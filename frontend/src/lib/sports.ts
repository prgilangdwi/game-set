import type { SportType } from "@/types";

export const SPORTS = [
  { id: "tennis" as SportType,     label: "Tennis",     emoji: "🎾", description: "Sets, games & tiebreaks" },
  { id: "badminton" as SportType,  label: "Badminton",  emoji: "🏸", description: "21-point rally scoring" },
  { id: "padel" as SportType,      label: "Padel",      emoji: "🎾", description: "Sets with golden point" },
  { id: "pickleball" as SportType, label: "Pickleball", emoji: "🟡", description: "11-point rally scoring" },
] as const;

export function getSport(id: SportType | string) {
  return SPORTS.find((s) => s.id === id) ?? SPORTS[0];
}
