-- GameSet Database Schema
-- Supabase PostgreSQL + Row Level Security

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ═══════════════════════════════════════
-- TABLES
-- ═══════════════════════════════════════

-- Users (extends Supabase auth.users)
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text,
  avatar_url  text,
  role        text not null default 'organizer' check (role in ('admin', 'organizer', 'player')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Tournaments
create table if not exists public.tournaments (
  id              uuid primary key default uuid_generate_v4(),
  organizer_id    uuid not null references auth.users(id) on delete cascade,
  name            text not null,
  description     text,
  format          text not null default 'americano' check (format in ('americano','mexicano','round_robin','single_elimination','double_elimination','mixed_doubles','team_cup','ladder')),
  location        text,
  start_date      date,
  end_date        date,
  courts          integer not null default 4 check (courts between 1 and 20),
  match_duration  integer not null default 20 check (match_duration > 0),
  break_duration  integer not null default 5 check (break_duration >= 0),
  scoring_system  text not null default 'points' check (scoring_system in ('points','standard','no-ad')),
  status          text not null default 'draft' check (status in ('draft','active','completed','cancelled')),
  is_public       boolean not null default true,
  max_players     integer,
  slug            text unique,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_tournaments_organizer on public.tournaments(organizer_id);
create index if not exists idx_tournaments_status on public.tournaments(status);
create index if not exists idx_tournaments_slug on public.tournaments(slug);

-- Players
create table if not exists public.players (
  id              uuid primary key default uuid_generate_v4(),
  tournament_id   uuid not null references public.tournaments(id) on delete cascade,
  user_id         uuid references auth.users(id) on delete set null,
  first_name      text not null,
  last_name       text not null,
  display_name    text generated always as (first_name || ' ' || last_name) stored,
  email           text,
  gender          text not null default 'male' check (gender in ('male','female','other')),
  skill_level     text not null default 'intermediate' check (skill_level in ('beginner','intermediate','advanced','pro')),
  rating          integer not null default 1000 check (rating between 0 and 9999),
  is_checked_in   boolean not null default false,
  created_at      timestamptz not null default now()
);

create index if not exists idx_players_tournament on public.players(tournament_id);
create index if not exists idx_players_user on public.players(user_id);

-- Rounds
create table if not exists public.rounds (
  id              uuid primary key default uuid_generate_v4(),
  tournament_id   uuid not null references public.tournaments(id) on delete cascade,
  round_number    integer not null,
  status          text not null default 'pending' check (status in ('pending','active','completed')),
  created_at      timestamptz not null default now(),
  unique(tournament_id, round_number)
);

create index if not exists idx_rounds_tournament on public.rounds(tournament_id);

-- Matches
create table if not exists public.matches (
  id                  uuid primary key default uuid_generate_v4(),
  round_id            uuid not null references public.rounds(id) on delete cascade,
  tournament_id       uuid not null references public.tournaments(id) on delete cascade,
  court_number        integer not null check (court_number > 0),
  team1_player1_id    uuid not null references public.players(id) on delete cascade,
  team1_player2_id    uuid not null references public.players(id) on delete cascade,
  team2_player1_id    uuid not null references public.players(id) on delete cascade,
  team2_player2_id    uuid not null references public.players(id) on delete cascade,
  team1_score         integer not null default 0 check (team1_score >= 0),
  team2_score         integer not null default 0 check (team2_score >= 0),
  status              text not null default 'scheduled' check (status in ('scheduled','live','completed','walkover')),
  started_at          timestamptz,
  completed_at        timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists idx_matches_tournament on public.matches(tournament_id);
create index if not exists idx_matches_round on public.matches(round_id);
create index if not exists idx_matches_status on public.matches(status);

-- Standings (computed, updated by trigger)
create table if not exists public.standings (
  id              uuid primary key default uuid_generate_v4(),
  tournament_id   uuid not null references public.tournaments(id) on delete cascade,
  player_id       uuid not null references public.players(id) on delete cascade,
  matches_played  integer not null default 0,
  wins            integer not null default 0,
  losses          integer not null default 0,
  points          integer not null default 0,
  points_for      integer not null default 0,
  points_against  integer not null default 0,
  differential    integer generated always as (points_for - points_against) stored,
  rank            integer not null default 0,
  prev_rank       integer,
  updated_at      timestamptz not null default now(),
  unique(tournament_id, player_id)
);

create index if not exists idx_standings_tournament on public.standings(tournament_id);
create index if not exists idx_standings_rank on public.standings(tournament_id, rank);

-- ═══════════════════════════════════════
-- FUNCTIONS & TRIGGERS
-- ═══════════════════════════════════════

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Auto-generate slug for tournaments
create or replace function public.generate_tournament_slug()
returns trigger language plpgsql as $$
declare
  base_slug text;
  final_slug text;
  counter integer := 0;
begin
  if new.slug is null then
    base_slug := lower(regexp_replace(new.name, '[^a-zA-Z0-9\s]', '', 'g'));
    base_slug := regexp_replace(trim(base_slug), '\s+', '-', 'g');
    base_slug := left(base_slug, 40);
    final_slug := base_slug || '-' || substr(new.id::text, 1, 6);
    new.slug := final_slug;
  end if;
  return new;
end;
$$;

drop trigger if exists set_tournament_slug on public.tournaments;
create trigger set_tournament_slug
  before insert on public.tournaments
  for each row execute function public.generate_tournament_slug();

-- Update standings when match completes
create or replace function public.update_standings_on_match()
returns trigger language plpgsql as $$
declare
  t_id uuid;
  winner_p1 uuid; winner_p2 uuid;
  loser_p1 uuid; loser_p2 uuid;
  w_score integer; l_score integer;
begin
  -- Only run when match is completed
  if new.status != 'completed' or old.status = 'completed' then
    return new;
  end if;

  t_id := new.tournament_id;

  if new.team1_score >= new.team2_score then
    winner_p1 := new.team1_player1_id; winner_p2 := new.team1_player2_id;
    loser_p1  := new.team2_player1_id; loser_p2  := new.team2_player2_id;
    w_score   := new.team1_score;      l_score   := new.team2_score;
  else
    winner_p1 := new.team2_player1_id; winner_p2 := new.team2_player2_id;
    loser_p1  := new.team1_player1_id; loser_p2  := new.team1_player2_id;
    w_score   := new.team2_score;      l_score   := new.team1_score;
  end if;

  -- Upsert winners
  insert into public.standings (tournament_id, player_id, matches_played, wins, points, points_for, points_against)
  values (t_id, winner_p1, 1, 1, w_score, w_score, l_score)
  on conflict (tournament_id, player_id) do update set
    matches_played = standings.matches_played + 1,
    wins           = standings.wins + 1,
    points         = standings.points + excluded.points,
    points_for     = standings.points_for + w_score,
    points_against = standings.points_against + l_score,
    updated_at     = now();

  insert into public.standings (tournament_id, player_id, matches_played, wins, points, points_for, points_against)
  values (t_id, winner_p2, 1, 1, w_score, w_score, l_score)
  on conflict (tournament_id, player_id) do update set
    matches_played = standings.matches_played + 1,
    wins           = standings.wins + 1,
    points         = standings.points + excluded.points,
    points_for     = standings.points_for + w_score,
    points_against = standings.points_against + l_score,
    updated_at     = now();

  -- Upsert losers
  insert into public.standings (tournament_id, player_id, matches_played, losses, points_for, points_against)
  values (t_id, loser_p1, 1, 1, l_score, w_score)
  on conflict (tournament_id, player_id) do update set
    matches_played = standings.matches_played + 1,
    losses         = standings.losses + 1,
    points_for     = standings.points_for + l_score,
    points_against = standings.points_against + w_score,
    updated_at     = now();

  insert into public.standings (tournament_id, player_id, matches_played, losses, points_for, points_against)
  values (t_id, loser_p2, 1, 1, l_score, w_score)
  on conflict (tournament_id, player_id) do update set
    matches_played = standings.matches_played + 1,
    losses         = standings.losses + 1,
    points_for     = standings.points_for + l_score,
    points_against = standings.points_against + w_score,
    updated_at     = now();

  -- Recompute ranks for this tournament
  with ranked as (
    select player_id, row_number() over (order by points desc, differential desc, wins desc) as new_rank
    from public.standings where tournament_id = t_id
  )
  update public.standings s
  set prev_rank = s.rank, rank = r.new_rank
  from ranked r where s.player_id = r.player_id and s.tournament_id = t_id;

  return new;
end;
$$;

drop trigger if exists on_match_completed on public.matches;
create trigger on_match_completed
  after update on public.matches
  for each row execute function public.update_standings_on_match();

-- Updated_at timestamps
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists set_tournaments_updated_at on public.tournaments;
create trigger set_tournaments_updated_at before update on public.tournaments
  for each row execute function public.set_updated_at();

drop trigger if exists set_matches_updated_at on public.matches;
create trigger set_matches_updated_at before update on public.matches
  for each row execute function public.set_updated_at();
