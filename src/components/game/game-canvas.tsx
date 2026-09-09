"use client";
import { useEffect, useRef, useState } from "react";
import { usePlayer } from "@/components/auth/player-context";
export function GameCanvas() {
  const host = useRef<HTMLDivElement>(null);
  const { session } = usePlayer();
  const [error, setError] = useState("");
  useEffect(() => {
    let disposed = false;
    let game: import("phaser").Game | undefined;
    // Phaser reads browser globals during import: import only inside this client effect.
    void Promise.all([import("phaser"), import("@/game/scenes/campus-scene")])
      .then(([Phaser, { CampusScene }]) => {
        if (disposed || !host.current) return;
        game = new Phaser.Game({
          type: Phaser.AUTO,
          parent: host.current,
          width: host.current.clientWidth,
          height: host.current.clientHeight,
          backgroundColor: "#152c29",
          render: { antialias: true },
          scale: {
            mode: Phaser.Scale.RESIZE,
            autoCenter: Phaser.Scale.CENTER_BOTH,
          },
          physics: { default: "arcade", arcade: { debug: false } },
          scene: [new CampusScene(session)],
          input: { keyboard: true },
          audio: { noAudio: true },
        });
        game.canvas.setAttribute(
          "aria-label",
          "EastQuest campus world. Move with WASD or arrow keys. Press E near a marker.",
        );
        game.canvas.setAttribute("role", "img");
      })
      .catch(() =>
        setError("The campus could not load. Please refresh to try again."),
      );
    return () => {
      disposed = true;
      game?.destroy(true);
    };
  }, [session]);
  return (
    <div className="canvas-host" ref={host}>
      {error && (
        <p role="alert" className="canvas-error">
          {error}
        </p>
      )}
    </div>
  );
}
