"use client";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  LocalGameRepository,
  type GameRepository,
} from "@/game/persistence/game-repository";
import { PrototypeAuthProvider } from "./auth-provider";
import { createSession, type GameSession } from "@/game/core/session";
import { newGame } from "@/game/quests/quest-engine";
import { defaultLocation, restoreLocation } from "@/game/data/campus/index";
import type { GameSave } from "@/types/game";
import { recordDiscovery } from "@/game/quests/discovery";
import { cases } from "@/game/cases/data";
import { awardReflex, collectClue, completeCase, completeStage, recordMiniGameResult, setCasePinned, startCase, useHint as consumeCaseHint } from "@/game/cases/engine";
import { activityById, discoverRumor, recordActivityResult } from "@/game/activities";
import {
  claimDailyChallenge,
  completeSideQuestStep,
  discoverHidden,
  markNotificationsRead,
  meetNpc,
  sideQuestById,
  startSideQuest,
} from "@/game/campus-life";

interface PlayerContextValue {
  repositoryMode: "LOCAL" | "SUPABASE";
  save: GameSave | null;
  ready: boolean;
  error: string;
  session: GameSession;
  login(id: string): Promise<void>;
  logout(): Promise<void>;
  reset(id?: string): Promise<void>;
  activate(id: string): Promise<void>;
  submit(id: string, answer: number): Promise<boolean>;
  startCase(id: string): Promise<void>;
  collectClue(caseId: string, clueId: string): Promise<boolean>;
  completeCaseStage(caseId: string, stageId: string): Promise<void>;
  finishCase(caseId: string): Promise<void>;
  caseHint(caseId: string): Promise<void>;
  pinCase(caseId: string, pinned: boolean): Promise<void>;
  recordCaseMiniGame(caseId: string, gameId: string, result: "SUCCESS" | "FAILED" | "CANCELLED"): Promise<void>;
  awardReflex(): Promise<void>;
  recordActivity(id: string, score: number, completed: boolean): Promise<{ score: number; completed: boolean; newAchievementIds: string[] }>;
  discoverRumor(id: string): Promise<boolean>;
  setSpecialty(specialty: GameSave["profile"]["specialty"]): Promise<void>;
  discoverHidden(id: string): Promise<boolean>;
  meetNpc(id: string): Promise<boolean>;
  startSideQuest(id: string): Promise<void>;
  completeSideQuestStep(questId: string, stepId: string, branch?: string): Promise<boolean>;
  claimDailyChallenge(): Promise<boolean>;
  markNotificationsRead(): Promise<void>;
}
const Context = createContext<PlayerContextValue | null>(null);
export function PlayerProvider({ children }: { children: ReactNode }) {
  const [session] = useState(createSession);
  const [save, setSave] = useState<GameSave | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const repository = useRef<GameRepository | null>(null);
  const current = useRef<GameSave | null>(null);
  const pending = useRef(false);
  useEffect(() => {
    let alive = true;
    // Delaying storage access until hydration prevents SSR errors. The promise also
    // catches browsers that throw when merely accessing the localStorage property.
    void Promise.resolve()
      .then(async () => {
        const repo = new LocalGameRepository(window.localStorage);
        repository.current = repo;
        const id = await repo.activeStudentId();
        return id ? repo.load(id) : null;
      })
      .then((data) => {
        if (alive) {
          current.current = data;
          session.position.updateWorldLocation(
            restoreLocation(data?.worldLocation),
          );
          setSave(data);
          session.bridge.emit(
            "PROGRESS_UPDATED",
            Object.keys(data?.collectibles ?? {}),
          );
        }
      })
      .catch((e) => {
        if (alive) setError(e instanceof Error ? e.message : String(e));
      })
      .finally(() => {
        if (alive) setReady(true);
      });
    return () => {
      alive = false;
    };
  }, [session]);
  useEffect(() => {
    let last = "";
    const flush = () => {
      if (!current.current || !repository.current || pending.current) return;
      const worldLocation = session.position.getWorldLocation();
      const signature = JSON.stringify(worldLocation);
      if (signature === last) return;
      const data = {
        ...current.current,
        worldRevision: 2 as const,
        worldLocation,
      };
      current.current = data;
      void repository.current
        .save(data)
        .then(() => {
          last = signature;
        })
        .catch((e) => setError(String(e)));
    };
    const off = session.bridge.on("POI_DISCOVERED", (id) => {
      if (!current.current) return;
      const result = recordDiscovery(current.current, id);
      if (!result.isNew) return;
      current.current = result.save;
      last = "";
      flush();
      session.bridge.emit("POI_DISCOVERY_NEW", id);
    });
    const timer = window.setInterval(flush, 1000);
    window.addEventListener("pagehide", flush);
    const visibility = () => {
      if (document.hidden) flush();
    };
    document.addEventListener("visibilitychange", visibility);
    return () => {
      flush();
      off();
      clearInterval(timer);
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [session]);
  function repo() {
    if (!repository.current)
      throw new Error(
        "Browser storage is unavailable. Enable site storage and reload.",
      );
    return repository.current;
  }
  async function commit(data: GameSave) {
    // Persist before announcing rewards. A failed write never looks like saved progress.
    data = {
      ...data,
      worldRevision: 2,
      worldLocation: session.position.getWorldLocation(),
    };
    await repo().save(data);
    current.current = data;
    setSave(data);
    session.bridge.emit("PROGRESS_UPDATED", Object.keys(data.collectibles));
  }
  async function login(id: string) {
    const profile = await new PrototypeAuthProvider(repo()).signIn(id);
    const data = await repo().load(profile.studentId);
    current.current = data;
    setSave(data);
    session.position.updateWorldLocation(restoreLocation(data?.worldLocation));
    session.bridge.emit(
      "PROGRESS_UPDATED",
      Object.keys(data?.collectibles ?? {}),
    );
    setError("");
  }
  async function logout() {
    await new PrototypeAuthProvider(repo()).signOut();
    current.current = null;
    setSave(null);
  }
  async function reset(id?: string) {
    if (id) {
      await repo().remove(id);
      if ((await repo().activeStudentId()) === id)
        await repo().setActiveStudentId(null);
      if (current.current?.profile.studentId === id) {
        current.current = null;
        setSave(null);
      }
    } else if (current.current) {
      session.position.updateWorldLocation(defaultLocation);
      await commit(newGame(current.current.profile));
    }
    session.position.updateWorldLocation(defaultLocation);
    setError("");
  }
  async function activate(id: string) {
    if (pending.current || !current.current)
      throw new Error("Please wait for the current action.");
    pending.current = true;
    try {
      await commit(await session.engine.activate(current.current, id));
      session.bridge.emit("QUEST_STARTED", id);
    } finally {
      pending.current = false;
    }
  }
  async function submit(id: string, answer: number) {
    if (pending.current || !current.current)
      throw new Error("Please wait for the current action.");
    // Serialize local UI actions. Production needs a database transaction for this guarantee.
    pending.current = true;
    try {
      const result = await session.engine.submit(current.current, id, answer);
      await commit(result.save);
      if (result.correct) session.bridge.emit("QUEST_COMPLETED", id);
      return result.correct;
    } finally {
      pending.current = false;
    }
  }
  async function updateCase(transform: (data: GameSave) => GameSave) {
      if (!current.current) throw new Error("Please log in before investigating.");
      await commit(transform(current.current));
    }
  async function beginCase(id: string) {
      const definition = cases.find((item) => item.id === id);
      if (!definition) throw new Error("That case is not available.");
      await updateCase((data) => startCase(data, definition));
    }
  async function collectClueAction(caseId: string, clueId: string) {
      if (!current.current) throw new Error("Please log in before investigating.");
      const result = collectClue(current.current, caseId, clueId);
      if (result.isNew) await commit(result.save);
      return result.isNew;
    }
  async function completeCaseStageAction(caseId: string, stageId: string) {
      await updateCase((data) => completeStage(data, caseId, stageId));
    }
  async function finishCase(caseId: string) {
      const definition = cases.find((item) => item.id === caseId);
      if (!definition) throw new Error("That case is not available.");
      await updateCase((data) => completeCase(data, definition));
    }
  async function caseHint(caseId: string) { await updateCase((data) => consumeCaseHint(data, caseId)); }
  async function pinCase(caseId: string, pinned: boolean) { await updateCase((data) => setCasePinned(data, caseId, pinned)); }
  async function recordCaseMiniGame(caseId: string, gameId: string, result: "SUCCESS" | "FAILED" | "CANCELLED") { await updateCase((data) => recordMiniGameResult(data, caseId, gameId, result)); }
  async function awardReflexActivity() { await updateCase(awardReflex); }
  async function recordActivityAction(id: string, score: number, completed: boolean) {
    if (!current.current) throw new Error("Please log in before playing activities.");
    const definition = activityById(id);
    if (!definition) throw new Error("That activity is not available.");
    const result = recordActivityResult(current.current, definition, score, completed);
    await commit(result.save);
    return {
      score: result.score,
      completed: result.completed,
      newAchievementIds: result.newAchievementIds,
    };
  }
  async function discoverRumorAction(id: string) {
    if (!current.current) throw new Error("Please log in before exploring rumors.");
    const result = discoverRumor(current.current, id);
    if (result.isNew) await commit(result.save);
    return result.isNew;
  }
  async function setSpecialty(specialty: GameSave["profile"]["specialty"]) {
    if (!current.current) throw new Error("Please log in before changing your focus.");
    await commit({
      ...current.current,
      profile: { ...current.current.profile, specialty },
    });
  }
  async function discoverHiddenAction(id: string) {
    if (!current.current) throw new Error("Please log in before exploring.");
    const result = discoverHidden(current.current, id);
    if (result.isNew) await commit(result.save);
    return result.isNew;
  }
  async function meetNpcAction(id: string) {
    if (!current.current) throw new Error("Please log in before meeting people.");
    const result = meetNpc(current.current, id);
    if (result.isNew) await commit(result.save);
    return result.isNew;
  }
  async function startSideQuestAction(id: string) {
    if (!current.current) throw new Error("Please log in before starting quests.");
    const definition = sideQuestById(id);
    if (!definition) throw new Error("That side quest is not available.");
    await commit(startSideQuest(current.current, definition));
  }
  async function completeSideQuestStepAction(questId: string, stepId: string, branch?: string) {
    if (!current.current) throw new Error("Please log in before progressing quests.");
    const result = completeSideQuestStep(current.current, questId, stepId, branch);
    if (result.advanced) await commit(result.save);
    return result.advanced;
  }
  async function claimDailyChallengeAction() {
    if (!current.current) throw new Error("Please log in before claiming a challenge.");
    const result = claimDailyChallenge(current.current);
    if (result.claimed) await commit(result.save);
    return result.claimed;
  }
  async function markNotificationsReadAction() {
    if (!current.current) return;
    await commit(markNotificationsRead(current.current));
  }
  return (
    <Context.Provider
      value={{
        repositoryMode: "LOCAL",
        save,
        ready,
        error,
        session,
        login,
        logout,
        reset,
        activate,
        submit,
        startCase: beginCase,
        collectClue: collectClueAction,
        completeCaseStage: completeCaseStageAction,
        finishCase,
        caseHint,
        pinCase,
        recordCaseMiniGame,
        awardReflex: awardReflexActivity,
        recordActivity: recordActivityAction,
        discoverRumor: discoverRumorAction,
        setSpecialty,
        discoverHidden: discoverHiddenAction,
        meetNpc: meetNpcAction,
        startSideQuest: startSideQuestAction,
        completeSideQuestStep: completeSideQuestStepAction,
        claimDailyChallenge: claimDailyChallengeAction,
        markNotificationsRead: markNotificationsReadAction,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function usePlayer() {
  const context = useContext(Context);
  if (!context) throw new Error("PlayerProvider missing");
  return context;
}
