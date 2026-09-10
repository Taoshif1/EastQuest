"use client";
import Link from "next/link";
import { usePlayer } from "@/components/auth/player-context";
import { PageHeader, PlayerGuard, Disclaimer } from "@/components/ui/shell";
import { cases, clues } from "@/game/cases/data";
import { startCase } from "@/game/cases/engine";
import { useState } from "react";

function CaseBoard() {
  const { save } = usePlayer();
  const [notice, setNotice] = useState("");
  const definition = cases[0];
  const progress = save!.cases?.[definition.id];
  const active = progress?.status === "ACTIVE";
  const begin = async () => {
    const raw = localStorage.getItem(`eastquest:v1:player:${save!.profile.studentId}`);
    if (!raw) return;
    const next = startCase(save!, definition);
    localStorage.setItem(`eastquest:v1:player:${save!.profile.studentId}`, JSON.stringify(next));
    setNotice("Case opened. Explore the entry route to find the first fragment.");
    window.location.reload();
  };
  const evidence = clues.filter((clue) => progress?.discoveredClues.includes(clue.id));
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
      {!active && progress?.status !== "COMPLETED" && <button className="primary" onClick={begin}>Open case file →</button>}
      {notice && <p role="status" className="game-message">{notice}</p>}
      <section className="case-board">
        <div className="case-lead">
          <span className="eyebrow">CURRENT LEAD</span>
          <h2>{active ? definition.stages[progress!.currentStage]?.title ?? "Final deduction" : "A fictional archive mystery"}</h2>
          <p>{active ? definition.stages[progress!.currentStage]?.objective : "Start the case when you are ready. Required content is never locked behind a specialty."}</p>
        </div>
        <div>
          <span className="eyebrow">EVIDENCE</span>
          <div className="evidence-grid">
            {clues.map((clue) => {
              const found = evidence.some((item) => item.id === clue.id);
              return <article className={found ? "found" : "unknown"} key={clue.id}><strong>{found ? clue.title : "Unknown evidence"}</strong><span>{found ? clue.description : "A fragment remains undiscovered."}</span>{found && <small>{clue.evidenceText}</small>}</article>;
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
