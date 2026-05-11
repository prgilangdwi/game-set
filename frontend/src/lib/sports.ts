import type { SportType } from "@/types";

export interface MatchTypeOption {
  value: string;
  label: string;
}

export const MATCH_TYPES: Record<SportType, MatchTypeOption[]> = {
  tennis: [
    { value: "best_of_3", label: "Best of 3 Sets" },
    { value: "best_of_5", label: "Best of 5 Sets" },
    { value: "race_to_4", label: "Race to 4 Games" },
    { value: "race_to_5", label: "Race to 5 Games" },
    { value: "tiebreak",  label: "Tiebreak to 10" },
    { value: "super_tiebreak", label: "Super Tiebreak" },
  ],
  badminton: [
    { value: "best_of_3", label: "Best of 3" },
    { value: "best_of_5", label: "Best of 5" },
    { value: "single_21", label: "Single Game to 21" },
  ],
  padel: [
    { value: "best_of_3", label: "Best of 3 Sets" },
    { value: "best_of_5", label: "Best of 5 Sets" },
    { value: "golden_point", label: "Golden Point" },
  ],
  pickleball: [
    { value: "best_of_3",  label: "Best of 3" },
    { value: "race_to_11", label: "Race to 11" },
    { value: "race_to_15", label: "Race to 15" },
    { value: "race_to_21", label: "Race to 21" },
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
