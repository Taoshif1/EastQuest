"use client";
import { useEffect, useState } from "react";
export function FullscreenControl() {
  const [supported, setSupported] = useState(false);
  const [active, setActive] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    const update = () => {
      setSupported(Boolean(document.fullscreenEnabled));
      setActive(Boolean(document.fullscreenElement));
    };
    update();
    document.addEventListener("fullscreenchange", update);
    return () => document.removeEventListener("fullscreenchange", update);
  }, []);
  if (!supported) return null;
  return (
    <span className="fullscreen-control">
      <button
        aria-pressed={active}
        onClick={async (event) => {
          const game = event.currentTarget.closest(".game-page");
          try {
            if (document.fullscreenElement) await document.exitFullscreen();
            else if (game?.requestFullscreen) await game.requestFullscreen();
            setError("");
          } catch {
            setError("Fullscreen unavailable. You can keep playing here.");
          }
        }}
      >
        {active ? "Exit fullscreen" : "Fullscreen"}
      </button>
      {error && <span role="status">{error}</span>}
    </span>
  );
}
