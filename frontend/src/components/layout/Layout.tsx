import { Outlet } from "react-router-dom";
import { Navigation } from "./Navigation";

export function Layout() {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-white">
      <Navigation />
      <main className="flex-1 overflow-auto min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
