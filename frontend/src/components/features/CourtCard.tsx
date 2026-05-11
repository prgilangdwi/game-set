import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Circle, Users, Play, CheckCircle, Save } from "lucide-react";
import type { Match, Player } from "@/types";
import { cn } from "@/lib/utils";

interface CourtCardProps {
  match: Match;
  onStartMatch?: (matchId: string) => void;
  onUpdateScore?: (matchId: string, t1: number, t2: number) => void;
  onCompleteMatch?: (matchId: string) => void;
  editable?: boolean;
}

const statusConfig = {
  live: { color: "bg-lime-green text-forest-green", label: "Live", bar: "bg-lime-green" },
  scheduled: { color: "bg-warm-gray text-muted-foreground border border-border", label: "Upcoming", bar: "bg-muted" },
  completed: { color: "bg-muted text-muted-foreground", label: "Done", bar: "bg-muted" },
  walkover: { color: "bg-muted text-muted-foreground", label: "W/O", bar: "bg-muted" },
};

function playerName(p?: Player) {
  if (!p) return "TBD";
  return p.display_name || p.name || "—";
}

export function CourtCard({ match, onStartMatch, onUpdateScore, onCompleteMatch, editable }: CourtCardProps) {
  const cfg = statusConfig[match.status] ?? statusConfig.scheduled;
  const isLive = match.status === "live";

  const [t1, setT1] = useState(match.team1_score);
  const [t2, setT2] = useState(match.team2_score);

  // Sync from server (e.g. realtime updates)
  useEffect(() => {
    setT1(match.team1_score);
    setT2(match.team2_score);
  }, [match.team1_score, match.team2_score]);

  const hasUnsaved = editable && isLive && onUpdateScore && (t1 !== match.team1_score || t2 !== match.team2_score);

  return (
    <Card className="border border-border bg-white overflow-hidden hover:shadow-md transition-shadow">
      <div className={cn("h-1", cfg.bar)} />
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Circle className="w-3 h-3 text-forest-green fill-forest-green" />
            <span className="text-sm font-medium text-muted-foreground">Court {match.court_number}</span>
          </div>
          <Badge className={cn(cfg.color, isLive ? "animate-pulse" : "", "font-medium text-xs")}>
            {cfg.label}
          </Badge>
        </div>

        {/* Team 1 */}
        <div className={cn(
          "flex items-center justify-between p-3.5 rounded-lg border mb-2",
          isLive ? "bg-soft-lime/20 border-lime-green/40" : "bg-warm-gray border-border/50"
        )}>
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <Users className="w-4 h-4 text-forest-green/70 shrink-0" />
            <div className="min-w-0">
              <div className="text-sm font-medium text-foreground truncate">{playerName(match.team1_player1)}</div>
              <div className="text-xs text-muted-foreground truncate">{playerName(match.team1_player2)}</div>
            </div>
          </div>
          {editable && isLive && onUpdateScore ? (
            <Input
              type="number"
              min={0}
              max={99}
              value={t1}
              onChange={(e) => setT1(Number(e.target.value))}
              className="w-16 text-center text-lg font-bold text-forest-green border-forest-green/30 ml-2"
            />
          ) : (
            <div className="text-2xl font-semibold text-forest-green tabular-nums ml-3">{t1}</div>
          )}
        </div>

        {/* Team 2 */}
        <div className="flex items-center justify-between p-3.5 rounded-lg border bg-warm-gray border-border/50">
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <Users className="w-4 h-4 text-muted-foreground/70 shrink-0" />
            <div className="min-w-0">
              <div className="text-sm font-medium text-foreground truncate">{playerName(match.team2_player1)}</div>
              <div className="text-xs text-muted-foreground truncate">{playerName(match.team2_player2)}</div>
            </div>
          </div>
          {editable && isLive && onUpdateScore ? (
            <Input
              type="number"
              min={0}
              max={99}
              value={t2}
              onChange={(e) => setT2(Number(e.target.value))}
              className="w-16 text-center text-lg font-bold border-border/50 ml-2"
            />
          ) : (
            <div className="text-2xl font-semibold text-foreground tabular-nums ml-3">{t2}</div>
          )}
        </div>

        {/* Actions */}
        {editable && (
          <div className="mt-4 flex gap-2">
            {match.status === "scheduled" && onStartMatch && (
              <Button size="sm" className="flex-1 bg-forest-green text-white hover:bg-forest-green-light" onClick={() => onStartMatch(match.id)}>
                <Play className="w-3.5 h-3.5" />
                Start
              </Button>
            )}
            {isLive && onUpdateScore && (
              <Button
                size="sm"
                variant={hasUnsaved ? "default" : "outline"}
                className={cn("flex-1", hasUnsaved && "bg-forest-green text-white hover:bg-forest-green-light")}
                onClick={() => onUpdateScore(match.id, t1, t2)}
              >
                <Save className="w-3.5 h-3.5" />
                Save
              </Button>
            )}
            {isLive && onCompleteMatch && (
              <Button size="sm" variant="outline" className="flex-1" onClick={() => onCompleteMatch(match.id)}>
                <CheckCircle className="w-3.5 h-3.5" />
                Finish
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
