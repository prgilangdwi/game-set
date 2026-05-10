import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StandingsTable } from "@/components/features/StandingsTable";
import { tournamentsApi, standingsApi } from "@/lib/api";
import { BarChart3 } from "lucide-react";

export function LeaderboardPage() {
  const { data: tournaments = [] } = useQuery({ queryKey: ["tournaments"], queryFn: tournamentsApi.list });
  const [selectedId, setSelectedId] = useState<string>("");

  const activeTournament = tournaments.find((t) => t.status === "active") || tournaments[0];
  const tournamentId = selectedId || activeTournament?.id || "";

  const { data: standings = [], isLoading } = useQuery({
    queryKey: ["standings", tournamentId],
    queryFn: () => standingsApi.get(tournamentId),
    enabled: !!tournamentId,
  });

  return (
    <div className="p-5 lg:p-8 bg-warm-gray/30 min-h-screen">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Leaderboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Match Up rankings and player statistics</p>
        </div>
        {tournaments.length > 0 && (
          <Select value={tournamentId} onValueChange={setSelectedId}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select match up" />
            </SelectTrigger>
            <SelectContent>
              {tournaments.map((t) => (
                <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {isLoading ? (
        <div className="h-64 bg-white rounded-xl border animate-pulse" />
      ) : standings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24">
          <BarChart3 className="w-16 h-16 text-muted-foreground/20 mb-4" />
          <p className="text-muted-foreground text-sm">
            {tournamentId ? "No standings yet — play some matches first" : "Select a match up to view standings"}
          </p>
        </div>
      ) : (
        <StandingsTable standings={standings} />
      )}
    </div>
  );
}
