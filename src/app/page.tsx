import Link from "next/link";
import { Brand, Disclaimer } from "@/components/ui/shell";
import { KeyIcon } from "@/components/ui/key-icon";
import { collectibles } from "@/game/data/campus";
export default function Home() {
  return (
    <main className="landing">
      <header className="page-header">
        <Brand />
        <span className="prototype-badge">V0 · PROTOTYPE MODE</span>
      </header>
      <section className="landing-content">
        <div className="landing-copy">
          <p className="eyebrow">
            <span className="live-dot" /> EAST WEST UNIVERSITY · BANGLADESH
          </p>
          <h1>
            Your Campus.
            <br />
            <span>Your Quest.</span>
          </h1>
          <p className="lead">
            Beyond the classroom,
            <br />a whole campus is waiting.
          </p>
          <p className="muted intro">
            Find your way. Take on little challenges. Discover five Campus Keys
            that make this place feel a little more like yours.
          </p>
          <Link className="button primary start-button" href="/login">
            Start exploring <span>↗</span>
          </Link>
          <div className="landing-meta">
            <span>01 CAMPUS</span>
            <span>05 KEYS</span>
            <span>YOUR STORY</span>
          </div>
        </div>
        <div
          className="campus-poster"
          aria-label="Stylized illustration of the EastQuest campus"
        >
          <div className="poster-top">
            <span>EWU / CAMPUS EXPLORATION</span>
            <span>01</span>
          </div>
          <svg
            viewBox="0 0 600 510"
            role="img"
            aria-label="An original geometric campus with paths, buildings, trees, and a golden gate"
          >
            <defs>
              <pattern
                id="grid"
                width="30"
                height="30"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M30 0H0V30"
                  fill="none"
                  stroke="#29403d"
                  strokeWidth=".5"
                />
              </pattern>
            </defs>
            <rect width="600" height="510" fill="#152d2d" />
            <rect width="600" height="510" fill="url(#grid)" />
            <g transform="translate(430 150) rotate(30) skewX(-30) scale(.8 .65)">
              <rect
                x="-175"
                y="50"
                width="370"
                height="360"
                rx="14"
                fill="#24423c"
                stroke="#567365"
                strokeWidth="3"
              />
              <path
                d="M10 90v290M-140 180h290M-140 315h290"
                stroke="#aaac91"
                strokeWidth="32"
              />
              {[
                [-145, 90],
                [65, 90],
                [-145, 225],
                [65, 225],
              ].map(([x, y], i) => (
                <g key={i}>
                  <rect
                    x={x + 8}
                    y={y + 15}
                    width="85"
                    height="65"
                    fill="#102a29"
                  />
                  <rect
                    x={x}
                    y={y}
                    width="85"
                    height="65"
                    fill={["#bcab87", "#78a9ad", "#a59eae", "#7fa28b"][i]}
                  />
                  <rect
                    x={x + 8}
                    y={y + 8}
                    width="69"
                    height="45"
                    fill="#284440"
                  />
                  {[0, 1, 2].map((n) => (
                    <rect
                      key={n}
                      x={x + 13 + n * 21}
                      y={y + 18}
                      width="12"
                      height="24"
                      fill="#d6be86"
                    />
                  ))}
                </g>
              ))}
              {[-150, -110, 100, 140].map((x, i) => (
                <g key={i}>
                  <circle cx={x} cy="370" r="18" fill="#102e2a" />
                  <circle cx={x - 3} cy="362" r="15" fill="#47765c" />
                </g>
              ))}
              <rect x="-35" y="365" width="90" height="13" fill="#f3bd63" />
              <rect x="-35" y="378" width="12" height="30" fill="#c69650" />
              <rect x="43" y="378" width="12" height="30" fill="#c69650" />
              <circle
                cx="10"
                cy="322"
                r="12"
                fill="#f9c56d"
                stroke="#fff0c9"
                strokeWidth="4"
              />
            </g>
          </svg>
          <div className="poster-bottom">
            <span className="live-dot" />
            <span>YOUR ADVENTURE STARTS AT THE MAIN GATE</span>
          </div>
          <span className="map-note">
            A fictional game map. A real sense of discovery.
          </span>
        </div>
      </section>
      <section className="key-preview" aria-label="Five Campus Keys">
        <span className="eyebrow">
          A CAMPUS WORTH
          <br />
          UNLOCKING
        </span>
        {collectibles.map((c) => (
          <div key={c.id}>
            <KeyIcon icon={c.icon} />
            <span>{c.name}</span>
          </div>
        ))}
      </section>
      <footer className="landing-footer">
        <Disclaimer />
        <span>BUILT BY TAOSHIF · SHAKKAR · TAUFIQ</span>
      </footer>
    </main>
  );
}
