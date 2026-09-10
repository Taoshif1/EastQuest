"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Modal } from "@/components/ui/modal";
import { usePlayer } from "@/components/auth/player-context";
import {
  discoveryById,
  interactionById,
  npcById,
  sideQuestById,
  sideQuests,
} from "@/game/campus-life";
import { activityById } from "@/game/activities";

export function CampusLifeInteraction({ id, onClose }: { id: string; onClose: () => void }) {
  const { save, discoverHidden, discoverRumor, meetNpc, startSideQuest, completeSideQuestStep } = usePlayer();
  const [notice, setNotice] = useState("");
  const [revealed, setRevealed] = useState(false);
  const npc = id.startsWith("npc:") ? npcById(id.slice(4)) : undefined;
  useEffect(() => {
    if (npc && save) void meetNpc(npc.id);
  }, [npc, meetNpc, save]);
  if (!save) return null;
  const interaction = interactionById(id);
  const activity = interaction?.activityId
    ? activityById(interaction.activityId)
    : undefined;
  const discovery = interaction?.discoveryId ? discoveryById(interaction.discoveryId) : undefined;
  const active = sideQuests
    .map((quest) => ({ quest, progress: save.sideQuests?.[quest.id] }))
    .filter(({ progress }) => progress?.status === "ACTIVE")
    .find(({ quest, progress }) => {
      const step = quest.steps[progress!.currentStep];
      return step?.interactionId === id || step?.npcId === npc?.id || (!step?.interactionId && !step?.npcId && npc?.questIds.includes(quest.id));
    });
  const available = npc?.questIds
    .map(sideQuestById)
    .filter((quest) => quest && save.sideQuests?.[quest.id]?.status !== "COMPLETED")
    .filter((quest) => !save.sideQuests?.[quest!.id]) ?? [];
  const npcQuest = npc?.questIds
    .map((questId) => sideQuestById(questId))
    .find(Boolean);
  const npcProgress = npcQuest ? save.sideQuests?.[npcQuest.id] : undefined;
  const npcDialogue = npcQuest && npcProgress?.status === "COMPLETED"
    ? "You followed the whole thread. Thanks for bringing the story back with care."
    : npcQuest && npcProgress?.status === "ACTIVE"
      ? `You are on step ${npcProgress.currentStep + 1} of our route. The next lead should be close.`
      : npc?.greeting;
  const completeCurrent = async () => {
    if (!active) return;
    const progress = save.sideQuests?.[active.quest.id];
    const step = active.quest.steps[progress!.currentStep];
    if (step) {
      const advanced = await completeSideQuestStep(active.quest.id, step.id);
      setNotice(advanced ? (progress!.currentStep + 1 >= active.quest.steps.length ? "Side quest complete — reward saved." : "Step complete. Follow the next lead.") : "That lead is not ready yet.");
    }
  };
  const title = npc ? npc.name : interaction?.title ?? "Campus discovery";
  return (
    <Modal title={title} onClose={onClose}>
      {npc ? (
        <>
          <span className="eyebrow">{npc.role}</span>
          <div className="dialogue-panel" aria-live="polite">
            <p className="dialogue-speaker">{npc.name}</p>
            <h1>{revealed ? npcDialogue : "..."}</h1>
            <button className="secondary" onClick={() => setRevealed(true)}>
              {revealed ? "Continue conversation" : "Listen"}
            </button>
          </div>
          <p className="muted">{npc.bio}</p>
          {revealed && npc.rumorIds.map((rumorId) => (
            <button className="secondary" key={rumorId} onClick={async () => {
              const found = await discoverRumor(rumorId);
              setNotice(found ? "Rumor added to your notebook." : "You already have that story.");
            }}>Ask about a campus rumor</button>
          ))}
        </>
      ) : interaction ? (
        <>
          <span className="eyebrow">{interaction.kind === "discovery" ? "HIDDEN DISCOVERY" : "CAMPUS LIFE"}</span>
          <h1>{interaction.title}</h1>
          <p className="muted">{interaction.description}</p>
          {discovery && (
            <button className="primary" disabled={Boolean(save.hiddenDiscoveries?.[discovery.id])} onClick={async () => {
              const found = await discoverHidden(discovery.id);
              setNotice(found ? `${discovery.title} stamped in your collection.` : "This discovery is already stamped.");
            }}>{save.hiddenDiscoveries?.[discovery.id] ? "Already stamped" : interaction.prompt + " →"}</button>
          )}
          {!discovery && <button className="primary" onClick={() => setNotice("Noted in your explorer log. Keep moving when you are ready.")}>{interaction.prompt} →</button>}
          {activity && <Link className="secondary" href={`/activities?activity=${activity.id}`}>Try {activity.title} →</Link>}
        </>
      ) : null}
      {active && (
        <div className="quest-lead">
          <span className="eyebrow">SIDE QUEST / {active.quest.title}</span>
          <p>{active.quest.steps[save.sideQuests![active.quest.id].currentStep]?.description}</p>
          <button className="primary" onClick={() => void completeCurrent()}>Advance quest →</button>
        </div>
      )}
      {available.map((quest) => (
        <button className="secondary" key={quest!.id} onClick={async () => {
          await startSideQuest(quest!.id);
          setNotice(`${quest!.title} started. Follow the lead markers around campus.`);
        }}>Start {quest!.title}</button>
      ))}
      {notice && <p className="game-message" role="status">{notice}</p>}
    </Modal>
  );
}
