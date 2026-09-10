import type { CaseDefinition, ClueDefinition } from "@/types/game";

export const clues: ClueDefinition[] = [
  { id: "file-fragment", caseId: "lost-campus-file", title: "Torn orientation fragment", type: "DOCUMENT", description: "A fictional archive fragment marked with a three-part symbol.", locationId: "gate", evidenceText: "The first symbol is a triangle.", rarity: "COMMON" },
  { id: "number-trail", caseId: "lost-campus-file", title: "Number trail", type: "NUMBER", description: "A note repeats 3 · 5 · 8, as if pointing through campus floors.", locationId: "library", evidenceText: "The sequence grows by combining the previous two numbers.", domain: "GENERAL" },
  { id: "pattern-clue", caseId: "lost-campus-file", title: "Margin pattern", type: "SYMBOL", description: "A repeating mark helps decode the next fragment.", locationId: "ics", evidenceText: "The missing mark is the one that keeps the sequence balanced.", domain: "COMPUTING" },
  { id: "witness-note", caseId: "lost-campus-file", title: "Witness note", type: "NOTE", description: "A fictional note records which fragment was seen first.", locationId: "career", evidenceText: "The courtyard fragment predates the library note.", optional: true },
  { id: "final-code", caseId: "lost-campus-file", title: "Access phrase fragment", type: "CODE", description: "The final fragment is legible only after the other evidence is assembled.", locationId: "support", evidenceText: "The phrase begins with EAST and ends with QUEST.", rarity: "RARE" },
];

export const cases: CaseDefinition[] = [
  {
    id: "lost-campus-file",
    title: "The Lost Campus File",
    description: "A fictional EastQuest orientation file has been split into fragments. Follow the evidence trail and reconstruct its playful final phrase.",
    category: "MYSTERY",
    difficulty: "INTRODUCTORY",
    recommendedDomains: ["GENERAL", "COMPUTING", "ENGINEERING"],
    stages: [
      { id: "discover", type: "DISCOVER", title: "Unexpected discovery", objective: "Find the unusual fragment near the entry.", locationId: "gate", clueIds: ["file-fragment"], completionRule: "Discover the file fragment." },
      { id: "trail", type: "INVESTIGATE", title: "The number trail", objective: "Follow the evidence to the next campus lead.", locationId: "library", clueIds: ["number-trail"], completionRule: "Collect the number trail." },
      { id: "pattern", type: "MINIGAME", title: "Decode the margin pattern", objective: "Solve the sequence without needing specialist knowledge.", locationId: "ics", clueIds: ["pattern-clue"], miniGameId: "sequence-pattern", completionRule: "Solve the configured pattern challenge." },
      { id: "evidence", type: "MINIGAME", title: "Conflicting evidence", objective: "Put the evidence in a sensible order.", locationId: "career", clueIds: ["witness-note"], miniGameId: "evidence-ordering", completionRule: "Order the evidence correctly.", optional: true },
      { id: "finale", type: "DEDUCTION", title: "Final deduction", objective: "Combine the fragments and identify the fictional access phrase.", locationId: "support", clueIds: ["final-code"], completionRule: "Use the collected evidence to reach the conclusion." },
      { id: "complete", type: "FINALE", title: "File reconstructed", objective: "Complete the case and claim your Investigator badge.", completionRule: "Complete the final deduction." },
    ],
    rewards: { badgeId: "investigator", xp: 75, title: "Investigator" },
  },
];

export function caseById(id: string) {
  return cases.find((item) => item.id === id);
}
export function clueById(id: string) {
  return clues.find((item) => item.id === id);
}
