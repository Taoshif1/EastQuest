import { restoreLocation } from "@/game/data/campus/index";
import type { GameSave } from "@/types/game";
import { initialCases } from "@/game/cases/engine";
import { initialActivities } from "@/game/activities/engine";
/** All storage is behind this contract; a production adapter can use authenticated APIs. */
export interface GameRepository {
  load(studentId: string): Promise<GameSave | null>;
  save(game: GameSave): Promise<void>;
  remove(studentId: string): Promise<void>;
  activeStudentId(): Promise<string | null>;
  setActiveStudentId(id: string | null): Promise<void>;
}
export interface StoragePort {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}
/** Versioned local saves are convenient, editable prototype data, never trusted identity. */
export class LocalGameRepository implements GameRepository {
  constructor(private storage: StoragePort) {}
  private key(id: string) {
    return `eastquest:v1:player:${id}`;
  }
  async load(id: string): Promise<GameSave | null> {
    const raw = this.storage.getItem(this.key(id));
    if (!raw) return null;
    try {
      const data = JSON.parse(raw) as GameSave;
      if (
        data.version !== 1 ||
        data.profile?.studentId !== id ||
        typeof data.profile.avatarId !== "string" ||
        !Number.isFinite(data.xp) ||
        data.xp < 0 ||
        !Number.isInteger(data.level) ||
        !data.quests ||
        !data.collectibles
      )
        throw new Error();
      for (const p of Object.values(data.quests))
        if (
          !p ||
          !["LOCKED", "AVAILABLE", "ACTIVE", "COMPLETED"].includes(p.status) ||
          !Number.isFinite(p.attempts)
        )
          throw new Error();
      for (const c of Object.values(data.collectibles))
        if (!c || !Number.isFinite(Date.parse(c.obtainedAt))) throw new Error();
      const migratedActivities = { ...initialActivities() };
      if (data.activities && typeof data.activities === "object") {
        for (const [id, value] of Object.entries(data.activities)) {
          if (
            value &&
            typeof value === "object" &&
            Number.isFinite(value.plays) &&
            Number.isFinite(value.bestScore) &&
            typeof value.completed === "boolean"
          ) {
            migratedActivities[id] = {
              plays: Math.max(0, Math.floor(value.plays)),
              bestScore: Math.max(0, Math.min(100, value.bestScore)),
              completed: value.completed,
              ...(typeof value.lastPlayedAt === "string"
                ? { lastPlayedAt: value.lastPlayedAt }
                : {}),
            };
          }
        }
      }
      const migratedStamps: NonNullable<GameSave["stamps"]> = {};
      if (data.stamps && typeof data.stamps === "object") {
        for (const [id, value] of Object.entries(data.stamps)) {
          if (
            value &&
            typeof value === "object" &&
            typeof value.obtainedAt === "string" &&
            Number.isFinite(Date.parse(value.obtainedAt))
          ) {
            migratedStamps[id] = { obtainedAt: value.obtainedAt };
          }
        }
      }
      return {
        ...data,
        worldRevision: 2,
        worldLocation: restoreLocation(
          data.worldRevision === 2 ? data.worldLocation : null,
        ),
        discoveredPois: Array.isArray(data.discoveredPois)
          ? data.discoveredPois.filter((id) => typeof id === "string")
          : [],
        cases: data.cases && typeof data.cases === "object" ? { ...initialCases(), ...data.cases } : initialCases(),
        badges: data.badges && typeof data.badges === "object" ? data.badges : {},
        activities: migratedActivities,
        achievements:
          data.achievements && typeof data.achievements === "object"
            ? data.achievements
            : {},
        stamps: migratedStamps,
        discoveredRumors: Array.isArray(data.discoveredRumors)
          ? data.discoveredRumors.filter((id) => typeof id === "string")
          : [],
      };
    } catch {
      throw new Error(
        "This local save is unreadable. Use Reset local profile on the login screen to start again.",
      );
    }
  }
  async save(game: GameSave) {
    this.storage.setItem(
      this.key(game.profile.studentId),
      JSON.stringify(game),
    );
  }
  async remove(id: string) {
    this.storage.removeItem(this.key(id));
  }
  async activeStudentId() {
    return this.storage.getItem("eastquest:active");
  }
  async setActiveStudentId(id: string | null) {
    if (id) this.storage.setItem("eastquest:active", id);
    else this.storage.removeItem("eastquest:active");
  }
}
