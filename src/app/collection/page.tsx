"use client";
import Link from "next/link";
import { usePlayer } from "@/components/auth/player-context";
import { PageHeader, PlayerGuard, Disclaimer } from "@/components/ui/shell";
import { KeyIcon } from "@/components/ui/key-icon";
import { buildingName } from "@/game/data/campus/index";
import { collectibles, locations } from "@/game/data/campus";
import { achievements, rumors } from "@/game/activities";
function Collection() {
  const { save } = usePlayer();
  const count = Object.keys(save!.collectibles).length;
  const discovered = locations.filter((location) =>
    save!.discoveredPois?.includes(location.id),
  );
  return (
    <>
      <PageHeader />
      <main className="content-page">
        <div className="page-heading">
          <div>
            <span className="eyebrow">YOUR DISCOVERIES / CAMPUS GUIDE</span>
            <h1>
              Campus <span className="gold">Collection</span>
            </h1>
            <p className="muted">
              Little discoveries. Useful knowledge. Yours to keep.
            </p>
          </div>
          <div className="collection-count">
            <strong>
              {count}
              <span> / 5</span>
            </strong>
            <span>KEYS DISCOVERED</span>
          </div>
        </div>
        {discovered.length > 0 && (
          <section className="knowledge-panel" aria-labelledby="campus-guide-title">
            <span className="eyebrow">CAMPUS GUIDE</span>
            <h2 id="campus-guide-title">Places you have discovered</h2>
            <div className="knowledge-grid">
              {discovered.map((location) => (
                <article key={location.id}>
                  <strong>{location.name}</strong>
                  <span>
                    {buildingName(location.buildingId)} · {location.floor}
                  </span>
                  <p>{location.description}</p>
                  <small>
                    {location.type} · {location.evidence.confidence.toLowerCase()} confidence
                  </small>
                </article>
              ))}
            </div>
          </section>
        )}
        <div className="collection-grid">
          {collectibles.map((item, i) => {
            const unlocked = save!.collectibles[item.id];
            return (
              <article
                className={`collection-card ${unlocked ? "unlocked" : "locked"}`}
                key={item.id}
              >
                <div className="collection-card-top">
                  <span>0{i + 1}</span>
                  <span>{unlocked ? "✓ UNLOCKED" : "◇ LOCKED"}</span>
                </div>
                <div className="collection-art">
                  <KeyIcon icon={item.icon} />
                </div>
                <p className="eyebrow">
                  {locations.find((l) => l.id === item.location)?.name}
                </p>
                <p className="muted">
                  {buildingName(
                    locations.find((l) => l.id === item.location)?.buildingId ??
                      null,
                  )}{" "}
                  · {locations.find((l) => l.id === item.location)?.floor}
                </p>
                <h2>{item.name}</h2>
                <p className="muted">
                  {unlocked
                    ? item.description
                    : "Explore this location to reveal its Campus Key."}
                </p>
                {unlocked ? (
                  <>
                    <div className="why-matters">
                      <span className="eyebrow">WHY IT MATTERS</span>
                      <p>{item.whyItMatters}</p>
                    </div>
                    <time dateTime={unlocked.obtainedAt}>
                      Discovered{" "}
                      {new Date(unlocked.obtainedAt).toLocaleString()}
                    </time>
                  </>
                ) : (
                  <div className="locked-hint">
                    Your next discovery is out there.
                  </div>
                )}
              </article>
            );
          })}
        </div>
        <section className="collection-extras">
          <div>
            <span className="eyebrow">ACTIVITY STAMPS</span>
            <h2>Small wins, kept</h2>
            <div className="stamp-grid">
              {Object.entries(save!.stamps ?? {}).map(([id, stamp]) => (
                <article key={id}><strong>✦</strong><span>{id.replaceAll("-", " ")}</span><small>{new Date(stamp.obtainedAt).toLocaleDateString()}</small></article>
              ))}
              {Object.keys(save!.stamps ?? {}).length === 0 && <p className="muted">Play an activity to earn your first stamp.</p>}
            </div>
          </div>
          <div>
            <span className="eyebrow">ACHIEVEMENTS</span>
            <h2>Milestones</h2>
            <div className="achievement-grid">
              {achievements.map((achievement) => {
                const unlocked = Boolean(save!.achievements?.[achievement.id]);
                return <article className={unlocked ? "unlocked" : "locked"} key={achievement.id}><strong>{achievement.icon}</strong><span>{achievement.title}</span><small>{unlocked ? achievement.description : "Keep exploring to reveal this."}</small></article>;
              })}
            </div>
          </div>
          {save!.discoveredRumors && save!.discoveredRumors.length > 0 && <div><span className="eyebrow">NPC NOTEBOOK</span><h2>Stories collected</h2><div className="rumor-list">{rumors.filter((rumor) => save!.discoveredRumors?.includes(rumor.id)).map((rumor) => <article className="found" key={rumor.id}><strong>{rumor.title}</strong><span>{rumor.npc} · {rumor.text}</span></article>)}</div></div>}
        </section>
        <Link href="/game" className="button primary">
          Back to campus →
        </Link>
      </main>
      <footer className="content-footer">
        <Disclaimer />
      </footer>
    </>
  );
}
export default function CollectionPage() {
  return (
    <PlayerGuard>
      <Collection />
    </PlayerGuard>
  );
}
