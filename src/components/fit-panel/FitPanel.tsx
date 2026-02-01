"use client";

import { useAppState, useAppActions } from "@/state/store";
import { computeFitState } from "@/logic/fit";
import { getItemDisplayName } from "@/data/furniture-templates";
import FitSummary from "./FitSummary";
import FitItemList from "./FitItemList";
import SelectedItemFit from "./SelectedItemFit";

export default function FitPanel() {
  const { state } = useAppState();
  const { selectItem, updateFurniture } = useAppActions();
  const { roomDimensions, furnitureItems, selectedId } = state;
  const fitState = computeFitState(roomDimensions, furnitureItems);
  const selectedItem = furnitureItems.find((item) => item.id === selectedId);

  const itemLabelById = (id: string) => {
    const item = furnitureItems.find((i) => i.id === id);
    return item ? `${getItemDisplayName(item.type)}-${id.slice(-6)}` : id;
  };

  return (
    <div className="flex h-full flex-col overflow-auto border-l border-gray-200 bg-white p-4">
      <h2 className="text-lg font-semibold text-gray-800">适配</h2>
      <FitSummary
        roomDimensions={roomDimensions}
        itemCount={furnitureItems.length}
        overall={fitState.overall}
      />
      <FitItemList
        furnitureItems={furnitureItems}
        byItem={fitState.byItem}
        selectedId={selectedId}
        onSelectItem={selectItem}
        getItemDisplayName={getItemDisplayName}
      />
      <SelectedItemFit
        item={selectedItem ?? null}
        fit={selectedId ? fitState.byItem[selectedId] : undefined}
        itemLabelById={itemLabelById}
        getItemDisplayName={getItemDisplayName}
        onUpdateFurniture={updateFurniture}
      />
    </div>
  );
}
