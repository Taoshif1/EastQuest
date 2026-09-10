# EastQuest

**Your Campus. Your Quest.** Built by Taoshif, Shakkar, and Taufiq.

A student-built web game initially for East West University (EWU), Bangladesh.
Student-built prototype. Not an official East West University service.
V0.2 uses locally supplied EWU architectural plans and the public campus directory.
The playable geometry is rectified and simplified; it is not a surveyed navigation aid.

## V0.2 — Real EWU Campus World

Repository: [Taoshif1/EastQuest](https://github.com/Taoshif1/EastQuest).

Hosted closed playtest: [eastquest.vercel.app](https://eastquest.vercel.app).
Use the sample ID below; saves stay on that device and browser.

[![CI](https://github.com/Taoshif1/EastQuest/actions/workflows/ci.yml/badge.svg)](https://github.com/Taoshif1/EastQuest/actions/workflows/ci.yml)

The existing quest engine now runs in a multi-floor EWU campus: two basements,
ground, and floors 1–8. Walk through the outer gate, security, and punch gate,
then find the courtyard and block lift/stair lobbies. Press M or tap the minimap
for the campus atlas. Roof Deck and the FUB interior remain reference-only.

Diagnostics are available at `/game?debug=1`. The architectural blueprint overlay
requires a local development server and local reference files. Original drawings
are ignored by Git and are never served by production builds.
See [map notes](docs/v0.2-map-notes.md), [source register](docs/campus-source-register.md),
and [map editing](docs/campus-map-editing.md).

The web manifest uses original compass icons and standalone display metadata.
There is no service worker or offline guarantee.

Start with [CONTRIBUTING](CONTRIBUTING.md), [team onboarding](docs/team-onboarding.md),
[phone playtesting](docs/playtesting.md), [campus content](docs/campus-content-guide.md),
[EWU survey](docs/ewu-campus-survey-template.md), and [V0.1 validation](docs/v0.1-validation.md).

## Play V0.2

Use Node.js 22.21 or newer compatible LTS and npm. From this existing project root:

```powershell
npm ci
npm run dev
```

Open http://localhost:3000. Enter `2023-3-60-376`; the displayed identity is
`2023-3-60-376@std.ewubd.edu`. This creates/loads a browser-local profile. It does
not verify enrollment, contact EWU, send email, or ask for a password.
The configurable ID policy currently accepts four-digit year, semester 1–3,
two-digit program, and three-digit sequence. Historical formats need research.

Move with WASD/arrows or the touch D-pad. Press E or tap Investigate near a marker.
Complete the Main Gate tutorial, then visit the Library, ICS / Computer Lab,
Career Counseling Center, and Medical Center in any order.
Library: Block B / Fifth. ICS Computer Lab: Block B / Fourth.
Career Counseling: Admin / Second. Medical Center: Block D / First.
Earn Explorer Pass (50 XP), Knowledge Key, Tech Chip, Career Compass, and Support
Beacon (100 XP each). All five award the EWU EXPLORER completion screen.
Continue exploring afterwards; collection and profile remain available.
Profile → Prototype settings → Reset prototype progress asks for confirmation.
Login has a confirmed recovery reset for a damaged local save.

## Stack and commands

Next.js App Router, React, TypeScript, Phaser 3, CSS, Vitest. npm lockfile is committed.
No Redux, scanner, ML, or production backend SDK is required.

| Command           | Purpose                      |
| ----------------- | ---------------------------- |
| npm run dev       | Local development            |
| npm run lint      | ESLint                       |
| npm run typecheck | Strict TypeScript            |
| npm run test      | Domain and persistence tests |
| npm run build     | Production build             |
| npm start         | Serve the production build   |

## Structure

- `src/app`: landing, login, game, collection, profile routes and design tokens.
- `src/components`: React UI, auth context, canvas host, accessible dialogs.
- `src/game/scenes`: campus drawing and Arcade physics.
- `src/game/movement`: PositionProvider and simulated coordinates.
- `src/game/verification`: location verification contract and proximity adapter.
- `src/game/quests`: framework-independent QuestEngine.
- `src/game/data`: typed locations, quest questions, rewards, building footprints.
- `src/game/minigames`: registry of reusable challenge components.
- `src/game/events`: typed per-session React/Phaser event bridge.
- `src/game/persistence`: GameRepository and versioned local implementation.
- `src/game/progression`: configurable 300 XP per level.
- `src/lib`: centralized ID validation and future Supabase adapter.
- `supabase/migrations`: initial schema and RLS preparation.
- `docs`: architecture, gameplay, team workflow, future adapters, roadmap.

## Architecture and persistence

Phaser loads dynamically inside a client effect, so server rendering never imports
browser-only Phaser code. Scene create/update/shutdown owns movement, collisions,
camera, decorations, and proximity prompts. React uses typed bridge events instead
of reaching into the Scene. Menus and challenges use native HTML dialogs.

Phaser publishes collision-resolved positions to SimulatedPositionProvider.
QuestEngine uses LocationVerificationProvider, checks prerequisites, evaluates
answers, and produces an immutable save. PlayerProvider serializes actions and
persists before announcing rewards. LocalGameRepository is the only storage
implementation. Profiles, avatarId, XP, level, attempts, completions and timestamped
keys survive reload. Building, floor, collision-resolved position, and discovered POIs survive reload.
V0.1 saves migrate to the outer gate while preserving quests, XP, and keys.
Invalid or colliding saved positions safely fall back to the outer gate.
Clearing browser data deletes saves. Local data is editable and has no anti-cheat
guarantee. Multiple tabs are not synchronized; play in one tab for V0.

## Supabase later

No credentials or environment files are needed or created for V0.
Future deployment variable names: `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and server-only `SUPABASE_SECRET_KEY`.
Never expose secret/service-role keys to browser code.
SupabaseGameRepository is a transport adapter boundary, not a live integration.
SupabaseAuthProvider and EwuSsoAuthProvider will implement AuthProvider when
legitimate identity services are available. Do not trust local student IDs as auth UUIDs.

The migration creates profiles, locations, quests, prerequisites, collectibles,
quest progress, collected keys, and stats. Public content is readable; private
records require matching auth.uid(). Players can update their own display name
and avatar. Reward fields remain server-owned. A future verified, atomic server
transaction must complete quests and grant XP exactly once.
The migration is prepared, not applied to a live database. Before beta, apply in
a disposable Supabase environment, test two-user RLS isolation, and run advisors.
Do not expose correct answers in production public mini_game_config.

## Future positioning and verification

WorldPosition (x/y) and GeoPosition (latitude/longitude/accuracy) remain separate.
A GPS source plus CampusCoordinateMapper will adapt measured locations.
QR can add signed checkpoint evidence; CV/YOLO can supply target class/confidence
through VisionVerificationProvider. None of these advanced features is installed.
See [architecture](docs/architecture.md), [GPS](docs/future-gps.md),
[QR](docs/future-qr.md), and [vision](docs/future-vision.md).

## Team and next steps

Start with [team guide](docs/team-guide.md), [game loop](docs/game-loop.md),
and [beta roadmap](docs/beta-roadmap.md). See [validation](docs/validation.md)
for actual checks and remaining limits.

Implementation references: [Next.js installation](https://nextjs.org/docs/app/getting-started/installation),
[Phaser installation](https://docs.phaser.io/phaser/getting-started/installation),
[Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security).
