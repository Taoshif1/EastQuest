"use client";

import { useEffect, useRef, useState } from "react";
import type { ActivityDefinition } from "@/types/game";

type Props = {
  activity: ActivityDefinition;
  onFinish: (score: number, completed: boolean) => Promise<void>;
  onCancel: () => void;
};

export function ActivityRunner({ activity, onFinish, onCancel }: Props) {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [meter, setMeter] = useState(0);
  const [meterRunning, setMeterRunning] = useState(false);
  const [corner, setCorner] = useState<string | null>(null);
  const [keeper, setKeeper] = useState<string | null>(null);
  const [reaction, setReaction] = useState<"ready" | "waiting" | "go" | "done">("ready");
  const startedAt = useRef(0);
  const goTimer = useRef<number | null>(null);
  const current = activity.rounds[round] ?? activity.rounds[0];

  useEffect(() => {
    if (!meterRunning) return;
    let direction = 1;
    const timer = window.setInterval(() => {
      setMeter((value) => {
        if (value >= 100) direction = -1;
        if (value <= 0) direction = 1;
        return value + direction * 4;
      });
    }, 45);
    return () => window.clearInterval(timer);
  }, [meterRunning]);

  useEffect(() => () => {
    if (goTimer.current) window.clearTimeout(goTimer.current);
  }, []);

  async function finish(value: number) {
    setBusy(true);
    setMeterRunning(false);
    setScore(Math.round(value));
    await onFinish(Math.round(value), value >= 60);
    setBusy(false);
  }

  function answer(index: number) {
    const correct = index === current.correctIndex;
    const nextScore = correct ? 100 : 0;
    if (round + 1 < activity.rounds.length) {
      setRound((value) => value + 1);
      return;
    }
    void finish(nextScore);
  }

  function startReaction() {
    setReaction("waiting");
    startedAt.current = performance.now();
    goTimer.current = window.setTimeout(() => {
      setReaction("go");
      startedAt.current = performance.now();
    }, 900 + Math.random() * 1400);
  }

  function hitReaction() {
    if (reaction === "ready") return;
    if (reaction === "waiting") {
      if (goTimer.current) window.clearTimeout(goTimer.current);
      setReaction("done");
      void finish(0);
      return;
    }
    const elapsed = performance.now() - startedAt.current;
    setReaction("done");
    void finish(Math.max(0, Math.min(100, 100 - (elapsed - 180) / 4)));
  }

  return (
    <section className="activity-runner" aria-labelledby="activity-runner-title">
      <div className="activity-runner-head">
        <div>
          <span className="eyebrow">{activity.domain} / {activity.gameType}</span>
          <h2 id="activity-runner-title">{activity.title}</h2>
          <p className="muted">{activity.description}</p>
        </div>
        <button className="subtle" onClick={onCancel} disabled={busy}>Exit</button>
      </div>
      {score === null && activity.gameType === "choice" && (
        <div className="activity-choice">
          <p className="activity-prompt">{current.prompt}</p>
          <div className="answers">
            {(current.options ?? []).map((option, index) => (
              <button key={option} onClick={() => answer(index)} disabled={busy}>
                <span>{String.fromCharCode(65 + index)}</span>{option}<span className="answer-arrow">↗</span>
              </button>
            ))}
          </div>
        </div>
      )}
      {score === null && activity.gameType === "timing" && (
        <div className="arcade-panel">
          <p className="activity-prompt">{current.prompt}</p>
          <div className="timing-meter" aria-label="Timing meter">
            <span className="timing-target" />
            <span className="timing-marker" style={{ left: `${meter}%` }} />
          </div>
          {!meterRunning ? (
            <button className="primary" onClick={() => setMeterRunning(true)}>Start meter</button>
          ) : (
            <button className="primary" onClick={() => void finish(100 - Math.min(100, Math.abs(meter - 70) * 3))}>Release shot</button>
          )}
          <small className="muted">Gold zone: 60–80. Release inside it for a clean shot.</small>
        </div>
      )}
      {score === null && activity.gameType === "penalty" && (
        <div className="arcade-panel">
          <p className="activity-prompt">{current.prompt}</p>
          <div className="corner-grid">
            {["Top left", "Top right", "Bottom left", "Bottom right"].map((option) => (
              <button className={corner === option ? "selected" : ""} key={option} onClick={() => setCorner(option)}>{option}</button>
            ))}
          </div>
          <button className="primary" disabled={!corner} onClick={() => {
            const choices = ["Top left", "Top right", "Bottom left", "Bottom right"];
            const picked = choices[Math.floor(Math.random() * choices.length)];
            setKeeper(picked);
            void finish(picked === corner ? 20 : 100);
          }}>Take penalty</button>
          {keeper && <p className="game-message">The keeper dived {keeper}.</p>}
        </div>
      )}
      {score === null && activity.gameType === "reaction" && (
        <div className="arcade-panel reaction-panel">
          <p className="activity-prompt">{current.prompt}</p>
          <button
            className={`reaction-button ${reaction}`}
            onClick={reaction === "ready" ? startReaction : hitReaction}
            disabled={busy || reaction === "done"}
          >
            {reaction === "ready" ? "Serve" : reaction === "waiting" ? "Wait…" : reaction === "go" ? "GO!" : "Done"}
          </button>
          <small className="muted">Do not press early. A false start is a penalty.</small>
        </div>
      )}
      {score !== null && (
        <div className="activity-result" role="status">
          <span className="eyebrow">ROUND COMPLETE</span>
          <strong>{score}<small> / 100</small></strong>
          <p>{score >= 60 ? "Nice run. Your stamp is in the collection." : "Not quite this time. You can replay for a better score."}</p>
          <button className="primary" onClick={onCancel}>Back to activities</button>
        </div>
      )}
    </section>
  );
}
