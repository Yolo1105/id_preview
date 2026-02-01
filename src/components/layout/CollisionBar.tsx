"use client";

import { useState } from "react";
import { useAppState } from "@/state/store";
import { computeFitState } from "@/logic/fit";
import { getItemDisplayName } from "@/data/furniture-templates";
import type { ItemFit } from "@/state/types";

export default function CollisionBar() {
  const { state } = useAppState();
  const fitState = computeFitState(state.roomDimensions, state.furnitureItems);
  const [dismissed, setDismissed] = useState(false);

  const itemsWithCollisions = state.furnitureItems.filter((item) => {
    const fit = fitState.byItem[item.id];
    return fit && (!fit.inRoom || fit.overlappingIds.length > 0);
  });

  if (itemsWithCollisions.length === 0 || dismissed) return null;

  const formatItem = (itemId: string, fit: ItemFit | undefined) => {
    const item = state.furnitureItems.find((i) => i.id === itemId);
    const label = item ? `${getItemDisplayName(item.type)}-${itemId.slice(-6)}` : itemId;
    const parts: string[] = [];
    if (fit?.wallHits?.length) {
      parts.push(...fit.wallHits.map((w) => w.replace("-wall", "")));
    }
    if (fit?.overlappingIds?.length) {
      fit.overlappingIds.forEach((id) => {
        const other = state.furnitureItems.find((i) => i.id === id);
        parts.push(other ? `${getItemDisplayName(other.type)}-${id.slice(-6)}` : id);
      });
    }
    return `${label}（${parts.join("、")}）`;
  };

  return (
    <div className="flex items-center justify-between border-t border-gray-200 bg-amber-50 px-4 py-2 text-sm">
      <span className="text-amber-800">
        碰撞：{" "}
        {itemsWithCollisions
          .map((item) => formatItem(item.id, fitState.byItem[item.id]))
          .join("；")}
      </span>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="rounded px-2 py-1 text-amber-800 hover:bg-amber-100"
        aria-label="关闭碰撞提示"
      >
        关闭
      </button>
    </div>
  );
}
