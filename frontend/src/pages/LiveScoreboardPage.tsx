import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Clock, Circle, Users, Save } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { scheduleApi } from "@/lib/api";
import type { Match } from "@/types";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

function playerName(p?: { display_name?: string; first_name?: string; last_name?: string }) {
  if (!p) return "TBD";
  return p.display_name || `${p.first_name || ""} ${p.last_name || ""}`.trim();
}

function ScoreCard({ match, onSave }: { match: Match; onSave: (matchId: string, t1: number, t2: number) => void }) {
  const [t1, setT1] = useState(match.team1_score);
  const [t2, setT2] = useState(match.team2_score);
  const isLive = match.status === "live";
  const isDone = match.status === "completed";

  useEffect(() => {
    setT1(match.team1_score);
    setT2(match.team2_score);
  }, [match.team1_score, match.team2_score]);

  return (
    <Card className={cn("border overflow-hidden", isLive ? "border-tennis-ball-green/50" : "border-border bg-white")}>
      <div className={cn("h-1", isLive ? "bg-tennis-ball-green" : "bg-muted")} />
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Circle className="w-3 h-3 text-forest-green fill-forest-green" />
            <span className="text-sm font-medium text-muted-foreground">Court {match.court_number}</span>
          </div>
          <Badge className={cn(
            isLive ? "bg-tennis-ball-green text-forest-green animate-pulse" : "bg-muted text-muted-foreground",
            "font-medium text-xs"
          )}>
            {isLive ? "LIVE" : isDone ? "Done" : "Scheduled"}
          </Badge>
        </div>

        {/* Team 1 */}
        <div className={cn("flex items-center justify-between p-3.5 rounded-lg border mb-2", isLive ? "bg-soft-lime/20 border-tennis-ball-green/30" : "bg-warm-gray border-border/50")}>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Users className="w-4 h-4 text-forest-green/70 shrink-0" />
            <div className="min-w-0">
              <div className="text-sm font-medium text-foreground truncate">{playerName(match.team1_player1)}</div>
              <div className="text-xs text-muted-foreground truncate">{playerName(match.team1_player2)}</div>
            </div>
          </div>
          {isLive ? (
            <Input
              type="number"
              min={0}
              max={99}
              value={t1}
              onChange={(e) => setT1(Number(e.target.value))}
              className="w-16 text-center text-xl font-bold text-forest-green border-forest-green/30 ml-2"
            />
          ) : (
            <div className="text-2xl font-semibold text-forest-green tabular-nums ml-3">{t1}</div>
          )}
        </div>

        {/* Team 2 */}
        <div className="flex items-center justify-between p-3.5 rounded-lg border bg-warm-gray border-border/50">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Users className="w-4 h-4 text-muted-foreground/70 shrink-0" />
            <div className="min-w-0">
              <div className="text-sm font-medium text-foreground truncate">{playerName(match.team2_player1)}</div>
              <div className="text-xs text-muted-foreground truncate">{playerName(match.team2_player2)}</div>
            </div>
          </div>
          {isLive ? (
            <Input
              type="number"
              min={0}
              max={99}
              value={t2}
              onChange={(e) => setT2(Number(e.target.value))}
              className="w-16 text-center text-xl font-bold border-border/50 ml-2"
            />
          ) : (
            <div className="text-2xl font-semibold text-foreground tabular-nums ml-3">{t2}</div>
          )}
        </div>

        {isLive && (
          <Button
            className="mt-3 w-full bg-forest-green text-white hover:bg-forest-green-light"
            size="sm"
            onClick={() => onSave(match.id, t1, t2)}
          >
            <Save className="w-3.5 h-3.5 mr-1.5" />
            Save Score
          </Button>
        )}
      </div>
    </Card>
  );
}

export function LiveScoreboardPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: matches = [] } = useQuery({
    queryKey: ["matches", id],
    queryFn: () => scheduleApi.getMatches(id!),
    enabled: !!id,
  });

  // Supabase Realtime subscription for live score updates
  useEffect(() => {
    if (!id) return;
    const channel = supabase
      .channel(`matches-${id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "matches", filter: `tournament_id=eq.${id}` }, () => {
        qc.invalidateQueries({ queryKey: ["matches", id] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [id, qc]);

  const scoreMutation = useMutation({
    mutationFn: ({ matchId, t1, t2 }: { matchId: string; t1: number; t2: number }) =>
      scheduleApi.updateScore(id!, { match_id: matchId, team1_score: t1, team2_score: t2 }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["matches", id] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const liveMatches = matches.filter((m: Match) => m.status === "live");
  const otherMatches = matches.filter((m: Match) => m.status !== "live");

  return (
    <div className="p-5 lg:p-8 bg-warm-gray/30 min-h-screen">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="-ml-2 mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-semibold text-foreground">Live Scoreboard</h1>
          {liveMatches.length > 0 && (
            <Badge className="bg-tennis-ball-green text-forest-green animate-pulse font-medium">
              {liveMatches.length} Live
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground text-sm mt-1">Real-time match updates · Auto-refreshes</p>
      </div>

      {liveMatches.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">Active Courts</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {liveMatches.map((m: Match) => (
              <ScoreCard
                key={m.id}
                match={m}
                onSave={(matchId, t1, t2) => scoreMutation.mutate({ matchId, t1, t2 })}
              />
            ))}
          </div>
        </div>
      )}

      {otherMatches.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Other Matches</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {otherMatches.map((m: Match) => (
              <ScoreCard
                key={m.id}
                match={m}
                onSave={(matchId, t1, t2) => scoreMutation.mutate({ matchId, t1, t2 })}
              />
            ))}
          </div>
        </div>
      )}

      {matches.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24">
          <Clock className="w-16 h-16 text-muted-foreground/20 mb-4" />
          <p className="text-muted-foreground">No matches in progress</p>
        </div>
      )}
    </div>
  );
}
