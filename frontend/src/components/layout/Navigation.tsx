import { NavLink, useNavigate, Link } from "react-router-dom";
import {
  Home, Trophy, BarChart3, Users, Settings, LogOut, Plus, UsersRound,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/dashboard",   label: "Home",        icon: Home },
  { to: "/tournaments", label: "Match Ups",   icon: Trophy },
  { to: "/leaderboard", label: "Leaderboard", icon: BarChart3 },
  { to: "/community",   label: "Community",   icon: UsersRound },
];

function SidebarNavItem({ to, label, icon: Icon, onClick }: {
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

function DesktopSidebar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate("/");
  }

  return (
    <aside className="hidden lg:flex flex-col w-60 border-r border-border bg-white p-5 h-screen sticky top-0 shrink-0">
      <div className="mb-6 px-1">
        <div className="flex items-center gap-2">
          <Trophy className="w-6 h-6 text-forest-green" />
          <span className="text-xl font-semibold text-foreground">GameSet</span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 ml-8">Racquet Sports Platform</p>
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map((item) => (
          <SidebarNavItem key={item.to} {...item} />
        ))}
        <SidebarNavItem to="/players" label="Players" icon={Users} />
      </nav>

      <a
        href="https://saweria.co/kuribohcharm"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-3 py-2 mb-2 rounded-lg bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors"
      >
        <span className="text-base leading-none">☕</span>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-amber-700">Support on Saweria</p>
          <p className="text-[10px] text-amber-600/80 truncate">saweria.co/kuribohcharm</p>
        </div>
      </a>

      <div className="border-t border-border pt-4 space-y-1">
        <SidebarNavItem to="/settings" label="Settings" icon={Settings} />
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
    </aside>
  );
}

function MobileHeader() {
  return (
    <header className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-white sticky top-0 z-40">
      <div className="flex items-center gap-2">
        <Trophy className="w-5 h-5 text-forest-green" />
        <span className="text-lg font-semibold text-foreground">GameSet</span>
      </div>
      <a
        href="https://saweria.co/kuribohcharm"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors"
      >
        <span className="text-sm leading-none">☕</span>
        <span className="text-xs font-semibold text-amber-700">Support</span>
      </a>
    </header>
  );
}

function MobileBottomNav() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const bottomItems = [
    { to: "/dashboard",   label: "Home",     icon: Home },
    { to: "/tournaments", label: "Matches",  icon: Trophy },
    { to: "/leaderboard", label: "Standings", icon: BarChart3 },
    { to: `/profile/${user?.id ?? "me"}`, label: "Profile", icon: Users },
  ];

  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-white border-t border-border"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-center justify-around h-14 px-2">
        {/* Left two items */}
        {bottomItems.slice(0, 2).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors min-w-[52px]",
                isActive ? "text-forest-green" : "text-muted-foreground"
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={cn("w-5 h-5", isActive && "stroke-[2.5]")} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}

        {/* FAB — center */}
        <button
          onClick={() => navigate("/tournaments/new")}
          className="flex items-center justify-center w-14 h-14 -mt-5 rounded-full bg-forest-green text-white shadow-lg shadow-forest-green/30 active:scale-95 transition-transform"
          aria-label="Create match up"
        >
          <Plus className="w-6 h-6" />
        </button>

        {/* Right two items */}
        {bottomItems.slice(2).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors min-w-[52px]",
                isActive ? "text-forest-green" : "text-muted-foreground"
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={cn("w-5 h-5", isActive && "stroke-[2.5]")} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export function Navigation() {
  return (
    <>
      <DesktopSidebar />
      <MobileHeader />
      <MobileBottomNav />
    </>
  );
}
