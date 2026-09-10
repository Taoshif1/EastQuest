import type { GameSave } from "@/types/game";

export function recordDiscovery(
  save: GameSave,
  id: string,
): { save: GameSave; isNew: boolean } {
  if (save.discoveredPois?.includes(id)) return { save, isNew: false };
  return {
    isNew: true,
    save: {
      ...save,
      discoveredPois: [...(save.discoveredPois ?? []), id],
    },
  };
}
