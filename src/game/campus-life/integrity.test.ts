import { describe, expect, it } from "vitest";
import { activities } from "@/game/activities/data";
import { floorById, walkable } from "@/game/data/campus/index";
import { locations } from "@/game/data/campus/pois";
import {
  hiddenDiscoveries,
  npcs,
  sideQuests,
  worldInteractions,
} from "./data";

describe("campus-life content integrity", () => {
  it("keeps world content on real, walkable floors", () => {
    const invalid: string[] = [];
    const nearestWalkable = (floorId: string, position: { x: number; y: number }) => {
      for (let radius = 0; radius <= 400; radius += 20) {
        for (let dx = -radius; dx <= radius; dx += 20) {
          for (const dy of [-radius, radius]) {
            const candidate = { x: position.x + dx, y: position.y + dy };
            if (walkable(floorId, candidate)) return `${candidate.x},${candidate.y}`;
          }
        }
      }
      return "none";
    };
    for (const item of [...worldInteractions, ...npcs, ...hiddenDiscoveries]) {
      if (!floorById(item.floorId) || !walkable(item.floorId, item.position))
        invalid.push(`${item.id} (try ${nearestWalkable(item.floorId, item.position)})`);
    }
    expect(invalid).toEqual([]);
  });

  it("keeps cross-references connected", () => {
    const interactionIds = new Set(worldInteractions.map((item) => item.id));
    const npcIds = new Set(npcs.map((item) => item.id));
    const activityIds = new Set(activities.map((item) => item.id));
    const locationIds = new Set(locations.map((item) => item.id));

    for (const discovery of hiddenDiscoveries)
      expect(interactionIds.has(discovery.interactionId), discovery.id).toBe(true);
    for (const interaction of worldInteractions) {
      if (interaction.activityId)
        expect(activityIds.has(interaction.activityId), interaction.id).toBe(true);
    }
    for (const npc of npcs) {
      for (const questId of npc.questIds)
        expect(sideQuests.some((quest) => quest.id === questId), `${npc.id}:${questId}`).toBe(true);
    }
    for (const quest of sideQuests) {
      for (const step of quest.steps) {
        if (step.interactionId)
          expect(interactionIds.has(step.interactionId), `${quest.id}:${step.id}`).toBe(true);
        if (step.npcId)
          expect(npcIds.has(step.npcId), `${quest.id}:${step.id}`).toBe(true);
        if (step.domain)
          expect(activities.some((activity) => activity.domain === step.domain), `${quest.id}:${step.id}`).toBe(true);
      }
    }
    for (const activity of activities) {
      if (activity.locationId)
        expect(locationIds.has(activity.locationId), activity.id).toBe(true);
    }
  });
});
