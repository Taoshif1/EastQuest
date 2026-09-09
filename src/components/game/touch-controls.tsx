"use client";
import { usePlayer } from "@/components/auth/player-context";
export function TouchControls() {
  const { session } = usePlayer();
  return (
    <div className="dpad" aria-label="Touch movement controls">
      {[
        { label: "Up", x: 0, y: -1, symbol: "↑" },
        { label: "Left", x: -1, y: 0, symbol: "←" },
        { label: "Down", x: 0, y: 1, symbol: "↓" },
        { label: "Right", x: 1, y: 0, symbol: "→" },
      ].map((d) => (
        <button
          key={d.label}
          className={`direction-${d.label.toLowerCase()}`}
          aria-label={`Move ${d.label.toLowerCase()}`}
          onPointerDown={(e) => {
            e.preventDefault();
            e.currentTarget.setPointerCapture(e.pointerId);
            session.bridge.emit("INPUT_CHANGED", { x: d.x, y: d.y });
          }}
          onPointerUp={() =>
            session.bridge.emit("INPUT_CHANGED", { x: 0, y: 0 })
          }
          onPointerCancel={() =>
            session.bridge.emit("INPUT_CHANGED", { x: 0, y: 0 })
          }
          onLostPointerCapture={() =>
            session.bridge.emit("INPUT_CHANGED", { x: 0, y: 0 })
          }
        >
          {d.symbol}
        </button>
      ))}
    </div>
  );
}
