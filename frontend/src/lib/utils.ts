import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function skillLevelLabel(level: string): string {
  const map: Record<string, string> = {
    beginner: "Beginner",
    intermediate: "Intermediate",
    advanced: "Advanced",
    pro: "Pro",
  };
  return map[level] ?? level;
}

export function formatTournamentFormat(format: string): string {
  const map: Record<string, string> = {
    americano: "Americano",
    mexicano: "Mexicano",
    round_robin: "Round Robin",
    single_elimination: "Single Elimination",
    double_elimination: "Double Elimination",
    mixed_doubles: "Mixed Doubles",
    team_cup: "Team Cup",
    ladder: "Ladder",
  };
  return map[format] ?? format;
}
