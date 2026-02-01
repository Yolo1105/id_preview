"use client";

import type { FurnitureItem } from "@/state/types";
import type { ItemFit } from "@/state/types";

interface FitItemListProps {
  furnitureItems: FurnitureItem[];
  byItem: Record<string, ItemFit>;
  selectedId: string | null;
  onSelectItem: (id: string | null) => void;
  getItemDisplayName: (type: string) => string;
}

function itemStatusLabel(fit: ItemFit | undefined): string {
  if (!fit) return "合适";
  if (!fit.inRoom) return `超出：${fit.wallHits.map((w) => w.replace("-wall", "")).join("、")}`;
  if (fit.overlappingIds.length > 0) return `重叠：${fit.overlappingIds.length}`;
  return "合适";
}

function itemIcon(fit: ItemFit | undefined): string {
  if (!fit) return "✓";
  if (!fit.inRoom) return "✗";
  if (fit.overlappingIds.length > 0) return "⚠";
  return "✓";
}

function itemIconColor(fit: ItemFit | undefined): string {
  if (!fit) return "text-green-600";
  if (!fit.inRoom) return "text-red-600";
  if (fit.overlappingIds.length > 0) return "text-amber-600";
  return "text-green-600";
}

export default function FitItemList({
  furnitureItems,
  byItem,
  selectedId,
  onSelectItem,
  getItemDisplayName,
}: FitItemListProps) {
  return (
    <div className="mt-3">
      <h3 className="text-sm font-semibold text-gray-700">逐项列表</h3>
      <ul className="mt-1 space-y-1">
        {furnitureItems.map((item) => {
          const fit = byItem[item.id];
          const isSelected = selectedId === item.id;
          return (
            <li
              key={item.id}
              role="button"
              tabIndex={0}
              onClick={() => onSelectItem(isSelected ? null : item.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") onSelectItem(isSelected ? null : item.id);
              }}
              className={`flex items-center gap-2 rounded px-2 py-1 text-sm ${
                isSelected ? "bg-blue-100" : "hover:bg-gray-100"
              }`}
            >
              <span className={`w-4 ${itemIconColor(fit)}`}>{itemIcon(fit)}</span>
              <span className="flex-1 truncate">{getItemDisplayName(item.type)}-{item.id.slice(-6)}</span>
              <span className="text-xs text-gray-500">{itemStatusLabel(fit)}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
