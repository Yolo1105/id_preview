import { checkWallCollisions, checkFurnitureOverlap } from "./collision";
import type {
  RoomDimensions,
  FurnitureItem,
  FitState,
  ItemFit,
  OverallFit,
} from "@/state/types";

export function computeFitState(
  roomDimensions: RoomDimensions,
  furnitureItems: FurnitureItem[]
): FitState {
  const byItem: Record<string, ItemFit> = {};

  for (let i = 0; i < furnitureItems.length; i++) {
    const item = furnitureItems[i];
    const wallHits = checkWallCollisions(item, roomDimensions);
    const overlappingIds: string[] = [];

    for (let j = 0; j < furnitureItems.length; j++) {
      if (i === j) continue;
      const other = furnitureItems[j];
      if (checkFurnitureOverlap(item, other)) {
        overlappingIds.push(other.id);
      }
    }

    byItem[item.id] = {
      inRoom: wallHits.length === 0,
      wallHits,
      overlappingIds,
    };
  }

  const allInRoom = furnitureItems.every((item) => byItem[item.id]?.inRoom ?? true);
  const noOverlaps = furnitureItems.every(
    (item) => (byItem[item.id]?.overlappingIds.length ?? 0) === 0
  );
  const status: OverallFit["status"] = !allInRoom
    ? "out_of_room"
    : !noOverlaps
      ? "overlaps"
      : "ok";

  const overall: OverallFit = { allInRoom, noOverlaps, status };

  return { byItem, overall };
}
