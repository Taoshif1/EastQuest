"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Brand, Disclaimer } from "@/components/ui/shell";
import { usePlayer } from "@/components/auth/player-context";
import { parseStudentId, studentIdToEmail } from "@/lib/validation/student-id";
export default function Login() {
  const [id, setId] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const player = usePlayer();
  const router = useRouter();
  const parsed = parseStudentId(id);
  return (
    <main className="login-page">
      <Brand />
      <section className="login-card">
        <span className="eyebrow">PROTOTYPE MODE / PLAYER ENTRY</span>
        <h1>
          Your next
          <br />
          <span className="gold">chapter starts here.</span>
        </h1>
        <p className="muted">
          Create or load a profile on this browser. No password, no official EWU
          authentication.
        </p>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setMessage("");
            try {
              await player.login(id);
              router.push("/game");
            } catch (e) {
              setMessage((e as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          <label htmlFor="student-id">Student ID</label>
          <input
            id="student-id"
            autoComplete="username"
            placeholder="2023-3-60-376"
            value={id}
            onChange={(e) => setId(e.target.value)}
            aria-describedby="identity-hint"
            required
          />
          <p id="identity-hint" className="identity-hint">
            {parsed
              ? studentIdToEmail(parsed)
              : "Example format: 2023-3-60-376"}
          </p>
          <button className="primary" disabled={!player.ready || busy}>
            {busy ? "Opening campus…" : "Enter campus →"}
          </button>
          <p role="alert" className="error">
            {message || player.error}
          </p>
        </form>
        <details>
          <summary>Local profile recovery</summary>
          <p className="muted">
            Reset only the ID entered above. This removes its saved quests and
            keys.
          </p>
          <button
            className="subtle"
            disabled={!parsed}
            onClick={async () => {
              if (
                parsed &&
                window.confirm(
                  `Delete local progress for ${parsed}? This cannot be undone.`,
                )
              ) {
                try {
                  await player.reset(parsed);
                  setMessage("Local profile reset. You can enter campus now.");
                } catch (e) {
                  setMessage((e as Error).message);
                }
              }
            }}
          >
            Reset local profile
          </button>
        </details>
      </section>
      <Disclaimer />
    </main>
  );
}
