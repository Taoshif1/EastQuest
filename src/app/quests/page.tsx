"use client";
import { useState } from "react";
import { usePlayer } from "@/components/auth/player-context";
import { Disclaimer, PageHeader, PlayerGuard } from "@/components/ui/shell";
import { sideQuests } from "@/game/campus-life";

function QuestsHub() {
  const { save, startSideQuest, completeSideQuestStep } = usePlayer();
  const [notice, setNotice] = useState("");
  return <main className="content-page">
    <div className="page-heading"><div><span className="eyebrow">CAMPUS LIFE / SIDE QUESTS</span><h1>Quest <span className="gold">board</span></h1><p className="muted">Multi-step fictional routes connect people, places, and domains. Follow the next lead in the campus world.</p></div><div className="collection-count"><strong>{sideQuests.filter((quest) => save!.sideQuests?.[quest.id]?.status === "COMPLETED").length}<span> / {sideQuests.length}</span></strong><span>ROUTES COMPLETE</span></div></div>
    <div className="quest-board-grid">{sideQuests.map((quest) => {
      const progress = save!.sideQuests?.[quest.id];
      const step = progress ? quest.steps[progress.currentStep] : undefined;
      return <article className={`quest-board-card ${progress?.status === "COMPLETED" ? "completed" : ""}`} key={quest.id}><div className="activity-card-top"><span className="eyebrow">+{quest.rewardXp} XP</span><span>{progress?.status ?? "AVAILABLE"}</span></div><h2>{quest.title}</h2><p className="muted">{quest.description}</p><div className="quest-steps">{quest.steps.map((item, index) => <span className={index < (progress?.currentStep ?? 0) ? "done" : index === progress?.currentStep ? "current" : ""} key={item.id}>{index + 1}. {item.title}</span>)}</div>{progress?.status === "ACTIVE" && step ? <><p><strong>Next:</strong> {step.description}</p>{!step.interactionId && !step.npcId && <div className="branch-actions"><button className="secondary" onClick={async () => { await completeSideQuestStep(quest.id, step.id, "sport"); setNotice("Sports route selected."); }}>Sports route</button><button className="secondary" onClick={async () => { await completeSideQuestStep(quest.id, step.id, "study"); setNotice("Study route selected."); }}>Study route</button></div>}</> : <button className="primary" disabled={progress?.status === "COMPLETED"} onClick={async () => { await startSideQuest(quest.id); setNotice(`${quest.title} started.`); }}>{progress?.status === "COMPLETED" ? "Completed ✓" : "Start route →"}</button>}</article>;
    })}</div>
    {notice && <p className="game-message" role="status">{notice}</p>}
  </main>;
}

export default function QuestsPage() { return <PlayerGuard><><PageHeader /><QuestsHub /><footer className="content-footer"><Disclaimer /></footer></></PlayerGuard>; }
