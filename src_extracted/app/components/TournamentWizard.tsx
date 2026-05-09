import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Badge } from "./ui/badge";

interface TournamentWizardProps {
  onComplete: () => void;
  onBack: () => void;
}

export function TournamentWizard({ onComplete, onBack }: TournamentWizardProps) {
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const steps = [
    { number: 1, title: "Basic Info", description: "Tournament details" },
    { number: 2, title: "Format", description: "Choose tournament type" },
    { number: 3, title: "Players", description: "Add participants" },
    { number: 4, title: "Schedule", description: "Set up courts & timing" },
  ];

  return (
    <div className="p-5 lg:p-8 max-w-4xl mx-auto bg-warm-gray/30 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <h1 className="text-3xl font-semibold mb-2 text-foreground">Create New Tournament</h1>
        <p className="text-muted-foreground text-sm">Set up your tournament in a few simple steps</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((s, index) => (
            <div key={s.number} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all font-medium ${
                  s.number < step
                    ? "bg-forest-green border-forest-green text-white"
                    : s.number === step
                    ? "border-forest-green text-forest-green bg-white"
                    : "border-border text-muted-foreground bg-white"
                }`}>
                  {s.number < step ? <Check className="w-5 h-5" /> : s.number}
                </div>
                <div className="mt-2 text-center hidden sm:block">
                  <div className="text-sm font-medium text-foreground">{s.title}</div>
                  <div className="text-xs text-muted-foreground">{s.description}</div>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={`h-0.5 flex-1 mx-2 ${
                  s.number < step ? "bg-forest-green" : "bg-border"
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <Card className="border border-border bg-white p-6 lg:p-8 shadow-sm">
        {step === 1 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="tournament-name">Tournament Name</Label>
              <Input id="tournament-name" placeholder="e.g., Summer Championship 2026" />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Input id="start-date" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">End Date</Label>
                <Input id="end-date" type="date" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" placeholder="e.g., City Tennis Club" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <textarea
                id="description"
                className="w-full min-h-[100px] px-3 py-2 rounded-lg bg-input-background border border-input text-sm"
                placeholder="Add tournament details, rules, or additional information..."
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Tournament Format</Label>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { id: "americano", name: "Americano", desc: "Rotating partners & opponents" },
                  { id: "round-robin", name: "Round Robin", desc: "Everyone plays everyone" },
                  { id: "mixed-doubles", name: "Mixed Doubles", desc: "Fixed mixed pairs" },
                  { id: "team-cup", name: "Team Cup", desc: "Team-based competition" },
                ].map((format) => (
                  <button
                    key={format.id}
                    className="p-4 rounded-lg border-2 border-border/50 hover:border-tennis-green/50 transition-all text-left bg-background/50"
                  >
                    <div className="font-medium mb-1">{format.name}</div>
                    <div className="text-sm text-muted-foreground">{format.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="match-type">Match Type</Label>
              <Select defaultValue="best-of-3">
                <SelectTrigger id="match-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="best-of-1">Best of 1 Set</SelectItem>
                  <SelectItem value="best-of-3">Best of 3 Sets</SelectItem>
                  <SelectItem value="timed-15">15 Minute Timed</SelectItem>
                  <SelectItem value="timed-20">20 Minute Timed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="scoring">Scoring System</Label>
              <Select defaultValue="standard">
                <SelectTrigger id="scoring">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard (15-30-40)</SelectItem>
                  <SelectItem value="no-ad">No-Ad Scoring</SelectItem>
                  <SelectItem value="points">Points Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Label>Players</Label>
              <Button variant="outline" size="sm">Import from CSV</Button>
            </div>

            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="grid sm:grid-cols-3 gap-3">
                  <Input placeholder="First Name" />
                  <Input placeholder="Last Name" />
                  <Select defaultValue="intermediate">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>

            <Button variant="outline" className="w-full">Add More Players</Button>

            <div className="flex items-center gap-4 p-4 rounded-lg bg-tennis-green/10 border border-tennis-green/30">
              <Badge className="bg-tennis-green text-black">5 Players</Badge>
              <span className="text-sm text-muted-foreground">Add at least 8 players for optimal tournament format</span>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="num-courts">Number of Courts</Label>
                <Select defaultValue="4">
                  <SelectTrigger id="num-courts">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                      <SelectItem key={n} value={n.toString()}>{n} {n === 1 ? 'Court' : 'Courts'}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="match-duration">Match Duration (minutes)</Label>
                <Select defaultValue="20">
                  <SelectTrigger id="match-duration">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="20">20 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-time">Start Time</Label>
                <Input id="start-time" type="time" defaultValue="09:00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="break-duration">Break Between Matches</Label>
                <Select defaultValue="5">
                  <SelectTrigger id="break-duration">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">No Break</SelectItem>
                    <SelectItem value="5">5 minutes</SelectItem>
                    <SelectItem value="10">10 minutes</SelectItem>
                    <SelectItem value="15">15 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-background/50 border border-border/30">
              <div className="text-sm font-medium mb-2">Tournament Overview</div>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div>• Estimated duration: 3 hours 45 minutes</div>
                <div>• Total matches: 28</div>
                <div>• Matches per court: 7</div>
                <div>• Estimated finish: 12:45 PM</div>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between mt-6">
        <Button
          variant="outline"
          onClick={() => setStep(Math.max(1, step - 1))}
          disabled={step === 1}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        {step < totalSteps ? (
          <Button
            className="bg-forest-green text-white hover:bg-forest-green-light font-medium"
            onClick={() => setStep(Math.min(totalSteps, step + 1))}
          >
            Next
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button
            className="bg-forest-green text-white hover:bg-forest-green-light font-medium"
            onClick={onComplete}
          >
            <Check className="w-4 h-4 mr-2" />
            Create Tournament
          </Button>
        )}
      </div>
    </div>
  );
}
