import type { FurnitureItem } from "@/state/types";

/**
 * Default Chinese-style furniture layout shown on first load.
 * Positions fit room 8×10 (x ∈ [-4, 4], z ∈ [-5, 5]) with no overlaps.
 * Colors: dark rosewood, lacquer red, gold, cream upholstery.
 */
export const DEFAULT_CHINESE_STYLE_LAYOUT: FurnitureItem[] = [
  {
    id: "default-table",
    type: "table",
    position: [0, 0, -1],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    color: "#4A3728",
    price: 420,
  },
  {
    id: "default-chair-1",
    type: "chair",
    position: [1.5, 0, -1],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    color: "#8B2500",
    price: 290,
  },
  {
    id: "default-chair-2",
    type: "chair",
    position: [-1.5, 0, -1],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    color: "#8B2500",
    price: 290,
  },
  {
    id: "default-chair-3",
    type: "chair",
    position: [0, 0, -2.2],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    color: "#6B4423",
    price: 290,
  },
  {
    id: "default-chair-4",
    type: "chair",
    position: [0, 0, 0.2],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    color: "#6B4423",
    price: 290,
  },
  {
    id: "default-cabinet",
    type: "cabinet",
    position: [0, 0, 4.3],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    color: "#4A3728",
    price: 520,
  },
  {
    id: "default-sofa",
    type: "sofa",
    position: [0, 0, 2.2],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    color: "#E8E0D5",
    price: 1890,
  },
  {
    id: "default-lamp",
    type: "lamp",
    position: [2.6, 0, 3.2],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    color: "#B8860B",
    price: 150,
  },
  {
    id: "default-shelf",
    type: "shelf",
    position: [-2.6, 0, -3.2],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    color: "#4A3728",
    price: 380,
  },
];
