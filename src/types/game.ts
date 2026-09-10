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
export type WorldInteractionKind = "interaction" | "discovery" | "npc" | "quest";
export interface WorldInteraction {
  id: string;
  floorId: FloorId;
  position: WorldPosition;
  title: string;
  prompt: string;
  description: string;
  kind: WorldInteractionKind;
  radius?: number;
  npcId?: string;
  discoveryId?: string;
  questId?: string;
  rewardXp?: number;
}
export interface NPCDefinition {
  id: string;
  name: string;
  role: string;
  floorId: FloorId;
  position: WorldPosition;
  bio: string;
  greeting: string;
  rumorIds: string[];
  questIds: string[];
  accent: string;
}
export interface HiddenDiscovery {
  id: string;
  title: string;
  description: string;
  floorId: FloorId;
  position: WorldPosition;
  set: string;
  stamp: string;
  rewardXp: number;
  interactionId: string;
}
export interface SideQuestStep {
  id: string;
  title: string;
  description: string;
  interactionId?: string;
  npcId?: string;
  domain?: ActivityDomain;
  branch?: string;
}
export interface SideQuestDefinition {
  id: string;
  title: string;
  description: string;
  rewardXp: number;
  steps: SideQuestStep[];
  branches?: Record<string, string[]>;
}
export interface SideQuestProgress {
  status: "AVAILABLE" | "ACTIVE" | "COMPLETED";
  currentStep: number;
  branch?: string;
  completedAt?: string;
}
export interface DailyChallengeProgress {
  date: string;
  activityId: string;
  completed: boolean;
  claimedAt?: string;
}
export interface NotificationEvent {
  id: string;
  message: string;
  createdAt: string;
  read?: boolean;
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
  discoveredInteractions?: Record<string, { discoveredAt: string }>;
  hiddenDiscoveries?: Record<string, { discoveredAt: string; stamp: string }>;
  npcsMet?: Record<string, { metAt: string }>;
  sideQuests?: Record<string, SideQuestProgress>;
  dailyChallenge?: DailyChallengeProgress;
  notifications?: NotificationEvent[];
}
