"use client";
import Link from "next/link";
import { usePlayer } from "@/components/auth/player-context";
import { PageHeader, PlayerGuard, Disclaimer } from "@/components/ui/shell";
import { cases, clues } from "@/game/cases/data";
import { useState } from "react";

function CaseBoard() {
  const { save, caseHint, pinCase, awardReflex } = usePlayer();
  const [notice, setNotice] = useState("");
  const definition = cases[0];
  const progress = save!.cases?.[definition.id];
  const active = progress?.status === "ACTIVE";
  const requestHint = async () => {
    await caseHint(definition.id);
    setNotice("Hint unlocked: " + (progress?.hintsUsed === 0 ? "Stories wait above the courtyard." : progress?.hintsUsed === 1 ? "Think about where students borrow books." : "Search the Library in Block B, Fifth Floor."));
  };
  const evidence = clues.filter((clue) => progress?.discoveredClues.includes(clue.id));
  const foundCount = evidence.length;
  const completed = progress?.status === "COMPLETED";
  const [reflex, setReflex] = useState(0);
  const [reflexMessage, setReflexMessage] = useState("");
  const playReflex = async () => {
    if (reflex >= 42 && reflex <= 58) { await awardReflex(); setReflexMessage("Target hit. +10 XP and Campus Reflex badge."); }
    else setReflexMessage("Missed the target. Try again.");
  };
  return (
    <main className="content-page case-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">CASE FILE / FICTIONAL GAME CONTENT</span>
          <h1>The Lost <span className="gold">Campus File</span></h1>
          <p className="muted">{definition.description}</p>
        </div>
        <span className={`case-status ${progress?.status ?? "AVAILABLE"}`}>{progress?.status ?? "AVAILABLE"}</span>
      </div>
      {completed && <section className="case-solved" role="status"><span className="eyebrow">CASE SOLVED</span><h2>{definition.title}</h2><p>Investigator Badge · +{definition.rewards.xp} XP</p></section>}
      {!active && !completed && <Link className="button primary" href="/game">Find the first fragment in campus →</Link>}
      {notice && <p role="status" className="game-message">{notice}</p>}
      {active && <div className="case-actions"><button className="secondary" onClick={() => void requestHint()}>Request hint ({progress?.hintsUsed ?? 0}/3)</button><button className="secondary" onClick={() => void pinCase(definition.id, !progress?.pinned)}>{progress?.pinned ? "Unpin lead" : "Pin lead"}</button></div>}
      <section className="reflex-card"><span className="eyebrow">OPTIONAL ACTIVITY</span><h2>Campus Reflex Challenge</h2><p className="muted">Stop the indicator inside the target zone. This side activity is separate from the case.</p><input aria-label="Reflex timing" type="range" min="0" max="100" value={reflex} onChange={(event) => setReflex(Number(event.target.value))} /><button className="secondary" onClick={() => void playReflex()}>Stop indicator</button>{reflexMessage && <p role="status">{reflexMessage}</p>}</section>
      <section className="case-board">
        <div className="case-lead">
          <span className="eyebrow">CURRENT LEAD</span>
          <h2>{active ? definition.stages[progress!.currentStage]?.title ?? "Final deduction" : "A fictional archive mystery"}</h2>
          <p>{active ? definition.stages[progress!.currentStage]?.objective : "Start the case when you are ready. Required content is never locked behind a specialty."}</p>
        </div>
        <div>
          <span className="eyebrow">EVIDENCE SET · {foundCount} / {clues.length} FOUND</span>
          <div className="evidence-grid">
            {clues.map((clue) => {
              const found = evidence.some((item) => item.id === clue.id);
              return <article className={found ? "found" : "unknown"} key={clue.id}><strong>{found ? clue.title : "???"}</strong><span>{found ? clue.description : "Important evidence remains undiscovered."}</span>{found ? <small>{clue.evidenceText} · {clue.locationId ?? "case board"}</small> : <small>Unknown fragment</small>}</article>;
            })}
          </div>
        </div>
        <div className="case-stages">
          <span className="eyebrow">CASE TRAIL</span>
          {definition.stages.map((stage, index) => <div className={progress?.completedStages.includes(stage.id) ? "complete" : index === progress?.currentStage ? "current" : "locked"} key={stage.id}><b>0{index + 1}</b><span>{stage.title}<small>{stage.type}</small></span></div>)}
        </div>
      </section>
      <Link href="/game" className="button primary">Return to campus →</Link>
    </main>
  );
}
export default function CasesPage() { return <PlayerGuard><><PageHeader /><CaseBoard /><footer className="content-footer"><Disclaimer /></footer></></PlayerGuard>; }
