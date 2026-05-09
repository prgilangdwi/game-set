import { useState } from "react";
import { LandingPage } from "./components/LandingPage";
import { AuthPage } from "./components/AuthPage";
import { Navigation } from "./components/Navigation";
import { Dashboard } from "./components/Dashboard";
import { TournamentWizard } from "./components/TournamentWizard";
import { LiveScoreboard } from "./components/LiveScoreboard";
import { StandingsTable } from "./components/StandingsTable";

type Page = "landing" | "auth" | "dashboard" | "tournaments" | "schedule" | "leaderboard" | "players" | "settings" | "create-tournament" | "live-scoreboard";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("landing");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleAuth = () => {
    setIsAuthenticated(true);
    setCurrentPage("dashboard");
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page as Page);
  };

  const leaderboardStandings = [
    { rank: 1, player: "Emma Watson", played: 12, wins: 10, losses: 2, points: 124, trend: "up" as const },
    { rank: 2, player: "Lucas Chen", played: 12, wins: 9, losses: 3, points: 118, trend: "same" as const },
    { rank: 3, player: "Sofia Rodriguez", played: 11, wins: 8, losses: 3, points: 112, trend: "up" as const },
    { rank: 4, player: "James Park", played: 12, wins: 7, losses: 5, points: 98, trend: "down" as const },
    { rank: 5, player: "Oliver Smith", played: 11, wins: 7, losses: 4, points: 95, trend: "up" as const },
    { rank: 6, player: "Mia Johnson", played: 12, wins: 6, losses: 6, points: 88, trend: "same" as const },
    { rank: 7, player: "Noah Williams", played: 11, wins: 6, losses: 5, points: 86, trend: "up" as const },
    { rank: 8, player: "Ava Brown", played: 12, wins: 5, losses: 7, points: 78, trend: "down" as const },
    { rank: 9, player: "Liam Davis", played: 10, wins: 5, losses: 5, points: 72, trend: "up" as const },
    { rank: 10, player: "Isabella Garcia", played: 11, wins: 4, losses: 7, points: 65, trend: "down" as const },
  ];

  if (!isAuthenticated && currentPage === "landing") {
    return (
      <LandingPage
        onGetStarted={() => setCurrentPage("auth")}
        onLogin={() => setCurrentPage("auth")}
      />
    );
  }

  if (!isAuthenticated && currentPage === "auth") {
    return (
      <AuthPage
        onAuth={handleAuth}
        onBack={() => setCurrentPage("landing")}
      />
    );
  }

  return (
    <div className="flex min-h-screen bg-white">
      <Navigation currentPage={currentPage} onNavigate={handleNavigate} />

      <main className="flex-1 overflow-auto">
        {currentPage === "dashboard" && <Dashboard onNavigate={handleNavigate} />}

        {currentPage === "create-tournament" && (
          <TournamentWizard
            onComplete={() => setCurrentPage("dashboard")}
            onBack={() => setCurrentPage("dashboard")}
          />
        )}

        {currentPage === "live-scoreboard" && <LiveScoreboard />}

        {currentPage === "leaderboard" && (
          <div className="p-5 lg:p-8 space-y-6 bg-warm-gray/30 min-h-screen">
            <div>
              <h1 className="text-3xl font-semibold mb-2 text-foreground">Leaderboard</h1>
              <p className="text-muted-foreground text-sm">Current tournament rankings and player statistics</p>
            </div>
            <StandingsTable standings={leaderboardStandings} />
          </div>
        )}

        {currentPage === "tournaments" && (
          <div className="p-5 lg:p-8 bg-warm-gray/30 min-h-screen">
            <h1 className="text-3xl font-semibold text-foreground">Tournaments</h1>
            <p className="text-muted-foreground mt-2 text-sm">View and manage all your tournaments</p>
          </div>
        )}

        {currentPage === "schedule" && (
          <div className="p-5 lg:p-8 bg-warm-gray/30 min-h-screen">
            <h1 className="text-3xl font-semibold text-foreground">Schedule</h1>
            <p className="text-muted-foreground mt-2 text-sm">View upcoming matches and court assignments</p>
          </div>
        )}

        {currentPage === "players" && (
          <div className="p-5 lg:p-8 bg-warm-gray/30 min-h-screen">
            <h1 className="text-3xl font-semibold text-foreground">Players</h1>
            <p className="text-muted-foreground mt-2 text-sm">Manage player profiles and statistics</p>
          </div>
        )}

        {currentPage === "settings" && (
          <div className="p-5 lg:p-8 bg-warm-gray/30 min-h-screen">
            <h1 className="text-3xl font-semibold text-foreground">Settings</h1>
            <p className="text-muted-foreground mt-2 text-sm">Configure your tournament preferences</p>
          </div>
        )}
      </main>
    </div>
  );
}