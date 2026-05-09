import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface Standing {
  rank: number;
  player: string;
  played: number;
  wins: number;
  losses: number;
  points: number;
  trend: "up" | "down" | "same";
}

interface StandingsTableProps {
  standings: Standing[];
}

export function StandingsTable({ standings }: StandingsTableProps) {
  return (
    <div className="rounded-lg border border-border bg-white overflow-hidden shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-warm-gray border-b border-border hover:bg-warm-gray">
            <TableHead className="w-20 font-semibold text-foreground">Rank</TableHead>
            <TableHead className="font-semibold text-foreground">Player</TableHead>
            <TableHead className="text-center font-semibold text-foreground">P</TableHead>
            <TableHead className="text-center font-semibold text-foreground">W</TableHead>
            <TableHead className="text-center font-semibold text-foreground">L</TableHead>
            <TableHead className="text-right font-semibold text-foreground">Points</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {standings.map((standing) => (
            <TableRow key={standing.rank} className="border-b border-border/50 hover:bg-warm-gray/50 transition-colors">
              <TableCell>
                <Badge variant={standing.rank <= 3 ? "default" : "outline"}
                       className={standing.rank <= 3 ? "bg-forest-green text-white font-medium" : "border-border text-muted-foreground"}>
                  {standing.rank}
                </Badge>
              </TableCell>
              <TableCell className="font-medium text-foreground">{standing.player}</TableCell>
              <TableCell className="text-center text-muted-foreground tabular-nums">{standing.played}</TableCell>
              <TableCell className="text-center text-forest-green font-medium tabular-nums">{standing.wins}</TableCell>
              <TableCell className="text-center text-clay-orange font-medium tabular-nums">{standing.losses}</TableCell>
              <TableCell className="text-right font-semibold text-foreground tabular-nums">{standing.points}</TableCell>
              <TableCell>
                {standing.trend === "up" && <TrendingUp className="w-4 h-4 text-tennis-ball-green" />}
                {standing.trend === "down" && <TrendingDown className="w-4 h-4 text-clay-orange" />}
                {standing.trend === "same" && <Minus className="w-4 h-4 text-muted-foreground/40" />}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
