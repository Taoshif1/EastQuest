import { defaultLocation } from "@/game/data/campus/index";
import type { PlayerWorldLocation } from "@/game/data/campus/types";
import type { GeoPosition, WorldPosition } from "@/types/game";
/** Supplies logical position independently of keyboard input, React, or quests. */
export interface PositionProvider {
  getPosition(): WorldPosition;
  getWorldLocation?(): PlayerWorldLocation;
  subscribe(listener: (p: WorldPosition) => void): () => void;
}
/** Phaser publishes collision-resolved coordinates; consumers never read keys. */
export class SimulatedPositionProvider implements PositionProvider {
  private listeners = new Set<(p: WorldPosition) => void>();
  private location = defaultLocation;
  constructor(private position: WorldPosition) {}
  getWorldLocation(): PlayerWorldLocation {
    return { ...this.location, position: this.getPosition() };
  }
  updateWorldLocation(location: PlayerWorldLocation) {
    this.location = { ...location, position: { ...location.position } };
    this.update(location.position);
  }
  getPosition() {
    return { ...this.position };
  }
  update(position: WorldPosition) {
    this.position = { ...position };
    this.listeners.forEach((fn) => fn(this.getPosition()));
  }
  subscribe(listener: (p: WorldPosition) => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}
/** Future calibration seam only: never treat latitude as a canvas x coordinate. */
export interface CampusCoordinateMapper {
  toWorld(position: GeoPosition): WorldPosition;
}
export interface GpsPositionSource {
  subscribe(listener: (p: GeoPosition) => void): () => void;
}
/** Unit vectors avoid the diagonal speed boost caused by adding two full speeds. */
export function normalizedDirection(x: number, y: number) {
  const length = Math.hypot(x, y);
  return length ? { x: x / length, y: y / length } : { x: 0, y: 0 };
}
