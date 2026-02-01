"use client";

import { useState } from "react";

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const steps = [
  { title: "欢迎使用房间规划器", description: "在 3D 中摆放家具并查看是否合适。您可以拖动物品、使用移动/旋转控制，并在右侧查看适配面板。" },
  { title: "添加家具", description: "使用左侧面板添加桌子、椅子、沙发等。每次点击会在房间中添加一件物品。" },
  { title: "3D 视图", description: "使用 Alt + 拖拽旋转视角，滚轮缩放。点击物品可选中；未选中时拖拽可移动。" },
  { title: "移动与旋转", description: "选中物品后，使用工具栏：移动 (G) 或旋转 (R) 显示控制。按 B 切换边框显示。" },
  { title: "适配检查", description: "右侧面板显示每件物品是否在房间内以及是否重叠。场景中红色物品表示有碰撞。" },
  { title: "导出与重置", description: "使用顶部栏的「导出」将布局保存为 JSON，或使用「重置」清空全部。" },
];

export default function TutorialModal({ isOpen, onClose }: TutorialModalProps) {
  const [step, setStep] = useState(1);
  if (!isOpen) return null;

  const current = steps[step - 1];
  const handleNext = () => (step < 6 ? setStep(step + 1) : onClose());
  const handlePrev = () => (step > 1 ? setStep(step - 1) : null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" aria-modal="true" role="dialog">
      <div className="mx-4 max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-500">第 {step} 步，共 6 步</span>
          <button
            type="button"
            onClick={onClose}
            className="rounded px-2 py-1 text-sm text-gray-600 hover:bg-gray-100"
          >
            关闭
          </button>
        </div>
        <h2 className="text-lg font-semibold text-gray-800">{current.title}</h2>
        <p className="mt-2 text-sm text-gray-600">{current.description}</p>
        <div className="mt-6 flex justify-between">
          <button
            type="button"
            onClick={handlePrev}
            disabled={step === 1}
            className="rounded border border-gray-300 bg-white px-3 py-1.5 text-sm disabled:opacity-50"
          >
            上一步
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="rounded bg-gray-800 px-3 py-1.5 text-sm text-white hover:bg-gray-700"
          >
            {step === 6 ? "完成" : "下一步"}
          </button>
        </div>
      </div>
    </div>
  );
}
