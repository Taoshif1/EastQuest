import type { Evidence } from "@/game/data/campus/evidence";
import type {
  BuildingId,
  FloorId,
  PlayerWorldLocation,
} from "@/game/data/campus/types";
export type WorldPosition = { x: number; y: number };
export type GeoPosition = {
  latitude: number;
  longitude: number;
  accuracy: number;
};
export type VerificationMode = "proximity" | "gps" | "qr" | "vision";
export interface CampusLocation {
  id: string;
  buildingId: BuildingId | null;
  floorId: FloorId;
  evidence: Evidence;
  geometryEvidence?: Evidence;
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
  specialty?: KnowledgeDomain;
}
export type KnowledgeDomain =
  | "COMPUTING"
  | "ENGINEERING"
  | "BUSINESS_FINANCE"
  | "LIFE_SCIENCE"
  | "LAW_SOCIETY"
  | "LANGUAGE_HUMANITIES"
  | "GENERAL"
  | "SPORTS";
export type ActivityDomain =
  | "ACADEMICS"
  | "TECH"
  | "CREATIVE"
  | "LEADERSHIP"
  | "WELLBEING"
  | "SPORTS"
  | "COMMUNITY";
export type ActivityGameType = "choice" | "timing" | "penalty" | "reaction";
export interface ActivityRound {
  prompt: string;
  options?: string[];
  correctIndex?: number;
  explanation?: string;
}
export interface ActivityDefinition {
  id: string;
  title: string;
  domain: ActivityDomain;
  subtitle: string;
  description: string;
  gameType: ActivityGameType;
  rewardXp: number;
  locationId?: string;
  specialty?: KnowledgeDomain;
  rounds: ActivityRound[];
  tags: string[];
  hidden?: boolean;
}
export interface ActivityProgress {
  plays: number;
  bestScore: number;
  completed: boolean;
  lastPlayedAt?: string;
}
export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  icon: string;
}
export interface RumorDefinition {
  id: string;
  title: string;
  npc: string;
  text: string;
  hint: string;
}
export type CaseStatus = "LOCKED" | "AVAILABLE" | "ACTIVE" | "COMPLETED";
export type CaseStageType =
  | "DISCOVER"
  | "INVESTIGATE"
  | "COLLECT_CLUE"
  | "MINIGAME"
  | "TRAVEL"
  | "VERIFY"
  | "DEDUCTION"
  | "FINALE";
export type ClueType =
  | "NOTE"
  | "SYMBOL"
  | "NUMBER"
  | "OBJECT"
  | "DOCUMENT"
  | "RIDDLE"
  | "PHOTO_REFERENCE"
  | "CODE"
  | "RUMOR";
export interface CaseStage {
  id: string;
  type: CaseStageType;
  title: string;
  objective: string;
  locationId?: string;
  clueIds?: string[];
  miniGameId?: string;
  completionRule: string;
  optional?: boolean;
}
export interface CaseDefinition {
  id: string;
  title: string;
  description: string;
  category: "ACADEMIC" | "EXPLORATION" | "MYSTERY" | "SPORTS" | "EVENT";
  difficulty: "INTRODUCTORY" | "STANDARD" | "ADVANCED";
  recommendedDomains: KnowledgeDomain[];
  stages: CaseStage[];
  rewards: { badgeId: string; xp: number; title: string };
}
export interface ClueDefinition {
  id: string;
  caseId: string;
  title: string;
  type: ClueType;
  description: string;
  locationId?: string;
  evidenceText?: string;
  hintText?: string;
  domain?: KnowledgeDomain;
  rarity?: "COMMON" | "UNCOMMON" | "RARE";
  optional?: boolean;
}
export interface CaseProgress {
  status: CaseStatus;
  currentStage: number;
  completedStages: string[];
  discoveredClues: string[];
  insightTokens: number;
  hintsUsed: number;
  pinned: boolean;
  choices: string[];
  miniGameResults: Record<string, "SUCCESS" | "FAILED" | "CANCELLED">;
  startedAt?: string;
  completedAt?: string;
}
export interface GameSave {
  version: 1;
  worldRevision?: 2;
  worldLocation?: PlayerWorldLocation;
  discoveredPois?: string[];
  profile: Profile;
  xp: number;
  level: number;
  quests: Record<string, QuestProgress>;
  collectibles: Record<string, { obtainedAt: string }>;
  cases?: Record<string, CaseProgress>;
  badges?: Record<string, { awardedAt: string }>;
  activities?: Record<string, ActivityProgress>;
  achievements?: Record<string, { awardedAt: string }>;
  stamps?: Record<string, { obtainedAt: string }>;
  discoveredRumors?: string[];
}
