"use client";

import { forwardRef, useState } from "react";
import type { Group } from "three";
import type { FurnitureItem } from "@/state/types";
import { getBoundingBox } from "@/logic/collision";
import { FurnitureModel } from "./FurnitureModel";

interface FurnitureMeshProps {
  item: FurnitureItem;
  isSelected: boolean;
  hasCollision: boolean;
  onSelect: () => void;
  onPositionChange: (position: [number, number, number]) => void;
  showBoundingBox?: boolean;
}

const FurnitureMesh = forwardRef<Group, FurnitureMeshProps>(
  function FurnitureMesh(
    { item, isSelected, hasCollision, onSelect, onPositionChange, showBoundingBox = false },
    ref
  ) {
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState<[number, number, number]>([0, 0, 0]);
    const pos = item.position ?? [0, 0, 0];
    const rot = item.rotation ?? [0, 0, 0];
    const scale = item.scale ?? [1, 1, 1];
    const box = getBoundingBox(item.type, item.scale);
    const color = hasCollision ? "#cc0000" : (item.color ?? "#8B7355");

    const handlePointerDown = (e: { stopPropagation: () => void; point: { x: number; y: number; z: number } }) => {
      e.stopPropagation();
      onSelect();
      if (!isSelected) {
        setIsDragging(true);
        setDragOffset([e.point.x - pos[0], e.point.y - pos[1], e.point.z - pos[2]]);
      }
    };

    const handlePointerUp = () => setIsDragging(false);
    const handlePointerCancel = () => setIsDragging(false);
    const handlePointerMove = (e: { point: { x: number; y: number; z: number } }) => {
      if (!isDragging || isSelected) return;
      const p = e.point;
      onPositionChange([p.x - dragOffset[0], 0, p.z - dragOffset[2]]);
    };

    return (
      <group
        ref={ref}
        position={pos}
        rotation={[rot[0], rot[1], rot[2]]}
        scale={[scale[0], scale[1], scale[2]]}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onPointerMove={handlePointerMove}
      >
        {isSelected && (
          <mesh position={[0, 0.02, 0]}>
            <boxGeometry args={[box.width + 0.05, 0.04, box.depth + 0.05]} />
            <meshBasicMaterial color="#00ff00" transparent opacity={0.35} />
          </mesh>
        )}
        <FurnitureModel type={item.type} box={box} color={color} />
        {showBoundingBox && (
          <mesh position={[0, box.height / 2, 0]}>
            <boxGeometry args={[box.width, box.height, box.depth]} />
            <meshBasicMaterial
              color={hasCollision ? "#ff0000" : "#ff6b35"}
              wireframe
              transparent
              opacity={0.8}
            />
          </mesh>
        )}
      </group>
    );
  }
);

export default FurnitureMesh;
