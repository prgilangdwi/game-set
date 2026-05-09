import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Layout } from "@/components/layout/Layout";
import { LandingPage } from "@/pages/LandingPage";
import { AuthPage } from "@/pages/AuthPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { TournamentsPage } from "@/pages/TournamentsPage";
import { TournamentDetailPage } from "@/pages/TournamentDetailPage";
import { CreateTournamentPage } from "@/pages/CreateTournamentPage";
import { SchedulePage } from "@/pages/SchedulePage";
import { PlayersPage } from "@/pages/PlayersPage";
import { LeaderboardPage } from "@/pages/LeaderboardPage";
import { LiveScoreboardPage } from "@/pages/LiveScoreboardPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { CommunityPage } from "@/pages/CommunityPage";
import { PublicTournamentPage } from "@/pages/PublicTournamentPage";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen text-muted-foreground">Loading…</div>;
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-muted-foreground text-sm">Loading GameSet…</div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
      <Route path="/auth" element={user ? <Navigate to="/dashboard" replace /> : <AuthPage />} />
      <Route path="/t/:slug" element={<PublicTournamentPage />} />

      {/* Protected routes with sidebar layout */}
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/tournaments" element={<TournamentsPage />} />
        <Route path="/tournaments/new" element={<CreateTournamentPage />} />
        <Route path="/tournaments/:id" element={<TournamentDetailPage />} />
        <Route path="/tournaments/:id/schedule" element={<SchedulePage />} />
        <Route path="/tournaments/:id/scoreboard" element={<LiveScoreboardPage />} />
        <Route path="/players" element={<PlayersPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/profile/:userId" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
