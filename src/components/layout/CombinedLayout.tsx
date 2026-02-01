"use client";

import React, { useRef, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useAppState, useAppActions } from "@/state/store";
import type { Group } from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import type { SceneRefs } from "@/components/canvas/Scene";
import { useIsMobile } from "@/hooks/useMediaQuery";
import Header from "./Header";
import Sidebar from "../sidebar/Sidebar";
import FitPanel from "../fit-panel/FitPanel";
import CollisionBar from "./CollisionBar";
import TutorialModal from "./TutorialModal";

const Scene = dynamic(() => import("@/components/canvas/Scene"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[400px] items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
        <p className="text-sm text-gray-600">正在加载 3D 场景…</p>
      </div>
    </div>
  ),
});

export default function CombinedLayout() {
  const { state } = useAppState();
  const { exportLayout, toggleBoundingBoxes } = useAppActions();
  const isMobile = useIsMobile();
  const [isTransformActive, setIsTransformActive] = useState(false);
  const [transformMode, setTransformMode] = useState<"translate" | "rotate">("translate");
  const [showTutorial, setShowTutorial] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [mobileFitOpen, setMobileFitOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const selectedRef = useRef<Group>(null);

  const refs: SceneRefs = { controlsRef, selectedRef };

  const closeMobilePanels = () => {
    setMobileSidebarOpen(false);
    setMobileFitOpen(false);
  };

  const handleExport = () => {
    const data = exportLayout();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "layout.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleScreenshot = () => {
    const canvas = containerRef.current?.querySelector("canvas");
    if (!canvas) return;
    try {
      const dataUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `room-${new Date().toISOString().slice(0, 10)}.png`;
      a.click();
    } catch (_) {
      // ignore
    }
  };

  const setCameraView = (view: string) => {
    const controls = controlsRef.current as {
      reset: () => void;
      object: { position: { set: (x: number, y: number, z: number) => void } };
      target: { set: (x: number, y: number, z: number) => void };
      update: () => void;
    } | null;
    if (!controls) return;
    controls.reset();
    switch (view) {
      case "top":
        controls.object.position.set(0, 10, 0);
        controls.target.set(0, 0, 0);
        break;
      case "front":
        controls.object.position.set(0, 0, 10);
        controls.target.set(0, 0, 0);
        break;
      case "side":
        controls.object.position.set(10, 0, 0);
        controls.target.set(0, 0, 0);
        break;
      default:
        controls.object.position.set(8, 8, 8);
        controls.target.set(0, 0, 0);
    }
    controls.update();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "r" || e.key === "R") {
        setTransformMode("rotate");
        setIsTransformActive((prev) => !prev);
      } else if (e.key === "g" || e.key === "G") {
        setTransformMode("translate");
        setIsTransformActive((prev) => !prev);
      } else if (e.key === "b" || e.key === "B") {
        toggleBoundingBoxes();
      } else if (e.key === "Escape") {
        setIsTransformActive(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleBoundingBoxes]);

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Header onExport={handleExport} onScreenshot={handleScreenshot} />
      <div className="relative flex flex-1 overflow-hidden">
        {/* Desktop: always-visible sidebar; Mobile: overlay drawer */}
        {isMobile ? (
          <>
            {mobileSidebarOpen && (
              <>
                <div
                  className="fixed inset-0 z-40 bg-black/40 md:hidden"
                  aria-hidden
                  onClick={closeMobilePanels}
                />
                <div className="fixed left-0 top-0 z-50 h-full w-[min(320px,85vw)] overflow-y-auto border-r border-gray-200 bg-white shadow-xl md:hidden">
                  <div className="flex items-center justify-between border-b border-gray-200 p-3">
                    <span className="font-medium text-gray-800">家具</span>
                    <button
                      type="button"
                      onClick={() => setMobileSidebarOpen(false)}
                      className="min-h-[44px] min-w-[44px] rounded p-2 text-gray-600 hover:bg-gray-100"
                      aria-label="关闭"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="p-4">
                    <Sidebar
                      embedded
                      onHelpClick={() => {
                        setShowTutorial(true);
                        setMobileSidebarOpen(false);
                      }}
                    />
                  </div>
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-[200px] shrink-0 border-r border-gray-200">
            <Sidebar onHelpClick={() => setShowTutorial(true)} />
          </div>
        )}

        <div className="relative flex flex-1 flex-col min-w-0">
          <div
            className="flex gap-2 border-b border-gray-200 bg-gray-50 px-2 py-2 overflow-x-auto flex-nowrap md:py-1"
            role="toolbar"
            aria-label="画布控制"
          >
            <button
              type="button"
              onClick={() => setCameraView("perspective")}
              className="rounded px-3 py-2 text-xs hover:bg-gray-200 min-h-[44px] min-w-[44px] flex items-center justify-center md:min-h-0 md:min-w-0 md:px-2 md:py-1"
              aria-label="透视视图"
            >
              透视
            </button>
            <button
              type="button"
              onClick={() => setCameraView("top")}
              className="rounded px-3 py-2 text-xs hover:bg-gray-200 min-h-[44px] min-w-[44px] flex items-center justify-center md:min-h-0 md:min-w-0 md:px-2 md:py-1"
              aria-label="顶视图"
            >
              顶
            </button>
            <button
              type="button"
              onClick={() => setCameraView("front")}
              className="rounded px-3 py-2 text-xs hover:bg-gray-200 min-h-[44px] min-w-[44px] flex items-center justify-center md:min-h-0 md:min-w-0 md:px-2 md:py-1"
              aria-label="前视图"
            >
              前
            </button>
            <button
              type="button"
              onClick={() => setCameraView("side")}
              className="rounded px-3 py-2 text-xs hover:bg-gray-200 min-h-[44px] min-w-[44px] flex items-center justify-center md:min-h-0 md:min-w-0 md:px-2 md:py-1"
              aria-label="侧视图"
            >
              侧
            </button>
            <span className="mx-1 border-l border-gray-300 shrink-0" aria-hidden />
            <button
              type="button"
              onClick={() => {
                setTransformMode("translate");
                setIsTransformActive((p) => !p);
              }}
              className="rounded px-3 py-2 text-xs hover:bg-gray-200 min-h-[44px] min-w-[44px] flex items-center justify-center md:min-h-0 md:min-w-0 md:px-2 md:py-1"
              aria-label="移动选中家具"
            >
              移动
            </button>
            <button
              type="button"
              onClick={() => {
                setTransformMode("rotate");
                setIsTransformActive((p) => !p);
              }}
              className="rounded px-3 py-2 text-xs hover:bg-gray-200 min-h-[44px] min-w-[44px] flex items-center justify-center md:min-h-0 md:min-w-0 md:px-2 md:py-1"
              aria-label="旋转选中家具"
            >
              旋转
            </button>
            <button
              type="button"
              onClick={toggleBoundingBoxes}
              className="rounded px-3 py-2 text-xs hover:bg-gray-200 min-h-[44px] min-w-[44px] flex items-center justify-center md:min-h-0 md:min-w-0 md:px-2 md:py-1"
              aria-label="切换边框显示"
            >
              边框
            </button>
          </div>

          <div ref={containerRef} className="flex-1 min-h-0 relative touch-canvas-area">
            <Scene
              showBoundingBoxes={state.showBoundingBoxes}
              isTransformActive={isTransformActive}
              transformMode={transformMode}
              refs={refs}
            />
            <div className="absolute bottom-2 left-2 right-2 flex flex-wrap gap-2 sm:gap-3 rounded bg-black/60 px-3 py-2 text-xs text-white">
              <span>单指/鼠标拖拽：环视</span>
              <span>双指/滚轮：缩放</span>
              <span>点按：选中</span>
              <span>拖拽：移动物品</span>
              <span>上方按钮：移动/旋转/边框</span>
            </div>
          </div>
        </div>

        {/* Desktop: always-visible fit panel; Mobile: overlay drawer */}
        {isMobile ? (
          <>
            {mobileFitOpen && (
              <>
                <div
                  className="fixed inset-0 z-40 bg-black/40 md:hidden"
                  aria-hidden
                  onClick={closeMobilePanels}
                />
                <div className="fixed right-0 top-0 z-50 h-full w-[min(320px,85vw)] overflow-y-auto border-l border-gray-200 bg-white shadow-xl md:hidden">
                  <div className="flex items-center justify-between border-b border-gray-200 p-3">
                    <span className="font-medium text-gray-800">适配</span>
                    <button
                      type="button"
                      onClick={() => setMobileFitOpen(false)}
                      className="min-h-[44px] min-w-[44px] rounded p-2 text-gray-600 hover:bg-gray-100"
                      aria-label="关闭"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="p-4">
                    <FitPanel />
                  </div>
                </div>
              </>
            )}
            <div className="fixed right-3 bottom-20 z-30 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => { setMobileSidebarOpen(true); setMobileFitOpen(false); }}
                className="min-h-[48px] min-w-[48px] rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center text-sm font-medium text-gray-800 active:bg-gray-50"
                aria-label="打开家具面板"
              >
                家具
              </button>
              <button
                type="button"
                onClick={() => { setMobileFitOpen(true); setMobileSidebarOpen(false); }}
                className="min-h-[48px] min-w-[48px] rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center text-sm font-medium text-gray-800 active:bg-gray-50"
                aria-label="打开适配面板"
              >
                适配
              </button>
            </div>
          </>
        ) : (
          <div className="w-[280px] shrink-0">
            <FitPanel />
          </div>
        )}
      </div>
      <CollisionBar />
      <TutorialModal isOpen={showTutorial} onClose={() => setShowTutorial(false)} />
    </div>
  );
}
