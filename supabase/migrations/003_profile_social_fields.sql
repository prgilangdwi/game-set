-- Social profile fields + community RLS

alter table public.profiles
  add column if not exists bio              text,
  add column if not exists skill_level      text check (skill_level in ('beginner','intermediate','advanced','pro')),
  add column if not exists years_playing    integer check (years_playing >= 0 and years_playing <= 60),
  add column if not exists location         text,
  add column if not exists preferred_hand   text check (preferred_hand in ('right','left','ambidextrous')),
  add column if not exists favorite_surface text check (favorite_surface in ('hard','clay','grass','indoor'));

-- Replace own-only view policy with community-wide access
drop policy if exists "Users can view own profile" on public.profiles;

create policy "Authenticated users can view any profile"
  on public.profiles for select
  using (auth.uid() is not null);

-- updated_at trigger was missing for profiles
drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();
