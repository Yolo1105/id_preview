"use client";

import React, { createContext, useContext, useReducer, useCallback, ReactNode } from "react";
import type {
  RoomDimensions,
  FurnitureItem,
  FurnitureTemplate,
  LayoutExport,
} from "./types";
import { DEFAULT_CHINESE_STYLE_LAYOUT } from "@/data/default-chinese-layout";

interface AppState {
  roomDimensions: RoomDimensions;
  furnitureItems: FurnitureItem[];
  selectedId: string | null;
  showBoundingBoxes: boolean;
}

type AppAction =
  | { type: "SET_ROOM_DIMENSIONS"; payload: RoomDimensions }
  | { type: "ADD_FURNITURE"; payload: FurnitureTemplate }
  | { type: "REMOVE_FURNITURE"; payload: string }
  | { type: "UPDATE_FURNITURE"; payload: { id: string; updates: Partial<FurnitureItem> } }
  | { type: "SELECT_ITEM"; payload: string | null }
  | { type: "CLEAR_ALL" }
  | { type: "LOAD_LAYOUT"; payload: LayoutExport }
  | { type: "TOGGLE_BOUNDING_BOXES" };

const defaultRoom: RoomDimensions = { width: 8, length: 10, height: 3.5 };

function getDefaultPosition(type: string, existingCount: number): [number, number, number] {
  const baseOffset = existingCount * 2;
  switch (type) {
    case "table":
      return [0, 0, -2];
    case "chair":
      return [0, 0, -1];
    case "desk":
      return [-3, 0, -2];
    case "shelf":
      return [3, 0, -2];
    case "cabinet":
      return [0, 0, 2];
    case "sofa":
      return [0, 0, 1];
    case "bed":
      return [-3, 0, 1];
    case "lamp":
      return [baseOffset, 0, baseOffset];
    default:
      return [baseOffset, 0, baseOffset];
  }
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_ROOM_DIMENSIONS":
      return { ...state, roomDimensions: action.payload };
    case "ADD_FURNITURE": {
      const template = action.payload;
      const newItem: FurnitureItem = {
        id: `${template.type}-${Date.now()}`,
        type: template.type,
        position: getDefaultPosition(template.type, state.furnitureItems.length),
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        ...(template.price != null && { price: template.price }),
      };
      return {
        ...state,
        furnitureItems: [...state.furnitureItems, newItem],
        selectedId: newItem.id,
      };
    }
    case "REMOVE_FURNITURE": {
      const next = state.furnitureItems.filter((item) => item.id !== action.payload);
      return {
        ...state,
        furnitureItems: next,
        selectedId: state.selectedId === action.payload ? null : state.selectedId,
      };
    }
    case "UPDATE_FURNITURE": {
      const { id, updates } = action.payload;
      return {
        ...state,
        furnitureItems: state.furnitureItems.map((item) =>
          item.id === id ? { ...item, ...updates } : item
        ),
      };
    }
    case "SELECT_ITEM":
      return { ...state, selectedId: action.payload };
    case "CLEAR_ALL":
      return {
        ...state,
        furnitureItems: [],
        selectedId: null,
      };
    case "LOAD_LAYOUT":
      return {
        ...state,
        roomDimensions: action.payload.roomDimensions,
        furnitureItems: action.payload.furnitureItems,
        selectedId: null,
      };
    case "TOGGLE_BOUNDING_BOXES":
      return { ...state, showBoundingBoxes: !state.showBoundingBoxes };
    default:
      return state;
  }
}

const initialState: AppState = {
  roomDimensions: defaultRoom,
  furnitureItems: DEFAULT_CHINESE_STYLE_LAYOUT,
  selectedId: null,
  showBoundingBoxes: false,
};

const AppStateContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  return (
    <AppStateContext.Provider value={{ state, dispatch }}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
}

export function useAppActions() {
  const { state, dispatch } = useAppState();
  const setRoomDimensions = useCallback(
    (dims: RoomDimensions) => dispatch({ type: "SET_ROOM_DIMENSIONS", payload: dims }),
    [dispatch]
  );
  const addFurniture = useCallback(
    (template: FurnitureTemplate) => dispatch({ type: "ADD_FURNITURE", payload: template }),
    [dispatch]
  );
  const removeFurniture = useCallback(
    (id: string) => dispatch({ type: "REMOVE_FURNITURE", payload: id }),
    [dispatch]
  );
  const updateFurniture = useCallback(
    (id: string, updates: Partial<FurnitureItem>) =>
      dispatch({ type: "UPDATE_FURNITURE", payload: { id, updates } }),
    [dispatch]
  );
  const selectItem = useCallback(
    (id: string | null) => dispatch({ type: "SELECT_ITEM", payload: id }),
    [dispatch]
  );
  const clearAll = useCallback(() => dispatch({ type: "CLEAR_ALL" }), [dispatch]);
  const loadLayout = useCallback(
    (layout: LayoutExport) => dispatch({ type: "LOAD_LAYOUT", payload: layout }),
    [dispatch]
  );
  const toggleBoundingBoxes = useCallback(
    () => dispatch({ type: "TOGGLE_BOUNDING_BOXES" }),
    [dispatch]
  );
  const exportLayout = useCallback((): LayoutExport => {
    return {
      roomDimensions: state.roomDimensions,
      furnitureItems: state.furnitureItems,
    };
  }, [state.roomDimensions, state.furnitureItems]);
  return {
    setRoomDimensions,
    addFurniture,
    removeFurniture,
    updateFurniture,
    selectItem,
    clearAll,
    loadLayout,
    toggleBoundingBoxes,
    exportLayout,
  };
}
