import { StatCard } from "./StatCard";
import { CourtCard } from "./CourtCard";
import { StandingsTable } from "./StandingsTable";
import { Trophy, Users, Calendar, TrendingUp } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";

interface DashboardProps {
  onNavigate: (page: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const liveMatches = [
    {
      courtNumber: 1,
      status: "live" as const,
      team1: { player1: "Emma Watson", player2: "Lucas Chen", score: 6 },
      team2: { player1: "Sofia Rodriguez", player2: "James Park", score: 4 },
      timeRemaining: "8:32"
    },
    {
      courtNumber: 2,
      status: "live" as const,
      team1: { player1: "Oliver Smith", player2: "Mia Johnson", score: 5 },
      team2: { player1: "Noah Williams", player2: "Ava Brown", score: 5 },
      timeRemaining: "12:15"
    },
    {
      courtNumber: 3,
      status: "scheduled" as const,
      team1: { player1: "Liam Davis", player2: "Isabella Garcia", score: 0 },
      team2: { player1: "Ethan Martinez", player2: "Charlotte Lee", score: 0 },
    }
  ];

  const standings = [
    { rank: 1, player: "Emma Watson", played: 12, wins: 10, losses: 2, points: 124, trend: "up" as const },
    { rank: 2, player: "Lucas Chen", played: 12, wins: 9, losses: 3, points: 118, trend: "same" as const },
    { rank: 3, player: "Sofia Rodriguez", played: 11, wins: 8, losses: 3, points: 112, trend: "up" as const },
    { rank: 4, player: "James Park", played: 12, wins: 7, losses: 5, points: 98, trend: "down" as const },
    { rank: 5, player: "Oliver Smith", played: 11, wins: 7, losses: 4, points: 95, trend: "up" as const },
  ];

  const upcomingMatches = [
    { time: "14:30", court: 4, teams: "Liam D. & Isabella G. vs Ethan M. & Charlotte L." },
    { time: "15:00", court: 5, teams: "William T. & Amelia H. vs Benjamin K. & Harper W." },
    { time: "15:30", court: 6, teams: "Alexander M. & Evelyn A. vs Daniel R. & Abigail N." },
  ];

  return (
    <div className="p-5 lg:p-8 space-y-8 bg-warm-gray/30 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold mb-1 text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-sm">Welcome back! Here's what's happening today.</p>
        </div>
        <Button className="bg-forest-green text-white hover:bg-forest-green-light w-full lg:w-auto font-medium" onClick={() => onNavigate("create-tournament")}>
          Create Tournament
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Tournaments"
          value="3"
          icon={Trophy}
          trend={{ value: "+2 this week", positive: true }}
        />
        <StatCard
          title="Total Players"
          value="156"
          icon={Users}
          trend={{ value: "+12 this month", positive: true }}
        />
        <StatCard
          title="Matches Today"
          value="24"
          icon={Calendar}
          subtitle="8 completed, 16 remaining"
        />
        <StatCard
          title="Avg. Participation"
          value="89%"
          icon={TrendingUp}
          trend={{ value: "+5.2%", positive: true }}
        />
      </div>

      {/* Live Matches */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-semibold text-foreground">Live Matches</h2>
          <Badge className="bg-tennis-ball-green text-forest-green animate-pulse font-medium">
            {liveMatches.filter(m => m.status === "live").length} Live
          </Badge>
        </div>
        <div className="grid lg:grid-cols-3 gap-4">
          {liveMatches.map((match, index) => (
            <CourtCard key={index} {...match} />
          ))}
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Standings */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl font-semibold text-foreground">Current Standings</h2>
            <Button variant="ghost" size="sm" onClick={() => onNavigate("leaderboard")} className="font-medium">
              View All
            </Button>
          </div>
          <StandingsTable standings={standings} />
        </div>

        {/* Upcoming Matches */}
        <div>
          <h2 className="text-2xl font-semibold mb-5 text-foreground">Upcoming Matches</h2>
          <Card className="border border-border bg-white p-4 shadow-sm">
            <div className="space-y-2.5">
              {upcomingMatches.map((match, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg bg-warm-gray border border-border/50 hover:border-forest-green/30 hover:shadow-sm transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="outline" className="text-xs border-border text-muted-foreground">Court {match.court}</Badge>
                    <span className="text-sm font-medium text-forest-green">{match.time}</span>
                  </div>
                  <p className="text-sm text-foreground">{match.teams}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
