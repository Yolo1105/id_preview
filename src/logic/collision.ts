import type { FurnitureItem, RoomDimensions } from "@/state/types";

export interface BoundingBox {
  width: number;
  depth: number;
  height: number;
}

const TYPE_DIMENSIONS: Record<string, BoundingBox> = {
  table: { width: 2.2, depth: 1.2, height: 1.6 },
  chair: { width: 0.7, depth: 0.7, height: 1.5 },
  desk: { width: 1.7, depth: 1.0, height: 1.6 },
  shelf: { width: 1.2, depth: 0.5, height: 1.4 },
  cabinet: { width: 1.2, depth: 0.7, height: 1.8 },
  sofa: { width: 2.2, depth: 1.0, height: 1.0 },
  bed: { width: 2.2, depth: 1.8, height: 0.8 },
  lamp: { width: 0.4, depth: 0.4, height: 1.2 },
};

const DEFAULT_BOX: BoundingBox = { width: 1.2, depth: 1.2, height: 1.5 };

export function getBoundingBox(
  type: string,
  scale?: [number, number, number]
): BoundingBox {
  const base = TYPE_DIMENSIONS[type] ?? DEFAULT_BOX;
  if (!scale) return base;
  return {
    width: base.width * scale[0],
    depth: base.depth * scale[2],
    height: base.height * scale[1],
  };
}

export function checkWallCollisions(
  item: FurnitureItem,
  roomDimensions: RoomDimensions
): string[] {
  const box = getBoundingBox(item.type, item.scale);
  const pos = item.position ?? [0, 0, 0];
  const left = pos[0] - box.width / 2;
  const right = pos[0] + box.width / 2;
  const front = pos[2] - box.depth / 2;
  const back = pos[2] + box.depth / 2;

  const roomLeft = -roomDimensions.width / 2;
  const roomRight = roomDimensions.width / 2;
  const roomFront = -roomDimensions.length / 2;
  const roomBack = roomDimensions.length / 2;

  const hits: string[] = [];
  if (left <= roomLeft) hits.push("left-wall");
  if (right >= roomRight) hits.push("right-wall");
  if (front <= roomFront) hits.push("front-wall");
  if (back >= roomBack) hits.push("back-wall");
  return hits;
}

export function checkFurnitureOverlap(
  item1: FurnitureItem,
  item2: FurnitureItem
): boolean {
  const dim1 = getBoundingBox(item1.type, item1.scale);
  const dim2 = getBoundingBox(item2.type, item2.scale);
  const pos1 = item1.position ?? [0, 0, 0];
  const pos2 = item2.position ?? [0, 0, 0];

  const overlapX =
    Math.abs(pos1[0] - pos2[0]) < (dim1.width + dim2.width) / 2;
  const overlapZ =
    Math.abs(pos1[2] - pos2[2]) < (dim1.depth + dim2.depth) / 2;
  return overlapX && overlapZ;
}
