"use client";

import React, { useEffect, useState } from "react";
import * as THREE from "three";
import { BoxGeometry } from "three";
import type { RoomDimensions } from "@/state/types";

interface RoomProps {
  roomDimensions: RoomDimensions;
}

/** Creates a wood-style floor texture via canvas for a more realistic look */
function createFloorTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const plankCount = 8;
  const plankH = size / plankCount;
  for (let i = 0; i < plankCount; i++) {
    const y = i * plankH;
    const base = 200 + Math.random() * 35;
    ctx.fillStyle = `rgb(${base},${base - 20},${base - 40})`;
    ctx.fillRect(0, y, size, plankH);
    ctx.strokeStyle = `rgba(90,65,45,0.5)`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, y + plankH);
    ctx.lineTo(size, y + plankH);
    ctx.stroke();
    for (let k = 0; k < 35; k++) {
      const gx = Math.random() * size;
      const gy = y + Math.random() * plankH;
      ctx.fillStyle = `rgba(80,60,40,${0.06 + Math.random() * 0.1})`;
      ctx.fillRect(gx, gy, 2 + Math.random() * 8, 1.5);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 4);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

/** Seeded random for reproducible wall texture */
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Creates a realistic wall texture: plaster/paint with brush marks and variation */
function createWallTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const rng = mulberry32(42);

  // Base warm off-white
  const baseR = 242;
  const baseG = 238;
  const baseB = 232;
  ctx.fillStyle = `rgb(${baseR},${baseG},${baseB})`;
  ctx.fillRect(0, 0, size, size);

  // Layer 1: soft patches of tone variation (like uneven paint/plaster)
  const patchSize = 40;
  for (let py = 0; py < size + patchSize; py += patchSize) {
    for (let px = 0; px < size + patchSize; px += patchSize) {
      const drift = (rng() - 0.5) * 28;
      const r = Math.max(220, Math.min(255, baseR + drift + (rng() - 0.5) * 15));
      const g = Math.max(218, Math.min(248, baseG + drift * 0.9 + (rng() - 0.5) * 12));
      const b = Math.max(210, Math.min(242, baseB + drift * 0.85 + (rng() - 0.5) * 10));
      ctx.fillStyle = `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`;
      ctx.beginPath();
      ctx.ellipse(px, py, patchSize * 1.2, patchSize * 1.1, rng() * 0.4, 0, Math.PI * 2);
      ctx.globalAlpha = 0.5 + rng() * 0.35;
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;

  // Layer 2: brush / roller strokes (elongated streaks)
  const strokeCount = 120;
  for (let s = 0; s < strokeCount; s++) {
    const x = rng() * (size + 80) - 40;
    const y = rng() * (size + 80) - 40;
    const len = 25 + rng() * 70;
    const angle = rng() * Math.PI * 2;
    const dx = Math.cos(angle) * len;
    const dy = Math.sin(angle) * len;
    const grad = ctx.createLinearGradient(x, y, x + dx, y + dy);
    const shade = (rng() - 0.5) * 22;
    const rr = Math.max(230, Math.min(255, baseR + shade));
    const gg = Math.max(226, Math.min(245, baseG + shade * 0.95));
    const bb = Math.max(218, Math.min(238, baseB + shade * 0.9));
    grad.addColorStop(0, `rgba(${rr},${gg},${bb},0.08)`);
    grad.addColorStop(0.5, `rgba(${rr + 4},${gg + 4},${bb + 4},0.12)`);
    grad.addColorStop(1, `rgba(${rr},${gg},${bb},0.06)`);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(x + dx / 2, y + dy / 2, Math.max(4, len / 4), 2.5 + rng() * 2, angle, 0, Math.PI * 2);
    ctx.fill();
  }

  // Layer 3: fine grain (orange peel / stipple)
  const imageData = ctx.getImageData(0, 0, size, size);
  const d = imageData.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (rng() - 0.5) * 18;
    d[i] = Math.max(0, Math.min(255, d[i] + n));
    d[i + 1] = Math.max(0, Math.min(255, d[i + 1] + n));
    d[i + 2] = Math.max(0, Math.min(255, d[i + 2] + n));
  }
  ctx.putImageData(imageData, 0, 0);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

const FRAME_WIDTH = 0.2;
const FRAME_DEPTH = 0.06;
const MULLION_THICKNESS = 0.05;
const GLASS_THICKNESS = 0.012;
const SILL_DEPTH = 0.2;
const SILL_HEIGHT = 0.1;
const REVEAL_THICKNESS = 0.02;
const REVEAL_WIDTH = 0.07;
const REVEAL_COLOR = "#2d2d2d";
const WINDOW_COLS = 3;
const WINDOW_ROWS = 2;

const LAMP_RADIUS = 0.35;
const LAMP_HEIGHT = 0.5;
const LAMP_STEM_HEIGHT = 0.15;

export default function Room({ roomDimensions }: RoomProps) {
  const { width, length, height } = roomDimensions;

  const [floorTexture, setFloorTexture] = useState<THREE.CanvasTexture | null>(null);
  const [wallTexture, setWallTexture] = useState<THREE.CanvasTexture | null>(null);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const floor = createFloorTexture();
    const wall = createWallTexture();
    setFloorTexture(floor);
    setWallTexture(wall);
    return () => {
      floor.dispose();
      wall.dispose();
    };
  }, []);

  const innerW = width - 2 * FRAME_WIDTH;
  const innerH = height - 2 * FRAME_WIDTH;
  const paneW = (innerW - (WINDOW_COLS - 1) * MULLION_THICKNESS) / WINDOW_COLS;
  const paneH =
    (innerH - (WINDOW_ROWS - 1) * MULLION_THICKNESS) / WINDOW_ROWS;

  const frameColor = "#e8e4dc";
  const frameRoughness = 0.85;
  const frameMetalness = 0.05;

  return (
    <group>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[width, length]} />
        <meshStandardMaterial
          map={floorTexture ?? undefined}
          color={floorTexture ? "#f0e6d4" : "#c9a86c"}
          roughness={0.75}
          metalness={0.08}
          envMapIntensity={0.35}
        />
      </mesh>
      {/* Back wall: realistic multi-pane window */}
      <group position={[0, height / 2, -length / 2]}>
        {/* Wall behind window (revealed at edges) */}
        <mesh receiveShadow>
          <planeGeometry args={[width, height]} />
          <meshStandardMaterial
            map={wallTexture ?? undefined}
            color={wallTexture ? "#ffffff" : "#f0ede8"}
            roughness={0.88}
            metalness={0}
            envMapIntensity={0.3}
          />
        </mesh>

        {/* Outer frame – 4 trim pieces with depth */}
        <mesh
          position={[-width / 2 + FRAME_WIDTH / 2, 0, FRAME_DEPTH / 2]}
          receiveShadow
          castShadow
        >
          <boxGeometry args={[FRAME_WIDTH, height, FRAME_DEPTH]} />
          <meshStandardMaterial
            color={frameColor}
            roughness={frameRoughness}
            metalness={frameMetalness}
          />
        </mesh>
        <mesh
          position={[width / 2 - FRAME_WIDTH / 2, 0, FRAME_DEPTH / 2]}
          receiveShadow
          castShadow
        >
          <boxGeometry args={[FRAME_WIDTH, height, FRAME_DEPTH]} />
          <meshStandardMaterial
            color={frameColor}
            roughness={frameRoughness}
            metalness={frameMetalness}
          />
        </mesh>
        <mesh
          position={[0, height / 2 - FRAME_WIDTH / 2, FRAME_DEPTH / 2]}
          receiveShadow
          castShadow
        >
          <boxGeometry args={[width, FRAME_WIDTH, FRAME_DEPTH]} />
          <meshStandardMaterial
            color={frameColor}
            roughness={frameRoughness}
            metalness={frameMetalness}
          />
        </mesh>
        <mesh
          position={[0, -height / 2 + FRAME_WIDTH / 2, FRAME_DEPTH / 2]}
          receiveShadow
          castShadow
        >
          <boxGeometry args={[width, FRAME_WIDTH, FRAME_DEPTH]} />
          <meshStandardMaterial
            color={frameColor}
            roughness={frameRoughness}
            metalness={frameMetalness}
          />
        </mesh>

        {/* Window sill – protrudes into room */}
        <mesh
          position={[
            0,
            -height / 2 + FRAME_WIDTH + SILL_HEIGHT / 2,
            FRAME_DEPTH / 2 + SILL_DEPTH / 2,
          ]}
          receiveShadow
          castShadow
        >
          <boxGeometry args={[innerW, SILL_HEIGHT, SILL_DEPTH]} />
          <meshStandardMaterial
            color={frameColor}
            roughness={frameRoughness}
            metalness={frameMetalness}
          />
        </mesh>

        {/* Frame reveal – dark strip along inner edge for depth */}
        <mesh
          position={[
            -width / 2 + FRAME_WIDTH + REVEAL_WIDTH / 2,
            0,
            REVEAL_THICKNESS / 2,
          ]}
          receiveShadow
        >
          <boxGeometry args={[REVEAL_WIDTH, innerH, REVEAL_THICKNESS]} />
          <meshStandardMaterial
            color={REVEAL_COLOR}
            roughness={0.9}
            metalness={0}
          />
        </mesh>
        <mesh
          position={[
            width / 2 - FRAME_WIDTH - REVEAL_WIDTH / 2,
            0,
            REVEAL_THICKNESS / 2,
          ]}
          receiveShadow
        >
          <boxGeometry args={[REVEAL_WIDTH, innerH, REVEAL_THICKNESS]} />
          <meshStandardMaterial
            color={REVEAL_COLOR}
            roughness={0.9}
            metalness={0}
          />
        </mesh>
        <mesh
          position={[
            0,
            height / 2 - FRAME_WIDTH - REVEAL_WIDTH / 2,
            REVEAL_THICKNESS / 2,
          ]}
          receiveShadow
        >
          <boxGeometry args={[innerW, REVEAL_WIDTH, REVEAL_THICKNESS]} />
          <meshStandardMaterial
            color={REVEAL_COLOR}
            roughness={0.9}
            metalness={0}
          />
        </mesh>
        <mesh
          position={[
            0,
            -height / 2 + FRAME_WIDTH + REVEAL_WIDTH / 2,
            REVEAL_THICKNESS / 2,
          ]}
          receiveShadow
        >
          <boxGeometry args={[innerW, REVEAL_WIDTH, REVEAL_THICKNESS]} />
          <meshStandardMaterial
            color={REVEAL_COLOR}
            roughness={0.9}
            metalness={0}
          />
        </mesh>

        {/* Vertical mullions */}
        {Array.from({ length: WINDOW_COLS - 1 }).map((_, i) => {
          const x =
            -innerW / 2 +
            paneW * (i + 1) +
            MULLION_THICKNESS * (i + 0.5);
          return (
            <mesh
              key={`v-${i}`}
              position={[x, 0, FRAME_DEPTH / 2]}
              receiveShadow
              castShadow
            >
              <boxGeometry args={[MULLION_THICKNESS, innerH, FRAME_DEPTH]} />
              <meshStandardMaterial
                color={frameColor}
                roughness={frameRoughness}
                metalness={frameMetalness}
              />
            </mesh>
          );
        })}

        {/* Horizontal mullions */}
        {Array.from({ length: WINDOW_ROWS - 1 }).map((_, i) => {
          const y =
            innerH / 2 -
            paneH * (i + 1) -
            MULLION_THICKNESS * (i + 0.5);
          return (
            <mesh
              key={`h-${i}`}
              position={[0, y, FRAME_DEPTH / 2]}
              receiveShadow
              castShadow
            >
              <boxGeometry args={[innerW, MULLION_THICKNESS, FRAME_DEPTH]} />
              <meshStandardMaterial
                color={frameColor}
                roughness={frameRoughness}
                metalness={frameMetalness}
              />
            </mesh>
          );
        })}

        {/* Glass panes – thin box per pane, slightly in front of mullions */}
        {Array.from({ length: WINDOW_ROWS }).map((_, row) =>
          Array.from({ length: WINDOW_COLS }).map((_, col) => {
            const x =
              -innerW / 2 +
              paneW / 2 +
              col * (paneW + MULLION_THICKNESS);
            const y =
              innerH / 2 -
              paneH / 2 -
              row * (paneH + MULLION_THICKNESS);
            const paneWidth = paneW - 0.02;
            const paneHeight = paneH - 0.02;
            return (
              <mesh
                key={`pane-${row}-${col}`}
                position={[x, y, FRAME_DEPTH + GLASS_THICKNESS / 2 + 0.005]}
                receiveShadow
              >
                <boxGeometry args={[paneWidth, paneHeight, GLASS_THICKNESS]} />
                <meshPhysicalMaterial
                  color="#c8e0f0"
                  transmission={1}
                  ior={1.5}
                  thickness={GLASS_THICKNESS}
                  roughness={0.05}
                  metalness={0}
                  envMapIntensity={0.5}
                  side={THREE.DoubleSide}
                />
              </mesh>
            );
          })
        )}
      </group>
      <mesh
        position={[-width / 2, height / 2, 0]}
        rotation={[0, Math.PI / 2, 0]}
        receiveShadow
      >
        <planeGeometry args={[length, height]} />
        <meshStandardMaterial
          map={wallTexture ?? undefined}
          color={wallTexture ? "#ffffff" : "#f0ede8"}
          roughness={0.88}
          metalness={0}
          envMapIntensity={0.3}
        />
      </mesh>
      <mesh
        position={[width / 2, height / 2, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        receiveShadow
      >
        <planeGeometry args={[length, height]} />
        <meshStandardMaterial
          map={wallTexture ?? undefined}
          color={wallTexture ? "#ffffff" : "#f0ede8"}
          roughness={0.88}
          metalness={0}
          envMapIntensity={0.3}
        />
      </mesh>
      {/* Ceiling with subtle texture */}
      <mesh
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, height, 0]}
        receiveShadow
      >
        <planeGeometry args={[width, length]} />
        <meshStandardMaterial
          map={wallTexture ?? undefined}
          color={wallTexture ? "#faf9f7" : "#f5f3ef"}
          roughness={0.9}
          metalness={0}
          envMapIntensity={0.25}
        />
      </mesh>
      {/* Ceiling lamp */}
      <group position={[0, height - 0.02, 0]}>
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.08, 0.08, 0.02, 24]} />
          <meshStandardMaterial color="#2a2a2a" roughness={0.4} metalness={0.6} />
        </mesh>
        <mesh position={[0, -LAMP_STEM_HEIGHT, 0]} castShadow>
          <cylinderGeometry args={[0.012, 0.012, LAMP_STEM_HEIGHT, 12]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.3} metalness={0.7} />
        </mesh>
        <mesh position={[0, -LAMP_STEM_HEIGHT - LAMP_HEIGHT / 2, 0]} castShadow>
          <cylinderGeometry args={[LAMP_RADIUS, LAMP_RADIUS * 1.1, LAMP_HEIGHT, 24]} />
          <meshStandardMaterial
            color="#fff8e7"
            emissive="#fff0c8"
            emissiveIntensity={0.6}
            roughness={0.9}
            metalness={0}
          />
        </mesh>
        <pointLight
          position={[0, -LAMP_STEM_HEIGHT - LAMP_HEIGHT / 2, 0]}
          color="#fff5dc"
          intensity={80}
          distance={8}
          decay={2}
          castShadow
        />
      </group>
      <lineSegments>
        <edgesGeometry args={[new BoxGeometry(width, height, length)]} />
        <lineBasicMaterial color="#e0e0e0" opacity={0.3} transparent />
      </lineSegments>
    </group>
  );
}
