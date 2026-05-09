import { Home, Trophy, Calendar, BarChart3, Users, Settings, Menu } from "lucide-react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { useState } from "react";

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: Home },
  { id: "tournaments", label: "Tournaments", icon: Trophy },
  { id: "schedule", label: "Schedule", icon: Calendar },
  { id: "leaderboard", label: "Leaderboard", icon: BarChart3 },
  { id: "players", label: "Players", icon: Users },
];

export function Navigation({ currentPage, onNavigate }: NavigationProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const NavContent = () => (
    <>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentPage === item.id;

        return (
          <button
            key={item.id}
            onClick={() => {
              onNavigate(item.id);
              setMobileOpen(false);
            }}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-150 ${
              isActive
                ? "bg-forest-green text-white font-medium"
                : "text-muted-foreground hover:bg-warm-gray hover:text-foreground"
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-sm font-medium">{item.label}</span>
          </button>
        );
      })}

      <div className="mt-auto pt-4 border-t border-border">
        <button
          onClick={() => {
            onNavigate("settings");
            setMobileOpen(false);
          }}
          className="flex items-center gap-3 px-3 py-2.5 rounded-md text-muted-foreground hover:bg-warm-gray hover:text-foreground transition-all duration-150 w-full"
        >
          <Settings className="w-5 h-5" />
          <span className="text-sm font-medium">Settings</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-white p-5 h-screen sticky top-0">
        <div className="mb-6">
          <h1 className="text-xl font-semibold flex items-center gap-2 text-foreground">
            <Trophy className="w-6 h-6 text-forest-green" />
            GameSet
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">Tournament Platform</p>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          <NavContent />
        </nav>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden flex items-center justify-between p-4 border-b border-border bg-white sticky top-0 z-50">
        <h1 className="text-lg font-semibold flex items-center gap-2 text-foreground">
          <Trophy className="w-5 h-5 text-forest-green" />
          GameSet
        </h1>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 bg-white border-border">
            <div className="mb-6">
              <h1 className="text-xl font-semibold flex items-center gap-2 text-foreground">
                <Trophy className="w-6 h-6 text-forest-green" />
                GameSet
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">Tournament Platform</p>
            </div>

            <nav className="flex flex-col gap-1">
              <NavContent />
            </nav>
          </SheetContent>
        </Sheet>
      </header>
    </>
  );
}
