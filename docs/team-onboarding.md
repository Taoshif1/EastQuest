# Team onboarding

Welcome Taoshif, Shakkar and Taufiq. Install Git and Node.js 22 LTS
(22.21 or newer in that line), which includes npm. An editor such as VS Code helps.

From a fresh machine, choose your normal projects directory:

```sh
git clone https://github.com/Taoshif1/EastQuest.git
cd EastQuest
npm install
npm run dev
```

Open http://localhost:3000. Use the sample ID 2023-3-60-376.
No password, EWU account access, environment file or backend is required.
On Windows, use npm.cmd if PowerShell blocks npm.ps1.
Use npm ci for a clean install matching the committed lockfile.

## Understand the pieces

| Piece | Responsibility | Start here |
| --- | --- | --- |
| React / Next.js | Pages, login, HUD, dialogs, routing | src/app, src/components |
| Phaser | Canvas world, collisions, movement, camera | src/game/scenes/campus-scene.ts |
| QuestEngine | Prerequisites, answers, XP and key rewards | src/game/quests/quest-engine.ts |
| PositionProvider | Supplies logical x/y independently of controls | src/game/movement/position-provider.ts |
| VerificationProvider | Checks whether interaction is allowed; current implementation uses proximity | src/game/verification/location-verification.ts |
| GameRepository | Loads and saves progress; currently browser localStorage | src/game/persistence/game-repository.ts |
| Session / bridge | Connects UI and world through typed events | src/game/core/session.ts, src/game/events/bridge.ts |
| MiniGameRegistry | Selects a reusable challenge UI | src/game/minigames/registry.tsx |
| Campus content | Locations, questions, rewards and map footprints | src/game/data/campus.ts |
| Playtest tooling | Version, JSON feedback, optional diagnostics | src/lib/app-info.ts, src/lib/feedback.ts, src/components/game/debug-panel.tsx |

Change content using [the content guide](campus-content-guide.md).
Read [architecture](architecture.md), [contribution workflow](../CONTRIBUTING.md)
and [playtesting](playtesting.md) before your first PR.

GPS, QR and vision are future adapters. Do not install ML packages or add
camera/location permissions in this milestone. The existing repository architecture
has room for them without replacing the playable world.

## First contribution

Create a branch from updated main, make one small change, run lint/typecheck/test/build,
and open a pull request. Never run git init in this cloned project.
Ask a teammate to review before merging.