"use client";

import { useRef } from "react";
import { useAppState, useAppActions } from "@/state/store";
import FurniturePalette from "./FurniturePalette";
import { getItemDisplayName } from "@/data/furniture-templates";
import type { LayoutExport } from "@/state/types";

interface SidebarProps {
  onHelpClick?: () => void;
  /** When true, use full width and no border (e.g. inside mobile overlay) */
  embedded?: boolean;
}

export default function Sidebar({ onHelpClick, embedded = false }: SidebarProps) {
  const { state } = useAppState();
  const {
    addFurniture,
    setRoomDimensions,
    clearAll,
    loadLayout,
  } = useAppActions();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { roomDimensions } = state;

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const json = JSON.parse(reader.result as string) as LayoutExport;
        if (
          json.roomDimensions &&
          typeof json.roomDimensions.width === "number" &&
          Array.isArray(json.furnitureItems)
        ) {
          loadLayout(json);
        }
      } catch (_) {
        // ignore invalid JSON
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div
      className={`flex flex-col gap-4 bg-white p-4 ${embedded ? "w-full" : "w-[200px] border-r border-gray-200"}`}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">家具</h3>
        {onHelpClick && (
          <button
            type="button"
            onClick={onHelpClick}
            className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-300 text-xs text-gray-600 hover:bg-gray-50"
            aria-label="显示教程"
            title="帮助"
          >
            ?
          </button>
        )}
      </div>
      <FurniturePalette onAdd={addFurniture} />
      <div>
        <h3 className="text-sm font-semibold text-gray-700">房间尺寸</h3>
        <div className="mt-2 space-y-2">
          <label className="block text-xs text-gray-600" htmlFor="room-width">
            宽度
            <input
              id="room-width"
              type="number"
              min={1}
              step={0.5}
              value={roomDimensions.width}
              onChange={(e) =>
                setRoomDimensions({
                  ...roomDimensions,
                  width: Number(e.target.value) || 8,
                })
              }
              className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm"
            />
          </label>
          <label className="block text-xs text-gray-600" htmlFor="room-length">
            长度
            <input
              id="room-length"
              type="number"
              min={1}
              step={0.5}
              value={roomDimensions.length}
              onChange={(e) =>
                setRoomDimensions({
                  ...roomDimensions,
                  length: Number(e.target.value) || 10,
                })
              }
              className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm"
            />
          </label>
          <label className="block text-xs text-gray-600">
            高度
            <input
              type="number"
              min={1}
              step={0.5}
              value={roomDimensions.height}
              onChange={(e) =>
                setRoomDimensions({
                  ...roomDimensions,
                  height: Number(e.target.value) || 3.5,
                })
              }
              className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm"
            />
          </label>
        </div>
      </div>
      <div className="border-t border-gray-200 pt-4">
        <h3 className="text-sm font-semibold text-gray-700">设计摘要</h3>
        <div className="mt-2 max-h-40 space-y-1.5 overflow-y-auto">
          {state.furnitureItems.length === 0 ? (
            <p className="text-xs text-gray-500">尚未放置物品。</p>
          ) : (
            state.furnitureItems.map((item) => {
              const price = item.price ?? 0;
              return (
                <div key={item.id} className="flex items-center justify-between gap-2 text-xs">
                  <span className="truncate text-gray-700">{getItemDisplayName(item.type)}</span>
                  <span className="shrink-0 font-medium text-gray-800">¥{price.toLocaleString()}</span>
                </div>
              );
            })
          )}
        </div>
        {state.furnitureItems.length > 0 && (
          <div className="mt-2 flex items-center justify-between border-t border-gray-200 pt-2 text-sm font-semibold text-gray-800">
            <span>合计</span>
            <span>
              ¥
              {state.furnitureItems
                .reduce((sum, item) => sum + (item.price ?? 0), 0)
                .toLocaleString()}
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={clearAll}
          className="rounded border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50"
          aria-label="清空所有家具"
        >
          清空
        </button>
        <label className="cursor-pointer rounded border border-gray-300 bg-white px-3 py-2 text-center text-sm hover:bg-gray-50" aria-label="从 JSON 文件导入布局">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
          导入
        </label>
      </div>
    </div>
  );
}
