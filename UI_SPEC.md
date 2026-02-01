# Combined Interface — UI Spec (Wireframe)

Quick reference for the single-screen layout that combines Three.js room and furniture-fit validation.

---

## Screen Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Logo]  Room planner    Room: 8×10×3.5 m    [✓ All fit]  [Export] [Reset] │
├────────────┬──────────────────────────────────────────────┬─────────────────┤
│            │  ┌────────────────────────────────────────┐   │  Fit summary    │
│  Add       │  │                                        │   │  ─────────────  │
│  furniture │  │         Three.js canvas                │   │  Room: 8×10 m   │
│  ─────────  │  │   • Room (floor + 3 walls)             │   │  Items: 5       │
│  [Table]   │  │   • Furniture (place/move/rotate)      │   │  Status: All ✓  │
│  [Chair]   │  │   • Red = doesn’t fit / overlaps       │   │                 │
│  [Desk]    │  │                                        │   │  Per-item list   │
│  [Sofa]    │  │   [Camera: persp|top|front|side]      │   │  ─────────────   │
│  …         │  │   [Move G] [Rotate R] [Boxes B]       │   │  ✓ Table-1       │
│            │  └────────────────────────────────────────┘   │  ✓ Chair-2       │
│  Room size │                                                │  ⚠ Sofa-3       │
│  W [8]  L [10]  H [3.5]                                    │  ✓ Desk-4       │
│            │                                                │  ✓ Lamp-5       │
│  [Clear]   │                                                │                 │
│  [Import]  │                                                │  Selected item   │
│            │                                                │  ─────────────   │
│            │                                                │  Sofa-3         │
│            │                                                │  Pos: 0, 0, 1   │
│            │                                                │  Fits room: No  │
│            │                                                │  Out: left wall │
│            │                                                │  Overlaps: Table │
└────────────┴──────────────────────────────────────────────┴─────────────────┘
┌─────────────────────────────────────────────────────────────────────────────┐
│  Collisions: Sofa-3 (left wall, Table-1)                          [Dismiss]  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Component Map

| Area | Component | Contents |
|------|-----------|----------|
| **Header** | `Header` | Title, room size (read-only or edit), fit badge (All fit / Overlaps / Out of room), Export, Reset |
| **Left** | `Sidebar` | Furniture palette (add items), room dimensions (W, L, H), Clear, Import |
| **Center** | `Canvas` | R3F scene: Room, furniture meshes, selection, transform controls, camera/view buttons, red highlight for bad fit |
| **Right** | `FitPanel` | Fit summary (room size, item count, overall status), per-item list (icon + status), selected-item card (position, “Fits room”, “Overlaps”) |
| **Bottom** | `CollisionBar` (optional) | One-line or expandable list of items with collisions; dismiss |

---

## Fit Panel States

**No selection**

- Summary: room size, N items, status (All fit / X overlap / X out of room).
- List: each item with ✓ / ⚠ / ✗ and short label (e.g. “Out: left wall”, “Overlaps: 2”).

**With selection**

- Same summary + list.
- Selected item card: name, position (and optional rotation), “Fits in room: Yes/No”, “Out of room: …”, “Overlaps: …”.

---

## Fit Status Rules

| Condition | Badge | Item icon |
|-----------|--------|-----------|
| All items in room, no overlaps | ✓ All fit (green) | ✓ |
| Any item out of room | Out of room (red) | ✗ for those items |
| Any overlap, all in room | Overlaps (amber) | ⚠ for those items |
| Both out of room and overlaps | Out of room (red) | ✗ / ⚠ per item |

---

## Data → UI

- **Header badge:** `overall.status` → “All fit” | “Overlaps” | “Out of room”.
- **Fit summary:** `roomDimensions`, `furnitureItems.length`, `overall`.
- **Per-item list:** `byItem[id]` → icon + “Fits” | “Out: …” | “Overlaps: …”.
- **Selected card:** `selectedId` + `byItem[selectedId]` + `furnitureItems.find(id)`.
- **Canvas red highlight:** For each item, red if `!byItem[id].inRoom || byItem[id].overlappingIds.length > 0`.

All of the above can be implemented in id_preview using the structure in `DESIGN_PLAN.md`; no edits required to the furnishes repo.
