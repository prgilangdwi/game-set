import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { CourtCard } from "@/components/features/CourtCard";
import { ArrowLeft, Zap } from "lucide-react";
import { scheduleApi } from "@/lib/api";
import { toast } from "sonner";
import type { Match, Round } from "@/types";


export function SchedulePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: rounds = [] } = useQuery({
    queryKey: ["rounds", id],
    queryFn: () => scheduleApi.getRounds(id!),
    enabled: !!id,
  });

  const { data: matches = [] } = useQuery({
    queryKey: ["matches", id],
    queryFn: () => scheduleApi.getMatches(id!),
    enabled: !!id,
  });

  const generateMutation = useMutation({
    mutationFn: () => scheduleApi.generateRound(id!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["matches", id] });
      qc.invalidateQueries({ queryKey: ["rounds", id] });
      toast.success("New round generated!");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const startMatchMutation = useMutation({
    mutationFn: (matchId: string) => scheduleApi.startMatch(id!, matchId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["matches", id] }),
  });

  const completeMatchMutation = useMutation({
    mutationFn: (matchId: string) => scheduleApi.completeMatch(id!, matchId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["matches", id] });
      qc.invalidateQueries({ queryKey: ["standings", id] });
    },
  });

  const scoreMatchMutation = useMutation({
    mutationFn: ({ matchId, t1, t2 }: { matchId: string; t1: number; t2: number }) =>
      scheduleApi.updateScore(id!, { match_id: matchId, team1_score: t1, team2_score: t2 }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["matches", id] }),
    onError: (e: Error) => toast.error(e.message),
  });

  // Group matches by round
  const matchesByRound = rounds.map((r: Round) => ({
    round: r,
    matches: matches.filter((m: Match) => m.round_id === r.id),
  }));

  return (
    <div className="p-5 lg:p-8 bg-warm-gray/30 min-h-screen">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <Button variant="ghost" onClick={() => navigate(`/tournaments/${id}`)} className="-ml-2 mb-2">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Tournament
          </Button>
          <h1 className="text-3xl font-semibold text-foreground">Schedule</h1>
          <p className="text-muted-foreground text-sm mt-1">{rounds.length} rounds · {matches.length} matches</p>
        </div>
        <Button className="bg-forest-green text-white hover:bg-forest-green-light w-full lg:w-auto" onClick={() => generateMutation.mutate()} disabled={generateMutation.isPending}>
          <Zap className="w-4 h-4" />
          {generateMutation.isPending ? "Generating…" : "Generate Next Round"}
        </Button>
      </div>

      {matchesByRound.length === 0 ? (
        <div className="text-center py-24 text-muted-foreground">
          No rounds generated yet
        </div>
      ) : (
        <div className="space-y-8">
          {matchesByRound.map(({ round, matches: roundMatches }) => (
            <div key={round.id}>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-xl font-semibold text-foreground">Round {round.round_number}</h2>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  round.status === "active" ? "bg-tennis-ball-green text-forest-green" :
                  round.status === "completed" ? "bg-muted text-muted-foreground" :
                  "bg-warm-gray text-muted-foreground border border-border"
                }`}>{round.status}</span>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {roundMatches.map((m: Match) => (
                  <CourtCard key={m.id} match={m} editable
                    onStartMatch={(matchId) => startMatchMutation.mutate(matchId)}
                    onUpdateScore={(matchId, t1, t2) => scoreMatchMutation.mutate({ matchId, t1, t2 })}
                    onCompleteMatch={(matchId) => completeMatchMutation.mutate(matchId)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
