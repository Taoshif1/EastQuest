"use client";
import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { cases, clueById } from "@/game/cases/data";
import { evaluateEvidenceOrder, evaluatePattern, evaluateTiming } from "@/game/cases/minigames";
import { usePlayer } from "@/components/auth/player-context";

export function CaseInteraction({ locationId, onClose }: { locationId: string; onClose: () => void }) {
  const { save, startCase, collectClue, completeCaseStage, finishCase, recordCaseMiniGame } = usePlayer();
  const definition = cases[0];
  const progress = save?.cases?.[definition.id];
  const stage = progress ? definition.stages[progress.currentStage] : undefined;
  const clue = stage?.clueIds?.map(clueById).find(Boolean);
  const [started, setStarted] = useState(false);
  const [answer, setAnswer] = useState("");
  const [order, setOrder] = useState<string[]>([]);
  const [feedback, setFeedback] = useState("");
  const [timing, setTiming] = useState(0);
  if (!save) return null;
  const isGateStart = locationId === "gate" && (!progress || progress.status === "AVAILABLE");
  const matches = stage?.locationId === locationId && stage.type !== "FINALE";
  if (!isGateStart && !matches && !(stage?.type === "FINALE" && locationId === "support")) return null;
  const begin = async () => { await startCase(definition.id); setStarted(true); };
  const discover = async () => {
    if (clue) await collectClue(definition.id, clue.id);
    if (stage) await completeCaseStage(definition.id, stage.id);
    setFeedback("Evidence added to the case file.");
  };
  const solvePattern = async () => {
    const ok = evaluatePattern(answer, false);
    await recordCaseMiniGame(definition.id, stage?.miniGameId ?? "sequence-pattern", ok ? "SUCCESS" : "FAILED");
    setFeedback(ok ? "Pattern decoded. The next lead is unlocked." : "Not quite. Inspect the symbols and try again.");
    if (ok && stage) { if (clue) await collectClue(definition.id, clue.id); await completeCaseStage(definition.id, stage.id); }
  };
  const solveOrder = async () => {
    const ok = evaluateEvidenceOrder(order);
    await recordCaseMiniGame(definition.id, stage?.miniGameId ?? "evidence-ordering", ok ? "SUCCESS" : "FAILED");
    setFeedback(ok ? "The timeline fits." : "That order leaves a contradiction.");
    if (ok && stage) await completeCaseStage(definition.id, stage.id);
  };
  const solveTiming = async () => setFeedback(evaluateTiming(timing) ? "Great timing." : "Try to stop inside the target zone.");
  if (isGateStart) return <Modal title="A fictional discovery" onClose={onClose}><span className="eyebrow">SOMETHING UNUSUAL...</span><h1>Investigate the loose fragment</h1><p className="muted">A torn orientation fragment rests near the entry. It is fictional game evidence, not a historical campus artifact.</p><button className="primary" onClick={begin}>Inspect fragment →</button></Modal>;
  return <Modal title={stage?.title ?? "Case interaction"} onClose={onClose}>
    <span className="eyebrow">{stage?.type === "MINIGAME" ? "CASE MINI-GAME" : "CASE EVIDENCE"}</span>
    <h1>{stage?.title}</h1>
    <p className="muted">{stage?.objective}</p>
    {stage?.type !== "MINIGAME" && stage?.type !== "DEDUCTION" && <button className="primary" onClick={() => void discover()}>{clue?.title ? `Inspect ${clue.title}` : "Investigate"} →</button>}
    {stage?.miniGameId === "sequence-pattern" && <><p className="pattern-sequence">▲ · ▲▲ · ▲▲▲ · ?</p><p className="muted">Which symbol completes the repeating margin pattern?</p><input aria-label="Pattern answer" value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="triangle" /><button className="primary" onClick={() => void solvePattern()}>Submit pattern</button></>}
    {stage?.miniGameId === "evidence-ordering" && <><p className="muted">Select the fragments from earliest to latest.</p>{["courtyard", "library", "final"].map((item) => <button className="secondary" key={item} disabled={order.includes(item)} onClick={() => setOrder([...order, item])}>{item}</button>)}<p>{order.join(" → ")}</p><button className="primary" disabled={order.length !== 3} onClick={() => void solveOrder()}>Check timeline</button></>}
    {stage?.optional && <button className="secondary" onClick={() => void completeCaseStage(definition.id, stage.id)}>Skip optional evidence</button>}
    {stage?.type === "DEDUCTION" && <><p className="muted">The fragments resolve to the fictional phrase EAST QUEST.</p><input aria-label="Final case phrase" value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="Enter the phrase" /><button className="primary" onClick={async () => { if (answer.trim().toUpperCase() !== "EAST QUEST") { setFeedback("Use the collected fragments to reconstruct the phrase."); return; } await collectClue(definition.id, clue?.id ?? "final-code"); await completeCaseStage(definition.id, stage.id); await finishCase(definition.id); setFeedback("CASE SOLVED — Investigator badge awarded."); }}>Solve case</button></>}
    {stage?.miniGameId === "campus-reflex" && <><input type="range" min="0" max="100" value={timing} onChange={(event) => setTiming(Number(event.target.value))} /><button className="primary" onClick={() => void solveTiming()}>Stop indicator</button></>}
    {feedback && <p className="game-message" role="status">{feedback}</p>}
    {started && <p className="muted">Case unlocked. Follow the clue language and use the campus map when you need a lead.</p>}
  </Modal>;
}
