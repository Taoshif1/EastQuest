-- Preparation only. Apply to a Supabase development project once official auth is configured.
-- Local student IDs are NOT auth.users UUIDs; never migrate them as authenticated identities.
begin;
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  student_id text not null unique,
  display_name text not null default 'Campus Explorer',
  avatar_id text not null default 'explorer-01',
  level integer not null default 1 check (level >= 1),
  xp integer not null default 0 check (xp >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.campus_locations (
  id text primary key, slug text not null unique, name text not null,
  description text not null, location_type text not null,
  world_x double precision not null, world_y double precision not null,
  interaction_radius double precision not null check (interaction_radius > 0),
  geo_lat double precision check (geo_lat between -90 and 90),
  geo_lng double precision check (geo_lng between -180 and 180),
  radius_meters double precision check (radius_meters > 0), floor text,
  official_resource_url text,
  verification_modes text[] not null default array['proximity'],
  created_at timestamptz not null default now(),
  check ((geo_lat is null) = (geo_lng is null))
);
create table public.collectibles (
  id text primary key, location_id text not null references public.campus_locations(id),
  name text not null, description text not null, why_it_matters text not null, icon text not null
);
create index collectibles_location_idx on public.collectibles(location_id);
create table public.quests (
  id text primary key, slug text not null unique,
  location_id text not null references public.campus_locations(id),
  title text not null, description text not null,
  mini_game_type text not null check (mini_game_type in ('tutorial','multiple-choice','quick-decision','logic','scenario')),
  mini_game_config jsonb not null,
  reward_xp integer not null check (reward_xp >= 0),
  collectible_id text not null references public.collectibles(id),
  active boolean not null default true
);
create index quests_location_idx on public.quests(location_id) where active;
create index quests_collectible_idx on public.quests(collectible_id);
create table public.quest_prerequisites (
  quest_id text not null references public.quests(id) on delete cascade,
  prerequisite_id text not null references public.quests(id),
  primary key (quest_id, prerequisite_id), check (quest_id <> prerequisite_id)
);
create index quest_prerequisite_lookup_idx on public.quest_prerequisites(prerequisite_id);
create table public.player_quest_progress (
  user_id uuid not null references public.profiles(id) on delete cascade,
  quest_id text not null references public.quests(id),
  status text not null default 'AVAILABLE' check (status in ('LOCKED','AVAILABLE','ACTIVE','COMPLETED')),
  score integer not null default 0 check (score between 0 and 100),
  attempts integer not null default 0 check (attempts >= 0),
  completed_at timestamptz,
  primary key (user_id, quest_id),
  check ((status = 'COMPLETED') = (completed_at is not null))
);
create index player_progress_quest_idx on public.player_quest_progress(quest_id);
create table public.player_collectibles (
  user_id uuid not null references public.profiles(id) on delete cascade,
  collectible_id text not null references public.collectibles(id),
  obtained_at timestamptz not null default now(),
  primary key (user_id, collectible_id)
);
create index player_collectibles_item_idx on public.player_collectibles(collectible_id);
create table public.player_stats (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  quests_completed integer not null default 0 check (quests_completed >= 0),
  total_score integer not null default 0 check (total_score >= 0),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
alter table public.campus_locations enable row level security;
alter table public.collectibles enable row level security;
alter table public.quests enable row level security;
alter table public.quest_prerequisites enable row level security;
alter table public.player_quest_progress enable row level security;
alter table public.player_collectibles enable row level security;
alter table public.player_stats enable row level security;

grant select on public.campus_locations, public.collectibles, public.quests, public.quest_prerequisites to anon, authenticated;
create policy locations_public_read on public.campus_locations for select to anon, authenticated using (true);
create policy collectibles_public_read on public.collectibles for select to anon, authenticated using (true);
create policy quests_public_read on public.quests for select to anon, authenticated using (active);
create policy prerequisites_public_read on public.quest_prerequisites for select to anon, authenticated using (
  exists (select 1 from public.quests where quests.id = quest_id and quests.active)
);

-- Ownership checks protect all private player data. Grants additionally protect reward columns.
revoke all on public.profiles, public.player_quest_progress, public.player_collectibles, public.player_stats from anon, authenticated;
grant select on public.profiles, public.player_quest_progress, public.player_collectibles, public.player_stats to authenticated;
grant update (display_name, avatar_id) on public.profiles to authenticated;
create policy profile_read_own on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy profile_update_own on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy progress_read_own on public.player_quest_progress for select to authenticated using ((select auth.uid()) = user_id);
create policy progress_update_own on public.player_quest_progress for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy keys_read_own on public.player_collectibles for select to authenticated using ((select auth.uid()) = user_id);
create policy stats_read_own on public.player_stats for select to authenticated using ((select auth.uid()) = user_id);
-- Progress writes intentionally have no browser grant yet. A future authenticated server
-- transaction validates evidence, prerequisites and answers, then atomically updates rewards.
-- Provision profiles through a trusted auth hook; clients cannot self-assign student_id or XP.
commit;
