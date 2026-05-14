import type { SportType } from "@/types";

export interface MatchTypeOption {
  value: string;
  label: string;
  description: string;
}

export const MATCH_TYPES: Record<SportType, MatchTypeOption[]> = {
  tennis: [
    { value: "best_of_3",      label: "Best of 3 Sets",   description: "First to win 2 sets wins the match. Each set to 6 games (tiebreak at 6-6). Standard recreational format." },
    { value: "best_of_5",      label: "Best of 5 Sets",   description: "First to win 3 sets. Used in Grand Slams and high-level tournaments. Long and prestigious." },
    { value: "race_to_4",      label: "Race to 4 Games",  description: "First team to 4 games wins, no sets needed. Fast and fun for social Americano events." },
    { value: "race_to_5",      label: "Race to 5 Games",  description: "First to 5 games wins. Slightly longer than Race to 4 — a good balance of speed and competition." },
    { value: "tiebreak",       label: "Tiebreak to 10",   description: "A single tiebreak to 10 points, win by 2. Quickest format — ideal when time is limited." },
    { value: "super_tiebreak", label: "Super Tiebreak",   description: "Match decided by one super tiebreak to 10, often replacing the 3rd set. Common in doubles play." },
  ],
  badminton: [
    { value: "best_of_3", label: "Best of 3",         description: "First to win 2 games of 21 points (win by 2, cap at 30). Standard BWF format for all levels." },
    { value: "best_of_5", label: "Best of 5",         description: "First to win 3 games of 21. Longer and more demanding — best suited for serious competitive play." },
    { value: "single_21", label: "Single Game to 21", description: "One game to 21 points with rally scoring. The fastest format — perfect for round-robin social events." },
  ],
  padel: [
    { value: "best_of_3",    label: "Best of 3 Sets", description: "First to win 2 sets (6 games each, tiebreak at 6-6). Standard padel format played worldwide." },
    { value: "best_of_5",    label: "Best of 5 Sets", description: "First to win 3 sets. Used in high-level padel tournaments. Long and physically demanding." },
    { value: "golden_point", label: "Golden Point",   description: "At deuce, one decisive point is played instead of advantage. Speeds up play — no long deuce games." },
  ],
  pickleball: [
    { value: "best_of_3",  label: "Best of 3",    description: "First to win 2 games of 11 points (win by 2). Standard USA Pickleball Association recreational format." },
    { value: "race_to_11", label: "Race to 11",   description: "Single game to 11, win by 2, rally scoring. The most common format for casual and recreational play." },
    { value: "race_to_15", label: "Race to 15",   description: "Single game to 15, win by 2. A bit longer than Race to 11 — good for competitive social play." },
    { value: "race_to_21", label: "Race to 21",   description: "Single game to 21, win by 2. The longest single-game format — ideal for elimination brackets." },
  ],
};

export const SPORTS = [
  { id: "tennis" as SportType,     label: "Tennis",     emoji: "🎾", description: "Sets, games & tiebreaks" },
  { id: "badminton" as SportType,  label: "Badminton",  emoji: "🏸", description: "21-point rally scoring" },
  { id: "padel" as SportType,      label: "Padel",      emoji: "🎾", description: "Sets with golden point" },
  { id: "pickleball" as SportType, label: "Pickleball", emoji: "🟡", description: "11-point rally scoring" },
] as const;

export function getSport(id: SportType | string) {
  return SPORTS.find((s) => s.id === id) ?? SPORTS[0];
}

export function getMatchTypeLabel(sport: SportType, value: string): string {
  return MATCH_TYPES[sport]?.find((m) => m.value === value)?.label ?? value;
}
