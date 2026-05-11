import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, MapPin, Users, Calendar, ChevronRight, Globe, Lock } from "lucide-react";
import type { Tournament } from "@/types";
import { formatDate, formatTournamentFormat } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { getSport } from "@/lib/sports";

interface TournamentCardProps {
  tournament: Tournament;
}

const statusConfig = {
  draft: { color: "bg-muted text-muted-foreground", label: "Draft" },
  active: { color: "bg-lime-green text-forest-green", label: "Active" },
  completed: { color: "bg-muted text-muted-foreground", label: "Completed" },
  cancelled: { color: "bg-destructive/10 text-destructive", label: "Cancelled" },
};

export function TournamentCard({ tournament }: TournamentCardProps) {
  const navigate = useNavigate();
  const cfg = statusConfig[tournament.status];
  const sport = getSport(tournament.sport ?? "tennis");

  return (
    <Card
      className="border border-border bg-white hover:shadow-md transition-all cursor-pointer group"
      onClick={() => navigate(`/tournaments/${tournament.id}`)}
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="p-2 rounded-lg bg-soft-lime/20 shrink-0 text-xl leading-none flex items-center justify-center w-9 h-9">
              {sport.emoji}
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-foreground truncate group-hover:text-forest-green transition-colors">
                {tournament.name}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">{sport.label} · {formatTournamentFormat(tournament.format)}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Badge className={cn(cfg.color, "text-xs font-medium")}>{cfg.label}</Badge>
            {tournament.is_public ? <Globe className="w-3.5 h-3.5 text-muted-foreground" /> : <Lock className="w-3.5 h-3.5 text-muted-foreground" />}
          </div>
        </div>

        {tournament.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{tournament.description}</p>
        )}

        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
          {tournament.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {tournament.location}
            </span>
          )}
          {tournament.start_date && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" /> {formatDate(tournament.start_date)}
            </span>
          )}
          {tournament.player_count != null && (
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" /> {tournament.player_count} players
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}
