import type { Profile } from "@/types/game";
import type { GameRepository } from "@/game/persistence/game-repository";
import { parseStudentId, studentIdToEmail } from "@/lib/validation/student-id";
import { newGame } from "@/game/quests/quest-engine";
/** Future SupabaseAuthProvider / EwuSsoAuthProvider implement this same boundary. */
export interface AuthProvider {
  signIn(studentId: string): Promise<Profile>;
  signOut(): Promise<void>;
}
export class PrototypeAuthProvider implements AuthProvider {
  constructor(private repository: GameRepository) {}
  async signIn(input: string) {
    const studentId = parseStudentId(input);
    if (!studentId) throw new Error("Use a student ID like 2023-3-60-376.");
    const existing = await this.repository.load(studentId);
    const profile = existing?.profile ?? {
      id: `local:${studentId}`,
      studentId,
      email: studentIdToEmail(studentId),
      displayName: "Campus Explorer",
      avatarId: "explorer-01",
    };
    if (!existing) await this.repository.save(newGame(profile));
    await this.repository.setActiveStudentId(studentId);
    return profile;
  }
  async signOut() {
    await this.repository.setActiveStudentId(null);
  }
}
