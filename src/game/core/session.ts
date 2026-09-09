import { GameBridge } from "@/game/events/bridge";
import { SimulatedPositionProvider } from "@/game/movement/position-provider";
import { ProximityVerificationProvider } from "@/game/verification/location-verification";
import { QuestEngine } from "@/game/quests/quest-engine";
import { locations, quests, WORLD } from "@/game/data/campus";
/** One runtime per mounted app, shared by the UI and the engine host. */
export function createSession() {
  const bridge = new GameBridge();
  const position = new SimulatedPositionProvider(WORLD.spawn);
  const verifier = new ProximityVerificationProvider(position);
  const engine = new QuestEngine(quests, locations, verifier);
  return { bridge, position, engine };
}
export type GameSession = ReturnType<typeof createSession>;
