"use client";

import { useEffect, useRef, useState } from "react";
import type { ActivityDefinition } from "@/types/game";
import { penaltyScore, timingScore, validBudget, validRoute } from "@/game/activities";

type Props = {
  activity: ActivityDefinition;
  onFinish: (score: number, completed: boolean) => Promise<void>;
  onCancel: () => void;
  onReplay?: () => void;
};

export function ActivityRunner({ activity, onFinish, onCancel, onReplay }: Props) {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState<number | null>(null);
  const [totalScore, setTotalScore] = useState(0);
  const [busy, setBusy] = useState(false);
  const [meter, setMeter] = useState(0);
  const [meterRunning, setMeterRunning] = useState(false);
  const [corner, setCorner] = useState<string | null>(null);
  const [keeper, setKeeper] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [reaction, setReaction] = useState<"ready" | "waiting" | "go" | "done">("ready");
  const current = activity.rounds[round] ?? activity.rounds[0];
  const [difficulty, setDifficulty] = useState(activity.difficulty ?? "NORMAL");
  const [route, setRoute] = useState<string[]>([]);
  const [budget, setBudget] = useState<Record<string, number>>(current?.budget ?? {});
  const [memoryVisible, setMemoryVisible] = useState(true);
  const startedAt = useRef(0);
  const goTimer = useRef<number | null>(null);
  const timingWindow = difficulty === "EASY" ? 30 : difficulty === "HARD" ? 12 : 20;

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

  useEffect(() => {
    if (activity.gameType !== "memory") return;
    const timer = window.setTimeout(() => setMemoryVisible(false), 1800);
    return () => window.clearTimeout(timer);
  }, [activity.gameType, round]);

  async function finish(value: number) {
    setBusy(true);
    setMeterRunning(false);
    setScore(Math.round(value));
    await onFinish(Math.round(value), value >= 60);
    setBusy(false);
  }
  function submitRound(value: number) {
    const nextTotal = totalScore + Math.round(value);
    setFeedback(value >= 90 ? "PERFECT" : value >= 60 ? "GOOD" : value > 0 ? "EDGE" : "MISS");
    if (round + 1 < activity.rounds.length) {
      setBusy(true);
      window.setTimeout(() => {
      setTotalScore(nextTotal);
      setRound((currentRound) => currentRound + 1);
      setMeter(0);
      setMeterRunning(false);
      setCorner(null);
      setKeeper(null);
      setReaction("ready");
      setRoute([]);
      setBudget(current?.budget ?? {});
      setMemoryVisible(true);
      setFeedback(null);
      setBusy(false);
      }, 450);
      return;
    }
    void finish(nextTotal / activity.rounds.length);
  }

  function answer(index: number) {
    const correct = index === current.correctIndex;
    submitRound(correct ? 100 : 0);
  }

  function startReaction() {
    setReaction("waiting");
    startedAt.current = performance.now();
    goTimer.current = window.setTimeout(() => {
      setReaction("go");
      startedAt.current = performance.now();
    }, 900 + round * 150);
  }

  function hitReaction() {
    if (reaction === "ready") return;
    if (reaction === "waiting") {
      if (goTimer.current) window.clearTimeout(goTimer.current);
      setReaction("done");
      submitRound(0);
      return;
    }
    const elapsed = performance.now() - startedAt.current;
    setReaction("done");
    submitRound(Math.max(0, Math.min(100, 100 - (elapsed - 180) / 4)));
  }

  return (
    <section className="activity-runner" aria-labelledby="activity-runner-title">
      <div className="activity-runner-head">
        <div>
          <span className="eyebrow">{activity.domain} / {activity.gameType}</span>
          <h2 id="activity-runner-title">{activity.title}</h2>
          <p className="muted">{activity.description}</p>
          <small className="activity-instructions">
            {activity.gameType === "memory" ? "Remember the pattern. Tap items in the original order." :
              activity.gameType === "routing" ? "Build SOURCE → INTERMEDIATE → TARGET." :
              activity.gameType === "budget" ? "Allocate 100 points while meeting every minimum." :
              activity.gameType === "observation" ? "Compare the two states and identify what changed." :
              activity.gameType === "cipher" ? "Use the clue and select the decoded fragment." :
              "Choose an answer, then use the feedback to adjust your next move."}
          </small>
          {activity.domain === "SPORTS" && activity.gameType === "timing" && (
            <label className="difficulty-select">Difficulty
              <select value={difficulty} onChange={(event) => setDifficulty(event.target.value as typeof difficulty)}>
                <option value="EASY">Easy</option>
                <option value="NORMAL">Normal</option>
                <option value="HARD">Hard</option>
              </select>
            </label>
          )}
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
      {score === null && activity.gameType === "debug" && (
        <div className="activity-choice">
          <pre className="code-challenge">{current.code}</pre>
          <p className="activity-prompt">{current.prompt}</p>
          <div className="answers">{(current.options ?? []).map((option, index) => <button key={option} onClick={() => answer(index)} disabled={busy}><span>{String.fromCharCode(65 + index)}</span>{option}</button>)}</div>
        </div>
      )}
      {score === null && activity.gameType === "routing" && (
        <div className="arcade-panel">
          <p className="activity-prompt">{current.prompt}</p>
          <div className="route-nodes">{["SOURCE", "SWITCH", "TARGET"].map((node) => <button className={route.includes(node) ? "selected" : ""} key={node} disabled={route.includes(node)} onClick={() => setRoute((items) => [...items, node])}>{node}</button>)}</div>
          <button className="primary" disabled={route.length !== 3} onClick={() => submitRound(validRoute(route, current.route ?? []) ? 100 : 0)}>Check route</button>
        </div>
      )}
      {score === null && activity.gameType === "budget" && (
        <div className="arcade-panel budget-challenge">
          <p className="activity-prompt">{current.prompt}</p>
          {Object.entries(budget).map(([name, value]) => <label key={name}>{name}: <input aria-label={name} type="range" min="0" max="60" step="5" value={value} onChange={(event) => setBudget((items) => ({ ...items, [name]: Number(event.target.value) }))} /><strong>{value}</strong></label>)}
          <p>Spent: {Object.values(budget).reduce((sum, value) => sum + value, 0)} / 100</p>
          <button className="primary" onClick={() => {
            const valid = validBudget(budget, current.constraints ?? {}, 100);
            submitRound(valid ? 100 : 0);
          }}>Submit allocation</button>
        </div>
      )}
      {score === null && (activity.gameType === "memory" || activity.gameType === "observation" || activity.gameType === "cipher") && (
        <div className="activity-choice">
          {activity.gameType === "memory" && <div className="memory-grid">{(memoryVisible ? current.items ?? [] : ["?", "?", "?"]).map((item, index) => <span key={`${item}-${index}`}>{item}</span>)}</div>}
          {activity.gameType === "observation" && <div className="observation-state"><p>Before: {(current.items ?? []).join(" · ")}</p><p>After: {(current.changedItems ?? []).join(" · ")}</p></div>}
          <p className="activity-prompt">{current.prompt}</p>
          <div className="answers">{(current.options ?? []).map((option, index) => <button key={option} onClick={() => answer(index)} disabled={busy}>{option}</button>)}</div>
        </div>
      )}
      {score === null && activity.gameType === "timing" && (
        <div className="arcade-panel">
          <p className="activity-prompt">{current.prompt}</p>
          <div className="timing-meter" aria-label="Timing meter">
            <span className="timing-target" style={{ left: `${50 - timingWindow / 2}%`, width: `${timingWindow}%` }} />
            <span className="timing-marker" style={{ left: `${meter}%` }} />
          </div>
          {!meterRunning ? (
            <button className="primary" onClick={() => setMeterRunning(true)}>Start meter</button>
          ) : (
            <button className="primary" onClick={() => submitRound(timingScore(meter, timingWindow))}>Release shot</button>
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
            if (!corner) return;
            const choices = ["Top left", "Top right", "Bottom left", "Bottom right"];
            const picked = choices[round % choices.length];
            setKeeper(picked);
            submitRound(penaltyScore(corner, picked));
          }}>Take penalty</button>
          {keeper && <p className="game-message">The keeper dived {keeper}.</p>}
        </div>
      )}
      {feedback && score === null && <p className="round-feedback" role="status">{feedback}</p>}
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
          <span className="eyebrow">GAME COMPLETE</span>
          <strong>{score}<small> / 100</small></strong>
          <p>{score >= 60 ? "Nice run. Your stamp is in the collection." : "Not quite this time. You can replay for a better score."}</p>
          <button className="primary" onClick={onCancel}>Back to activities</button>
          {onReplay && <button className="secondary" onClick={onReplay}>Replay</button>}
        </div>
      )}
    </section>
  );
}
