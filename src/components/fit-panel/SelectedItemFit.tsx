"use client";

import type { FurnitureItem } from "@/state/types";
import type { ItemFit } from "@/state/types";

const PRESET_COLORS = [
  "#8B7355",
  "#4a3728",
  "#c4a77d",
  "#2c1810",
  "#6b5344",
  "#e8dcc4",
  "#3d5a80",
  "#98c1d9",
  "#ee6c4d",
  "#293241",
];

interface SelectedItemFitProps {
  item: FurnitureItem | null;
  fit: ItemFit | undefined;
  itemLabelById: (id: string) => string;
  getItemDisplayName: (type: string) => string;
  onUpdateFurniture: (id: string, updates: Partial<FurnitureItem>) => void;
}

export default function SelectedItemFit({
  item,
  fit,
  itemLabelById,
  getItemDisplayName,
  onUpdateFurniture,
}: SelectedItemFitProps) {
  if (!item) {
    return (
      <div className="mt-3 rounded border border-gray-200 bg-gray-50 p-3">
        <p className="text-sm text-gray-500">请选择一件物品以查看适配详情。</p>
      </div>
    );
  }

  const pos = item.position ?? [0, 0, 0];
  const inRoom = fit?.inRoom ?? true;
  const wallHits = fit?.wallHits ?? [];
  const overlappingIds = fit?.overlappingIds ?? [];
  const rotation = item.rotation ?? [0, 0, 0];
  const scale = item.scale ?? [1, 1, 1];

  const handleRotate = (direction: "left" | "right") => {
    const amount = direction === "left" ? -Math.PI / 2 : Math.PI / 2;
    onUpdateFurniture(item.id, {
      rotation: [rotation[0], rotation[1] + amount, rotation[2]],
    });
  };

  const handleScale = (direction: "increase" | "decrease") => {
    const factor = direction === "increase" ? 1.1 : 0.9;
    const newScale: [number, number, number] = [
      scale[0] * factor,
      scale[1] * factor,
      scale[2] * factor,
    ];
    const clamped: [number, number, number] = [
      Math.max(0.5, Math.min(2, newScale[0])),
      Math.max(0.5, Math.min(2, newScale[1])),
      Math.max(0.5, Math.min(2, newScale[2])),
    ];
    onUpdateFurniture(item.id, { scale: clamped });
  };

  return (
    <div className="mt-3 rounded border border-gray-200 bg-gray-50 p-3">
      <h3 className="text-sm font-semibold text-gray-700">已选物品</h3>
      <p className="mt-1 text-sm font-medium">
        {getItemDisplayName(item.type)}-{item.id.slice(-6)}
      </p>
      <p className="text-xs text-gray-600">
        位置：X {pos[0].toFixed(2)}，Y {pos[1].toFixed(2)}，Z {pos[2].toFixed(2)}
      </p>
      <p className="mt-2 text-xs">
        在房间内：{" "}
        <span className={inRoom ? "text-green-600" : "text-red-600"}>{inRoom ? "是" : "否"}</span>
      </p>
      {wallHits.length > 0 && (
        <p className="text-xs text-red-600">
          超出房间：{wallHits.map((w) => w.replace("-wall", "")).join("、")}
        </p>
      )}
      <p className="mt-1 text-xs">
        重叠：{" "}
        {overlappingIds.length === 0
          ? "无"
          : overlappingIds.map((id) => itemLabelById(id)).join("、")}
      </p>

      <div className="mt-3 border-t border-gray-200 pt-3">
        <h4 className="text-xs font-semibold text-gray-600">变换</h4>
        <div className="mt-1.5 flex items-center gap-2">
          <span className="text-xs text-gray-500">旋转</span>
          <button
            type="button"
            onClick={() => handleRotate("left")}
            className="rounded border border-gray-300 bg-white p-1.5 hover:bg-gray-100"
            title="逆时针旋转 90°"
            aria-label="逆时针旋转 90°"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => handleRotate("right")}
            className="rounded border border-gray-300 bg-white p-1.5 hover:bg-gray-100"
            title="顺时针旋转 90°"
            aria-label="顺时针旋转 90°"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
              <path d="M3 21v-5h5" />
            </svg>
          </button>
        </div>
        <div className="mt-1.5 flex items-center gap-2">
          <span className="text-xs text-gray-500">缩放</span>
          <button
            type="button"
            onClick={() => handleScale("decrease")}
            className="rounded border border-gray-300 bg-white px-2 py-1 text-sm hover:bg-gray-100"
            title="缩小"
            aria-label="缩小尺寸"
          >
            −
          </button>
          <span className="min-w-[3ch] text-center text-xs font-medium text-gray-700">
            {Math.round((scale[0] ?? 1) * 100)}%
          </span>
          <button
            type="button"
            onClick={() => handleScale("increase")}
            className="rounded border border-gray-300 bg-white px-2 py-1 text-sm hover:bg-gray-100"
            title="放大"
            aria-label="放大尺寸"
          >
            +
          </button>
        </div>
      </div>

      <div className="mt-3 border-t border-gray-200 pt-3">
        <h4 className="text-xs font-semibold text-gray-600">颜色</h4>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {PRESET_COLORS.map((hex) => (
            <button
              key={hex}
              type="button"
              onClick={() => onUpdateFurniture(item.id, { color: hex })}
              className="h-6 w-6 rounded-full border-2 border-gray-300 transition hover:scale-110"
              style={{ backgroundColor: hex }}
              title={hex}
              aria-label={`设置颜色 ${hex}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
