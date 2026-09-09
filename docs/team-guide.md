# Team guide

Taoshif, Shakkar, and Taufiq are building and learning together.

| Starting owner | Suggested focus                                                                          |
| -------------- | ---------------------------------------------------------------------------------------- |
| Taoshif        | Architecture, persistence/backend, Supabase, QuestEngine integration, integration/review |
| Shakkar        | Quest content, mini-games, testing, balancing, future campus-content research            |
| Taufiq         | Phaser world, movement, controls, UI, visual polish                                      |

Ownership is a starting point, not a permanent boundary. All three should trace
QuestEngine, GameRepository, PositionProvider, and GameBridge once before adding features.

## First learning session

Run the game and earn a key. Read campus.ts for its definition, then follow
QuestDialog → PlayerProvider → QuestEngine → verification → GameRepository.
Next follow CampusScene.update → PositionProvider and bridge → GameScreen.
Change one question, run tests, and explain the reward protection to a teammate.

## Small pull requests

Branch from the agreed integration branch. Suggested branches:
feature/game-world, feature/quest-engine, feature/minigames, feature/gps, feature/vision.
Use small scoped commits and ask one teammate to review. Include the concrete
behavior changed and validation performed. Rebase only your own unpublished work.
Before merging: npm run lint, npm run typecheck, npm run test, npm run build,
git diff --check. For UI/world changes, also walk the affected route on desktop and mobile.
Never commit node_modules, .next, environment files, screenshots from temporary
browser checks, or real student data. Use the example ID for demonstrations.

## Content changes

Keep questions and keys in data, not location-specific component branches.
Confirm real campus descriptions and links before claiming official resources.
Respect student privacy; this prototype does not verify identity or record GPS.
