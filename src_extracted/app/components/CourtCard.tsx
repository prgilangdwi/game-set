import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Circle, Users, Clock } from "lucide-react";

interface CourtCardProps {
  courtNumber: number;
  status: "live" | "scheduled" | "completed";
  team1: { player1: string; player2: string; score: number };
  team2: { player1: string; player2: string; score: number };
  timeRemaining?: string;
}

export function CourtCard({ courtNumber, status, team1, team2, timeRemaining }: CourtCardProps) {
  const statusConfig = {
    live: { color: "bg-tennis-ball-green text-forest-green", label: "Live", pulse: true },
    scheduled: { color: "bg-warm-gray text-muted-foreground", label: "Scheduled", pulse: false },
    completed: { color: "bg-muted text-muted-foreground", label: "Complete", pulse: false }
  };

  const config = statusConfig[status];

  return (
    <Card className="border border-border bg-white hover:shadow-md transition-shadow duration-200">
      <div className="p-5">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Circle className="w-3 h-3 text-forest-green fill-forest-green" />
            <span className="text-sm font-medium text-muted-foreground">Court {courtNumber}</span>
          </div>
          <Badge className={`${config.color} ${config.pulse ? 'animate-pulse' : ''} font-medium text-xs`}>
            {config.label}
          </Badge>
        </div>

        <div className="space-y-2.5">
          <div className="flex items-center justify-between p-3.5 rounded-lg bg-warm-gray border border-border/50">
            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4 text-forest-green/70" />
              <div>
                <div className="text-sm font-medium text-foreground">{team1.player1}</div>
                <div className="text-xs text-muted-foreground">{team1.player2}</div>
              </div>
            </div>
            <div className="text-2xl font-semibold text-forest-green tabular-nums">{team1.score}</div>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-lg bg-warm-gray border border-border/50">
            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4 text-muted-foreground/70" />
              <div>
                <div className="text-sm font-medium text-foreground">{team2.player1}</div>
                <div className="text-xs text-muted-foreground">{team2.player2}</div>
              </div>
            </div>
            <div className="text-2xl font-semibold text-foreground tabular-nums">{team2.score}</div>
          </div>
        </div>

        {timeRemaining && status === "live" && (
          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            <span>{timeRemaining} remaining</span>
          </div>
        )}
      </div>
    </Card>
  );
}
