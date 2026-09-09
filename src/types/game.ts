export type WorldPosition = { x: number; y: number };
export type GeoPosition = {
  latitude: number;
  longitude: number;
  accuracy: number;
};
export type VerificationMode = "proximity" | "gps" | "qr" | "vision";
export interface CampusLocation {
  id: string;
  slug: string;
  name: string;
  description: string;
  type: "entrance" | "learning" | "career" | "support";
  worldPosition: WorldPosition;
  interactionRadius: number;
  verificationModes: VerificationMode[];
  geoPosition?: GeoPosition;
  radiusMeters?: number;
  floor?: string;
  officialResourceUrl?: string;
}
export type MiniGameType =
  "tutorial" | "multiple-choice" | "quick-decision" | "logic" | "scenario";
export interface Quest {
  id: string;
  locationId: string;
  title: string;
  description: string;
  type: MiniGameType;
  prerequisites: string[];
  rewardXp: number;
  collectibleId: string;
  config: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
    steps?: string[];
  };
}
export type QuestStatus = "LOCKED" | "AVAILABLE" | "ACTIVE" | "COMPLETED";
export interface QuestProgress {
  status: QuestStatus;
  score: number;
  attempts: number;
  completedAt?: string;
}
export interface Collectible {
  id: string;
  name: string;
  description: string;
  location: string;
  whyItMatters: string;
  icon: string;
}
export interface Profile {
  id: string;
  studentId: string;
  email: string;
  displayName: string;
  avatarId: string;
}
export interface GameSave {
  version: 1;
  profile: Profile;
  xp: number;
  level: number;
  quests: Record<string, QuestProgress>;
  collectibles: Record<string, { obtainedAt: string }>;
}
