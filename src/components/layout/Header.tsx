"use client";

import { useAppState, useAppActions } from "@/state/store";
import { computeFitState } from "@/logic/fit";

interface HeaderProps {
  onExport: () => void;
  onScreenshot?: () => void;
}

export default function Header({ onExport, onScreenshot }: HeaderProps) {
  const { state } = useAppState();
  const { clearAll, removeFurniture } = useAppActions();
  const { roomDimensions, furnitureItems, selectedId } = state;
  const fitState = computeFitState(roomDimensions, furnitureItems);
  const { overall } = fitState;

  const statusText =
    overall.status === "ok"
      ? "全部合适"
      : overall.status === "out_of_room"
        ? "超出房间"
        : "重叠";
  const badgeClass =
    overall.status === "ok"
      ? "bg-green-100 text-green-800"
      : overall.status === "out_of_room"
        ? "bg-red-100 text-red-800"
        : "bg-amber-100 text-amber-800";

  return (
    <header className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 bg-white px-3 py-2 sm:px-4 sm:py-3">
      <h1 className="text-base font-semibold text-gray-800 sm:text-lg shrink-0">房间规划器</h1>
      <div className="flex flex-wrap items-center gap-2 sm:gap-4 min-w-0">
        <span className="text-xs text-gray-600 shrink-0 sm:text-sm">
          房间：{roomDimensions.width}×{roomDimensions.length}×{roomDimensions.height} 米
        </span>
        <span
          className={`rounded px-2 py-1 text-sm font-medium shrink-0 ${badgeClass}`}
          aria-live="polite"
        >
          {statusText}
        </span>
        <button
          type="button"
          onClick={onExport}
          className="rounded border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50 min-h-[44px] min-w-[44px] flex items-center justify-center active:bg-gray-100"
          aria-label="导出布局为 JSON"
        >
          导出
        </button>
        {onScreenshot && (
          <button
            type="button"
            onClick={onScreenshot}
            className="rounded border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50 min-h-[44px] min-w-[44px] flex items-center justify-center active:bg-gray-100"
            aria-label="截取 3D 视图"
          >
            截图
          </button>
        )}
        {selectedId && (
          <button
            type="button"
            onClick={() => removeFurniture(selectedId)}
            className="rounded border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50 min-h-[44px] min-w-[44px] flex items-center justify-center active:bg-gray-100"
            aria-label="移除选中物品"
          >
            移除选中
          </button>
        )}
        <button
          type="button"
          onClick={() => clearAll()}
          className="rounded border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50 min-h-[44px] min-w-[44px] flex items-center justify-center active:bg-gray-100"
          aria-label="重置并清空所有家具"
        >
          重置
        </button>
      </div>
    </header>
  );
}
