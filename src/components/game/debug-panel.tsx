"use client";
import { useEffect, useState } from "react";
import { usePlayer } from "@/components/auth/player-context";
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
    </details>
  );
}
