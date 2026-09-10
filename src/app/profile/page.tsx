"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePlayer } from "@/components/auth/player-context";
import { PageHeader, PlayerGuard, Disclaimer } from "@/components/ui/shell";
import { progression } from "@/game/progression/progression";
import { FeedbackDialog } from "@/components/ui/feedback-dialog";
import { APP_VERSION, RELEASE_LABEL } from "@/lib/app-info";
import { achievements } from "@/game/activities";
import type { KnowledgeDomain } from "@/types/game";
const specialties: Array<KnowledgeDomain | undefined> = [
  undefined,
  "COMPUTING",
  "ENGINEERING",
  "BUSINESS_FINANCE",
  "LIFE_SCIENCE",
  "LAW_SOCIETY",
  "LANGUAGE_HUMANITIES",
  "GENERAL",
  "SPORTS",
];
function Profile() {
  const { save, logout, reset, setSpecialty } = usePlayer();
  const router = useRouter();
  const [error, setError] = useState("");
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const xp = progression(save!.xp);
  return (
    <>
      <PageHeader />
      <main className="content-page profile-page">
        <span className="eyebrow">PLAYER FILE / PROTOTYPE MODE</span>
        <h1>Your campus story.</h1>
        <p className="muted">
          v{APP_VERSION} / {RELEASE_LABEL}
        </p>
        <div className="profile-card">
          <div className="profile-avatar" aria-label="Original explorer avatar">
            <svg viewBox="0 0 80 100" aria-hidden="true">
              <ellipse cx="40" cy="88" rx="28" ry="7" fill="#142d2d" />
              <path d="M23 65h13v23H23zm22 0h13v23H45z" fill="#1c3041" />
              <rect
                x="19"
                y="39"
                width="44"
                height="31"
                rx="8"
                fill="#efba66"
              />
              <rect
                x="48"
                y="46"
                width="19"
                height="25"
                rx="5"
                fill="#54868c"
              />
              <circle cx="40" cy="28" r="17" fill="#e8ba92" />
              <path d="M22 25V10h36v16H32v9H22" fill="#263640" />
              <circle cx="48" cy="29" r="2" fill="#263640" />
            </svg>
          </div>
          <div>
            <span className="eyebrow">{save!.profile.avatarId}</span>
            <h2>{save!.profile.displayName}</h2>
            <p>{save!.profile.studentId}</p>
            <p className="muted profile-email">{save!.profile.email}</p>
            <p className="profile-specialty">Focus: {save!.profile.specialty?.replace("_", " ") ?? "GENERAL EXPLORER"}</p>
            <label className="profile-specialty-select">
              Optional knowledge focus
              <select
                value={save!.profile.specialty ?? ""}
                onChange={(event) =>
                  void setSpecialty(
                    (event.target.value || undefined) as KnowledgeDomain | undefined,
                  )
                }
              >
                {specialties.map((specialty, index) => (
                  <option key={specialty ?? `GENERAL-${index}`} value={specialty ?? ""}>
                    {specialty?.replace("_", " ") ?? "General explorer"}
                  </option>
                ))}
              </select>
            </label>
            <span className="prototype-badge">
              LOCAL PROFILE · NOT EWU VERIFIED
            </span>
          </div>
        </div>
        <div className="profile-stats">
          <div>
            <strong>{xp.level}</strong>
            <span>LEVEL</span>
          </div>
          <div>
            <strong>{save!.xp}</strong>
            <span>TOTAL XP</span>
          </div>
          <div>
            <strong>{Object.keys(save!.collectibles).length} / 5</strong>
            <span>CAMPUS KEYS</span>
          </div>
          <div>
            <strong>
              {
                Object.values(save!.quests).filter(
                  (q) => q.status === "COMPLETED",
                ).length
              }
            </strong>
            <span>QUESTS COMPLETE</span>
          </div>
          <div>
            <strong>{Object.values(save!.activities ?? {}).filter((activity) => activity.completed).length}</strong>
            <span>ACTIVITIES COMPLETE</span>
          </div>
        </div>
        <section className="profile-achievements">
          <span className="eyebrow">ACTIVITY ACHIEVEMENTS</span>
          <div className="achievement-strip">
            {achievements.map((achievement) => <span className={save!.achievements?.[achievement.id] ? "unlocked" : ""} title={achievement.description} key={achievement.id}>{achievement.icon} {achievement.title}</span>)}
          </div>
        </section>
        <p className="muted">
          Progress lives in this browser. Use the same student ID to return to
          your collection.
        </p>
        <div className="profile-actions">
          <button onClick={() => setFeedbackOpen(true)}>
            Playtest feedback
          </button>
          <Link href="/game" className="button primary">
            Continue exploring →
          </Link>
          <Link href="/activities" className="button">
            Open activities
          </Link>
          <button
            onClick={async () => {
              try {
                await logout();
                router.push("/login");
              } catch (e) {
                setError((e as Error).message);
              }
            }}
          >
            Switch local profile
          </button>
        </div>
        <details className="dev-settings">
          <summary>Prototype settings</summary>
          <p>
            Reset quests, XP, and keys for this profile. Your student ID and
            avatar are retained.
          </p>
          <button
            className="danger"
            onClick={async () => {
              if (
                window.confirm(
                  "Reset all quest progress, XP, and Campus Keys for this local profile? This cannot be undone.",
                )
              ) {
                try {
                  await reset();
                  router.push("/game");
                } catch (e) {
                  setError((e as Error).message);
                }
              }
            }}
          >
            Reset prototype progress
          </button>
        </details>
        <p role="alert" className="error">
          {error}
        </p>
      </main>
      <footer className="content-footer">
        <Disclaimer />
      </footer>
      {feedbackOpen && (
        <FeedbackDialog onClose={() => setFeedbackOpen(false)} />
      )}
    </>
  );
}
export default function ProfilePage() {
  return (
    <PlayerGuard>
      <Profile />
    </PlayerGuard>
  );
}
