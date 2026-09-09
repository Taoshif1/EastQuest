"use client";
import { useState } from "react";
import { usePlayer } from "@/components/auth/player-context";
import { Modal } from "@/components/ui/modal";
import { KeyIcon } from "@/components/ui/key-icon";
import { collectibles, locations } from "@/game/data/campus";
import { MiniGameRegistry } from "@/game/minigames/registry";
import type { Quest } from "@/types/game";
export function QuestDialog({
  quest,
  onClose,
}: {
  quest: Quest;
  onClose: () => void;
}) {
  const { submit, save } = usePlayer();
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState("");
  const reward = collectibles.find((c) => c.id === quest.collectibleId)!;
  const done = save?.quests[quest.id]?.status === "COMPLETED";
  const Game = MiniGameRegistry[quest.type];
  async function answer(index: number) {
    setBusy(true);
    try {
      const correct = await submit(quest.id, index);
      setFeedback(correct ? "" : "Not quite. Think it through and try again.");
    } catch (e) {
      setFeedback((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal
      title={done ? `${reward.name} unlocked` : quest.title}
      onClose={onClose}
    >
      <span className="eyebrow">
        {locations.find((l) => l.id === quest.locationId)?.name} /{" "}
        {done ? "DISCOVERY COMPLETE" : quest.type.toUpperCase()}
      </span>
      {done ? (
        <div className="reward-state">
          <div className="reward-icon">
            <KeyIcon icon={reward.icon} />
          </div>
          <span className="eyebrow gold">CAMPUS KEY UNLOCKED</span>
          <h2>{reward.name}</h2>
          <p>{quest.config.explanation}</p>
          <span className="xp-reward">+{quest.rewardXp} XP</span>
          <button className="primary" onClick={onClose}>
            Continue exploring →
          </button>
        </div>
      ) : (
        <>
          <h1>{quest.title}</h1>
          <p className="muted">{quest.description}</p>
          <div className="quest-reward-line">
            <KeyIcon icon={reward.icon} />
            <span>{reward.name}</span>
            <strong>+{quest.rewardXp} XP</strong>
          </div>
          <Game quest={quest} onAnswer={answer} busy={busy} />
          <p className="error" role="status">
            {feedback}
          </p>
        </>
      )}
    </Modal>
  );
}
