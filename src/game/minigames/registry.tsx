"use client";
import type { ComponentType } from "react";
import type { Quest, MiniGameType } from "@/types/game";
export interface MiniGameProps {
  quest: Quest;
  onAnswer: (answer: number) => void;
  busy: boolean;
}
function Choices({ quest, onAnswer, busy }: MiniGameProps) {
  return (
    <>
      <h2 className="question">{quest.config.question}</h2>
      <div className="answers">
        {quest.config.options.map((option, index) => (
          <button disabled={busy} key={option} onClick={() => onAnswer(index)}>
            <span>{String.fromCharCode(65 + index)}</span>
            {option}
            <span className="answer-arrow">↗</span>
          </button>
        ))}
      </div>
    </>
  );
}
function Tutorial({ quest, onAnswer, busy }: MiniGameProps) {
  return (
    <>
      <div className="tutorial-steps">
        {quest.config.steps?.map((step, index) => (
          <p key={step}>
            <span>0{index + 1}</span>
            {step}
          </p>
        ))}
      </div>
      <button className="primary" onClick={() => onAnswer(0)} disabled={busy}>
        {quest.config.options[0]} →
      </button>
    </>
  );
}
/** Register a component once; location-specific copy belongs to quest data. */
export const MiniGameRegistry: Record<
  MiniGameType,
  ComponentType<MiniGameProps>
> = {
  tutorial: Tutorial,
  "multiple-choice": Choices,
  "quick-decision": Choices,
  logic: Choices,
  scenario: Choices,
};
