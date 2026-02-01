"use client";

import React, { useRef } from "react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  TransformControls,
  ContactShadows,
  SoftShadows,
} from "@react-three/drei";
import * as THREE from "three";
import type { Group } from "three";
import { useAppState, useAppActions } from "@/state/store";
import { computeFitState } from "@/logic/fit";
import Room from "./Room";
import FurnitureMesh from "./FurnitureMesh";

export interface SceneRefs {
  controlsRef: React.RefObject<unknown>;
  selectedRef: React.RefObject<Group | null>;
}

interface SceneProps {
  showBoundingBoxes: boolean;
  isTransformActive: boolean;
  transformMode: "translate" | "rotate";
  refs: SceneRefs;
}

export default function Scene({
  showBoundingBoxes,
  isTransformActive,
  transformMode,
  refs,
}: SceneProps) {
  const { state } = useAppState();
  const { updateFurniture, selectItem } = useAppActions();
  const { roomDimensions, furnitureItems, selectedId } = state;
  const fitState = computeFitState(roomDimensions, furnitureItems);
  const selectedItem = furnitureItems.find((item) => item.id === selectedId);

  const { width, length, height } = roomDimensions;

  return (
    <Canvas
      camera={{ position: [0, 5, 5], fov: 70 }}
      shadows
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.05,
        outputColorSpace: THREE.SRGBColorSpace,
      }}
      style={{
        background: "linear-gradient(180deg, #e8e6e2 0%, #ddd9d2 100%)",
        width: "100%",
        height: "100%",
      }}
    >
      <SoftShadows size={40} samples={16} focus={0.5} />
      <ambientLight intensity={0.45} />
      <hemisphereLight
        args={["#e8f0f8", "#c4b8a8", 0.3]}
      />
      <directionalLight
        position={[0, height / 2 + 1, -length / 2 + 2]}
        intensity={1.1}
        castShadow
        shadow-mapSize={[4096, 4096]}
        shadow-bias={-0.0002}
        shadow-normalBias={0.02}
        shadow-camera-far={30}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
      />
      <directionalLight position={[-6, 6, 4]} intensity={0.4} />
      <directionalLight
        position={[0, height / 2, -length / 2 - 1]}
        intensity={0.25}
      />
      <Room roomDimensions={roomDimensions} />
      <ContactShadows
        position={[0, 0, 0]}
        scale={Math.max(width, length) * 1.2}
        opacity={0.5}
        blur={2.5}
        far={height}
        resolution={1024}
        frames={1}
      />
      {furnitureItems.map((item) => (
        <FurnitureMesh
          key={item.id}
          ref={selectedId === item.id ? refs.selectedRef : null}
          item={item}
          isSelected={selectedId === item.id}
          hasCollision={
            !fitState.byItem[item.id]?.inRoom ||
            (fitState.byItem[item.id]?.overlappingIds.length ?? 0) > 0
          }
          onSelect={() => selectItem(item.id)}
          onPositionChange={(position) => updateFurniture(item.id, { position })}
          showBoundingBox={showBoundingBoxes}
        />
      ))}
      {selectedId &&
        isTransformActive &&
        refs.selectedRef.current &&
        selectedItem && (
          <TransformControls
            mode={transformMode}
            object={refs.selectedRef.current}
            size={1.2}
            showX
            showY
            showZ
            translationSnap={0.1}
            rotationSnap={Math.PI / 12}
            space="world"
            camera={refs.controlsRef.current?.object}
            onMouseDown={() => {
              if (refs.controlsRef.current) {
                refs.controlsRef.current.enabled = false;
              }
            }}
            onMouseUp={() => {
              if (refs.controlsRef.current) {
                refs.controlsRef.current.enabled = true;
              }
            }}
            onObjectChange={(e) => {
              const obj = e?.target?.object;
              if (obj && selectedItem) {
                updateFurniture(selectedItem.id, {
                  position: [obj.position.x, obj.position.y, obj.position.z],
                  rotation: [obj.rotation.x, obj.rotation.y, obj.rotation.z],
                });
              }
            }}
          />
        )}
      <OrbitControls
        ref={refs.controlsRef}
        enablePan
        enableZoom
        enableRotate
        minDistance={2}
        maxDistance={20}
      />
      <Environment preset="apartment" />
    </Canvas>
  );
}
