import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StandingsTable } from "@/components/features/StandingsTable";
import { CourtCard } from "@/components/features/CourtCard";
import {
  ArrowLeft, Trophy, MapPin, Calendar, Users, Play, Share2,
  Zap, BarChart3, Clock, Plus, Trash2, Pencil, Check, X, ArrowLeftRight,
} from "lucide-react";
import { tournamentsApi, playersApi, scheduleApi, standingsApi } from "@/lib/api";
import { formatDate, formatTournamentFormat, skillLevelLabel } from "@/lib/utils";
import { toast } from "sonner";
import type { Match, Player, SkillLevel, SportType } from "@/types";
import { getSport } from "@/lib/sports";

interface PlayerInput {
  name: string;
  skill_level: SkillLevel;
}
const emptyPlayer = (): PlayerInput => ({ name: "", skill_level: "intermediate" });

const SKILL_LEVELS: { value: SkillLevel; label: string }[] = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Mid" },
  { value: "advanced", label: "Advanced" },
  { value: "pro", label: "Pro" },
];

export function TournamentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [showAddPlayers, setShowAddPlayers] = useState(false);
  const [newPlayers, setNewPlayers] = useState<PlayerInput[]>([emptyPlayer()]);

  // Player editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editSkill, setEditSkill] = useState<SkillLevel>("intermediate");

  // Swap dialog state
  const [showSwap, setShowSwap] = useState(false);
  const [swapA, setSwapA] = useState("");
  const [swapB, setSwapB] = useState("");

  const { data: tournament, isLoading } = useQuery({
    queryKey: ["tournament", id],
    queryFn: () => tournamentsApi.get(id!),
    enabled: !!id,
  });

  const { data: players = [] } = useQuery({
    queryKey: ["players", id],
    queryFn: () => playersApi.list(id!),
    enabled: !!id,
  });

  const { data: matches = [] } = useQuery({
    queryKey: ["matches", id],
    queryFn: () => scheduleApi.getMatches(id!),
    enabled: !!id,
    refetchInterval: tournament?.status === "active" ? 15_000 : false,
  });

  const { data: standings = [] } = useQuery({
    queryKey: ["standings", id],
    queryFn: () => standingsApi.get(id!),
    enabled: !!id,
  });

  const generateMutation = useMutation({
    mutationFn: () => scheduleApi.generateRound(id!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["matches", id] });
      toast.success("New round generated!");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const startMutation = useMutation({
    mutationFn: () => tournamentsApi.start(id!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tournament", id] });
      toast.success("Match Up started!");
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

  const addPlayersMutation = useMutation({
    mutationFn: (playerList: PlayerInput[]) =>
      playersApi.add(id!, { players: playerList.filter((p) => p.name.trim()).map((p) => ({ name: p.name.trim(), skill_level: p.skill_level, gender: "other" as const })) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["players", id] });
      toast.success("Players added!");
      setShowAddPlayers(false);
      setNewPlayers([emptyPlayer()]);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updatePlayerMutation = useMutation({
    mutationFn: ({ playerId, name, skill_level }: { playerId: string; name: string; skill_level: SkillLevel }) =>
      playersApi.update(id!, playerId, { name, skill_level }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["players", id] });
      toast.success("Player updated!");
      setEditingId(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const removePlayerMutation = useMutation({
    mutationFn: (playerId: string) => playersApi.remove(id!, playerId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["players", id] });
      toast.success("Player removed");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const swapPlayersMutation = useMutation({
    mutationFn: async () => {
      const a = players.find((p) => p.id === swapA);
      const b = players.find((p) => p.id === swapB);
      if (!a || !b) throw new Error("Select two different players");
      await playersApi.update(id!, a.id, { name: b.name, skill_level: b.skill_level });
      await playersApi.update(id!, b.id, { name: a.name, skill_level: a.skill_level });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["players", id] });
      toast.success("Players swapped!");
      setShowSwap(false);
      setSwapA("");
      setSwapB("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function startEdit(p: Player) {
    setEditingId(p.id);
    setEditName(p.name || p.display_name || "");
    setEditSkill(p.skill_level as SkillLevel);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  function copyShareLink() {
    const url = `${window.location.origin}/t/${tournament?.slug || id}`;
    navigator.clipboard.writeText(url);
    toast.success("Share link copied!");
  }

  if (isLoading) {
    return (
      <div className="p-8 bg-warm-gray/30 min-h-screen">
        <div className="h-8 bg-muted rounded w-48 animate-pulse mb-4" />
        <div className="h-4 bg-muted rounded w-32 animate-pulse" />
      </div>
    );
  }
  if (!tournament) return <div className="p-8">Match Up not found</div>;

  const liveMatches = matches.filter((m: Match) => m.status === "live");
  const scheduledMatches = matches.filter((m: Match) => m.status === "scheduled");
  const completedMatches = matches.filter((m: Match) => m.status === "completed");

  const statusColors = {
    draft: "bg-muted text-muted-foreground",
    active: "bg-lime-green text-forest-green animate-pulse",
    completed: "bg-muted text-muted-foreground",
    cancelled: "bg-destructive/10 text-destructive",
  };

  return (
    <div className="p-5 lg:p-8 bg-warm-gray/30 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate("/tournaments")} className="-ml-2 mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          All Match Ups
        </Button>
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <span className="text-2xl">{getSport((tournament.sport ?? "tennis") as SportType).emoji}</span>
              <h1 className="text-3xl font-semibold text-foreground">{tournament.name}</h1>
              <Badge className={statusColors[tournament.status]}>{tournament.status}</Badge>
              <Badge variant="outline" className="text-xs">{formatTournamentFormat(tournament.format)}</Badge>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
              {tournament.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{tournament.location}</span>}
              {tournament.start_date && <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{formatDate(tournament.start_date)}</span>}
              <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{players.length} players</span>
              <span className="flex items-center gap-1"><Trophy className="w-3.5 h-3.5" />{tournament.courts} courts</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {tournament.is_public && (
              <Button variant="outline" size="sm" onClick={copyShareLink}>
                <Share2 className="w-4 h-4" />
                Share
              </Button>
            )}
            {tournament.status === "active" && (
              <Button variant="outline" size="sm" onClick={() => navigate(`/tournaments/${id}/scoreboard`)}>
                <BarChart3 className="w-4 h-4" />
                Scoreboard
              </Button>
            )}
            {tournament.status === "draft" && (
              <Button className="bg-forest-green text-white hover:bg-forest-green-light" size="sm" onClick={() => startMutation.mutate()} disabled={startMutation.isPending || players.length < 4}>
                <Play className="w-4 h-4" />
                {startMutation.isPending ? "Starting…" : "Start Match Up"}
              </Button>
            )}
            {tournament.status === "active" && (
              <Button className="bg-forest-green text-white hover:bg-forest-green-light" size="sm" onClick={() => generateMutation.mutate()} disabled={generateMutation.isPending}>
                <Zap className="w-4 h-4" />
                {generateMutation.isPending ? "Generating…" : "Next Round"}
              </Button>
            )}
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="players">Players</TabsTrigger>
          <TabsTrigger value="standings">Standings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {liveMatches.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-foreground flex items-center gap-2">
                    Live
                    <Badge className="bg-lime-green text-forest-green animate-pulse text-xs">{liveMatches.length}</Badge>
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {liveMatches.map((m: Match) => (
                      <CourtCard key={m.id} match={m} editable
                        onUpdateScore={(matchId, t1, t2) => scoreMatchMutation.mutate({ matchId, t1, t2 })}
                        onCompleteMatch={(matchId) => completeMatchMutation.mutate(matchId)}
                      />
                    ))}
                  </div>
                </div>
              )}
              {scheduledMatches.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-foreground">Upcoming</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {scheduledMatches.slice(0, 4).map((m: Match) => (
                      <CourtCard key={m.id} match={m} editable
                        onStartMatch={(matchId) => startMatchMutation.mutate(matchId)}
                      />
                    ))}
                  </div>
                </div>
              )}
              {liveMatches.length === 0 && scheduledMatches.length === 0 && (
                <Card className="border border-border bg-white p-8 text-center">
                  <Clock className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">
                    {tournament.status === "draft" ? "Start the match up to generate matches" : "All matches completed"}
                  </p>
                </Card>
              )}
            </div>

            <div className="space-y-4">
              <Card className="border border-border bg-white p-4">
                <h3 className="text-sm font-semibold text-foreground mb-3">Match Up Info</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Format</span><span className="font-medium">{formatTournamentFormat(tournament.format)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Courts</span><span className="font-medium">{tournament.courts}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Duration</span><span className="font-medium">{tournament.match_duration}min</span></div>
                  {tournament.match_type && (
                    <div className="flex justify-between"><span className="text-muted-foreground">Match Type</span><span className="font-medium">{tournament.match_type.replace(/_/g, " ")}</span></div>
                  )}
                  <div className="flex justify-between"><span className="text-muted-foreground">Players</span><span className="font-medium">{players.length}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Matches</span><span className="font-medium">{matches.length}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Completed</span><span className="font-medium">{completedMatches.length}</span></div>
                </div>
              </Card>

              {standings.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3">Top 3</h3>
                  <StandingsTable standings={standings} limit={3} />
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="schedule">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">All Matches ({matches.length})</h3>
              {tournament.status === "active" && (
                <Button className="bg-forest-green text-white hover:bg-forest-green-light" size="sm" onClick={() => generateMutation.mutate()} disabled={generateMutation.isPending}>
                  <Zap className="w-4 h-4 mr-2" />
                  Generate Round
                </Button>
              )}
            </div>
            {matches.length === 0 ? (
              <Card className="border border-border bg-white p-8 text-center">
                <p className="text-muted-foreground text-sm">No matches scheduled yet</p>
              </Card>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {matches.map((m: Match) => (
                  <CourtCard key={m.id} match={m} editable
                    onStartMatch={(matchId) => startMatchMutation.mutate(matchId)}
                    onUpdateScore={(matchId, t1, t2) => scoreMatchMutation.mutate({ matchId, t1, t2 })}
                    onCompleteMatch={(matchId) => completeMatchMutation.mutate(matchId)}
                  />
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="players">
          <div className="space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-lg font-semibold text-foreground">{players.length} Players</h3>
              <div className="flex gap-2">
                {players.length >= 2 && (
                  <Button variant="outline" size="sm" onClick={() => { setSwapA(""); setSwapB(""); setShowSwap(true); }}>
                    <ArrowLeftRight className="w-4 h-4" />
                    Swap
                  </Button>
                )}
                <Button size="sm" className="bg-forest-green text-white hover:bg-forest-green-light" onClick={() => setShowAddPlayers(true)}>
                  <Plus className="w-4 h-4" />
                  Add Players
                </Button>
              </div>
            </div>

            {players.length === 0 ? (
              <Card className="border border-border bg-white p-8 text-center">
                <p className="text-muted-foreground text-sm">No players added yet</p>
              </Card>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {players.map((p) => (
                  <Card key={p.id} className="border border-border bg-white p-4">
                    {editingId === p.id ? (
                      <div className="space-y-2">
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="h-9 text-sm"
                          autoFocus
                        />
                        <Select value={editSkill} onValueChange={(v) => setEditSkill(v as SkillLevel)}>
                          <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {SKILL_LEVELS.map((s) => (
                              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="flex gap-1.5">
                          <Button
                            size="sm"
                            className="flex-1 h-8 bg-forest-green text-white hover:bg-forest-green-light text-xs"
                            disabled={updatePlayerMutation.isPending || !editName.trim()}
                            onClick={() => updatePlayerMutation.mutate({ playerId: p.id, name: editName.trim(), skill_level: editSkill })}
                          >
                            <Check className="w-3 h-3 mr-1" />
                            Save
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 text-xs" onClick={cancelEdit}>
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-soft-lime/20 flex items-center justify-center text-forest-green font-semibold text-sm shrink-0">
                          {(p.name || p.display_name || "?")[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-foreground truncate">{p.display_name || p.name || "—"}</div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Badge variant="outline" className="text-xs py-0">{skillLevelLabel(p.skill_level)}</Badge>
                            {p.is_checked_in && <Badge className="text-xs py-0 bg-lime-green text-forest-green">✓ In</Badge>}
                          </div>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(p)}>
                            <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            disabled={removePlayerMutation.isPending}
                            onClick={() => removePlayerMutation.mutate(p.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5 text-destructive/70" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="standings">
          <StandingsTable standings={standings} />
        </TabsContent>
      </Tabs>

      {/* Add Players Dialog */}
      <Dialog open={showAddPlayers} onOpenChange={setShowAddPlayers}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Players</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {newPlayers.map((p, i) => (
              <div key={i} className="flex gap-2 items-center">
                <Input
                  placeholder={`Player ${i + 1}`}
                  value={p.name}
                  onChange={(e) => setNewPlayers((prev) => prev.map((x, idx) => idx === i ? { ...x, name: e.target.value } : x))}
                  className="flex-1 h-10"
                />
                <Select value={p.skill_level} onValueChange={(v) => setNewPlayers((prev) => prev.map((x, idx) => idx === i ? { ...x, skill_level: v as SkillLevel } : x))}>
                  <SelectTrigger className="w-28 h-10"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SKILL_LEVELS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="ghost" size="icon" onClick={() => setNewPlayers((prev) => prev.filter((_, idx) => idx !== i))} disabled={newPlayers.length <= 1} className="h-10 w-10">
                  <Trash2 className="w-4 h-4 text-muted-foreground" />
                </Button>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full" onClick={() => setNewPlayers((p) => [...p, emptyPlayer()])}>
            <Plus className="w-4 h-4 mr-2" />
            Add Row
          </Button>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => { setShowAddPlayers(false); setNewPlayers([emptyPlayer()]); }}>Cancel</Button>
            <Button
              className="flex-1 bg-forest-green text-white hover:bg-forest-green-light"
              onClick={() => addPlayersMutation.mutate(newPlayers)}
              disabled={addPlayersMutation.isPending || !newPlayers.some((p) => p.name.trim())}
            >
              {addPlayersMutation.isPending ? "Adding…" : "Add Players"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Swap Players Dialog */}
      <Dialog open={showSwap} onOpenChange={(open) => { setShowSwap(open); if (!open) { setSwapA(""); setSwapB(""); } }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Swap Players</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Select two players — their names and skill levels will be exchanged.</p>
          <div className="space-y-3 pt-1">
            <div className="space-y-1.5">
              <Label>Player A</Label>
              <Select value={swapA} onValueChange={setSwapA}>
                <SelectTrigger><SelectValue placeholder="Select player…" /></SelectTrigger>
                <SelectContent>
                  {players.filter((p) => p.id !== swapB).map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name || p.display_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-center">
              <ArrowLeftRight className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="space-y-1.5">
              <Label>Player B</Label>
              <Select value={swapB} onValueChange={setSwapB}>
                <SelectTrigger><SelectValue placeholder="Select player…" /></SelectTrigger>
                <SelectContent>
                  {players.filter((p) => p.id !== swapA).map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name || p.display_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowSwap(false)}>Cancel</Button>
            <Button
              className="flex-1 bg-forest-green text-white hover:bg-forest-green-light"
              disabled={!swapA || !swapB || swapA === swapB || swapPlayersMutation.isPending}
              onClick={() => swapPlayersMutation.mutate()}
            >
              {swapPlayersMutation.isPending ? "Swapping…" : "Swap"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
