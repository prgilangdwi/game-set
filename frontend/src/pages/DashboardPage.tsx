import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/features/StatCard";
import { CourtCard } from "@/components/features/CourtCard";
import { StandingsTable } from "@/components/features/StandingsTable";
import { TournamentCard } from "@/components/features/TournamentCard";
import { Trophy, Users, Calendar, TrendingUp, Plus } from "lucide-react";
import { tournamentsApi, standingsApi, scheduleApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import type { Match } from "@/types";

export function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: tournaments = [] } = useQuery({
    queryKey: ["tournaments"],
    queryFn: tournamentsApi.list,
  });

  const activeTournaments = tournaments.filter((t) => t.status === "active");
  const firstActive = activeTournaments[0];

  const { data: liveMatches = [] } = useQuery({
    queryKey: ["matches", firstActive?.id, "live"],
    queryFn: () => scheduleApi.getMatches(firstActive!.id),
    enabled: !!firstActive,
    refetchInterval: 10_000,
  });

  const { data: standings = [] } = useQuery({
    queryKey: ["standings", firstActive?.id],
    queryFn: () => standingsApi.get(firstActive!.id),
    enabled: !!firstActive,
  });

  const liveCourts = liveMatches.filter((m: Match) => m.status === "live");
  const upcoming = liveMatches.filter((m: Match) => m.status === "scheduled").slice(0, 3);
  const totalPlayers = tournaments.reduce((s, t) => s + (t.player_count ?? 0), 0);
  const totalMatches = liveMatches.length;
  const completedMatches = liveMatches.filter((m: Match) => m.status === "completed").length;

  return (
    <div className="p-5 lg:p-8 space-y-8 bg-warm-gray/30 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold mb-1 text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            Welcome back, {user?.user_metadata?.name?.split(" ")[0] || "Organizer"}! Here's what's happening today.
          </p>
        </div>
        <Button
          className="bg-forest-green text-white hover:bg-forest-green-light w-full lg:w-auto font-medium"
          onClick={() => navigate("/tournaments/new")}
        >
          <Plus className="w-4 h-4" />
          Create Match Up
        </Button>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Match Ups" value={activeTournaments.length} icon={Trophy} trend={activeTournaments.length > 0 ? { value: `${activeTournaments.length} running`, positive: true } : undefined} />
        <StatCard title="Total Players" value={totalPlayers} icon={Users} />
        <StatCard title="Matches Today" value={totalMatches} icon={Calendar} subtitle={totalMatches > 0 ? `${completedMatches} completed, ${totalMatches - completedMatches} remaining` : "No active match up"} />
        <StatCard title="Live Courts" value={liveCourts.length} icon={TrendingUp} trend={liveCourts.length > 0 ? { value: "matches in progress", positive: true } : undefined} />
      </div>

      {/* Live courts */}
      {liveCourts.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl font-semibold text-foreground">Live Matches</h2>
            <div className="flex items-center gap-2">
              <Badge className="bg-lime-green text-forest-green animate-pulse font-medium">
                {liveCourts.length} Live
              </Badge>
              {firstActive && (
                <Button variant="ghost" size="sm" onClick={() => navigate(`/tournaments/${firstActive.id}/scoreboard`)}>
                  Full Scoreboard
                </Button>
              )}
            </div>
          </div>
          <div className="grid lg:grid-cols-3 gap-4">
            {liveCourts.map((match: Match) => (
              <CourtCard key={match.id} match={match} />
            ))}
          </div>
        </div>
      )}

      {/* Standings + upcoming */}
      {firstActive && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-2xl font-semibold text-foreground">Current Standings</h2>
              <Button variant="ghost" size="sm" onClick={() => navigate("/leaderboard")}>View All</Button>
            </div>
            <StandingsTable standings={standings} limit={5} />
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-5 text-foreground">Upcoming Matches</h2>
            <Card className="border border-border bg-white p-4 shadow-sm">
              {upcoming.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No upcoming matches</p>
              ) : (
                <div className="space-y-2.5">
                  {upcoming.map((match: Match) => (
                    <div key={match.id} className="p-3 rounded-lg bg-warm-gray border border-border/50 hover:border-forest-green/30 transition-all cursor-pointer">
                      <div className="flex items-center justify-between mb-1">
                        <Badge variant="outline" className="text-xs border-border text-muted-foreground">Court {match.court_number}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {match.team1_player1?.display_name} & {match.team1_player2?.display_name}
                        {" vs "}
                        {match.team2_player1?.display_name} & {match.team2_player2?.display_name}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* Recent tournaments */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-semibold text-foreground">Your Match Ups</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate("/tournaments")}>View All</Button>
        </div>
        {tournaments.length === 0 ? (
          <Card className="border border-border bg-white p-12 text-center">
            <Trophy className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No match ups yet</h3>
            <p className="text-muted-foreground text-sm mb-6">Create your first match up to get started</p>
            <Button className="bg-forest-green text-white hover:bg-forest-green-light" onClick={() => navigate("/tournaments/new")}>
              Create Match Up
            </Button>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tournaments.slice(0, 6).map((t) => <TournamentCard key={t.id} tournament={t} />)}
          </div>
        )}
      </div>
    </div>
  );
}
