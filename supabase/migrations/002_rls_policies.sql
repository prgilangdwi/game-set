-- Row Level Security Policies
-- Ensures data isolation between organizers and allows public access where appropriate

alter table public.profiles        enable row level security;
alter table public.tournaments     enable row level security;
alter table public.players         enable row level security;
alter table public.rounds          enable row level security;
alter table public.matches         enable row level security;
alter table public.standings       enable row level security;

-- ── Profiles ──────────────────────────────
create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- ── Tournaments ───────────────────────────
create policy "Organizers see own tournaments"
  on public.tournaments for select
  using (organizer_id = auth.uid() or is_public = true);

create policy "Organizers create tournaments"
  on public.tournaments for insert
  with check (organizer_id = auth.uid());

create policy "Organizers update own tournaments"
  on public.tournaments for update
  using (organizer_id = auth.uid());

create policy "Organizers delete own tournaments"
  on public.tournaments for delete
  using (organizer_id = auth.uid());

-- ── Players ───────────────────────────────
create policy "Players visible in own or public tournaments"
  on public.players for select
  using (
    exists (
      select 1 from public.tournaments t
      where t.id = tournament_id
      and (t.organizer_id = auth.uid() or t.is_public = true)
    )
  );

create policy "Organizers manage players"
  on public.players for all
  using (
    exists (
      select 1 from public.tournaments t
      where t.id = tournament_id and t.organizer_id = auth.uid()
    )
  );

-- ── Rounds ────────────────────────────────
create policy "Rounds visible in own or public tournaments"
  on public.rounds for select
  using (
    exists (
      select 1 from public.tournaments t
      where t.id = tournament_id
      and (t.organizer_id = auth.uid() or t.is_public = true)
    )
  );

create policy "Organizers manage rounds"
  on public.rounds for all
  using (
    exists (
      select 1 from public.tournaments t
      where t.id = tournament_id and t.organizer_id = auth.uid()
    )
  );

-- ── Matches ───────────────────────────────
create policy "Matches visible in own or public tournaments"
  on public.matches for select
  using (
    exists (
      select 1 from public.tournaments t
      where t.id = tournament_id
      and (t.organizer_id = auth.uid() or t.is_public = true)
    )
  );

create policy "Organizers manage matches"
  on public.matches for all
  using (
    exists (
      select 1 from public.tournaments t
      where t.id = tournament_id and t.organizer_id = auth.uid()
    )
  );

-- ── Standings ─────────────────────────────
create policy "Standings visible in own or public tournaments"
  on public.standings for select
  using (
    exists (
      select 1 from public.tournaments t
      where t.id = tournament_id
      and (t.organizer_id = auth.uid() or t.is_public = true)
    )
  );

create policy "System can update standings (via trigger)"
  on public.standings for all
  using (true)
  with check (true);
