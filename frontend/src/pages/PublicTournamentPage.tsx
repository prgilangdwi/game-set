import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StandingsTable } from "@/components/features/StandingsTable";
import { CourtCard } from "@/components/features/CourtCard";
import { Trophy, MapPin, Calendar, Users, ArrowRight } from "lucide-react";
import { publicApi } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { formatDate, formatTournamentFormat } from "@/lib/utils";
import type { Match } from "@/types";

export function PublicTournamentPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: tournament, isLoading } = useQuery({
    queryKey: ["tournament-public", slug],
    queryFn: () => publicApi.getTournament(slug!),
    enabled: !!slug,
  });

  const tournamentId = tournament?.id;

  const { data: matches = [] } = useQuery({
    queryKey: ["matches-public", tournamentId],
    queryFn: () => publicApi.getMatches(tournamentId!),
    enabled: !!tournamentId,
    refetchInterval: tournament?.status === "active" ? 15_000 : false,
  });

  const { data: standings = [] } = useQuery({
    queryKey: ["standings-public", tournamentId],
    queryFn: () => publicApi.getStandings(tournamentId!),
    enabled: !!tournamentId,
  });

  // Realtime updates for public page (uses UUID, not slug)
  useEffect(() => {
    if (!tournamentId) return;
    const channel = supabase
      .channel(`public-${tournamentId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "matches", filter: `tournament_id=eq.${tournamentId}` }, () => {
        qc.invalidateQueries({ queryKey: ["matches-public", tournamentId] });
        qc.invalidateQueries({ queryKey: ["standings-public", tournamentId] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [tournamentId, qc]);

  const liveMatches = matches.filter((m: Match) => m.status === "live");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-warm-gray/30 flex items-center justify-center">
        <div className="text-muted-foreground">Loading tournament…</div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen bg-warm-gray/30 flex flex-col items-center justify-center gap-4">
        <Trophy className="w-16 h-16 text-muted-foreground/20" />
        <h1 className="text-2xl font-semibold text-foreground">Tournament not found</h1>
        <Button onClick={() => navigate("/")} className="bg-forest-green text-white hover:bg-forest-green-light">
          Go to GameSet
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-border bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-forest-green" />
            <span className="text-base font-semibold text-foreground">GameSet</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate("/auth")}>
            Sign In
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Tournament header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h1 className="text-3xl font-semibold text-foreground">{tournament.name}</h1>
            {tournament.status === "active" && (
              <Badge className="bg-lime-green text-forest-green animate-pulse font-medium">Live</Badge>
            )}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mb-2">
            <span>{formatTournamentFormat(tournament.format)}</span>
            {tournament.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{tournament.location}</span>}
            {tournament.start_date && <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{formatDate(tournament.start_date)}</span>}
          </div>
          {tournament.description && <p className="text-muted-foreground mt-2">{tournament.description}</p>}
        </div>

        {/* Live banner */}
        {liveMatches.length > 0 && (
          <Card className="border-lime-green/50 bg-soft-lime/10 p-4 mb-6 flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-lime-green animate-pulse" />
            <span className="text-forest-green font-medium">{liveMatches.length} match{liveMatches.length !== 1 ? "es" : ""} in progress</span>
          </Card>
        )}

        <Tabs defaultValue="standings">
          <TabsList className="mb-6">
            <TabsTrigger value="standings">Standings</TabsTrigger>
            <TabsTrigger value="scoreboard">Live Scores</TabsTrigger>
          </TabsList>

          <TabsContent value="standings">
            <StandingsTable standings={standings} />
          </TabsContent>

          <TabsContent value="scoreboard">
            {liveMatches.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {liveMatches.map((m: Match) => <CourtCard key={m.id} match={m} />)}
              </div>
            ) : (
              <div className="text-center py-16 text-muted-foreground">No matches in progress right now</div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <footer className="border-t border-border py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          Powered by <a href="/" className="text-forest-green hover:underline font-medium">GameSet</a>
        </div>
      </footer>
    </div>
  );
}
