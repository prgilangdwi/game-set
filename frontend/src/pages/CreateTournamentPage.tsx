import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, ArrowRight, Check, Plus, Trash2, AlertCircle,
  ChevronDown, ChevronUp,
} from "lucide-react";
import { tournamentsApi, playersApi } from "@/lib/api";
import { SPORTS, MATCH_TYPES } from "@/lib/sports";
import { toast } from "sonner";
import type { TournamentFormat, SkillLevel, SportType, CreateTournamentPayload } from "@/types";

const steps = [
  { number: 1, label: "Sport" },
  { number: 2, label: "Details" },
  { number: 3, label: "Players" },
  { number: 4, label: "Create" },
];

const formats: { id: TournamentFormat; name: string; desc: string; detail: string }[] = [
  {
    id: "americano",
    name: "Americano",
    desc: "Rotating partners & opponents",
    detail: "Every round, partners and opponents rotate so everyone plays with everyone. Final ranking is by total points scored — great for social events where you want to mix all levels.",
  },
  {
    id: "mexicano",
    name: "Mexicano",
    desc: "Like Americano with skill matching",
    detail: "Starts like Americano, but after each round players are re-seeded by score so similar skill levels are matched together. Gets more competitive as the event progresses.",
  },
  {
    id: "round_robin",
    name: "Round Robin",
    desc: "Everyone plays everyone",
    detail: "Every team or player faces every other team/player once. The most wins (or points) decides the champion. Fair and complete, but takes more time with large groups.",
  },
  {
    id: "mixed_doubles",
    name: "Mixed Doubles",
    desc: "Fixed mixed pairs",
    detail: "Teams are fixed as one male + one female player. Perfect for club social nights. Partners stay the same the whole event — bring a partner or get paired randomly.",
  },
  {
    id: "single_elimination",
    name: "Single Elimination",
    desc: "Bracket-style knockout",
    detail: "One loss and you're out. Matches are seeded into a bracket and the winner advances. The fastest format to crown a champion — great for competitive events.",
  },
  {
    id: "team_cup",
    name: "Team Cup",
    desc: "Team-based competition",
    detail: "Players are divided into fixed teams that compete for overall team score. Individual matches contribute to team totals. Ideal for club vs club or inter-group rivalries.",
  },
];

interface PlayerDraft {
  name: string;
  skill_level: SkillLevel;
}

const emptyPlayer = (): PlayerDraft => ({ name: "", skill_level: "intermediate" });

export function CreateTournamentPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Step 1
  const [sport, setSport] = useState<SportType>("tennis");

  // Step 2
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [description, setDescription] = useState("");

  // Advanced
  const [format, setFormat] = useState<TournamentFormat>("americano");
  const [scoringSystem, setScoringSystem] = useState("points");
  const [matchType, setMatchType] = useState<string>("");
  const [courts, setCourts] = useState("2");
  const [matchDuration, setMatchDuration] = useState("20");
  const [breakDuration, setBreakDuration] = useState("5");

  // Step 3
  const [players, setPlayers] = useState<PlayerDraft[]>([
    emptyPlayer(), emptyPlayer(), emptyPlayer(), emptyPlayer(),
  ]);

  const createMutation = useMutation({
    mutationFn: async () => {
      setError("");
      const payload: CreateTournamentPayload = {
        name,
        sport,
        description: description || undefined,
        format,
        location: location || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        courts: parseInt(courts),
        match_duration: parseInt(matchDuration),
        break_duration: parseInt(breakDuration),
        scoring_system: scoringSystem,
        match_type: matchType || undefined,
        is_public: isPublic,
      };
      const tournament = await tournamentsApi.create(payload);
      const validPlayers = players.filter((p) => p.name.trim());
      if (validPlayers.length > 0) {
        try {
          await playersApi.add(tournament.id, {
            players: validPlayers.map((p) => ({
              name: p.name.trim(),
              skill_level: p.skill_level,
              gender: "other" as const,
            })),
          });
        } catch {
          qc.invalidateQueries({ queryKey: ["tournaments"] });
          toast.warning("Match Up created, but players couldn't be added. You can add them from the match up page.");
          navigate(`/tournaments/${tournament.id}`);
          return tournament;
        }
      }
      return tournament;
    },
    onSuccess: (t) => {
      qc.invalidateQueries({ queryKey: ["tournaments"] });
      toast.success(`"${t.name}" created!`);
      navigate(`/tournaments/${t.id}`);
    },
    onError: (err: Error) => setError(err.message),
  });

  function validateStep(): boolean {
    setError("");
    if (step === 2 && !name.trim()) {
      setError("Match Up name is required");
      return false;
    }
    return true;
  }

  function nextStep() { if (validateStep()) setStep((s) => Math.min(4, s + 1)); }
  function prevStep() { setError(""); setStep((s) => Math.max(1, s - 1)); }

  function addPlayer() { setPlayers((p) => [...p, emptyPlayer()]); }
  function removePlayer(i: number) {
    if (players.length <= 1) return;
    setPlayers((p) => p.filter((_, idx) => idx !== i));
  }
  function updatePlayer(i: number, field: keyof PlayerDraft, value: string) {
    setPlayers((prev) => prev.map((p, idx) => idx === i ? { ...p, [field]: value } : p));
  }

  const validPlayerCount = players.filter((p) => p.name.trim()).length;
  const currentSport = SPORTS.find((s) => s.id === sport) ?? SPORTS[0];

  return (
    <div className="p-4 lg:p-8 max-w-2xl mx-auto min-h-screen pb-24 lg:pb-8">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate("/tournaments")} className="mb-3 -ml-2">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold text-foreground">New Match Up</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Quick setup in 4 steps</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-1 mb-6">
        {steps.map((s, i) => (
          <div key={s.number} className="flex items-center flex-1">
            <div className="flex flex-col items-center w-full">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all text-xs font-semibold ${
                s.number < step  ? "bg-forest-green border-forest-green text-white"
                : s.number === step ? "border-forest-green text-forest-green bg-white"
                : "border-border text-muted-foreground bg-white"
              }`}>
                {s.number < step ? <Check className="w-4 h-4" /> : s.number}
              </div>
              <span className="hidden sm:block text-[11px] mt-1 font-medium text-muted-foreground">{s.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`h-0.5 flex-1 mx-1 -mt-4 sm:-mt-5 ${s.number < step ? "bg-forest-green" : "bg-border"}`} />
            )}
          </div>
        ))}
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm mb-4">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <Card className="border border-border bg-white p-5 shadow-sm">

        {/* Step 1: Sport */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-1">Choose your sport</h2>
              <p className="text-sm text-muted-foreground">What are you organizing?</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {SPORTS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => { setSport(s.id); setMatchType(""); }}
                  className={`p-4 rounded-xl border-2 text-left transition-all active:scale-95 ${
                    sport === s.id
                      ? "border-forest-green bg-forest-green/5"
                      : "border-border hover:border-forest-green/40 bg-white"
                  }`}
                >
                  <div className="text-3xl mb-2">{s.emoji}</div>
                  <div className="font-semibold text-sm text-foreground">{s.label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5 leading-snug">{s.description}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Details */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-1">
                {currentSport.emoji} {currentSport.label} · Details
              </h2>
              <p className="text-sm text-muted-foreground">Give your match up a name</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="t-name">Name <span className="text-destructive">*</span></Label>
              <Input
                id="t-name"
                placeholder="e.g., Summer Americano 2026"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-base h-12"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="Sports club or venue"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Input id="start-date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">End Date</Label>
                <Input id="end-date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Notes (optional)</Label>
              <Textarea
                id="description"
                placeholder="Rules, dress code, anything useful…"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            </div>
            <div className="flex items-center gap-3 pt-1">
              <input
                type="checkbox"
                id="is-public"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="rounded w-4 h-4"
              />
              <Label htmlFor="is-public" className="text-sm font-normal cursor-pointer">
                Public — anyone with the link can view
              </Label>
            </div>
          </div>
        )}

        {/* Step 3: Players */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-0.5">Add Players</h2>
                <p className="text-sm text-muted-foreground">Need at least 4 to start</p>
              </div>
              <Badge className={validPlayerCount >= 4 ? "bg-lime-green text-forest-green font-semibold" : "bg-muted text-muted-foreground"}>
                {validPlayerCount} ready
              </Badge>
            </div>

            <div className="space-y-3 max-h-[28rem] overflow-y-auto -mx-1 px-1">
              {players.map((p, i) => (
                <div key={i} className="rounded-xl border border-border bg-muted/30 p-3 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Player {i + 1}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removePlayer(i)}
                      disabled={players.length <= 1}
                      className="h-8 w-8 -mr-1 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <Input
                    placeholder={`Player ${i + 1} name`}
                    value={p.name}
                    onChange={(e) => updatePlayer(i, "name", e.target.value)}
                    className="w-full text-base h-12"
                  />
                  <Select value={p.skill_level} onValueChange={(v) => updatePlayer(i, "skill_level", v)}>
                    <SelectTrigger className="w-full h-12 text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="pro">Pro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>

            <Button variant="outline" className="w-full h-12 text-base" onClick={addPlayer}>
              <Plus className="w-5 h-5 mr-2" />
              Add Player
            </Button>
          </div>
        )}

        {/* Step 4: Confirm */}
        {step === 4 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-1">Ready to create?</h2>
              <p className="text-sm text-muted-foreground">Your match up summary</p>
            </div>

            <div className="rounded-xl bg-forest-green/5 border border-forest-green/20 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{currentSport.emoji}</span>
                <span className="font-bold text-foreground text-lg">{name}</span>
              </div>
              <p className="text-sm text-muted-foreground capitalize">{currentSport.label}</p>
              {location && <p className="text-sm text-muted-foreground">📍 {location}</p>}
              <p className="text-sm text-muted-foreground">
                👥 {validPlayerCount} player{validPlayerCount !== 1 ? "s" : ""}
              </p>
              {(startDate || endDate) && (
                <p className="text-sm text-muted-foreground">
                  📅 {startDate || "—"}{endDate && startDate !== endDate ? ` → ${endDate}` : ""}
                </p>
              )}
            </div>

            <button
              className="flex items-center gap-2 w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-1"
              onClick={() => setShowAdvanced((v) => !v)}
            >
              {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              Advanced settings
            </button>

            {showAdvanced && (
              <div className="space-y-3 pt-1 border-t border-border">
                <div className="space-y-1.5">
                  <Label>Format</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {formats.map((f) => (
                      <div key={f.id} className="relative group">
                        <button
                          onClick={() => setFormat(f.id)}
                          className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                            format === f.id
                              ? "border-forest-green bg-forest-green/5"
                              : "border-border hover:border-forest-green/40"
                          }`}
                        >
                          <div className="font-medium text-xs text-foreground">{f.name}</div>
                          <div className="text-[11px] text-muted-foreground mt-0.5">{f.desc}</div>
                        </button>
                        {/* Hover tooltip */}
                        <div className="pointer-events-none absolute bottom-full left-0 mb-2 z-50 hidden group-hover:block w-56">
                          <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg leading-relaxed">
                            <p className="font-semibold mb-1">{f.name}</p>
                            {f.detail}
                          </div>
                          <div className="w-2 h-2 bg-gray-900 rotate-45 ml-4 -mt-1" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Courts</Label>
                    <Select value={courts} onValueChange={setCourts}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                          <SelectItem key={n} value={String(n)}>{n} court{n > 1 ? "s" : ""}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Match length</Label>
                    <Select value={matchDuration} onValueChange={setMatchDuration}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 min</SelectItem>
                        <SelectItem value="20">20 min</SelectItem>
                        <SelectItem value="30">30 min</SelectItem>
                        <SelectItem value="45">45 min</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Break</Label>
                    <Select value={breakDuration} onValueChange={setBreakDuration}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">No break</SelectItem>
                        <SelectItem value="5">5 min</SelectItem>
                        <SelectItem value="10">10 min</SelectItem>
                        <SelectItem value="15">15 min</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Scoring</Label>
                    <Select value={scoringSystem} onValueChange={setScoringSystem}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="points">Points</SelectItem>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="no-ad">No-Ad</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Match Type</Label>
                  <Select
                    value={matchType || "__none__"}
                    onValueChange={(v) => setMatchType(v === "__none__" ? "" : v)}
                  >
                    <SelectTrigger><SelectValue placeholder="Select match type…" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">— None —</SelectItem>
                      {MATCH_TYPES[sport].map((mt) => (
                        <SelectItem key={mt.value} value={mt.value}>{mt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {matchType && (() => {
                    const desc = MATCH_TYPES[sport].find((mt) => mt.value === matchType)?.description;
                    return desc ? (
                      <p className="text-xs text-muted-foreground bg-warm-gray/60 rounded-lg px-3 py-2 leading-relaxed">
                        {desc}
                      </p>
                    ) : null;
                  })()}
                </div>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Nav buttons */}
      <div className="flex items-center gap-3 mt-4">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={step === 1 || createMutation.isPending}
          className="flex-1 lg:flex-none h-11"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {step < 4 ? (
          <Button
            className="flex-1 bg-forest-green text-white hover:bg-forest-green-light h-11"
            onClick={nextStep}
          >
            Next
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button
            className="flex-1 bg-forest-green text-white hover:bg-forest-green-light h-12 text-base font-semibold"
            onClick={() => createMutation.mutate()}
            disabled={createMutation.isPending || !name.trim()}
          >
            {createMutation.isPending ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Creating…
              </span>
            ) : (
              <><Check className="w-5 h-5 mr-2" />Create Match Up</>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
