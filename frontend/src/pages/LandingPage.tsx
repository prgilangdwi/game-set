import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Trophy, Users, Calendar, BarChart3, Zap, ChevronRight } from "lucide-react";

const features = [
  { icon: Trophy, title: "Americano Format", description: "Auto-schedule rotating partners every round for a true Americano experience." },
  { icon: Users, title: "Mixed Doubles", description: "Smart team mixing so everyone plays with and against different people." },
  { icon: Calendar, title: "Round Robin", description: "Full draws generated instantly — just add players and go." },
  { icon: BarChart3, title: "Live Standings", description: "Leaderboards update the moment a score is entered." },
  { icon: Zap, title: "Score in Seconds", description: "Enter match results from any device, changes propagate instantly." },
];

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Floating nav over hero */}
      <header className="absolute top-0 left-0 right-0 z-20 px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-tennis-ball-green" />
          <span className="text-xl font-bold text-white tracking-tight">GameSet</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            className="text-white/90 hover:text-white hover:bg-white/10"
            onClick={() => navigate("/auth")}
          >
            Sign In
          </Button>
          <Button
            className="bg-tennis-ball-green text-forest-green font-bold hover:opacity-90"
            onClick={() => navigate("/auth")}
          >
            Get Started
          </Button>
        </div>
      </header>

      {/* Hero — full screen with tennis court photo */}
      <section className="relative h-screen min-h-[600px] flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1920&q=80"
            alt="Tennis court aerial view"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-forest-green/75 via-forest-green/60 to-black/80" />
        </div>

        <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/90 text-sm mb-8">
            <span className="w-2 h-2 rounded-full bg-tennis-ball-green" />
            Tennis Tournament Platform
          </div>
          <h1 className="text-5xl lg:text-7xl font-bold text-white mb-5 leading-tight tracking-tight">
            Game, Set,{" "}
            <span className="text-tennis-ball-green">Match.</span>
          </h1>
          <p className="text-xl text-white/75 mb-10 leading-relaxed">
            Organize Americano and round-robin tournaments, track live scores, and manage your tennis events — all in one place.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Button
              size="lg"
              className="bg-tennis-ball-green text-forest-green hover:opacity-90 font-bold px-8 text-base"
              onClick={() => navigate("/auth")}
            >
              Create a Tournament
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 font-medium px-8 text-base"
              onClick={() => navigate("/auth")}
            >
              Sign In
            </Button>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center">
          <div className="w-5 h-8 rounded-full border-2 border-white/30 flex justify-center pt-1.5">
            <div className="w-1 h-2 bg-white/50 rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-warm-gray/40">
        <div className="container mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-3">Built for Tennis</h2>
            <p className="text-muted-foreground text-lg">Everything you need to run a great tournament</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="bg-white rounded-xl border border-border p-6 hover:shadow-md transition-shadow group"
                >
                  <div className="w-10 h-10 rounded-lg bg-forest-green/10 flex items-center justify-center mb-4 group-hover:bg-tennis-ball-green/20 transition-colors">
                    <Icon className="w-5 h-5 text-forest-green" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Action photo + CTA */}
      <section className="relative py-28 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=1920&q=80"
            alt="Tennis match in action"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-forest-green/85" />
        </div>
        <div className="relative z-10 container mx-auto px-6 text-center">
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4">Ready to play?</h2>
          <p className="text-white/75 text-lg mb-8 max-w-md mx-auto">
            Set up your first tournament in under a minute — no credit card, no hassle.
          </p>
          <Button
            size="lg"
            className="bg-tennis-ball-green text-forest-green hover:opacity-90 font-bold px-10 text-base"
            onClick={() => navigate("/auth")}
          >
            Start Now <ChevronRight className="w-5 h-5 ml-1" />
          </Button>
        </div>
      </section>

      <footer className="bg-white border-t border-border py-8">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          © 2026 GameSet · Tennis Tournament Platform
        </div>
      </footer>
    </div>
  );
}
