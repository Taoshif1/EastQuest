import type { Evidence } from "./evidence";
import type { WorldPosition } from "@/types/game";
export type Rect = { x: number; y: number; width: number; height: number };
export type BuildingId =
  "admin" | "a" | "b" | "c-north" | "c-middle" | "c-south" | "d" | "fub";
export type FloorId =
  | "lower-basement"
  | "upper-basement"
  | "ground"
  | "first"
  | "second"
  | "third"
  | "fourth"
  | "fifth"
  | "sixth"
  | "seventh"
  | "eighth"
  | "roof-deck";
export type PlayerWorldLocation = {
  buildingId: BuildingId | null;
  floorId: FloorId;
  position: WorldPosition;
};
export type MapObject = Rect & {
  kind:
    | "bench"
    | "chair"
    | "table"
    | "desk"
    | "counter"
    | "shelf"
    | "pillar"
    | "tree"
    | "scanner"
    | "punch"
    | "gate"
    | "stairs"
    | "lift"
    | "notice"
    | "glass"
    | "door"
    | "auditorium"
    | "gallery"
    | "lightwell";
  solid?: boolean;
};
export type Area = Rect & {
  id: string;
  name: string;
  buildingId: BuildingId | null;
  material: "stone" | "tile" | "wood" | "outdoor" | "terrace" | "parking";
  evidence: Evidence;
};
export type Floor = {
  id: FloorId;
  name: string;
  order: number;
  access: "EXPLORATION" | "REFERENCE_ONLY";
  source: string;
  evidence: Evidence;
  notes: string;
  areas: Area[];
  walls: Rect[];
  objects: MapObject[];
  labels: { x: number; y: number; text: string }[];
};
export type Connection = {
  id: string;
  buildingId: BuildingId;
  kind: "stairs" | "lift";
  name: string;
  position: WorldPosition;
  floors: FloorId[];
  evidence: Evidence;
};
