export interface FurnitureTemplateEntry {
  type: string;
  name: string;
  description: string;
  icon: string;
  /** Default price (USD) for design summary. */
  price: number;
}

export const furnitureTemplates: FurnitureTemplateEntry[] = [
  { type: "table", name: "桌子", description: "餐桌与茶几", icon: "table", price: 420 },
  { type: "chair", name: "椅子", description: "座椅", icon: "chair", price: 290 },
  { type: "desk", name: "书桌", description: "办公桌", icon: "desk", price: 680 },
  { type: "shelf", name: "书架", description: "书柜与收纳", icon: "shelf", price: 380 },
  { type: "cabinet", name: "柜子", description: "储物柜", icon: "cabinet", price: 520 },
  { type: "sofa", name: "沙发", description: "长沙发", icon: "sofa", price: 1890 },
  { type: "bed", name: "床", description: "床架", icon: "bed", price: 1650 },
  { type: "lamp", name: "灯", description: "台灯与落地灯", icon: "lamp", price: 150 },
];

export function getItemDisplayName(type: string): string {
  return furnitureTemplates.find((t) => t.type === type)?.name ?? type;
}
