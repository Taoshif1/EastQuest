"use client";
import { useState } from "react";
import { ActivityRunner } from "@/components/activities/activity-runner";
import { usePlayer } from "@/components/auth/player-context";
import { Disclaimer, PageHeader, PlayerGuard } from "@/components/ui/shell";
import { activities, sportMedalForScore } from "@/game/activities";

function SportsHub() {
  const { save, recordActivity } = usePlayer();
  const sports = activities.filter((activity) => activity.domain === "SPORTS");
  const [selected, setSelected] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const activity = sports.find((item) => item.id === selected);
  async function finish(score: number, completed: boolean) {
    if (!activity) return;
    const result = await recordActivity(activity.id, score, completed);
    setNotice(result.newMedal ? `NEW MEDAL: ${result.newMedal}. ${result.completed ? "First-clear reward saved." : "Replay saved."}` : result.completed ? "Game complete. Result saved to your collection." : "Run saved. Replay to improve your score.");
  }
  if (activity) return <main className="content-page"><ActivityRunner activity={activity} onFinish={finish} onCancel={() => setSelected(null)} />{notice && <p className="game-message">{notice}</p>}</main>;
  return (
    <main className="content-page sports-page">
      <div className="page-heading">
        <div><span className="eyebrow">CAMPUS LIFE / SPORTS ARCADE</span><h1>Sports <span className="gold">desk</span></h1><p className="muted">Short, fictional arcade runs. No equipment, scorekeeping, or athletic background required.</p></div>
        <div className="collection-count"><strong>{sports.filter((item) => save!.activities?.[item.id]?.completed).length}<span> / {sports.length}</span></strong><span>MEDALS EARNED</span></div>
      </div>
      <div className="activity-grid">
        {sports.map((item) => {
          const progress = save!.activities?.[item.id];
          const medal = save!.sportsMedals?.[item.id];
          return <article className={`activity-card ${progress?.completed ? "completed" : ""}`} key={item.id}><div className="activity-card-top"><span className="eyebrow">{item.gameType}</span><span>{medal ? `${medal} MEDAL` : "OPEN"}</span></div><h2>{item.title}</h2><strong>{item.subtitle}</strong><p className="muted">{item.description}</p><div className="activity-card-meta"><span>+{item.rewardXp} XP first clear</span><span>{progress?.bestScore ? `best ${progress.bestScore} · ${sportMedalForScore(progress.bestScore) ?? "TRY"} ` : "new run"}</span></div><button className="primary" onClick={() => { setNotice(""); setSelected(item.id); }}>Play {item.title} →</button></article>;
        })}
      </div>
      <section className="knowledge-panel"><span className="eyebrow">FAIR PLAY</span><h2>Cricket, penalties, reactions</h2><p className="muted">The runner keeps the same score and stamp rules as the Activities hub. Your best score persists; first clears award XP once.</p></section>
    </main>
  );
}

export default function SportsPage() {
  return <PlayerGuard><><PageHeader /><SportsHub /><footer className="content-footer"><Disclaimer /></footer></></PlayerGuard>;
}
