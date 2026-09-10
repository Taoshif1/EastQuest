import type { FloorId, Rect } from "./types";
export type CalibrationOptions = {
  collisions: boolean;
  blueprint: boolean;
  color: boolean;
  opacity: number;
  offsetX: number;
  offsetY: number;
  scale: number;
};
export const defaultCalibration: CalibrationOptions = {
  collisions: false,
  blueprint: false,
  color: true,
  opacity: 0.3,
  offsetX: 0,
  offsetY: 0,
  scale: 1,
};
// Normalized drawing bounds exclude legends and engineering margins. These align
// the main footprint to the rectified game footprint, not to surveyed metres.
const monochrome: Record<FloorId, [number, number, number, number]> = {
  "lower-basement": [0.08, 0.078, 0.68, 0.77],
  "upper-basement": [0.087, 0.081, 0.862, 0.773],
  ground: [0.092, 0.091, 0.675, 0.75],
  first: [0.108, 0.087, 0.84, 0.742],
  second: [0.078, 0.079, 0.885, 0.75],
  third: [0.06, 0.079, 0.645, 0.75],
  fourth: [0.06, 0.079, 0.645, 0.75],
  fifth: [0.074, 0.083, 0.655, 0.75],
  sixth: [0.09, 0.086, 0.86, 0.75],
  seventh: [0.087, 0.085, 0.761, 0.725],
  eighth: [0.08, 0.076, 0.66, 0.744],
  "roof-deck": [0.08, 0.086, 0.66, 0.75],
};
export function blueprintBounds(floorId: FloorId, color: boolean): Rect {
  const [left, top, right, bottom] =
    color && floorId !== "roof-deck"
      ? floorId.includes("basement")
        ? [0.007, 0.075, 0.69, 0.835]
        : [0.006, 0.01, 0.69, 0.76]
      : monochrome[floorId];
  const width = 1240 / (right - left),
    height = 1040 / (bottom - top);
  return { x: 160 - left * width, y: 100 - top * height, width, height };
}
