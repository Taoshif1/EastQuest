# V0 validation report

Validated on 9 September 2026 in E:\EastQuest, branch
feat/v0-campus-exploration. Initial directory was empty; Git had no commits or remote.

## Required checks

| Check | Result |
| --- | --- |
| npm run lint | Passed, no lint rules disabled |
| npm run typecheck | Passed, strict TypeScript |
| npm run test | 24 tests passed |
| npm run build | Passed; all five requested routes prerender successfully |
| git diff --check | Passed |
| Naming / environment audit | EastQuest retained; no forbidden product/path names or environment files |

Toolchain: Next.js 16.3.4, React 19.2.8, Phaser 3.90.0, TypeScript 6.0.3,
Vitest 5.0.0, ESLint 9.39.5. TypeScript 7 was tested but is not yet supported by
the bundled typescript-eslint stack; compatible versions were pinned instead.
A Phaser ESM default-import mismatch was caught in browser/build validation and
fixed with a namespace import. No SSR or hydration bypass was added.

## Unit coverage

24 tests cover valid/trimmed IDs, derived email, six invalid input cases,
quest availability and prerequisites, activation, completion, XP, dated keys,
duplicate completion, proximity recheck, wrong-answer retry/attempts, the full
450-XP route, normalized diagonal vectors, radius boundaries, provider subscription
cleanup, levels, repository serialization, profile isolation/removal, corrupt-save
preservation, storage failures, and password-free prototype profile restoration.

## Actual playable browser route

Used headless Chromium through agent-browser, then its CDP connection for repeatable
viewport and real touch tests. Gameplay moved the actual Phaser avatar with keyboard
events; tests observed typed position events without teleporting or editing saves.

- Entered 2023-3-60-376 and verified the derived student identity.
- Spawned at Main Gate, completed tutorial, unlocked Explorer Pass / 50 XP.
- Walked to Library using WASD; prompt cleared outside the interaction radius.
- Pressed E to open Library quest; movement stopped while the dialog was open.
- Submitted a wrong answer, saw retry feedback, then unlocked Knowledge Key.
- Tried walking through Library: collision stopped the avatar at its footprint.
- Walked to ICS, Career Center and Student Support and completed each challenge.
- Unlocked all five keys; EWU EXPLORER displayed 450 XP and five completed quests.
- Continued exploring; world bounds held the avatar at x=40, y=1010.
- Reloaded and verified all five keys / completion state survived.
- Confirmed collection displayed five unlocked keys with obtained times.
- Cancelled reset: retained 450 XP. Confirmed reset: zero XP, level 1, five locked keys.
- Fresh run returned to x=640, y=915, and tutorial could start again.
- Real CDP touch input moved the player; releasing the D-pad stopped movement.
- Arrow keys moved the player; the 390px tutorial dialog fit and remained usable.

## Responsive matrix

All five routes tested at each width, using a 900px viewport height:

| Width | Pages | Horizontal overflow | Game canvas | Touch controls | Completion dialog |
| --- | --- | --- | --- | --- | --- |
| 1440 | 5/5 | None | 1440 × 775 | Keyboard desktop | Fits |
| 1024 | 5/5 | None | 1024 × 775 | Keyboard desktop | Fits |
| 768 | 5/5 | None | 768 × 784 | Visible | Fits |
| 430 | 5/5 | None | 430 × 761 | Visible | Fits |
| 390 | 5/5 | None | 390 × 761 | Visible | Fits |

Zero runtime exceptions in the 25-page matrix and reset/touch checks.
Visually inspected desktop campus, landing, mobile world, mobile collection,
tutorial, and completion screenshots. Corrected a clipped landing SVG and a
marker encoding issue discovered during review.
Temporary browser scripts, screenshots and SQL tooling stay in ignored .artifacts.

## SQL and security preparation

Executed the migration with PGlite (local PostgreSQL) and a minimal simulated
auth.users / auth.uid setup. Twelve checks passed:
migration execution, RLS on all eight tables, ownership filtering for profiles,
progress, keys and stats, own-profile update, rejection of another profile update,
XP write rejection, progress write rejection, anonymous public-content read,
and anonymous private-collection rejection.

This validates PostgreSQL syntax and policy behavior, not a deployed Supabase
integration. Live Supabase credentials, identity provisioning, API transport,
schema advisors and end-to-end hosted auth are deferred. Test them before beta.
Production rewards need atomic trusted transactions; public question data must
not contain production answer keys.

## Practical limits

Browser checks use emulation, not physical Android/iOS hardware. A real-device
campus playtest is the recommended next milestone. GPS/QR/vision remain documentation
and provider seams; the map is fictional. Local profiles are editable, unverified,
browser-specific and not synchronized across tabs. Google-hosted fonts enhance
typography; system font fallbacks keep the UI usable when font downloads fail.
