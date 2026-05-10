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
import { ArrowLeft, ArrowRight, Check, Plus, Trash2, AlertCircle } from "lucide-react";
import { tournamentsApi, playersApi } from "@/lib/api";
import { toast } from "sonner";
import type { TournamentFormat, PlayerGender, SkillLevel, CreateTournamentPayload } from "@/types";

const steps = [
  { number: 1, title: "Basic Info", description: "Match Up details" },
  { number: 2, title: "Format", description: "Choose match up type" },
  { number: 3, title: "Players", description: "Add participants" },
  { number: 4, title: "Schedule", description: "Courts & timing" },
];

const formats: { id: TournamentFormat; name: string; desc: string }[] = [
  { id: "americano", name: "Americano", desc: "Rotating partners & opponents" },
  { id: "mexicano", name: "Mexicano", desc: "Like Americano with skill matching" },
  { id: "round_robin", name: "Round Robin", desc: "Everyone plays everyone" },
  { id: "mixed_doubles", name: "Mixed Doubles", desc: "Fixed mixed pairs" },
  { id: "single_elimination", name: "Single Elimination", desc: "Bracket-style match up" },
  { id: "team_cup", name: "Team Cup", desc: "Team-based competition" },
];

interface PlayerInput {
  first_name: string;
  last_name: string;
  email: string;
  gender: PlayerGender;
  skill_level: SkillLevel;
}

const emptyPlayer = (): PlayerInput => ({ first_name: "", last_name: "", email: "", gender: "male", skill_level: "intermediate" });

export function CreateTournamentPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");

  // Step 1 - basic info
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isPublic, setIsPublic] = useState(true);

  // Step 2 - format
  const [format, setFormat] = useState<TournamentFormat>("americano");
  const [matchType, setMatchType] = useState("timed-20");
  const [scoringSystem, setScoringSystem] = useState("points");

  // Step 3 - players
  const [players, setPlayers] = useState<PlayerInput[]>([emptyPlayer(), emptyPlayer(), emptyPlayer(), emptyPlayer()]);

  // Step 4 - schedule
  const [courts, setCourts] = useState("4");
  const [matchDuration, setMatchDuration] = useState("20");
  const [breakDuration, setBreakDuration] = useState("5");

  const createMutation = useMutation({
    mutationFn: async () => {
      setError("");
      const payload: CreateTournamentPayload = {
        name, description, format, location,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        courts: parseInt(courts),
        match_duration: parseInt(matchDuration),
        break_duration: parseInt(breakDuration),
        scoring_system: scoringSystem,
        is_public: isPublic,
      };
      const tournament = await tournamentsApi.create(payload);
      const validPlayers = players.filter((p) => p.first_name.trim() && p.last_name.trim());
      if (validPlayers.length > 0) {
        try {
          await playersApi.add(tournament.id, { players: validPlayers });
        } catch {
          // Tournament created — navigate there so players can be added manually
          qc.invalidateQueries({ queryKey: ["tournaments"] });
          toast.warning(`Match Up created but players couldn't be added. You can add them from the match up page.`);
          navigate(`/tournaments/${tournament.id}`);
          return tournament;
        }
      }
      return tournament;
    },
    onSuccess: (t) => {
      qc.invalidateQueries({ queryKey: ["tournaments"] });
      toast.success(`Match Up "${t.name}" created!`);
      navigate(`/tournaments/${t.id}`);
    },
    onError: (err: Error) => setError(err.message),
  });

  function validateStep(): boolean {
    setError("");
    if (step === 1 && !name.trim()) { setError("Match Up name is required"); return false; }
    return true;
  }

  function nextStep() { if (validateStep()) setStep((s) => Math.min(4, s + 1)); }
  function prevStep() { setError(""); setStep((s) => Math.max(1, s - 1)); }

  function addPlayer() { setPlayers((p) => [...p, emptyPlayer()]); }
  function removePlayer(i: number) { setPlayers((p) => p.filter((_, idx) => idx !== i)); }
  function updatePlayer(i: number, field: keyof PlayerInput, value: string) {
    setPlayers((prev) => prev.map((p, idx) => idx === i ? { ...p, [field]: value } : p));
  }

  const validPlayerCount = players.filter((p) => p.first_name.trim() && p.last_name.trim()).length;

  // Estimate schedule
  const numCourts = parseInt(courts);
  const matchMins = parseInt(matchDuration) + parseInt(breakDuration);
  const matchesNeeded = validPlayerCount > 0 ? Math.ceil(validPlayerCount * (validPlayerCount - 1) / 2) : 0;
  const roundsNeeded = validPlayerCount > 0 ? Math.ceil(matchesNeeded / numCourts) : 0;
  const totalMins = roundsNeeded * matchMins;
  const hrs = Math.floor(totalMins / 60);
  const mins = totalMins % 60;

  return (
    <div className="p-5 lg:p-8 max-w-4xl mx-auto bg-warm-gray/30 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" onClick={() => navigate("/tournaments")} className="mb-4 -ml-2">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Match Ups
        </Button>
        <h1 className="text-3xl font-semibold mb-2 text-foreground">Create New Match Up</h1>
        <p className="text-muted-foreground text-sm">Set up your match up in a few simple steps</p>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((s, index) => (
            <div key={s.number} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 transition-all font-medium text-xs sm:text-sm ${
                  s.number < step ? "bg-forest-green border-forest-green text-white"
                    : s.number === step ? "border-forest-green text-forest-green bg-white"
                    : "border-border text-muted-foreground bg-white"
                }`}>
                  {s.number < step ? <Check className="w-4 h-4 sm:w-5 sm:h-5" /> : s.number}
                </div>
                <div className="mt-2 text-center hidden sm:block">
                  <div className="text-xs font-medium text-foreground">{s.title}</div>
                  <div className="text-xs text-muted-foreground">{s.description}</div>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={`h-0.5 flex-1 mx-2 ${s.number < step ? "bg-forest-green" : "bg-border"}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm mb-6">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Form content */}
      <Card className="border border-border bg-white p-6 lg:p-8 shadow-sm">
        {step === 1 && (
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="t-name">Match Up Name <span className="text-destructive">*</span></Label>
              <Input id="t-name" placeholder="e.g., Summer Championship 2026" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
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
              <Label htmlFor="location">Location</Label>
              <Input id="location" placeholder="e.g., City Tennis Club" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="Add tournament details, rules, or additional information..." value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="is-public" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="rounded" />
              <Label htmlFor="is-public">Public match up (shareable link)</Label>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div className="space-y-2">
              <Label>Match Up Format</Label>
              <div className="grid sm:grid-cols-2 gap-3">
                {formats.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFormat(f.id)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      format === f.id
                        ? "border-forest-green bg-soft-lime/10"
                        : "border-border hover:border-forest-green/40"
                    }`}
                  >
                    <div className="font-medium text-sm mb-1 text-foreground">{f.name}</div>
                    <div className="text-xs text-muted-foreground">{f.desc}</div>
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Match Type</Label>
              <Select value={matchType} onValueChange={setMatchType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="best-of-1">Best of 1 Set</SelectItem>
                  <SelectItem value="best-of-3">Best of 3 Sets</SelectItem>
                  <SelectItem value="best-of-4">Best of 4 Sets</SelectItem>
                  <SelectItem value="best-of-5">Best of 5 Sets</SelectItem>
                  <SelectItem value="race-to-4">First to 4 Sets</SelectItem>
                  <SelectItem value="race-to-5">First to 5 Sets</SelectItem>
                  <SelectItem value="timed-15">15 Minute Timed</SelectItem>
                  <SelectItem value="timed-20">20 Minute Timed</SelectItem>
                  <SelectItem value="timed-30">30 Minute Timed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Scoring System</Label>
              <Select value={scoringSystem} onValueChange={setScoringSystem}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="points">Points Only</SelectItem>
                  <SelectItem value="standard">Standard (15-30-40)</SelectItem>
                  <SelectItem value="no-ad">No-Ad Scoring</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Players</Label>
              <Badge className={validPlayerCount >= 4 ? "bg-tennis-ball-green text-forest-green" : "bg-muted text-muted-foreground"}>
                {validPlayerCount} Valid Players
              </Badge>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {players.map((p, i) => (
                <div key={i} className="grid grid-cols-[1fr_1fr_auto_auto_auto] gap-2 items-center">
                  <Input placeholder="First name" value={p.first_name} onChange={(e) => updatePlayer(i, "first_name", e.target.value)} />
                  <Input placeholder="Last name" value={p.last_name} onChange={(e) => updatePlayer(i, "last_name", e.target.value)} />
                  <Select value={p.gender} onValueChange={(v) => updatePlayer(i, "gender", v)}>
                    <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">M</SelectItem>
                      <SelectItem value="female">F</SelectItem>
                      <SelectItem value="other">X</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={p.skill_level} onValueChange={(v) => updatePlayer(i, "skill_level", v)}>
                    <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="pro">Pro</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="ghost" size="icon" onClick={() => removePlayer(i)} disabled={players.length <= 1}>
                    <Trash2 className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full" onClick={addPlayer}>
              <Plus className="w-4 h-4 mr-2" />
              Add Player
            </Button>
            {validPlayerCount < 4 && (
              <p className="text-sm text-muted-foreground text-center">Need at least 4 players for a match up</p>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Number of Courts</Label>
                <Select value={courts} onValueChange={setCourts}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                      <SelectItem key={n} value={n.toString()}>{n} {n === 1 ? "Court" : "Courts"}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Match Duration (minutes)</Label>
                <Select value={matchDuration} onValueChange={setMatchDuration}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="20">20 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Break Between Matches</Label>
              <Select value={breakDuration} onValueChange={setBreakDuration}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">No break</SelectItem>
                  <SelectItem value="5">5 minutes</SelectItem>
                  <SelectItem value="10">10 minutes</SelectItem>
                  <SelectItem value="15">15 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {validPlayerCount >= 4 && (
              <div className="p-4 rounded-lg bg-soft-lime/10 border border-tennis-ball-green/30 space-y-1.5">
                <div className="text-sm font-semibold text-foreground mb-2">Match Up Overview</div>
                <div className="text-sm text-muted-foreground">• {validPlayerCount} players across {courts} courts</div>
                <div className="text-sm text-muted-foreground">• ~{roundsNeeded} rounds, {matchesNeeded} total matches</div>
                <div className="text-sm text-muted-foreground">• Estimated duration: {hrs > 0 ? `${hrs}h ` : ""}{mins}min</div>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <Button variant="outline" onClick={prevStep} disabled={step === 1 || createMutation.isPending}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        {step < 4 ? (
          <Button className="bg-forest-green text-white hover:bg-forest-green-light" onClick={nextStep}>
            Next
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button
            className="bg-forest-green text-white hover:bg-forest-green-light"
            onClick={() => createMutation.mutate()}
            disabled={createMutation.isPending || !name.trim()}
          >
            {createMutation.isPending ? (
              "Creating…"
            ) : (
              <><Check className="w-4 h-4 mr-2" />Create Match Up</>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
