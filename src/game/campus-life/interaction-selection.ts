export type InteractionCandidateKind =
  | "quest"
  | "case"
  | "side-quest"
  | "npc"
  | "discovery"
  | "activity"
  | "poi";

export type InteractionCandidate = {
  id: string;
  kind: InteractionCandidateKind;
  distance: number;
};

const priority: Record<InteractionCandidateKind, number> = {
  quest: 0,
  case: 0,
  "side-quest": 0,
  npc: 1,
  discovery: 2,
  activity: 3,
  poi: 4,
};

export function rankInteractions(
  candidates: InteractionCandidate[],
): InteractionCandidate[] {
  return [...candidates].sort(
    (a, b) =>
      priority[a.kind] - priority[b.kind] ||
      a.distance - b.distance ||
      a.id.localeCompare(b.id),
  );
}

export function cycleInteraction(
  candidates: InteractionCandidate[],
  selectedId: string | null,
  direction = 1,
): InteractionCandidate | null {
  const ranked = rankInteractions(candidates);
  if (ranked.length === 0) return null;
  const selectedIndex = ranked.findIndex((item) => item.id === selectedId);
  const start = selectedIndex < 0 ? 0 : selectedIndex;
  const nextIndex = (start + direction + ranked.length) % ranked.length;
  return ranked[nextIndex];
}
