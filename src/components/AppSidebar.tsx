import { Link, useLocation } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Camera,
  BellRing,
  Activity,
  History,
  Settings,
  SlidersHorizontal,
  Eye,
} from "lucide-react";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/live", label: "Live Monitoring", icon: Camera },
  { to: "/alerts", label: "Alerts", icon: BellRing },
  { to: "/fatigue", label: "Fatigue Score", icon: Activity },
  { to: "/history", label: "Reports", icon: History },
  { to: "/calibration", label: "Calibration", icon: SlidersHorizontal },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppSidebar() {
  const { pathname } = useLocation();

  return (
    <aside className="hidden lg:flex fixed inset-y-0 left-0 z-30 w-[260px] flex-col bg-sidebar border-r border-sidebar-border">
      <div className="px-6 py-6 border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-3">
          <div className="relative h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
            <Eye className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <div className="font-display text-lg font-bold tracking-tight text-sidebar-foreground">
              DriveAware
            </div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Drowsiness AI
            </div>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {nav.map((item) => {
          const active =
            item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                active
                  ? "bg-gradient-primary text-primary-foreground shadow-glow"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
              {active && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary-foreground" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-sidebar-border">
        <div className="rounded-xl bg-sidebar-accent p-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-gradient-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
              AS
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold truncate text-sidebar-foreground">
                Aarav Sharma
              </div>
              <div className="text-xs text-muted-foreground truncate">
                Driver · ID 02841
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
