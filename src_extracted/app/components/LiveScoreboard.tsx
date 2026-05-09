import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Clock, Circle, Users } from "lucide-react";

export function LiveScoreboard() {
  const matches = [
    {
      court: 1,
      status: "live",
      team1: { player1: "Emma Watson", player2: "Lucas Chen", score: 6, serving: true },
      team2: { player1: "Sofia Rodriguez", player2: "James Park", score: 4, serving: false },
      time: "8:32"
    },
    {
      court: 2,
      status: "live",
      team1: { player1: "Oliver Smith", player2: "Mia Johnson", score: 5, serving: false },
      team2: { player1: "Noah Williams", player2: "Ava Brown", score: 5, serving: true },
      time: "12:15"
    },
    {
      court: 3,
      status: "break",
      team1: { player1: "Liam Davis", player2: "Isabella Garcia", score: 6, serving: false },
      team2: { player1: "Ethan Martinez", player2: "Charlotte Lee", score: 3, serving: false },
      time: "Break - 2:00"
    },
    {
      court: 4,
      status: "live",
      team1: { player1: "William Taylor", player2: "Amelia Harris", score: 4, serving: true },
      team2: { player1: "Benjamin King", player2: "Harper White", score: 6, serving: false },
      time: "6:48"
    },
  ];

  return (
    <div className="p-5 lg:p-8 space-y-6 bg-warm-gray/30 min-h-screen">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-semibold text-foreground">Live Scoreboard</h1>
          <Badge className="bg-tennis-ball-green text-forest-green animate-pulse font-medium">Live</Badge>
        </div>
        <p className="text-muted-foreground text-sm">Real-time match updates across all courts</p>
      </div>

      {/* Scoreboard Grid */}
      <div className="grid gap-4">
        {matches.map((match) => (
          <Card key={match.court} className="border border-border bg-white overflow-hidden shadow-sm">
            <div className={`h-1 ${match.status === "live" ? "bg-tennis-ball-green" : "bg-muted"}`} />

            <div className="p-6">
              {/* Court Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Circle className="w-3 h-3 text-forest-green fill-forest-green" />
                  <span className="font-medium text-foreground">Court {match.court}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span className="tabular-nums">{match.time}</span>
                </div>
              </div>

              {/* Score Display */}
              <div className="space-y-3">
                {/* Team 1 */}
                <div className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                  match.team1.serving
                    ? "bg-soft-lime/20 border-tennis-ball-green/40"
                    : "bg-warm-gray border-border/50"
                }`}>
                  <div className="flex items-center gap-3 flex-1">
                    <Users className="w-5 h-5 text-forest-green/70" />
                    <div>
                      <div className="font-medium text-foreground">{match.team1.player1}</div>
                      <div className="text-sm text-muted-foreground">{match.team1.player2}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {match.team1.serving && (
                      <div className="w-2 h-2 rounded-full bg-tennis-ball-green animate-pulse" />
                    )}
                    <div className="text-4xl font-semibold text-forest-green tabular-nums">
                      {match.team1.score}
                    </div>
                  </div>
                </div>

                {/* Team 2 */}
                <div className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                  match.team2.serving
                    ? "bg-soft-lime/20 border-tennis-ball-green/40"
                    : "bg-warm-gray border-border/50"
                }`}>
                  <div className="flex items-center gap-3 flex-1">
                    <Users className="w-5 h-5 text-muted-foreground/70" />
                    <div>
                      <div className="font-medium text-foreground">{match.team2.player1}</div>
                      <div className="text-sm text-muted-foreground">{match.team2.player2}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {match.team2.serving && (
                      <div className="w-2 h-2 rounded-full bg-tennis-ball-green animate-pulse" />
                    )}
                    <div className="text-4xl font-semibold text-foreground tabular-nums">
                      {match.team2.score}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
