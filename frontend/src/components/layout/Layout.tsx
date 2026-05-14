import { Outlet } from "react-router-dom";
import { Navigation } from "./Navigation";
import { HelpCircle } from "lucide-react";

export function Layout() {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-white">
      <Navigation />
      <main className="flex-1 overflow-auto min-w-0 pb-16 lg:pb-0">
        <Outlet />
      </main>

      {/* Floating help button — every authenticated page */}
      <a
        href="mailto:pr.gilangdwi@gmail.com?subject=GameSet%20Support"
        className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-50 flex items-center gap-2 px-3 py-2 rounded-full bg-forest-green text-white shadow-lg hover:bg-forest-green-light transition-all group"
        aria-label="Help"
      >
        <HelpCircle className="w-4 h-4 shrink-0" />
        <span className="text-xs font-semibold max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap">
          Need help?
        </span>
      </a>
    </div>
  );
}
