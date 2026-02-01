"use client";

import type { FurnitureTemplate } from "@/state/types";
import { furnitureTemplates } from "@/data/furniture-templates";

function toTemplate(t: { type: string; price: number }): FurnitureTemplate {
  return { type: t.type, price: t.price };
}

function Icon({ name }: { name: string }) {
  const className = "h-6 w-6 shrink-0 text-gray-500";
  switch (name) {
    case "table":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="9" width="18" height="6" rx="1" />
          <line x1="6" y1="15" x2="6" y2="20" />
          <line x1="12" y1="15" x2="12" y2="20" />
          <line x1="18" y1="15" x2="18" y2="20" />
        </svg>
      );
    case "chair":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="6" y="12" width="12" height="6" rx="1" />
          <rect x="8" y="6" width="8" height="8" rx="1" />
          <line x1="10" y1="12" x2="10" y2="18" />
          <line x1="14" y1="12" x2="14" y2="18" />
        </svg>
      );
    case "desk":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="8" width="20" height="10" rx="1" />
          <line x1="8" y1="8" x2="8" y2="20" />
          <line x1="16" y1="8" x2="16" y2="20" />
        </svg>
      );
    case "shelf":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="6" y1="6" x2="6" y2="18" />
          <line x1="12" y1="8" x2="12" y2="18" />
          <line x1="18" y1="10" x2="18" y2="18" />
          <line x1="6" y1="18" x2="18" y2="18" />
        </svg>
      );
    case "cabinet":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="1" />
          <line x1="12" y1="3" x2="12" y2="21" />
          <line x1="3" y1="12" x2="21" y2="12" />
        </svg>
      );
    case "sofa":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="10" width="20" height="8" rx="2" />
          <line x1="6" y1="10" x2="6" y2="18" />
          <line x1="18" y1="10" x2="18" y2="18" />
        </svg>
      );
    case "bed":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="8" width="20" height="10" rx="1" />
          <rect x="4" y="4" width="16" height="6" rx="1" />
        </svg>
      );
    case "lamp":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="8" r="5" />
          <line x1="12" y1="13" x2="12" y2="20" />
          <line x1="8" y1="20" x2="16" y2="20" />
        </svg>
      );
    default:
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="4" y="4" width="16" height="16" rx="2" />
        </svg>
      );
  }
}

interface FurniturePaletteProps {
  onAdd: (template: FurnitureTemplate) => void;
}

export default function FurniturePalette({ onAdd }: FurniturePaletteProps) {
  return (
    <div className="space-y-1">
      {furnitureTemplates.map((template) => (
        <button
          key={template.type}
          type="button"
          onClick={() => onAdd(toTemplate(template))}
          className="flex w-full items-center gap-3 rounded border border-gray-200 bg-white p-2 text-left hover:bg-gray-50"
        >
          <Icon name={template.icon} />
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-gray-800">{template.name}</div>
            <div className="truncate text-xs text-gray-500">{template.description}</div>
          </div>
        </button>
      ))}
    </div>
  );
}
