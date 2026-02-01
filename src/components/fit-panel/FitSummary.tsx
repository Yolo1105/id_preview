"use client";

import type { OverallFit, RoomDimensions } from "@/state/types";

interface FitSummaryProps {
  roomDimensions: RoomDimensions;
  itemCount: number;
  overall: OverallFit;
}

export default function FitSummary({
  roomDimensions,
  itemCount,
  overall,
}: FitSummaryProps) {
  const statusText =
    overall.status === "ok"
      ? "全部合适"
      : overall.status === "out_of_room"
        ? "超出房间"
        : "重叠";
  const statusColor =
    overall.status === "ok"
      ? "text-green-600"
      : overall.status === "out_of_room"
        ? "text-red-600"
        : "text-amber-600";

  return (
    <div className="rounded border border-gray-200 bg-gray-50 p-3">
      <h3 className="text-sm font-semibold text-gray-700">适配摘要</h3>
      <p className="mt-1 text-xs text-gray-600">
        房间：{roomDimensions.width}×{roomDimensions.length} 米
      </p>
      <p className="text-xs text-gray-600">物品：{itemCount}</p>
      <p className={`mt-1 text-sm font-medium ${statusColor}`}>{statusText}</p>
    </div>
  );
}
