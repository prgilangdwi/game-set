import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { Standing } from "@/types";

interface StandingsTableProps {
  standings: Standing[];
  limit?: number;
}

function playerName(s: Standing) {
  if (s.player) return s.player.display_name || `${s.player.first_name} ${s.player.last_name}`;
  return `Player #${s.player_id.slice(0, 6)}`;
}

export function StandingsTable({ standings, limit }: StandingsTableProps) {
  const rows = limit ? standings.slice(0, limit) : standings;

  if (!rows.length) {
    return (
      <div className="rounded-lg border border-border bg-white p-8 text-center">
        <p className="text-muted-foreground text-sm">No standings available yet</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-white overflow-hidden shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-warm-gray border-b border-border hover:bg-warm-gray">
            <TableHead className="w-16 font-semibold text-foreground">Rank</TableHead>
            <TableHead className="font-semibold text-foreground">Player</TableHead>
            <TableHead className="text-center font-semibold text-foreground">P</TableHead>
            <TableHead className="text-center font-semibold text-foreground">W</TableHead>
            <TableHead className="text-center font-semibold text-foreground">L</TableHead>
            <TableHead className="text-right font-semibold text-foreground">Pts</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((s) => {
            const trend = s.prev_rank == null ? "same" : s.rank < s.prev_rank ? "up" : s.rank > s.prev_rank ? "down" : "same";
            return (
              <TableRow key={s.id} className="border-b border-border/50 hover:bg-warm-gray/50 transition-colors">
                <TableCell>
                  <Badge
                    className={s.rank <= 3 ? "bg-forest-green text-white font-medium" : "border-border text-muted-foreground"}
                    variant={s.rank <= 3 ? "default" : "outline"}
                  >
                    {s.rank}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium text-foreground">{playerName(s)}</TableCell>
                <TableCell className="text-center text-muted-foreground tabular-nums">{s.matches_played}</TableCell>
                <TableCell className="text-center text-forest-green font-medium tabular-nums">{s.wins}</TableCell>
                <TableCell className="text-center text-clay-orange font-medium tabular-nums">{s.losses}</TableCell>
                <TableCell className="text-right font-semibold text-foreground tabular-nums">{s.points}</TableCell>
                <TableCell>
                  {trend === "up" && <TrendingUp className="w-4 h-4 text-tennis-ball-green" />}
                  {trend === "down" && <TrendingDown className="w-4 h-4 text-clay-orange" />}
                  {trend === "same" && <Minus className="w-4 h-4 text-muted-foreground/40" />}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
