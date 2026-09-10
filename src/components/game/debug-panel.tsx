"use client";
import { useEffect, useState } from "react";
import { usePlayer } from "@/components/auth/player-context";
import { connectionsOn, floorById, zoneAt } from "@/game/data/campus/index";
import { locations } from "@/game/data/campus/pois";
import {
  defaultCalibration,
  type CalibrationOptions,
} from "@/game/data/campus/calibration";
import { APP_VERSION } from "@/lib/app-info";
/** Explicit URL opt-in; sample at 4 Hz so diagnostics do not render every frame. */
export function DebugPanel({
  nearby,
  paused,
}: {
  nearby: string | null;
  paused: boolean;
}) {
  const { session, save, repositoryMode } = usePlayer();
  const [position, setPosition] = useState(() =>
    session.position.getPosition(),
  );
  useEffect(() => {
    const timer = window.setInterval(
      () => setPosition(session.position.getPosition()),
      250,
    );
    return () => window.clearInterval(timer);
  }, [session]);
  const world = session.position.getWorldLocation();
  const zone = zoneAt(world.floorId, position);
  const nearest = (kind: "stairs" | "lift") =>
    connectionsOn(world.floorId)
      .filter((c) => c.kind === kind)
      .sort(
        (a, b) =>
          Math.hypot(a.position.x - position.x, a.position.y - position.y) -
          Math.hypot(b.position.x - position.x, b.position.y - position.y),
      )[0]?.id ?? "none";
  const nearestPoi = locations
    .filter((l) => l.floorId === world.floorId)
    .sort(
      (a, b) =>
        Math.hypot(
          a.worldPosition.x - position.x,
          a.worldPosition.y - position.y,
        ) -
        Math.hypot(
          b.worldPosition.x - position.x,
          b.worldPosition.y - position.y,
        ),
    )[0]?.name;
  const [calibration, setCalibration] = useState(defaultCalibration);
  const calibrate = (patch: Partial<CalibrationOptions>) => {
    const value = { ...calibration, ...patch };
    setCalibration(value);
    session.bridge.emit("CALIBRATION_CHANGED", value);
  };
  return (
    <details className="debug-panel" open>
      <summary>Debug · v{APP_VERSION}</summary>
      <div>
        WorldPosition: {position.x.toFixed(1)}, {position.y.toFixed(1)}
      </div>
      <div>In-range location: {nearby ?? "none"}</div>
      <div>
        Interaction:{" "}
        {paused ? "paused / dialog" : nearby ? "available" : "out of range"}
      </div>
      <div>
        Active quest:{" "}
        {Object.entries(save!.quests)
          .filter(([, q]) => q.status === "ACTIVE")
          .map(([id]) => id)
          .join(", ") || "none"}
      </div>
      <div>
        Completed:{" "}
        {
          Object.values(save!.quests).filter((q) => q.status === "COMPLETED")
            .length
        }{" "}
        · Keys: {Object.keys(save!.collectibles).length}
      </div>
      <div>Repository: {repositoryMode}</div>
      <div>
        Building: {world.buildingId ?? "outside"} · Floor: {world.floorId}
      </div>
      <div>Zone: {zone?.name ?? "boundary"}</div>
      <div>Nearest POI: {nearestPoi ?? "none"}</div>
      <div>
        Stair: {nearest("stairs")} · Lift: {nearest("lift")}
      </div>
      <div>
        {floorById(world.floorId)?.evidence.sourceType} ·{" "}
        {zone?.evidence.confidence}
      </div>
      <div className="calibration-controls">
        {(["collisions", "blueprint"] as const)
          .filter(
            (key) =>
              key !== "blueprint" || process.env.NODE_ENV === "development",
          )
          .map((key) => (
            <label key={key}>
              <input
                type="checkbox"
                checked={calibration[key]}
                onChange={(e) => {
                  const value = { ...calibration, [key]: e.target.checked };
                  setCalibration(value);
                  session.bridge.emit("CALIBRATION_CHANGED", value);
                }}
              />
              {key === "blueprint"
                ? "Blueprint reference"
                : "Collision / geometry bounds"}
            </label>
          ))}
      </div>
      {process.env.NODE_ENV === "development" && calibration.blueprint && (
        <div className="calibration-controls">
          <label>
            <input
              type="checkbox"
              checked={calibration.color}
              onChange={(e) => calibrate({ color: e.target.checked })}
            />
            Colored plan
          </label>
          {(["opacity", "offsetX", "offsetY", "scale"] as const).map((key) => (
            <label key={key}>
              {key}
              <input
                aria-label={key}
                type="number"
                step={key === "opacity" || key === "scale" ? 0.05 : 10}
                min={key === "opacity" ? 0 : key === "scale" ? 0.1 : undefined}
                max={key === "opacity" ? 1 : undefined}
                value={calibration[key]}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  if (Number.isFinite(value)) calibrate({ [key]: value });
                }}
              />
            </label>
          ))}
          <button
            onClick={() =>
              calibrate({ ...defaultCalibration, blueprint: true })
            }
          >
            Reset alignment
          </button>
        </div>
      )}
    </details>
  );
}
