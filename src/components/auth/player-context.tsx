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
import { WORLD } from "@/game/data/campus";
import type { GameSave } from "@/types/game";

interface PlayerContextValue {
  save: GameSave | null;
  ready: boolean;
  error: string;
  session: GameSession;
  login(id: string): Promise<void>;
  logout(): Promise<void>;
  reset(id?: string): Promise<void>;
  activate(id: string): Promise<void>;
  submit(id: string, answer: number): Promise<boolean>;
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
  function repo() {
    if (!repository.current)
      throw new Error(
        "Browser storage is unavailable. Enable site storage and reload.",
      );
    return repository.current;
  }
  async function commit(data: GameSave) {
    // Persist before announcing rewards. A failed write never looks like saved progress.
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
    session.position.update(WORLD.spawn);
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
    } else if (current.current) await commit(newGame(current.current.profile));
    session.position.update(WORLD.spawn);
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
  return (
    <Context.Provider
      value={{
        save,
        ready,
        error,
        session,
        login,
        logout,
        reset,
        activate,
        submit,
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
