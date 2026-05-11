-- Migration 004: Universal Racquet Sports Platform
-- Adds multi-sport support and simplifies the player name model.

-- ── 1. Add sport column to tournaments ───────────────────────────────────────
alter table public.tournaments
  add column if not exists sport text not null default 'tennis'
  check (sport in ('tennis', 'badminton', 'padel', 'pickleball'));

-- ── 2. Migrate players to a single name field ─────────────────────────────────

-- Drop the old generated display_name (first_name || ' ' || last_name).
-- We will recreate it as a generated alias of the new `name` column.
alter table public.players drop column if exists display_name;

-- Add the unified name column (nullable initially so the backfill can run).
alter table public.players add column if not exists name text;

-- Backfill from existing split fields.
update public.players
set name = trim(first_name || ' ' || last_name)
where name is null or name = '';

-- Enforce non-empty name going forward.
alter table public.players alter column name set not null;
alter table public.players
  add constraint players_name_nonempty check (length(trim(name)) > 0);

-- Restore display_name as a generated alias of name so existing queries
-- that join on display_name continue to work without modification.
alter table public.players
  add column display_name text generated always as (name) stored;

-- Make first_name / last_name nullable with empty defaults so legacy inserts
-- (and the americano engine which never touches these fields) still work.
alter table public.players alter column first_name drop not null;
alter table public.players alter column last_name  drop not null;
alter table public.players alter column first_name set default '';
alter table public.players alter column last_name  set default '';
