import type { GameRepository } from "@/game/persistence/game-repository";
import type { GameSave } from "@/types/game";
/** Future transport must enforce auth.uid() and atomic server-verified rewards.
 * No SDK, credentials, or remote calls are required for the local V0.
 */
export class SupabaseGameRepository implements GameRepository {
  constructor(private authenticatedTransport: GameRepository) {}
  load(id: string) {
    return this.authenticatedTransport.load(id);
  }
  save(game: GameSave) {
    return this.authenticatedTransport.save(game);
  }
  remove(id: string) {
    return this.authenticatedTransport.remove(id);
  }
  activeStudentId() {
    return this.authenticatedTransport.activeStudentId();
  }
  setActiveStudentId(id: string | null) {
    return this.authenticatedTransport.setActiveStudentId(id);
  }
}
