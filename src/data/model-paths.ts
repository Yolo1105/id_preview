/**
 * Maps furniture types to GLB model paths (under public/).
 * Place your .glb files in public/models/ (e.g. public/models/table.glb).
 * If a model is missing, the app falls back to a simple box.
 */
export const FURNITURE_MODEL_PATHS: Record<string, string> = {
  table: "/models/table.glb",
  chair: "/models/chair.glb",
  desk: "/models/desk.glb",
  shelf: "/models/shelf.glb",
  cabinet: "/models/cabinet.glb",
  sofa: "/models/sofa.glb",
  bed: "/models/bed.glb",
  lamp: "/models/lamp.glb",
};
