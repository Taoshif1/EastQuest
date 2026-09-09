# Beta roadmap

1. Playtest the V0 with the team on real phones. Improve navigation, marker visibility,
   challenge feedback and accessibility from observed problems.
2. Confirm campus content and historical ID formats with legitimate resources.
   Replace fictional geography only after mapping and field checks.
3. Add legitimate Supabase authentication. Apply migration in a disposable project;
   verify RLS with two real test auth users, then build atomic server-verified rewards.
   Move answer keys out of public quest configuration. Test retry and replay protection.
4. Implement SupabaseGameRepository authenticated transport and versioned save migration.
   Decide whether unverified local progress can be imported; do not treat it as proof.
5. Research GPS calibration and accuracy; implement provider and PostGIS migration.
6. Pilot approved signed QR checkpoints, then evaluate a consented vision landmark dataset.
7. Only after the core is reliable: events, achievements, custom avatars, social features,
   leaderboards, and potentially multiplayer.

Do not add payments, PvP, chat, ML dependencies, or push notifications to V0.
The recommended next milestone is a small campus playtest plus content verification.
