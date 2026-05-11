import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { tournamentsApi, playersApi } from "@/lib/api";
import { Search, Users } from "lucide-react";
import { skillLevelLabel } from "@/lib/utils";
import type { Player } from "@/types";

export function PlayersPage() {
  const { data: tournaments = [] } = useQuery({ queryKey: ["tournaments"], queryFn: tournamentsApi.list });
  const [selectedId, setSelectedId] = useState<string>("");
  const [search, setSearch] = useState("");

  const tournamentId = selectedId || tournaments[0]?.id || "";

  const { data: players = [], isLoading } = useQuery({
    queryKey: ["players", tournamentId],
    queryFn: () => playersApi.list(tournamentId),
    enabled: !!tournamentId,
  });

  const filtered = players.filter((p: Player) => {
    if (!search) return true;
    const name = (p.display_name || p.name || "").toLowerCase();
    return name.includes(search.toLowerCase());
  });

  const skillColors: Record<string, string> = {
    beginner: "bg-muted text-muted-foreground",
    intermediate: "bg-soft-lime/20 text-forest-green",
    advanced: "bg-lime-green/20 text-forest-green",
    pro: "bg-forest-green text-white",
  };

  return (
    <div className="p-5 lg:p-8 bg-warm-gray/30 min-h-screen">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Players</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage player profiles and statistics</p>
        </div>
        {tournaments.length > 0 && (
          <Select value={tournamentId} onValueChange={setSelectedId}>
            <SelectTrigger className="w-64"><SelectValue placeholder="Select tournament" /></SelectTrigger>
            <SelectContent>
              {tournaments.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search players..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-28 bg-white rounded-xl border animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24">
          <Users className="w-16 h-16 text-muted-foreground/20 mb-4" />
          <p className="text-muted-foreground text-sm">
            {search ? "No players match your search" : tournamentId ? "No players in this tournament yet" : "Select a tournament to see players"}
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((p: Player) => (
            <Card key={p.id} className="border border-border bg-white p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-soft-lime/20 flex items-center justify-center text-forest-green font-semibold shrink-0">
                  {(p.name || p.display_name || "?")[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-foreground truncate">
                    {p.display_name || p.name || "—"}
                  </div>
                  {p.email && <div className="text-xs text-muted-foreground truncate mt-0.5">{p.email}</div>}
                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    <Badge variant="outline" className="text-xs py-0">{p.gender === "male" ? "Male" : p.gender === "female" ? "Female" : "Other"}</Badge>
                    <Badge className={`text-xs py-0 ${skillColors[p.skill_level] || ""}`}>{skillLevelLabel(p.skill_level)}</Badge>
                    {p.is_checked_in && <Badge className="text-xs py-0 bg-lime-green text-forest-green">Checked In</Badge>}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
