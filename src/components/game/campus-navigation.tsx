"use client";
import { useEffect, useState } from "react";
import { usePlayer } from "@/components/auth/player-context";
import { Modal } from "@/components/ui/modal";
import {
  buildingName,
  collisionRects,
  connections,
  connectionsOn,
  destinations,
  floorById,
  floors,
  WORLD,
} from "@/game/data/campus/index";
import { locations } from "@/game/data/campus/pois";
import { quests } from "@/game/data/campus";
import type { PlayerWorldLocation } from "@/game/data/campus/types";

function FloorMap({
  world,
  discovered,
  target,
  large = false,
}: {
  world: PlayerWorldLocation;
  discovered: string[];
  target?: string;
  large?: boolean;
}) {
  const floor = floorById(world.floorId)!;
  return (
    <svg
      viewBox={`0 0 ${WORLD.width} ${WORLD.height}`}
      className={large ? "floor-map large" : "floor-map"}
      role="img"
      aria-label={
        floor.name + " map with player, stairs, lifts and quest destination"
      }
    >
      <rect width={WORLD.width} height={WORLD.height} fill="#243a35" />
      {floor.areas.map((a) => (
        <rect
          key={a.id}
          {...{ x: a.x, y: a.y, width: a.width, height: a.height }}
          fill={a.material === "outdoor" ? "#9eae94" : "#d8d5c5"}
        />
      ))}
      {collisionRects(floor.id).map((r, i) => (
        <rect
          key={i}
          {...{ x: r.x, y: r.y, width: r.width, height: r.height }}
          fill="#786c59"
        />
      ))}
      {connectionsOn(floor.id).map((c) => (
        <g key={c.id}>
          <rect
            x={c.position.x - 16}
            y={c.position.y - 16}
            width="32"
            height="32"
            fill={c.kind === "lift" ? "#458e91" : "#976e41"}
          />
          {large && (
            <text
              x={c.position.x}
              y={c.position.y - 25}
              fill="#263d38"
              textAnchor="middle"
              fontSize="36"
            >
              {c.kind === "lift" ? "L" : "S"}
            </text>
          )}
        </g>
      ))}
      {locations
        .filter(
          (l) =>
            l.floorId === world.floorId &&
            (discovered.includes(l.id) || l.id === target),
        )
        .map((l) => (
          <g key={l.id}>
            <circle
              cx={l.worldPosition.x}
              cy={l.worldPosition.y}
              r={l.id === target ? 25 : 15}
              fill="#e6b559"
              stroke="#fff0c4"
              strokeWidth="5"
            />
            {large && (
              <text
                x={l.worldPosition.x}
                y={l.worldPosition.y + 48}
                fontSize="34"
                textAnchor="middle"
                fill="#172c27"
              >
                {l.name}
              </text>
            )}
          </g>
        ))}
      <circle
        cx={world.position.x}
        cy={world.position.y}
        r="23"
        fill="#fff"
        stroke="#337875"
        strokeWidth="9"
      />
    </svg>
  );
}

export function FloorContext() {
  const { session } = usePlayer();
  const [world, setWorld] = useState(() => session.position.getWorldLocation());
  useEffect(() => {
    const timer = setInterval(
      () => setWorld(session.position.getWorldLocation()),
      250,
    );
    return () => clearInterval(timer);
  }, [session]);
  const floor = floorById(world.floorId)!;
  return (
    <div className="floor-context">
      <span className="eyebrow">{buildingName(world.buildingId)}</span>
      <strong>{floor.name}</strong>
    </div>
  );
}

export function CampusNavigation({
  transit,
  onTransitClose,
  mapOpen,
  setMapOpen,
}: {
  transit: string | null;
  onTransitClose: () => void;
  mapOpen: boolean;
  setMapOpen: (open: boolean) => void;
}) {
  const { session, save } = usePlayer();
  const [world, setWorld] = useState(() => session.position.getWorldLocation());
  const [discovered, setDiscovered] = useState(save?.discoveredPois ?? []);
  useEffect(() => {
    const timer = setInterval(
      () => setWorld(session.position.getWorldLocation()),
      250,
    );
    const off = session.bridge.on("POI_DISCOVERED", (id) =>
      setDiscovered((old) => (old.includes(id) ? old : [...old, id])),
    );
    return () => {
      clearInterval(timer);
      off();
    };
  }, [session]);
  const floor = floorById(world.floorId)!;
  const core = connections.find((c) => c.id === transit);
  const next = quests.find((q) => save?.quests[q.id]?.status !== "COMPLETED");
  const target = locations.find((l) => l.id === next?.locationId);
  return (
    <>
      <button
        className="minimap-button"
        aria-label="Open campus map"
        onClick={() => setMapOpen(true)}
      >
        <span>
          {floor.name}
          <small>M · MAP</small>
        </span>
        <FloorMap world={world} discovered={discovered} target={target?.id} />
      </button>
      {core && (
        <Modal title="Choose destination floor" onClose={onTransitClose}>
          <span className="eyebrow">
            {core.kind === "lift" ? "LIFT DIRECTORY" : "STAIR LANDING"} ·{" "}
            {buildingName(core.buildingId)}
          </span>
          <h1>Where to next?</h1>
          <p className="muted">
            You are on {floor.name}.{" "}
            {core.kind === "stairs"
              ? "Choose the adjacent landing."
              : "Choose your destination."}
          </p>
          <div className="floor-options">
            {destinations(core, world.floorId).map((id) => {
              const dest = floorById(id)!;
              const useful = locations.filter(
                (l) => l.floorId === id && l.buildingId === core.buildingId,
              );
              return (
                <button
                  key={id}
                  onClick={() => {
                    onTransitClose();
                    session.bridge.emit("TRAVEL_REQUESTED", {
                      connectionId: core.id,
                      floorId: id,
                    });
                  }}
                >
                  <span className="floor-number">
                    {dest.order < 0
                      ? "B" + Math.abs(dest.order)
                      : dest.order === 0
                        ? "G"
                        : dest.order}
                  </span>
                  <span>
                    <strong>{dest.name}</strong>
                    <small>
                      {useful.map((l) => l.name).join(" · ") ||
                        "Campus exploration"}
                    </small>
                  </span>
                  <span aria-hidden="true">→</span>
                </button>
              );
            })}
          </div>
          <p className="directory-note">
            Game routes follow available campus references. Lift service and
            access conditions await field checks.
          </p>
        </Modal>
      )}
      {mapOpen && (
        <Modal title="Campus map" onClose={() => setMapOpen(false)}>
          <span className="eyebrow">EASTQUEST · CAMPUS ATLAS</span>
          <h1>{floor.name}</h1>
          <p className="muted">{buildingName(world.buildingId)}</p>
          <FloorMap
            world={world}
            discovered={discovered}
            target={target?.id}
            large
          />
          <div className="map-legend">
            <span>● You</span>
            <span>◆ Quest / discovery</span>
            <span>L Lift</span>
            <span>S Stairs</span>
          </div>
          {target && (
            <div className="destination-note">
              <span className="eyebrow">NEXT CAMPUS KEY</span>
              <strong>{target.name}</strong>
              <p>
                {buildingName(target.buildingId)} · {target.floor}
              </p>
              <p>
                {target.id === "gate"
                  ? "Start at the outer gate."
                  : "From ground circulation, enter " +
                    buildingName(target.buildingId) +
                    ", then use its lift or stairs to " +
                    target.floor +
                    "."}
              </p>
            </div>
          )}
          <details>
            <summary>Floor directory</summary>
            <div className="atlas-directory">
              {floors
                .filter((f) => f.access === "EXPLORATION")
                .map((f) => (
                  <p key={f.id}>
                    <strong>{f.name}</strong> ·{" "}
                    {locations
                      .filter((l) => l.floorId === f.id)
                      .map((l) => l.name)
                      .join(", ") || "Exploration areas"}
                  </p>
                ))}
            </div>
          </details>
        </Modal>
      )}
    </>
  );
}
