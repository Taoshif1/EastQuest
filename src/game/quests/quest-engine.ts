import type {
  CampusLocation,
  GameSave,
  Profile,
  Quest,
  QuestStatus,
} from "@/types/game";
import type { LocationVerificationProvider } from "@/game/verification/location-verification";
import { progression } from "@/game/progression/progression";

export function newGame(profile: Profile): GameSave {
  return { version: 1, profile, xp: 0, level: 1, quests: {}, collectibles: {} };
}
/** Pure domain service: prerequisites and rewards live here, never in a modal or scene. */
export class QuestEngine {
  constructor(
    private definitions: Quest[],
    private locations: CampusLocation[],
    private verifier: LocationVerificationProvider,
  ) {}
  status(save: GameSave, id: string): QuestStatus {
    const quest = this.quest(id);
    if (save.quests[id]?.status === "COMPLETED") return "COMPLETED";
    if (
      !quest.prerequisites.every(
        (key) => save.quests[key]?.status === "COMPLETED",
      )
    )
      return "LOCKED";
    return save.quests[id]?.status === "ACTIVE" ? "ACTIVE" : "AVAILABLE";
  }
  private quest(id: string) {
    const quest = this.definitions.find((q) => q.id === id);
    if (!quest) throw new Error("Unknown quest.");
    return quest;
  }
  private async verify(quest: Quest) {
    const location = this.locations.find((l) => l.id === quest.locationId);
    if (!location) throw new Error("Unknown location.");
    const result = await this.verifier.verify(location);
    if (!result.verified)
      throw new Error(result.reason ?? "Location could not be verified.");
  }
  async activate(save: GameSave, id: string): Promise<GameSave> {
    if (this.status(save, id) === "LOCKED")
      throw new Error("Complete the Main Gate tutorial first.");
    if (this.status(save, id) === "COMPLETED") return save;
    await this.verify(this.quest(id));
    return {
      ...save,
      quests: {
        ...save.quests,
        [id]: {
          status: "ACTIVE",
          score: 0,
          attempts: save.quests[id]?.attempts ?? 0,
        },
      },
    };
  }
  /** Answers are evaluated here. A completed quest returns unchanged, protecting rewards. */
  async submit(
    save: GameSave,
    id: string,
    answer: number,
  ): Promise<{ save: GameSave; correct: boolean }> {
    const quest = this.quest(id);
    if (this.status(save, id) === "COMPLETED") return { save, correct: true };
    if (this.status(save, id) !== "ACTIVE")
      throw new Error("Start this quest before submitting.");
    await this.verify(quest);
    const previous = save.quests[id];
    const correct = answer === quest.config.correctIndex;
    const completedAt = new Date().toISOString();
    const xp = save.xp + (correct ? quest.rewardXp : 0);
    return {
      correct,
      save: {
        ...save,
        xp,
        level: progression(xp).level,
        quests: {
          ...save.quests,
          [id]: {
            status: correct ? "COMPLETED" : "ACTIVE",
            attempts: previous.attempts + 1,
            score: correct ? 100 : 0,
            ...(correct ? { completedAt } : {}),
          },
        },
        collectibles: correct
          ? {
              ...save.collectibles,
              [quest.collectibleId]: { obtainedAt: completedAt },
            }
          : save.collectibles,
      },
    };
  }
}
