import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Trophy, Users, BarChart3, Zap, ChevronRight, ChevronDown,
  UserPlus, Settings2, Play, Activity, Share2, HelpCircle,
} from "lucide-react";

const btnYellow = "bg-lime-green text-forest-green font-bold hover:bg-[#b8cc30]";

// ── How It Works steps ───────────────────────────────────────────────────────

const HOW_STEPS = [
  {
    n: 1,
    label: "Create Your Account",
    desc: "Sign up free in seconds — no credit card needed.",
    icon: UserPlus,
    preview: (
      <div className="space-y-2">
        <div className="h-7 w-24 rounded bg-forest-green/20 mx-auto" />
        <div className="h-4 w-32 rounded bg-muted mx-auto" />
        <div className="h-8 w-full rounded-lg bg-forest-green mt-3 flex items-center justify-center">
          <span className="text-white text-[10px] font-semibold">Sign In / Sign Up</span>
        </div>
        <div className="h-8 w-full rounded-lg border border-border flex items-center justify-center">
          <span className="text-[10px] text-muted-foreground">Continue with Google</span>
        </div>
      </div>
    ),
  },
  {
    n: 2,
    label: "Set Up Your Match Up",
    desc: "Pick your sport, format, number of courts, and give it a name.",
    icon: Settings2,
    preview: (
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-1">
          {["🎾 Tennis", "🏸 Badminton", "🎾 Padel", "🟡 Pickleball"].map((s) => (
            <div key={s} className={`p-1.5 rounded border text-[9px] font-medium text-center ${s.startsWith("🎾 Tennis") ? "border-forest-green bg-forest-green/10 text-forest-green" : "border-border text-muted-foreground"}`}>{s}</div>
          ))}
        </div>
        <div className="h-7 w-full rounded bg-muted mt-1 flex items-center px-2">
          <span className="text-[9px] text-muted-foreground">Match Up Name…</span>
        </div>
        <div className="flex gap-1 mt-1">
          {["Americano", "Round Robin", "Mexicano"].map((f) => (
            <div key={f} className={`flex-1 text-[8px] text-center py-1 rounded border ${f === "Americano" ? "border-forest-green bg-forest-green/10 text-forest-green font-semibold" : "border-border text-muted-foreground"}`}>{f}</div>
          ))}
        </div>
      </div>
    ),
  },
  {
    n: 3,
    label: "Add Players",
    desc: "Enter player names and skill levels — mix of all levels welcome.",
    icon: Users,
    preview: (
      <div className="space-y-1.5">
        {["Alice · Advanced", "Bob · Intermediate", "Carol · Pro", "Dave · Beginner"].map((p, i) => (
          <div key={p} className="flex items-center gap-1.5 px-2 py-1 rounded border border-border bg-warm-gray">
            <div className="w-5 h-5 rounded-full bg-forest-green/20 flex items-center justify-center text-[8px] font-bold text-forest-green">{p[0]}</div>
            <span className="text-[9px] text-foreground flex-1">{p}</span>
            {i === 0 && <span className="text-[8px] text-lime-green font-semibold">✓ In</span>}
          </div>
        ))}
        <div className="h-6 w-full rounded bg-forest-green flex items-center justify-center mt-1">
          <span className="text-white text-[9px] font-semibold">+ Add Players</span>
        </div>
      </div>
    ),
  },
  {
    n: 4,
    label: "Auto-Generated Matches",
    desc: "GameSet builds the schedule instantly. Start a round, enter scores live.",
    icon: Zap,
    preview: (
      <div className="space-y-1.5">
        <div className="text-[9px] font-semibold text-muted-foreground mb-1">Round 1 · Court 1</div>
        {[["Alice / Carol", "Bob / Dave", "7", "5"], ["Eve / Frank", "Grace / Hank", "3", "9"]].map(([t1, t2, s1, s2]) => (
          <div key={t1} className="p-1.5 rounded border border-lime-green/40 bg-soft-lime/10">
            <div className="flex justify-between items-center text-[9px]">
              <span className="font-medium text-foreground">{t1}</span>
              <span className="font-bold text-forest-green tabular-nums">{s1}</span>
            </div>
            <div className="flex justify-between items-center text-[9px] mt-0.5">
              <span className="text-muted-foreground">{t2}</span>
              <span className="font-bold tabular-nums">{s2}</span>
            </div>
          </div>
        ))}
        <div className="h-1 w-3/4 bg-lime-green rounded-full mx-auto mt-1 animate-pulse" />
      </div>
    ),
  },
  {
    n: 5,
    label: "Track Scores & Share",
    desc: "Leaderboards update instantly. Share a live link with all players.",
    icon: Share2,
    preview: (
      <div className="space-y-1.5">
        <div className="text-[9px] font-semibold text-muted-foreground mb-1">Standings</div>
        {[["1", "Alice", "32 pts", "3W"], ["2", "Carol", "28 pts", "2W"], ["3", "Bob", "21 pts", "1W"]].map(([rank, name, pts, w]) => (
          <div key={name} className="flex items-center gap-1.5 px-2 py-1 rounded bg-warm-gray border border-border">
            <span className="text-[9px] font-bold text-muted-foreground w-3">{rank}</span>
            <span className="text-[9px] font-medium flex-1">{name}</span>
            <span className="text-[9px] text-forest-green font-semibold">{pts}</span>
            <span className="text-[8px] text-muted-foreground">{w}</span>
          </div>
        ))}
        <div className="h-6 w-full rounded border border-forest-green/40 flex items-center justify-center gap-1 mt-1">
          <Share2 className="w-2.5 h-2.5 text-forest-green" />
          <span className="text-[9px] text-forest-green font-medium">Share Results</span>
        </div>
      </div>
    ),
  },
];

// ── FAQ ───────────────────────────────────────────────────────────────────────

const FAQS = [
  {
    q: "Is GameSet free to use?",
    a: "Yes, completely free. Create an account, set up as many match ups as you like, and invite unlimited players — no credit card required.",
  },
  {
    q: "What sports does GameSet support?",
    a: "Tennis, Badminton, Padel, and Pickleball. Each sport has its own match types and scoring options tailored to the sport.",
  },
  {
    q: "What is Americano format?",
    a: "In Americano, partners rotate every round so everyone plays with and against each other. Rankings are based on total points scored across all matches — perfect for social events.",
  },
  {
    q: "What is Mexicano format?",
    a: "Mexicano is like Americano but with skill-based matchmaking after each round. Players with similar scores are matched together, making every round more competitive as the event progresses.",
  },
  {
    q: "How many players do I need to start?",
    a: "You need at least 4 players to generate the first round. There's no maximum — GameSet scales to any size.",
  },
  {
    q: "Can players view the tournament without an account?",
    a: "Yes! When you mark a match up as Public, anyone with the share link can view matches, scores, and standings in real time — no account needed.",
  },
  {
    q: "How does the live scoreboard work?",
    a: "The scoreboard updates in real time using Supabase Realtime. As soon as you enter or save a score on any device, everyone viewing the tournament sees the change instantly.",
  },
  {
    q: "How do I contact support?",
    a: "Email us at pr.gilangdwi@gmail.com and we'll get back to you as soon as possible.",
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border last:border-0">
      <button
        className="w-full flex items-center justify-between py-4 text-left gap-3"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="font-medium text-foreground text-sm">{q}</span>
        <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <p className="text-sm text-muted-foreground pb-4 leading-relaxed pr-6">{a}</p>
      )}
    </div>
  );
}

// ── Features ──────────────────────────────────────────────────────────────────

const features = [
  { icon: Trophy,    title: "Americano & Mexicano",  description: "Auto-schedule rotating partners every round — the true Americano/Mexicano experience." },
  { icon: Users,     title: "Mixed Doubles",         description: "Smart team mixing so everyone plays with and against different people every round." },
  { icon: BarChart3, title: "Live Standings",        description: "Leaderboards update the moment a score is entered — visible to all players instantly." },
  { icon: Activity,  title: "Real-time Scoreboard",  description: "A live scoreboard page synced via Supabase Realtime. Open it on a TV or projector." },
  { icon: Zap,       title: "Score in Seconds",      description: "Enter match results from any phone or tablet. Changes propagate instantly." },
  { icon: Share2,    title: "Share with One Link",   description: "Public match up link — players see live scores & standings without an account." },
];

// ── Component ─────────────────────────────────────────────────────────────────

export function LandingPage() {
  const navigate = useNavigate();

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="absolute top-0 left-0 right-0 z-20 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-lime-green" />
          <span className="text-xl font-bold text-white tracking-tight">GameSet</span>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <button onClick={() => scrollTo("how-it-works")} className="text-white/80 hover:text-white text-sm font-medium transition-colors">How It Works</button>
          <button onClick={() => scrollTo("faq")} className="text-white/80 hover:text-white text-sm font-medium transition-colors">FAQ</button>
          <a href="mailto:pr.gilangdwi@gmail.com" className="text-white/80 hover:text-white text-sm font-medium transition-colors">Help</a>
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" className="text-white hover:text-white hover:bg-white/15 hidden sm:flex" onClick={() => navigate("/auth")}>
            Sign In
          </Button>
          <Button className={`${btnYellow} px-5`} onClick={() => navigate("/auth")}>
            Get Started
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative h-screen min-h-[600px] flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1920&q=80"
            alt="Racquet sports court aerial view"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-forest-green/75 via-forest-green/60 to-black/80" />
        </div>

        <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/90 text-sm mb-8">
            <span className="w-2 h-2 rounded-full bg-lime-green" />
            🎾 🏸 🟡 Racquet Sports Platform
          </div>
          <h1 className="text-5xl lg:text-7xl font-bold text-white mb-5 leading-tight tracking-tight">
            Game, Set,{" "}
            <span className="text-lime-green">Match.</span>
          </h1>
          <p className="text-xl text-white/75 mb-10 leading-relaxed">
            The easiest way to organize and play racquet sports with friends — Tennis, Badminton, Padel &amp; Pickleball.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Button size="lg" className={`${btnYellow} px-8 text-base`} onClick={() => navigate("/auth")}>
              Start Playing →
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-transparent border-white/40 text-white hover:bg-white/15 hover:text-white font-medium px-8 text-base"
              onClick={() => scrollTo("how-it-works")}
            >
              How It Works
            </Button>
          </div>
          <p className="mt-5 text-white/50 text-sm">Free forever · No credit card needed</p>
        </div>

        <div className="absolute bottom-8 left-0 right-0 flex justify-center">
          <div className="w-5 h-8 rounded-full border-2 border-white/30 flex justify-center pt-1.5">
            <div className="w-1 h-2 bg-white/50 rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-[#f0f4f8]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-3">Simple Way to Use GameSet</h2>
            <p className="text-muted-foreground text-lg">Up and running in under 2 minutes</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 max-w-6xl mx-auto">
            {HOW_STEPS.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.n} className="flex flex-col items-center text-center">
                  {/* Phone frame */}
                  <div className="w-44 bg-white rounded-2xl border-2 border-border shadow-md overflow-hidden mb-4">
                    {/* Phone notch */}
                    <div className="h-5 bg-gray-900 flex items-center justify-center">
                      <div className="w-12 h-2 rounded-full bg-gray-700" />
                    </div>
                    {/* Header bar */}
                    <div className="flex items-center gap-1.5 px-2 py-1.5 border-b border-border bg-warm-gray/50">
                      <Trophy className="w-3 h-3 text-forest-green" />
                      <span className="text-[9px] font-semibold text-foreground">GameSet</span>
                    </div>
                    {/* Content preview */}
                    <div className="p-2.5">
                      {step.preview}
                    </div>
                  </div>

                  {/* Step number + label */}
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 rounded-full bg-forest-green flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {step.n}
                    </div>
                    <Icon className="w-4 h-4 text-forest-green" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">{step.label}</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-warm-gray/40">
        <div className="container mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-3">Built for Racquet Sports</h2>
            <p className="text-muted-foreground text-lg">Everything you need to run a great tournament</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="bg-white rounded-xl border border-border p-6 hover:shadow-md transition-shadow group">
                  <div className="w-10 h-10 rounded-lg bg-forest-green/10 flex items-center justify-center mb-4 group-hover:bg-lime-green/20 transition-colors">
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

      {/* CTA */}
      <section className="relative py-28 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=1920&q=80"
            alt="Players in action"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-forest-green/85" />
        </div>
        <div className="relative z-10 container mx-auto px-6 text-center">
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4">Ready to play?</h2>
          <p className="text-white/75 text-lg mb-8 max-w-md mx-auto">
            Set up your first tournament in under a minute — free, no hassle.
          </p>
          <Button size="lg" className={`${btnYellow} px-10 text-base`} onClick={() => navigate("/auth")}>
            Start Now <ChevronRight className="w-5 h-5 ml-1" />
          </Button>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 bg-white">
        <div className="container mx-auto px-6 max-w-2xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-3">Frequently Asked Questions</h2>
            <p className="text-muted-foreground">Can't find your answer? <a href="mailto:pr.gilangdwi@gmail.com" className="text-forest-green hover:underline font-medium">Email us</a></p>
          </div>
          <div className="bg-white rounded-2xl border border-border shadow-sm px-6">
            {FAQS.map((f) => <FaqItem key={f.q} q={f.q} a={f.a} />)}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-forest-green py-10">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-lime-green" />
              <span className="text-white font-bold text-lg">GameSet</span>
              <span className="text-white/40 text-sm ml-2">· Racquet Sports Platform</span>
            </div>
            <div className="flex flex-wrap items-center gap-6 text-sm">
              <button onClick={() => scrollTo("how-it-works")} className="text-white/70 hover:text-white transition-colors">How It Works</button>
              <button onClick={() => scrollTo("faq")} className="text-white/70 hover:text-white transition-colors">FAQ</button>
              <a href="https://saweria.co/kuribohcharm" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white transition-colors">☕ Support</a>
              <a href="mailto:pr.gilangdwi@gmail.com" className="flex items-center gap-1.5 text-white/70 hover:text-white transition-colors">
                <HelpCircle className="w-3.5 h-3.5" />Help
              </a>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-white/10 text-center text-white/40 text-xs">
            © 2026 GameSet · Made with ❤️ for racquet sports lovers
          </div>
        </div>
      </footer>
    </div>
  );
}
