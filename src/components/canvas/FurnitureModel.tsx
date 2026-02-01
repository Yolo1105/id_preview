"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { BoundingBox } from "@/logic/collision";
import { FURNITURE_MODEL_PATHS } from "@/data/model-paths";

interface BoxFallbackProps {
  box: BoundingBox;
  color: string;
}

function BoxFallback({ box, color }: BoxFallbackProps) {
  return (
    <mesh position={[0, box.height / 2, 0]} castShadow receiveShadow>
      <boxGeometry args={[box.width, box.height, box.depth]} />
      <meshStandardMaterial
        color={color}
        roughness={0.75}
        metalness={0.08}
        envMapIntensity={0.4}
      />
    </mesh>
  );
}

interface FurnitureModelContentProps {
  path: string;
  box: BoundingBox;
  color: string;
}

function FurnitureModelContent({ path, box, color }: FurnitureModelContentProps) {
  const { scene: threeScene } = useThree();
  const [scene, setScene] = useState<THREE.Group | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoadError(false);
    setScene(null);

    const loader = new GLTFLoader();
    loader.load(
      path,
      (gltf) => {
        if (!cancelled && gltf.scene) {
          setScene(gltf.scene);
        }
      },
      undefined,
      () => {
        if (!cancelled) {
          setLoadError(true);
        }
      }
    );

    return () => {
      cancelled = true;
    };
  }, [path]);

  const scaledScene = useMemo(() => {
    if (!scene) return null;
    const clone = scene.clone();
    const bbox = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    bbox.getSize(size);
    bbox.getCenter(center);

    const scaleX = size.x > 0 ? box.width / size.x : 1;
    const scaleY = size.y > 0 ? box.height / size.y : 1;
    const scaleZ = size.z > 0 ? box.depth / size.z : 1;
    clone.scale.set(scaleX, scaleY, scaleZ);

    const min = bbox.min.clone();
    clone.position.set(
      -center.x * scaleX,
      -min.y * scaleY,
      -center.z * scaleZ
    );

    // Preserve original PBR materials (textures, roughness, metalness) so models
    // look realistic instead of flat/cartoon. Optionally apply a subtle tint from
    // layout color so wood/fabric still reads with the theme. envMapIntensity lets
    // materials reflect the scene environment for a more cohesive look.
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        const materials = Array.isArray(child.material)
          ? child.material
          : [child.material];
        for (const mat of materials) {
          if (mat instanceof THREE.MeshStandardMaterial) {
            // Tint slightly toward layout color (0 = original, 1 = full override).
            // Low value keeps textures and avoids cartoon flat look.
            const tintStrength = 0.2;
            const current = mat.color.clone();
            const tint = new THREE.Color(color);
            current.lerp(tint, tintStrength);
            mat.color.copy(current);
            // Ensure PBR-ish look if the model had flat defaults
            if (mat.roughness === 0 && mat.metalness === 0) {
              mat.roughness = 0.7;
              mat.metalness = 0.1;
            }
            mat.envMapIntensity = 0.4;
          }
        }
      }
    });

    return clone;
  }, [scene, box, color]);

  // Apply scene environment map to materials once Environment has loaded (reflections)
  useEffect(() => {
    if (!scaledScene || !threeScene.environment) return;
    scaledScene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        const materials = Array.isArray(child.material)
          ? child.material
          : [child.material];
        for (const mat of materials) {
          if (mat instanceof THREE.MeshStandardMaterial) {
            mat.envMap = threeScene.environment;
          }
        }
      }
    });
  }, [scaledScene, threeScene.environment]);

  if (loadError || !scaledScene) {
    return <BoxFallback box={box} color={color} />;
  }

  return <primitive object={scaledScene} castShadow receiveShadow />;
}

interface FurnitureModelProps {
  type: string;
  box: BoundingBox;
  color: string;
}

export function FurnitureModel({ type, box, color }: FurnitureModelProps) {
  const path = FURNITURE_MODEL_PATHS[type] ?? null;

  if (!path) {
    return <BoxFallback box={box} color={color} />;
  }

  return (
    <FurnitureModelContent path={path} box={box} color={color} />
  );
}
