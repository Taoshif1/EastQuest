import type { WorldPosition } from "@/types/game";
export type GameEvents = {
  PLAYER_POSITION_CHANGED: WorldPosition;
  INTERACTION_AVAILABLE: string;
  INTERACTION_CLEARED: undefined;
  INTERACT: undefined;
  INPUT_CHANGED: WorldPosition;
  PAUSE_CHANGED: boolean;
  QUEST_STARTED: string;
  QUEST_COMPLETED: string;
  PROGRESS_UPDATED: string[];
};
/** A per-session typed bus. Unsubscribe on cleanup so remounts cannot duplicate handlers. */
export class GameBridge {
  private target = new EventTarget();
  private state: Partial<GameEvents> = {};
  emit<K extends keyof GameEvents>(type: K, detail: GameEvents[K]) {
    if (type === "PAUSE_CHANGED" || type === "PROGRESS_UPDATED")
      this.state[type] = detail;
    this.target.dispatchEvent(new CustomEvent(type, { detail }));
  }
  on<K extends keyof GameEvents>(
    type: K,
    listener: (payload: GameEvents[K]) => void,
  ) {
    const handler = (event: Event) =>
      listener((event as CustomEvent<GameEvents[K]>).detail);
    this.target.addEventListener(type, handler);
    if (type in this.state) listener(this.state[type] as GameEvents[K]);
    return () => this.target.removeEventListener(type, handler);
  }
}
