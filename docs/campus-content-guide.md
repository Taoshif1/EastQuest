# Campus content guide

The V0 source of truth is **src/game/data/campus.ts**. It already groups typed data;
V0.1 keeps the same locations, quests and rewards. Data stays separate so campus
surveys can improve content without rewriting movement or quest rules.

| Change | Field / export |
| --- | --- |
| Location name, description, service type | locations[].name / description / type |
| Logical x/y coordinates | locations[].worldPosition |
| Interaction distance in world units | locations[].interactionRadius |
| Building label and collision footprint | buildings[].label / x / y / width / height |
| Map dimensions, spawn and movement speed | WORLD |
| Quest title, copy and location link | quests[].title / description / locationId |
| Unlock order | quests[].prerequisites (quest IDs) |
| XP reward | quests[].rewardXp |
| Collectible reward link | quests[].collectibleId |
| Collectible name, icon and usefulness | collectibles[].name / icon / whyItMatters |
| Mini-game selection | quests[].type → MiniGameRegistry |
| Question, options, answer and explanation | quests[].config |

A building sign and a location's display name serve different visual contexts;
update both in this file if renaming that service. Do not scatter copied questions
through JSX. Existing SQL is future schema preparation, not live V0 content.

Keep IDs stable because local saves refer to them. Keep coordinates within WORLD,
markers outside collision footprints, and a walkable approach within their radius.
correctIndex is zero-based. Prerequisites must exist and must not form cycles.
Every quest must reference an existing location and collectible.
Use the integrity tests and play through changes before submitting a PR.

This release assumes five Campus Keys in its completion UI; expanding beyond five
needs a separate feature with UI and save compatibility review.
Never replace logical x/y with latitude/longitude. Record measured evidence in
[the survey template](ewu-campus-survey-template.md) first; a later coordinate mapper
will connect real positioning to the game. Do not invent official policies.