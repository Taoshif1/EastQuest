# Contributing to EastQuest

Taoshif, Shakkar and Taufiq build this student prototype together.
Do not work directly on main for normal feature development. Keep each change small
enough that another student can understand and test it.

## Start a feature

First finish and commit current work, or stash it with a descriptive message.
Run `git status` before switching branches. Never discard someone else's changes.

```sh
git switch main
git pull origin main --ff-only
git switch -c feature/short-name
npm install
npm run dev
```

On a branch that already tracks a remote, `git pull --ff-only` (the safe form of
`git pull`) downloads and fast-forwards it. If it refuses, inspect the history;
do not force-push to make the error disappear.

Examples: `feature/game-world`, `feature/minigame-library`,
`feature/campus-content`, `feature/gps-provider`, `feature/vision-provider`.
GPS and vision names are future examples, not permission to add them in V0.1.

## Work, test, commit, push

Read AGENTS.md and the installed Next.js guides before changing Next.js code.

```sh
npm run lint
npm run typecheck
npm run test
npm run build
git diff --check
git diff
git add src docs
git commit -m "feat: describe the change"
git push -u origin feature/short-name
```

Stage the actual files you changed; the example paths are not a requirement.
Open GitHub and create a pull request targeting main. Explain the problem,
resulting behavior, and checks performed. Ask a teammate to review. Wait for
the CI validation job to pass before merging. Never bypass failing CI.

## Safely update your feature from main

Commit or stash first. Merge main into shared branches to preserve others' history.

```sh
git fetch origin
git switch feature/short-name
git merge origin/main
```

If conflicts appear, read both versions and resolve the intended behavior,
then stage resolved files and commit. Run all checks again before pushing.
Use `git merge --abort` if you need to return to the pre-merge state.
Do not rebase a shared branch or force-push without team coordination.

## Boundaries

Campus content lives in src/game/data/campus.ts. Keep QuestEngine independent
of React, Phaser and hosting. UI changes belong in React; world movement belongs
in Phaser. Do not commit credentials, student records, feedback exports or .vercel.
Student-built prototype. Not an official East West University service.