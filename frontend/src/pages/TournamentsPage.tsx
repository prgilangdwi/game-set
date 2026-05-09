import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { TournamentCard } from "@/components/features/TournamentCard";
import { tournamentsApi } from "@/lib/api";
import { Plus, Search, Trophy } from "lucide-react";
import type { TournamentStatus } from "@/types";

const statusFilters: { label: string; value: TournamentStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Draft", value: "draft" },
  { label: "Completed", value: "completed" },
];

export function TournamentsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TournamentStatus | "all">("all");

  const { data: tournaments = [], isLoading } = useQuery({
    queryKey: ["tournaments"],
    queryFn: tournamentsApi.list,
  });

  const filtered = tournaments.filter((t) => {
    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    const matchesSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.location?.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="p-5 lg:p-8 bg-warm-gray/30 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Tournaments</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {tournaments.length} tournament{tournaments.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <Button
          className="bg-forest-green text-white hover:bg-forest-green-light w-full lg:w-auto font-medium"
          onClick={() => navigate("/tournaments/new")}
        >
          <Plus className="w-4 h-4" />
          New Tournament
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search tournaments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          {statusFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all border ${
                statusFilter === f.value
                  ? "bg-forest-green text-white border-forest-green"
                  : "bg-white text-muted-foreground border-border hover:border-forest-green/50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-white rounded-xl border border-border animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24">
          <Trophy className="w-16 h-16 text-muted-foreground/20 mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {search || statusFilter !== "all" ? "No tournaments found" : "No tournaments yet"}
          </h3>
          <p className="text-muted-foreground text-sm mb-6">
            {search || statusFilter !== "all" ? "Try adjusting your filters" : "Create your first tournament to get started"}
          </p>
          {!search && statusFilter === "all" && (
            <Button className="bg-forest-green text-white hover:bg-forest-green-light" onClick={() => navigate("/tournaments/new")}>
              Create Tournament
            </Button>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((t) => <TournamentCard key={t.id} tournament={t} />)}
        </div>
      )}
    </div>
  );
}
