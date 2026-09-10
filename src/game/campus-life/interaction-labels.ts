import { activityById } from "@/game/activities";
import { interactionById } from "./data";

export function interactionAction(id: string | null, hasConnection: boolean) {
  if (!id) return hasConnection ? "Choose floor" : "Interact";
  if (id.startsWith("npc:")) return "Talk";
  const interaction = interactionById(id);
  if (interaction?.kind === "discovery") return "Investigate";
  if (interaction?.activityId || activityById(interaction?.activityId ?? "")) return "Play";
  if (interaction) {
    const prompt = interaction.prompt.toLowerCase();
    if (prompt.includes("read") || prompt.includes("note") || prompt.includes("board")) return "Read";
    if (prompt.includes("collect") || prompt.includes("refill")) return "Collect";
    return "Inspect";
  }
  return hasConnection ? "Choose floor" : "Enter";
}
