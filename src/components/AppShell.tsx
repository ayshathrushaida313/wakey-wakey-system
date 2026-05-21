import { type ReactNode, useState } from "react";
import { AppSidebar } from "./AppSidebar";
import { Bell, Menu, Search } from "lucide-react";

export function AppShell({
  children,
  title,
  subtitle,
  status = "monitoring",
}: {
  children: ReactNode;
  title: string;
  subtitle?: string;
  status?: "monitoring" | "idle" | "alert";
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const statusMap = {
    monitoring: { label: "Live", color: "bg-success" },
    idle: { label: "Idle", color: "bg-muted-foreground" },
    alert: { label: "Alert", color: "bg-destructive" },
  } as const;
  const s = statusMap[status];

  return (
    <div className="min-h-screen">
      <AppSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-[260px]">
        <header className="sticky top-0 z-20 backdrop-blur-xl bg-background/70 border-b border-border">
          <div className="flex items-center gap-4 px-6 lg:px-8 h-16">
            <button
              type="button"
              aria-label="Open sidebar"
              onClick={() => setSidebarOpen(true)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-muted hover:bg-secondary transition-colors lg:hidden"
            >
              <Menu className="h-4 w-4" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <h1 className="font-display text-lg font-semibold truncate">
                  {title}
                </h1>
                <span className="hidden md:inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-0.5 text-xs">
                  <span className={`h-1.5 w-1.5 rounded-full ${s.color} ${status === "monitoring" ? "animate-pulse" : ""}`} />
                  {s.label}
                </span>
              </div>
              {subtitle && (
                <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
              )}
            </div>
            <div className="ml-auto flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5 text-sm text-muted-foreground w-64">
                <Search className="h-4 w-4" />
                <span className="text-xs">Search alerts, drivers…</span>
              </div>
              <button className="relative h-9 w-9 rounded-lg bg-muted hover:bg-secondary flex items-center justify-center transition-colors">
                <Bell className="h-4 w-4" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary animate-pulse" />
              </button>
            </div>
          </div>
        </header>
        <main className="px-6 lg:px-8 py-8">{children}</main>
      </div>
    </div>
  );
}
