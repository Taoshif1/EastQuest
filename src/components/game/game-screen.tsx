"use client";
import "./campus.css";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { usePlayer } from "@/components/auth/player-context";
import { Brand, PlayerGuard } from "@/components/ui/shell";
import { GameCanvas } from "./game-canvas";
import { TouchControls } from "./touch-controls";
import { QuestDialog } from "@/components/quests/quest-dialog";
import { Modal } from "@/components/ui/modal";
import { KeyIcon } from "@/components/ui/key-icon";
import { locations, quests } from "@/game/data/campus";
import { progression } from "@/game/progression/progression";
import { isDebugMode, RELEASE_LABEL } from "@/lib/app-info";
import { DebugPanel } from "./debug-panel";
import { CampusNavigation, FloorContext } from "./campus-navigation";
import { buildingName, connections } from "@/game/data/campus/index";
import { FullscreenControl } from "./fullscreen-control";
import { currentObjective } from "@/game/quests/objectives";
import { QrScanner } from "./qr-scanner";
import { QrVerificationProvider } from "@/game/verification/qr-verification";
import { locations as campusLocations } from "@/game/data/campus/pois";
import { CaseInteraction } from "./case-interaction";
import { cases } from "@/game/cases/data";
function CampusGame() {
  const { save, session, activate, error } = usePlayer();
  const [connection, setConnection] = useState<string | null>(null);
  const [transit, setTransit] = useState<string | null>(null);
  const [mapOpen, setMapOpen] = useState(false);
  const [nearby, setNearby] = useState<string | null>(null);
  const [active, setActive] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [completionDismissed, setCompletionDismissed] = useState(false);
  const [debug, setDebug] = useState(false);
  const [discovery, setDiscovery] = useState<string | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [caseLocation, setCaseLocation] = useState<string | null>(null);
  useEffect(() => {
    const update = () => setDebug(isDebugMode(window.location.search));
    update();
    window.addEventListener("popstate", update);
    return () => window.removeEventListener("popstate", update);
  }, []);
  const complete = Object.keys(save!.collectibles).length === 5;
  const showCompletion = complete && !completionDismissed && !active;
  const quest = quests.find((q) => q.locationId === nearby);
  const selected = quests.find((q) => q.id === active);
  const interact = useCallback(async () => {
    if (active || showCompletion || transit || mapOpen || caseLocation) return;
    const caseProgress = save!.cases?.[cases[0].id];
    const caseStage = caseProgress && cases[0].stages[caseProgress.currentStage];
    if (
      nearby &&
      ((nearby === "gate" && (!caseProgress || caseProgress.status === "AVAILABLE")) ||
        (caseStage?.locationId === nearby))
    ) {
      setCaseLocation(nearby);
      return;
    }
    if (!quest && connection) {
      setTransit(connection);
      return;
    }
    if (!quest) return;
    try {
      await activate(quest.id);
      setActive(quest.id);
      setMessage("");
    } catch (e) {
      setMessage((e as Error).message);
    }
  }, [quest, active, activate, showCompletion, connection, transit, mapOpen, caseLocation, nearby, save]);
  useEffect(() => {
    const off3 = session.bridge.on("CONNECTION_AVAILABLE", setConnection);
    const off4 = session.bridge.on("MAP_TOGGLE", () =>
      setMapOpen((open) => !open),
    );
    const off1 = session.bridge.on("INTERACTION_AVAILABLE", (id) => {
      setNearby(id);
      setMessage("");
    });
    const off2 = session.bridge.on("INTERACTION_CLEARED", () => {
      setNearby(null);
      setMessage("");
    });
    return () => {
      off1();
      off3();
      off4();
      off2();
    };
  }, [session]);
  useEffect(
    () =>
      session.bridge.on("INTERACT", () => {
        void interact();
      }),
    [session, interact],
  );
  useEffect(() => {
    session.bridge.emit(
      "PAUSE_CHANGED",
      Boolean(active) || showCompletion || Boolean(transit) || mapOpen,
    );
    return () => session.bridge.emit("PAUSE_CHANGED", false);
  }, [session, active, showCompletion, transit, mapOpen, caseLocation]);
  useEffect(() => {
    const toggleMap = (event: KeyboardEvent) => {
      if (
        event.key.toLowerCase() !== "m" ||
        event.repeat ||
        active ||
        transit ||
        showCompletion
      )
        return;
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      )
        return;
      event.preventDefault();
      setMapOpen((open) => !open);
    };
    window.addEventListener("keydown", toggleMap);
    return () => window.removeEventListener("keydown", toggleMap);
  }, [active, transit, showCompletion]);
  const xp = progression(save!.xp);
  const count = Object.keys(save!.collectibles).length;
  const destination = locations.find(
    (l) =>
      l.id ===
      quests.find((q) => save!.quests[q.id]?.status !== "COMPLETED")
        ?.locationId,
  );
  const objective = currentObjective(save!);
  const scanLibrary = useCallback(
    async (payload: string) => {
      const location = campusLocations.find((item) => item.id === "library");
      if (!location) return;
      const result = await new QrVerificationProvider().verify(location, payload);
      setScannerOpen(false);
      setMessage(
        result.verified
          ? "Library checkpoint verified. You can still complete the Knowledge Key normally."
          : result.reason ?? "This QR code could not be verified.",
      );
    },
    [],
  );
  useEffect(() => {
    const off = session.bridge.on("POI_DISCOVERY_NEW", (id) => {
      setDiscovery(id);
      window.setTimeout(() => setDiscovery((current) => (current === id ? null : current)), 3600);
    });
    return off;
  }, [session]);
  return (
    <main className="game-page">
      <header className="game-hud">
        <Brand />
        <div className="player-id">
          <span className="eyebrow">CAMPUS EXPLORER</span>
          <span>{save!.profile.studentId}</span>
        </div>
        <div className="hud-xp">
          <div>
            <strong>LVL {xp.level.toString().padStart(2, "0")}</strong>
            <span>
              {xp.current} / {xp.target} XP
            </span>
          </div>
          <progress
            value={xp.current}
            max={xp.target}
            aria-label="XP toward next level"
          />
        </div>
        <Link href="/collection" className="hud-keys">
          <KeyIcon icon="key" />
          <span>
            {count}
            <small> / 5</small>
          </span>
          <span className="keys-word">KEYS</span>
        </Link>
        <Link
          href="/profile"
          className="menu-link"
          aria-label="Player profile and settings"
        >
          ☰
        </Link>
      </header>
      <section className="world-frame">
        <GameCanvas />
        <CampusNavigation
          transit={transit}
          onTransitClose={() => setTransit(null)}
          mapOpen={mapOpen}
          setMapOpen={setMapOpen}
        />
        {debug && (
          <DebugPanel
            nearby={nearby}
            paused={
              Boolean(active) || showCompletion || Boolean(transit) || mapOpen
            }
          />
        )}
        <div className="hud-left-stack">
          <div className="world-title">
            <span className="live-dot" />
            <div>
              <strong>EWU CAMPUS</strong>
              <span>CAMPUS EXPLORATION · V0.2</span>
            </div>
          </div>
          <FloorContext />
          <aside className="route-card">
            <span className="eyebrow">YOUR CAMPUS ROUTE</span>
            <strong>
              {count === 0
                ? "A new beginning"
                : complete
                  ? "Campus route complete"
                  : "Follow your curiosity"}
            </strong>
            <span>
              {count === 0
                ? "Start at the outer gate. Follow the entry path."
                : `${5 - count} more keys waiting to be discovered.`}
            </span>
            {count > 0 && destination && (
              <span>
                {destination.name}
                <br />
                {buildingName(destination.buildingId)} · {destination.floor}
              </span>
            )}
            <div className="route-dots">
              {quests.map((q) => (
                <span
                  title={q.title}
                  key={q.id}
                  className={
                    save!.quests[q.id]?.status === "COMPLETED" ? "done" : ""
                  }
                />
              ))}
            </div>
          </aside>
          {objective && (
            <aside className="objective-card" aria-live="polite">
              <span className="eyebrow">CURRENT OBJECTIVE</span>
              <strong>{objective.title}</strong>
              <span>{objective.locationName}</span>
              <small>
                {objective.building} · {objective.floor}
                <br />
                {objective.guidance}
              </small>
            </aside>
          )}
          {save!.cases?.[cases[0].id]?.pinned && (
            <aside className="case-pinned-card" aria-live="polite">
              <span className="eyebrow">ACTIVE CASE LEAD</span>
              <strong>{cases[0].title}</strong>
              <span>{cases[0].stages[save!.cases[cases[0].id].currentStage]?.objective}</span>
              <Link href="/cases">Open case board →</Link>
            </aside>
          )}
          {discovery && (() => {
            const location = locations.find((item) => item.id === discovery);
            return location ? (
              <div className="discovery-toast" role="status">
                <span className="eyebrow">LOCATION DISCOVERED</span>
                <strong>{location.name}</strong>
                <span>{buildingName(location.buildingId)} · {location.floor}</span>
              </div>
            ) : null;
          })()}
        </div>
        <div className="north-indicator" aria-hidden="true">
          N<br />↑
        </div>
        <div className="world-caption">
          EWU-INSPIRED WORLD · INTERIOR GEOMETRY APPROXIMATE
        </div>
        <TouchControls />
        {(nearby || connection) && (
          <div className="interaction-card" aria-live="polite">
            <div>
              <span className="eyebrow">
                {save!.quests[quest?.id ?? ""]?.status === "COMPLETED"
                  ? "LOCATION COMPLETE"
                  : "LOCATION DISCOVERED"}
              </span>
              <strong>
                {locations.find((l) => l.id === nearby)?.name ??
                  connections.find((c) => c.id === connection)?.name}
              </strong>
            </div>
            <button className="primary" onClick={() => void interact()}>
              <kbd>E</kbd>{" "}
              {save!.quests[quest?.id ?? ""]?.status === "COMPLETED"
                ? "View key"
                : connection && !nearby
                  ? "Choose floor"
                  : "Investigate"}
            </button>
            {nearby === "library" && (
              <button className="secondary qr-action" onClick={() => setScannerOpen(true)}>
                Scan Library QR
              </button>
            )}
          </div>
        )}
        {(message || error) && (
          <p className="game-message" role="status">
            {message || error}
          </p>
        )}
      </section>
      {scannerOpen && (
        <Modal title="Scan Library checkpoint" onClose={() => setScannerOpen(false)}>
          <span className="eyebrow">REAL-WORLD CHECKPOINT · EXPERIMENTAL</span>
          <h1>Scan Library QR</h1>
          <p className="muted">Camera access starts only after choosing this action. Static test codes can be copied.</p>
          <QrScanner onScan={(payload) => void scanLibrary(payload)} onClose={() => setScannerOpen(false)} />
        </Modal>
      )}
      {caseLocation && <CaseInteraction locationId={caseLocation} onClose={() => setCaseLocation(null)} />}
      <footer className="game-footer">
        <span>
          <kbd>W A S D</kbd> / <kbd>↑ ← ↓ →</kbd> MOVE{" "}
          <span className="footer-separator">·</span> <kbd>E</kbd> INTERACT
        </span>
        <FullscreenControl />
        <span className="playtest-label">{RELEASE_LABEL}</span>
      </footer>
      {selected && (
        <QuestDialog
          key={selected.id}
          quest={selected}
          onClose={() => setActive(null)}
        />
      )}
      {showCompletion && (
        <Modal
          title="EWU Explorer — Campus Route Complete"
          onClose={() => setCompletionDismissed(true)}
        >
          <div className="completion-state">
            <span className="eyebrow">ALL FIVE CAMPUS KEYS FOUND</span>
            <div className="completion-emblem">
              <KeyIcon icon="compass" />
            </div>
            <h1>
              EWU <span className="gold">EXPLORER</span>
            </h1>
            <h2>Campus Route Complete</h2>
            <p>You found your way. Now make it your own.</p>
            <div className="completion-stats">
              <div>
                <strong>{save!.xp}</strong>
                <span>TOTAL XP</span>
              </div>
              <div>
                <strong>5 / 5</strong>
                <span>KEYS DISCOVERED</span>
              </div>
              <div>
                <strong>5</strong>
                <span>QUESTS COMPLETED</span>
              </div>
            </div>
            <button
              className="primary"
              onClick={() => setCompletionDismissed(true)}
            >
              Continue exploring →
            </button>
            <div className="completion-links">
              <Link href="/collection">View collection</Link>
              <Link href="/profile">View profile</Link>
            </div>
          </div>
        </Modal>
      )}
    </main>
  );
}
export function GameScreen() {
  return (
    <PlayerGuard>
      <CampusGame />
    </PlayerGuard>
  );
}
