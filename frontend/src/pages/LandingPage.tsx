import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trophy, Users, Calendar, BarChart3, Zap, Shield } from "lucide-react";

const features = [
  { icon: Trophy, title: "Americano Tournaments", description: "Automated scheduling and pairing for perfect Americano events" },
  { icon: Users, title: "Mixed Doubles", description: "Smart team formation and rotation for balanced competition" },
  { icon: Calendar, title: "Round Robin", description: "Complete round-robin scheduling with real-time updates" },
  { icon: BarChart3, title: "Live Analytics", description: "Track performance, rankings, and statistics in real-time" },
  { icon: Zap, title: "Instant Updates", description: "Live scoreboards and standings across all devices" },
  { icon: Shield, title: "Tournament Management", description: "Complete control over your tennis events and leagues" },
];

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-border bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-forest-green" />
            <span className="text-xl font-semibold text-foreground">GameSet</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate("/auth")} className="text-sm font-medium">Sign In</Button>
            <Button
              className="bg-forest-green text-white hover:bg-forest-green-light text-sm font-medium"
              onClick={() => navigate("/auth")}
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-16 lg:py-24">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl lg:text-6xl font-semibold mb-6 leading-tight text-foreground">
            Tournament management<br />made simple
          </h1>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            The modern platform for organizing Americano tournaments, mixed doubles, and round-robin events.
            Built for clubs, organizers, and players.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Button
              size="lg"
              className="bg-forest-green text-white hover:bg-forest-green-light font-medium px-8"
              onClick={() => navigate("/auth")}
            >
              Start Free Trial
            </Button>
            <Button size="lg" variant="outline" className="font-medium px-8 border-border">
              Watch Demo
            </Button>
          </div>
        </div>

        {/* Hero visual */}
        <div className="mt-16">
          <div className="rounded-xl border border-border bg-warm-gray p-8 lg:p-12 shadow-lg">
            <div className="aspect-video bg-white rounded-lg border border-border flex items-center justify-center">
              <div className="text-center">
                <Trophy className="w-24 h-24 text-forest-green/20 mx-auto mb-4" />
                <p className="text-muted-foreground text-sm">Live tournament dashboard</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16 bg-warm-gray/30">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-semibold mb-3 text-foreground">Everything You Need</h2>
          <p className="text-lg text-muted-foreground">Complete tournament management in one platform</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="border border-border bg-white p-6 hover:shadow-md transition-shadow">
                <div className="p-2.5 rounded-lg bg-soft-lime/20 w-fit mb-4">
                  <Icon className="w-5 h-5 text-forest-green" />
                </div>
                <h3 className="text-base font-semibold mb-2 text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-16">
        <Card className="border border-border bg-warm-gray p-12 lg:p-16 text-center">
          <h2 className="text-3xl lg:text-4xl font-semibold mb-4 text-foreground">Ready to Get Started?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join hundreds of tennis clubs and organizers using GameSet to manage their tournaments
          </p>
          <Button
            size="lg"
            className="bg-forest-green text-white hover:bg-forest-green-light font-medium px-8"
            onClick={() => navigate("/auth")}
          >
            Start Your Free Trial
          </Button>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-white py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2026 GameSet. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
