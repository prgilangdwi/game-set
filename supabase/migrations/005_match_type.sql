-- Migration 005: Add match_type column to tournaments
-- Stores sport-specific match format: "best_of_3", "best_of_5", "tiebreak", etc.

alter table public.tournaments
  add column if not exists match_type text;
