import { useState } from "react";
import { NavLink, useNavigate, Link } from "react-router-dom";
import {
  Home, Trophy, Calendar, BarChart3, Users, Settings,
  Menu, X, LogOut, ChevronRight, UsersRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: Home },
  { to: "/tournaments", label: "Match Ups", icon: Trophy },
  { to: "/leaderboard", label: "Leaderboard", icon: BarChart3 },
  { to: "/players", label: "Players", icon: Users },
  { to: "/community", label: "Community", icon: UsersRound },
];

function NavItem({ to, label, icon: Icon, onClick }: {
  to: string; label: string; icon: typeof Home; onClick?: () => void;
}) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-150 text-sm font-medium",
          isActive
            ? "bg-forest-green text-white"
            : "text-muted-foreground hover:bg-warm-gray hover:text-foreground"
        )
      }
    >
      <Icon className="w-5 h-5 shrink-0" />
      {label}
    </NavLink>
  );
}

export function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate("/");
  }

  const SidebarContent = ({ onItemClick }: { onItemClick?: () => void }) => (
    <div className="flex flex-col h-full">
      <div className="mb-6 px-1">
        <div className="flex items-center gap-2">
          <Trophy className="w-6 h-6 text-forest-green" />
          <span className="text-xl font-semibold text-foreground">GameSet</span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 ml-8">Match Up Platform</p>
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map((item) => (
          <NavItem key={item.to} {...item} onClick={onItemClick} />
        ))}
      </nav>

      <div className="border-t border-border pt-4 space-y-1">
        <NavItem to="/settings" label="Settings" icon={Settings} onClick={onItemClick} />
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-md transition-all w-full text-sm font-medium text-muted-foreground hover:bg-warm-gray hover:text-foreground"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          Sign Out
        </button>
      </div>

      {user && (
        <Link to={`/profile/${user.id}`} className="block mt-3">
          <div className="px-3 py-2 rounded-lg bg-warm-gray border border-border/50 hover:border-forest-green/30 transition-colors">
            <p className="text-xs font-medium text-foreground truncate">
              {user.user_metadata?.name || user.email}
            </p>
            <p className="text-xs text-muted-foreground truncate">View profile</p>
          </div>
        </Link>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 border-r border-border bg-white p-5 h-screen sticky top-0 shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile header */}
      <header className="lg:hidden flex items-center justify-between p-4 border-b border-border bg-white sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-forest-green" />
          <span className="text-lg font-semibold text-foreground">GameSet</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)}>
          <Menu className="w-5 h-5" />
        </Button>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-64 bg-white p-5 shadow-xl">
            <div className="flex justify-end mb-4">
              <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            <SidebarContent onItemClick={() => setMobileOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
