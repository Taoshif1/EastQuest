import type { KnowledgeDomain } from "@/types/game";
export type MiniGameResult = { success: boolean; score: number; route: "EXPERT" | "INVESTIGATION" | "GENERAL" };
export type CaseMiniGame = { id: string; title: string; domain: KnowledgeDomain; difficulty: "INTRODUCTORY" | "STANDARD"; instructions: string; estimatedDuration: string; kind: "SEQUENCE" | "EVIDENCE_ORDERING" | "TIMING"; solution: string[] };
export const caseMiniGames: CaseMiniGame[] = [
  { id: "sequence-pattern", title: "Sequence / Pattern", domain: "GENERAL", difficulty: "INTRODUCTORY", instructions: "Choose the symbol that completes the configured sequence.", estimatedDuration: "1 minute", kind: "SEQUENCE", solution: ["triangle"] },
  { id: "evidence-ordering", title: "Evidence Ordering", domain: "LAW_SOCIETY", difficulty: "INTRODUCTORY", instructions: "Arrange the evidence from earliest to latest.", estimatedDuration: "2 minutes", kind: "EVIDENCE_ORDERING", solution: ["courtyard", "library", "final"] },
  { id: "campus-reflex", title: "Campus Reflex Challenge", domain: "SPORTS", difficulty: "INTRODUCTORY", instructions: "Press at the right moment in this deterministic timing challenge.", estimatedDuration: "30 seconds", kind: "TIMING", solution: ["target"] },
];
