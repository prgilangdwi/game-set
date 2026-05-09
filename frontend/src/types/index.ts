export type PreferredHand = "right" | "left" | "ambidextrous";
export type FavoriteSurface = "hard" | "clay" | "grass" | "indoor";

export interface UserProfile {
  id: string;
  name: string | null;
  avatar_url: string | null;
  bio: string | null;
  skill_level: SkillLevel | null;
  years_playing: number | null;
  location: string | null;
  preferred_hand: PreferredHand | null;
  favorite_surface: FavoriteSurface | null;
  role: string | null;
  created_at: string | null;
}

export interface ProfileUpdatePayload {
  name?: string;
  bio?: string;
  skill_level?: SkillLevel;
  years_playing?: number;
  location?: string;
  preferred_hand?: PreferredHand;
  favorite_surface?: FavoriteSurface;
  avatar_url?: string;
}

export type TournamentFormat =
  | "americano"
  | "mexicano"
  | "round_robin"
  | "single_elimination"
  | "double_elimination"
  | "mixed_doubles"
  | "team_cup"
  | "ladder";

export type TournamentStatus = "draft" | "active" | "completed" | "cancelled";
export type MatchStatus = "scheduled" | "live" | "completed" | "walkover";
export type PlayerGender = "male" | "female" | "other";
export type SkillLevel = "beginner" | "intermediate" | "advanced" | "pro";

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
}

export interface Tournament {
  id: string;
  organizer_id: string;
  name: string;
  description?: string;
  format: TournamentFormat;
  location?: string;
  start_date?: string;
  end_date?: string;
  courts: number;
  match_duration: number;
  break_duration: number;
  scoring_system: string;
  status: TournamentStatus;
  is_public: boolean;
  slug?: string;
  max_players?: number;
  created_at: string;
  player_count?: number;
}

export interface Player {
  id: string;
  tournament_id: string;
  user_id?: string;
  first_name: string;
  last_name: string;
  display_name: string;
  email?: string;
  gender: PlayerGender;
  skill_level: SkillLevel;
  rating: number;
  is_checked_in: boolean;
  created_at: string;
}

export interface Round {
  id: string;
  tournament_id: string;
  round_number: number;
  status: "pending" | "active" | "completed";
  created_at: string;
}

export interface Match {
  id: string;
  round_id: string;
  tournament_id: string;
  court_number: number;
  team1_player1_id: string;
  team1_player2_id: string;
  team2_player1_id: string;
  team2_player2_id: string;
  team1_score: number;
  team2_score: number;
  status: MatchStatus;
  started_at?: string;
  completed_at?: string;
  team1_player1?: Player;
  team1_player2?: Player;
  team2_player1?: Player;
  team2_player2?: Player;
}

export interface Standing {
  id: string;
  tournament_id: string;
  player_id: string;
  player?: Player;
  matches_played: number;
  wins: number;
  losses: number;
  points: number;
  points_for: number;
  points_against: number;
  differential: number;
  rank: number;
  prev_rank?: number;
}

export interface TournamentWithDetails extends Tournament {
  players: Player[];
  rounds: Round[];
  standings: Standing[];
}

export interface MatchWithPlayers extends Match {
  team1_player1: Player;
  team1_player2: Player;
  team2_player1: Player;
  team2_player2: Player;
}

export interface CreateTournamentPayload {
  name: string;
  description?: string;
  format: TournamentFormat;
  location?: string;
  start_date?: string;
  end_date?: string;
  courts: number;
  match_duration: number;
  break_duration: number;
  scoring_system: string;
  is_public: boolean;
  max_players?: number;
}

export interface AddPlayersPayload {
  players: {
    first_name: string;
    last_name: string;
    email?: string;
    gender: PlayerGender;
    skill_level: SkillLevel;
  }[];
}

export interface UpdateScorePayload {
  match_id: string;
  team1_score: number;
  team2_score: number;
  status?: MatchStatus;
}
