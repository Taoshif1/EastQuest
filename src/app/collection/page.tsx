"use client";
import Link from "next/link";
import { usePlayer } from "@/components/auth/player-context";
import { PageHeader, PlayerGuard, Disclaimer } from "@/components/ui/shell";
import { KeyIcon } from "@/components/ui/key-icon";
import { buildingName } from "@/game/data/campus/index";
import { collectibles, locations } from "@/game/data/campus";
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
