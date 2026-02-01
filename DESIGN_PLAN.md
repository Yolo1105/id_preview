# Combined Room Planner + Fit Validation — Design Plan

**Purpose:** Single interface that merges (1) Three.js room/furniture placement and (2) furniture-fit validation (room bounds + collisions) into one cohesive experience.  
**Scope:** Plan only — UI design, functions, features, and code structure. No implementation in the furnishes repo; all new code lives in `id_preview` (or a dedicated app that consumes/embeds these concepts).

---

## 1. High-Level Concept

**One screen, two mental zones:**

| Zone | Role | User mental model |
|------|------|-------------------|
| **Canvas** | Place, move, rotate furniture in 3D; see room and items | “I’m arranging my room.” |
| **Fit panel** | See at a glance: “Does it fit?” (room + overlaps) | “I’m checking if my layout is valid.” |

They share the same data: room dimensions, furniture list, positions, rotations. The canvas is the primary interaction; the fit panel is a persistent “validation dashboard” that updates live.

---

## 2. UI Layout (Single Interface)

### 2.1 Overall Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Header: Title, Room size (W×L×H), “Fit status” badge (e.g. ✓ All fit)     │
├──────────────┬──────────────────────────────────────────────┬───────────────┤
│              │                                              │               │
│  Left        │           MAIN CANVAS (Three.js)              │  Right        │
│  sidebar     │   • Room (floor + 3 walls)                    │  panel        │
│              │   • Furniture (place / move / rotate)         │               │
│  • Add       │   • Bounding boxes (optional)                 │  • Selected   │
│    furniture │   • Collision highlight (red) in same view   │    item       │
│  • Room      │   • Camera controls (top/side/front/persp)   │    details    │
│    size      │                                              │  • Fit        │
│  • Clear /   │   [Optional: small 2D top-down minimap]       │    summary    │
│    Export    │                                              │    (this     │
│              │                                              │    interface) │
│              │                                              │               │
├──────────────┴──────────────────────────────────────────────┴───────────────┤
│  Bottom bar (optional): Collision list (compact), or “X items overlap”      │
└─────────────────────────────────────────────────────────────────────────────┘
```

- **Left:** Add furniture, set room size, clear/export (like current playground sidebar).
- **Center:** Full Three.js canvas — same “place and edit” behavior; collision state shown by red highlight in this same view.
- **Right:** “Fit” interface — selected item details + **fit summary** (see 2.3). This is where the “furniture fit” feature is surfaced in one place.
- **Bottom (optional):** Compact list of items with collisions, or a single line “2 items overlap / 1 item past wall”.

### 2.2 Header

- **Title:** e.g. “Room planner” or “Layout & fit”.
- **Room size:** Display only or editable (e.g. `8 × 10 × 3.5 m`).
- **Fit status badge:**
  - Green / “All fit” when no wall collisions and no furniture–furniture collisions.
  - Amber / “Overlaps” when furniture–furniture only.
  - Red / “Out of room” when any item exceeds room bounds (or mixed).
- **Actions:** Screenshot, Export layout, Reset (optional).

### 2.3 Right Panel — “Fit” Interface (Core Combined Feature)

This panel is the dedicated “does it fit?” surface. It does **not** duplicate the 3D view; it summarizes validation.

**When nothing selected:**

- **Fit summary card:**
  - “Room: 8×10 m” (or current dimensions).
  - “Furniture: N items.”
  - Status: “All fit” / “X items overlap” / “X items out of room” (with short list or counts).
- **List (compact):** Each item with a small status icon:
  - ✓ Fits
  - ⚠ Overlaps [other items]
  - ✗ Out of room [wall names]

**When an item is selected:**

- **Selected item card:**
  - Name/type, position (X, Z or X,Y,Z), rotation (optional).
  - **Fit for this item:**
    - “Fits in room” or “Out of room: left wall, front wall”.
    - “No overlaps” or “Overlaps: Sofa-1, Table-2”.
  - Optional: dimensions (W×D×H) of the item’s bounding box.

**Behavior:**

- All data comes from the same state that drives the Three.js scene (room dimensions, furniture list, positions, rotations).
- Collision/wall logic is the same as in furnishes (AABB vs room bounds, AABB vs AABB on XZ). No second “validation app”; one engine, two views (3D + this panel).

### 2.4 Canvas (Three.js) — Unchanged Role, Clear Feedback

- Keep: place, move (G), rotate (R), camera views, bounding box toggle (B), click-to-select.
- Keep: collision visualization in the **same** view (red tint / red wireframe for items that don’t “fit”).
- Optional: subtle floor grid or 2D top-down minimap in a corner to reinforce “fit in room” (e.g. outline of room and item footprints).

No second 3D “validation view”; the single canvas is both “arrange” and “see what doesn’t fit.”

---

## 3. Functions & Features (Checklist)

### 3.1 Room & Data

| Function | Description |
|----------|-------------|
| `setRoomDimensions(width, length, height)` | Update room size; canvas and fit panel both use this. |
| `getRoomDimensions()` | Return current room size (for display and collision). |
| `getFurnitureList()` | List of items with id, type, position, rotation, scale (and optional dimensions). |
| `addFurniture(template)` | Add one item; default position; immediate fit re-check. |
| `removeFurniture(id)` | Remove item. |
| `updateFurniture(id, { position?, rotation?, scale? })` | Update transform; used by canvas and triggers fit re-compute. |
| `clearAll()` | Remove all furniture; reset fit state. |
| `exportLayout()` | Export room + furniture (e.g. JSON). |
| `importLayout(json)` | Load room + furniture; run fit after load. |

### 3.2 Fit / Validation (Shared Logic)

| Function | Description |
|----------|-------------|
| `computeFitState()` | Returns: `{ byItem: Record<id, ItemFit>, overall: OverallFit }`. |
| `ItemFit` | `{ inRoom: boolean, wallHits: string[], overlappingIds: string[] }`. |
| `OverallFit` | `{ allInRoom: boolean, noOverlaps: boolean, status: 'ok' | 'overlaps' | 'out_of_room' }`. |
| `getBoundingBox(type, scale?)` | W×D×H per furniture type (and scale); used for collision and optional display in right panel. |

All of these are pure functions or derived state from: room dimensions + furniture list (positions, rotations, scales, types). No UI in this layer.

### 3.3 Canvas (Three.js)

| Function / feature | Description |
|--------------------|-------------|
| Render room | Floor, 3 walls, optional grid/outline; size from `roomDimensions`. |
| Render furniture | One mesh/group per item; position/rotation/scale from state. |
| Selection | Click to select; selected id stored in shared state. |
| Transform controls | Move (G) / Rotate (R) on selected item; write back via `updateFurniture`. |
| Camera | Perspective, top, front, side; optional minimap. |
| Visual fit feedback | Red tint or red wireframe for items where `ItemFit.inRoom === false` or `overlappingIds.length > 0`. |
| Bounding box toggle | Show/hide AABB per item (optional). |
| Screenshot | Export canvas as image. |

### 3.4 Fit Panel (UI Only)

| Feature | Description |
|---------|-------------|
| Overall status badge | Green / Amber / Red from `OverallFit.status`. |
| Summary card | Counts: “N items fit”, “M overlap”, “K out of room”. |
| Per-item list | Icon + label + short text (e.g. “Out of room: left wall”). |
| Selected-item card | Name, position, rotation; “Fits in room” or wall list; “No overlaps” or list of overlapping items. |
| Optional | Show W×D×H for selected item; “Suggested move” (e.g. “Move right 0.5 m”) — future. |

### 3.5 Persistence & Export (Optional)

| Feature | Description |
|---------|-------------|
| Save layout | JSON: roomDimensions, furnitureItems. |
| Load layout | Parse JSON; `setRoomDimensions` + add/update furniture; run `computeFitState`. |
| Export for furnishes | Same JSON shape so furnishes could import it later. |

---

## 4. Data Flow (Single Source of Truth)

```
┌─────────────────────────────────────────────────────────────────┐
│  State (e.g. React state or context)                            │
│  • roomDimensions: { width, length, height }                     │
│  • furnitureItems: { id, type, position, rotation, scale }[]     │
│  • selectedId: string | null                                     │
└───────────────┬─────────────────────────────────────────────────┘
                │
    ┌───────────┼───────────┬───────────────────┐
    ▼           ▼           ▼                   ▼
  Canvas    Fit panel   Left sidebar      Header
  (Three)   (summary +  (add/remove/     (badge,
            per-item)   room size)       export)
                │
                ▼
        computeFitState(roomDimensions, furnitureItems)
                │
        • byItem[id] → inRoom, wallHits, overlappingIds
        • overall   → status, allInRoom, noOverlaps
```

- **State** is the only source. Canvas and fit panel are two views over the same state.
- **Fit** is derived: `computeFitState(roomDimensions, furnitureItems)` (and optionally rotation/scale for future AABB). No separate “validation backend”; same logic as furnishes, callable from one place.

---

## 5. Code Structure (For id_preview or New App)

Suggested modules (no code yet; only roles):

```
id_preview/
├── DESIGN_PLAN.md                 # This file
├── docs/
│   └── COMBINED_INTERFACE_SPEC.md # Optional: copy of sections 1–4
├── src/                           # When you implement
│   ├── state/
│   │   ├── types.ts               # RoomDimensions, FurnitureItem, ItemFit, OverallFit
│   │   └── store.ts               # State + actions (or context)
│   ├── logic/
│   │   ├── collision.ts           # AABB vs room, AABB vs AABB; getBoundingBox(type)
│   │   └── fit.ts                 # computeFitState(room, items) → byItem, overall
│   ├── components/
│   │   ├── layout/
│   │   │   └── CombinedLayout.tsx # Header + Left + Canvas + Right (+ optional bottom)
│   │   ├── canvas/
│   │   │   ├── Scene.tsx         # R3F Canvas, room + furniture, selection, transform
│   │   │   ├── Room.tsx          # Floor, walls (uses roomDimensions)
│   │   │   └── FurnitureMesh.tsx  # One item; red if !inRoom or overlaps
│   │   ├── fit-panel/
│   │   │   ├── FitPanel.tsx      # Right panel container
│   │   │   ├── FitSummary.tsx    # Overall badge + counts
│   │   │   ├── FitItemList.tsx   # Per-item icons + short status
│   │   │   └── SelectedItemFit.tsx # Selected item’s fit details
│   │   └── sidebar/
│   │       ├── Sidebar.tsx       # Left: add furniture, room size, clear, export
│   │       └── FurniturePalette.tsx
│   └── app/
│       └── page.tsx              # Renders CombinedLayout with provider
└── package.json                  # React, R3F, drei, three (when you add code)
```

- **state:** Single place for room + furniture + selectedId.
- **logic:** Pure fit/collision; no UI.
- **components:** Layout splits left / center / right; canvas and fit-panel both read from state and (for fit) from `computeFitState`.

---

## 6. Feature Summary Table

| Feature | Where it lives | Notes |
|---------|----------------|-------|
| 3D room + furniture | Canvas (Three.js) | Same as current playground. |
| Move/rotate furniture | Canvas + state | Transform controls → updateFurniture. |
| “Does it fit in room?” | logic/fit + Fit panel + canvas | AABB vs room; show in right panel + red in 3D. |
| “Does it overlap others?” | logic/fit + Fit panel + canvas | AABB vs AABB; show in right panel + red in 3D. |
| Overall status | Header + Fit panel | Badge + summary from OverallFit. |
| Per-item status | Fit panel list + Selected item card | From byItem[id]. |
| Add/remove furniture | Left sidebar | Same idea as playground. |
| Room size | Left sidebar + header | Drives room mesh and fit. |
| Export/import | Header or sidebar | JSON layout. |
| Screenshot | Header | Canvas export. |

---

## 7. What You Have vs What This Plan Adds

- **Furnishes (existing):** Already has Three.js canvas + collision logic + collision UI (warning panel + DetailInfoPopup). Two “sections” that are separate in the UI.
- **This plan:** One interface that **combines** them by:
  - Keeping one canvas (no second 3D view).
  - Adding a dedicated **right-side “Fit” panel** (summary + per-item + selected-item fit).
  - Using the same collision/fit logic as one derived layer (`computeFitState`).
  - Optionally a header fit badge and a compact bottom collision list.

When you implement, you can either:
- Build this in `id_preview` from scratch (using this plan and reusing the same math as furnishes), or
- Refactor furnishes so that its existing canvas + collision logic are fed by one state and a new right panel + header badge are added to match this layout.

This document stays plan-only; no edits to the furnishes repo, and all new code is intended for id_preview (or a new app you create from this spec).
