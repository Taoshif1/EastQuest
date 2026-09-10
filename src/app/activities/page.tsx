"use client";

import { useMemo, useState } from "react";
import { ActivityRunner } from "@/components/activities/activity-runner";
import { usePlayer } from "@/components/auth/player-context";
import { Disclaimer, PageHeader, PlayerGuard } from "@/components/ui/shell";
import { achievements, activities, rumors } from "@/game/activities";

const domains = ["ALL", "ACADEMICS", "TECH", "CREATIVE", "LEADERSHIP", "WELLBEING", "SPORTS", "COMMUNITY"] as const;

function ActivitiesHub() {
  const { save, recordActivity, discoverRumor } = usePlayer();
  const [filter, setFilter] = useState<(typeof domains)[number]>("ALL");
  const [selected, setSelected] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const visible = useMemo(
    () =>
      activities.filter(
        (activity) =>
          !activity.hidden &&
          (filter === "ALL" || activity.domain === filter),
      ),
    [filter],
  );
  const activity = activities.find((item) => item.id === selected);
  const completed = Object.values(save!.activities ?? {}).filter((item) => item.completed).length;
  const unlockedRumors = rumors.filter((rumor) => save!.discoveredRumors?.includes(rumor.id));

  async function finish(score: number, success: boolean) {
    if (!activity) return;
    const result = await recordActivity(activity.id, score, success);
    setNotice(result.newAchievementIds.length > 0
      ? `Activity saved. Achievement unlocked: ${result.newAchievementIds.map((id) => achievements.find((item) => item.id === id)?.title ?? id).join(", ")}.`
      : success ? "Activity saved. Your stamp is in the collection." : "Run saved. Replay to beat your best score.");
  }

  if (activity) {
    return (
      <main className="content-page">
        <ActivityRunner activity={activity} onFinish={finish} onCancel={() => setSelected(null)} />
        {notice && <p className="game-message" role="status">{notice}</p>}
      </main>
    );
  }

  return (
    <main className="content-page activities-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">CAMPUS LIFE / DROP-IN PLAY</span>
          <h1>Activities <span className="gold">hub</span></h1>
          <p className="muted">Short challenges for study, making, community, wellbeing, and sport. Specialty is optional—curiosity is enough.</p>
        </div>
        <div className="collection-count"><strong>{completed}<span> / {activities.length}</span></strong><span>ACTIVITIES COMPLETE</span></div>
      </div>
      <div className="activity-filters" role="group" aria-label="Activity domains">
        {domains.map((domain) => <button className={filter === domain ? "selected" : ""} key={domain} onClick={() => setFilter(domain)}>{domain === "ALL" ? "All" : domain.replace("_", " ")}</button>)}
      </div>
      <div className="activity-grid">
        {visible.map((item) => {
          const progress = save!.activities?.[item.id];
          return (
            <article className={`activity-card ${progress?.completed ? "completed" : ""}`} key={item.id}>
              <div className="activity-card-top"><span className="eyebrow">{item.domain}</span><span>{progress?.completed ? "✓ STAMPED" : item.gameType.toUpperCase()}</span></div>
              <h2>{item.title}</h2>
              <strong>{item.subtitle}</strong>
              <p className="muted">{item.description}</p>
              <div className="activity-card-meta"><span>+{item.rewardXp} XP first clear</span><span>{progress?.plays ?? 0} plays{progress?.bestScore ? ` · best ${progress.bestScore}` : ""}</span></div>
              <button className="primary" onClick={() => { setNotice(""); setSelected(item.id); }}>Play activity →</button>
            </article>
          );
        })}
      </div>
      <section className="rumor-panel">
        <div><span className="eyebrow">HIDDEN DISCOVERIES / NPC RUMORS</span><h2>Stories between the buildings</h2><p className="muted">Rumors are fictional game content. Respect closed spaces and ask staff before exploring.</p></div>
        <div className="rumor-list">
          {rumors.map((rumor) => {
            const found = unlockedRumors.some((item) => item.id === rumor.id);
            return <article key={rumor.id} className={found ? "found" : "unknown"}><strong>{found ? rumor.title : "Undiscovered rumor"}</strong><span>{found ? `${rumor.npc}: ${rumor.text}` : rumor.hint}</span>{!found && rumor.id === "rooftop-garden" && <button onClick={() => void discoverRumor(rumor.id).then(() => setNotice("Rumor discovered. A new stamp was added."))}>Ask around</button>}</article>;
          })}
        </div>
      </section>
    </main>
  );
}

export default function ActivitiesPage() {
  return <PlayerGuard><><PageHeader /><ActivitiesHub /><footer className="content-footer"><Disclaimer /></footer></></PlayerGuard>;
}
