export interface RoomDimensions {
  width: number;
  length: number;
  height: number;
}

export interface FurnitureItem {
  id: string;
  type: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  /** Optional price for design summary (set when added from template). */
  price?: number;
  /** Optional color override for 3D mesh (hex e.g. "#8B7355"). */
  color?: string;
}

export interface FurnitureTemplate {
  type: string;
  /** Optional default price for new items. */
  price?: number;
}

export interface ItemFit {
  inRoom: boolean;
  wallHits: string[];
  overlappingIds: string[];
}

export interface OverallFit {
  allInRoom: boolean;
  noOverlaps: boolean;
  status: "ok" | "overlaps" | "out_of_room";
}

export interface FitState {
  byItem: Record<string, ItemFit>;
  overall: OverallFit;
}

export interface LayoutExport {
  roomDimensions: RoomDimensions;
  furnitureItems: FurnitureItem[];
}
