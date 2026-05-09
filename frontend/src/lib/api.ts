import { supabase } from "./supabase";
import type {
  Tournament,
  Player,
  Round,
  Match,
  Standing,
  CreateTournamentPayload,
  AddPlayersPayload,
  UpdateScorePayload,
  UserProfile,
  ProfileUpdatePayload,
} from "@/types";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

async function authHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = await authHeaders();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...headers,
      ...(options.headers as Record<string, string>),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Request failed");
  }
  return res.json();
}

// Tournaments
export const tournamentsApi = {
  list: () => request<Tournament[]>("/tournaments"),
  get: (id: string) => request<Tournament>(`/tournaments/${id}`),
  create: (data: CreateTournamentPayload) =>
    request<Tournament>("/tournaments", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Partial<CreateTournamentPayload>) =>
    request<Tournament>(`/tournaments/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: string) =>
    request<void>(`/tournaments/${id}`, { method: "DELETE" }),
  start: (id: string) =>
    request<Tournament>(`/tournaments/${id}/start`, { method: "POST" }),
};

// Players
export const playersApi = {
  list: (tournamentId: string) =>
    request<Player[]>(`/tournaments/${tournamentId}/players`),
  add: (tournamentId: string, data: AddPlayersPayload) =>
    request<Player[]>(`/tournaments/${tournamentId}/players`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (tournamentId: string, playerId: string, data: Partial<Player>) =>
    request<Player>(`/tournaments/${tournamentId}/players/${playerId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  remove: (tournamentId: string, playerId: string) =>
    request<void>(`/tournaments/${tournamentId}/players/${playerId}`, { method: "DELETE" }),
  checkIn: (tournamentId: string, playerId: string) =>
    request<Player>(`/tournaments/${tournamentId}/players/${playerId}/checkin`, { method: "POST" }),
};

// Schedule
export const scheduleApi = {
  getRounds: (tournamentId: string) =>
    request<Round[]>(`/tournaments/${tournamentId}/rounds`),
  getMatches: (tournamentId: string, roundId?: string) =>
    roundId
      ? request<Match[]>(`/tournaments/${tournamentId}/rounds/${roundId}/matches`)
      : request<Match[]>(`/tournaments/${tournamentId}/matches`),
  generateRound: (tournamentId: string) =>
    request<Round>(`/tournaments/${tournamentId}/schedule/generate`, { method: "POST" }),
  updateScore: (tournamentId: string, data: UpdateScorePayload) =>
    request<Match>(`/tournaments/${tournamentId}/matches/${data.match_id}/score`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  startMatch: (tournamentId: string, matchId: string) =>
    request<Match>(`/tournaments/${tournamentId}/matches/${matchId}/start`, { method: "POST" }),
  completeMatch: (tournamentId: string, matchId: string) =>
    request<Match>(`/tournaments/${tournamentId}/matches/${matchId}/complete`, { method: "POST" }),
};

// Standings
export const standingsApi = {
  get: (tournamentId: string) =>
    request<Standing[]>(`/tournaments/${tournamentId}/standings`),
};

// Public (no auth required)
async function publicRequest<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Request failed");
  }
  return res.json();
}

// Profiles
export const profilesApi = {
  getMe: () => request<UserProfile>("/profiles/me"),
  updateMe: (data: ProfileUpdatePayload) =>
    request<UserProfile>("/profiles/me", { method: "PATCH", body: JSON.stringify(data) }),
  get: (userId: string) => request<UserProfile>(`/profiles/${userId}`),
  list: () => request<UserProfile[]>("/profiles"),
};

export const publicApi = {
  getTournament: (slugOrId: string) =>
    publicRequest<Tournament>(`/public/tournaments/${slugOrId}`),
  getMatches: (slugOrId: string) =>
    publicRequest<Match[]>(`/public/tournaments/${slugOrId}/matches`),
  getStandings: (slugOrId: string) =>
    publicRequest<Standing[]>(`/public/tournaments/${slugOrId}/standings`),
};
