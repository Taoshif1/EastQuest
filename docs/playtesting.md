# Physical-phone closed playtest

This is a Team / closed playtest build.
Student-built prototype. Not an official East West University service.
The map is fictional; do not use it to navigate the real campus.

## Connect a phone

Use the verified hosted URL in README when available. For local testing, put
phone and computer on the same trusted Wi-Fi network, then run:

```sh
npm run dev -- --hostname 0.0.0.0
```

Find the computer's Wi-Fi IPv4 address with ipconfig (Windows), and open
http://YOUR-COMPUTER-IP:3000 on the phone. Allow the Node development server through
the firewall only on your private network if prompted. Do not expose the port
on the public internet. localhost on a phone refers to the phone itself.
Guest Wi-Fi may isolate devices; use the hosted URL instead.
No GPS, camera or QR permissions are needed.

## Ten-minute test

1. Open landing and read the prototype disclaimer.
2. Log in with sample ID 2023-3-60-376. No password or real ID is needed.
3. Move with the D-pad in portrait, then optionally landscape. Rotation is never forced.
4. Investigate Main Gate, finish the tutorial, confirm 50 XP and Explorer Pass.
5. Visit Library and another location, answer a quest, and inspect the collection.
6. Open profile, return to game, reload; verify XP, keys and quests persist.
   Position resets to Main Gate intentionally.
7. Try game-only Fullscreen if the button is available. Exit and continue.
8. Profile → Playtest feedback → EXPORT FEEDBACK. Check the JSON download.
   Share it manually with the team; there is no server submission.
9. Optional diagnostics: open /game?debug=1. Collapse the panel to keep controls clear.
10. Check text zoom on login/profile, long dialogs, and accidental swipes on the canvas.

Test at 390, 430 and 768 CSS pixels, including narrow portrait and short landscape.
Device emulation helps find layout issues but does not replace actual iOS/Android testing.
Installation depends on browser support. The manifest supplies standalone metadata
and original icons; no service worker or offline guarantee is provided.

## V0.3C campus adventure pass

Use this shorter route to exercise the connected exploration loop:

1. Log in with the sample ID and walk until an NPC or unusual-detail cue appears.
2. Open the interaction prompt and confirm that NPCs say **Talk**, activities say
   **Play**, discoveries say **Investigate**, and ordinary objects use **Read** or
   **Inspect**. When several targets overlap, use the arrows or Tab/Q to cycle.
3. Talk to an NPC, choose **Listen**, then ask about a rumor. Close the conversation
   and continue exploring; the contact and rumor should remain in the Explorer Log.
4. Visit the Sports Arcade. Play one cricket timing, penalty, and reaction run.
   Confirm each run gives immediate round feedback, supports replay, and preserves
   the best score after reload.
5. Inspect a Three Marks discovery and at least one other hidden discovery. Confirm
   the subtle world cue becomes a saved collection entry without duplicate XP.
6. Reload after the route and verify position, discoveries, rumors, activity scores,
   notifications, and quest progress remain available.

For touch testing, use the on-screen movement controls and tap every action button
at 390x844 and 430x900. For desktop testing, verify the same route at 1440x900
without HUD overlap. Reduced-motion users should still receive text feedback and
must not depend on animation alone.

## V0.3C2 progression pass

1. Start a side quest, enter the Lost Campus File, and confirm the compact
   **TRACKING** controls can switch between the Campus Quest, case, and side-quest
   lead without resetting any progress.
2. Open the Case Board and confirm the current lead, stage trail, evidence count,
   discovered clue details, and `???` placeholders for undiscovered clues are
   readable on a narrow screen.
3. Play Cricket Boundary Timing, Futsal Penalty, and Table Tennis Reaction.
   Confirm best scores persist, a first medal is shown, and replaying with a lower
   score does not remove an existing medal.
4. Open Collection and Profile after the sports runs. Confirm the three sports
   medal slots, activity counts, and objective selection survive reload.

## One record per tester

Do not collect names, passwords, real student IDs, location history or faces.
Use a temporary anonymous tester code if needed.

| Field | Tester response |
| --- | --- |
| Build version / URL / test date | |
| Device model | |
| Operating system | |
| Browser / version | |
| Screen size / orientation | |
| Login worked? | |
| Movement responsiveness | |
| Touch-control usability | |
| Interaction prompt clarity | |
| Quest clarity | |
| Collection clarity | |
| Performance issues (when and where) | |
| Bugs / reproduction steps | |
| Confusing moments | |
| Enjoyment (1–5) | |
| Did you understand the useful campus-information purpose? Explain. | |

The feedback form captures rating and free-text notes plus browser/viewport metadata.
Use this table for the additional observations. Review exports before sharing;
remove accidental personal details. Keep feedback with the team, delete raw reports
after triage, and put only anonymized reproduction details in public issues.