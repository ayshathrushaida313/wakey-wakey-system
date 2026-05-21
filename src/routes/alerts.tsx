import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { AlertTriangle, Eye, Filter, Search, X } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/alerts")({
  component: Alerts,
  head: () => ({
    meta: [
      { title: "Alerts · DriveAware" },
      { name: "description", content: "History of drowsiness alerts and incident severity." },
    ],
  }),
});

const rows = [
  { time: "10:32 PM", driver: "Aysha", type: "Drowsiness", icon: Eye, severity: "High", color: "warning" },
  { time: "10:35 PM", driver: "Rahul Verma", type: "Eyes Closed", icon: Eye, severity: "Critical", color: "destructive" },
  
  { time: "10:58 PM", driver: "Priya Singh", type: "Head Tilt", icon: AlertTriangle, severity: "Medium", color: "warning" },
  { time: "11:14 PM", driver: "Rahul Verma", type: "Drowsiness", icon: Eye, severity: "High", color: "warning" },
  { time: "11:20 PM", driver: "Aysha", type: "Sleeping", icon: AlertTriangle, severity: "Critical", color: "destructive" },
] as const;

const colorMap = {
  success: "bg-success/15 text-success border-success/30",
  warning: "bg-warning/15 text-warning border-warning/30",
  destructive: "bg-destructive/15 text-destructive border-destructive/30",
} as const;

const severityFilters = ["All", "Critical", "High", "Medium", "Low"] as const;
type SeverityFilter = (typeof severityFilters)[number];

function Alerts() {
  const [query, setQuery] = useState("");
  const [severity, setSeverity] = useState<SeverityFilter>("All");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      const matchesQ =
        !q ||
        r.driver.toLowerCase().includes(q) ||
        r.type.toLowerCase().includes(q) ||
        r.severity.toLowerCase().includes(q);
      const matchesSev = severity === "All" || r.severity === severity;
      return matchesQ && matchesSev;
    });
  }, [query, severity]);

  return (
    <AppShell title="Alert History" subtitle={`${filtered.length} of ${rows.length} events`}>
      <div className="rounded-2xl border border-border bg-gradient-card shadow-card overflow-hidden">
        <div className="flex flex-col gap-4 p-5 border-b border-border md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="font-display text-lg font-semibold">Today's incidents</h3>
            <p className="text-xs text-muted-foreground">Search by driver, type, or severity</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search driver…"
                className="w-full sm:w-64 rounded-lg bg-muted/60 border border-border pl-9 pr-9 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <div className="inline-flex items-center gap-1 rounded-lg bg-muted/60 p-1">
              <Filter className="h-3.5 w-3.5 text-muted-foreground ml-2" />
              {severityFilters.map((s) => (
                <button
                  key={s}
                  onClick={() => setSeverity(s)}
                  className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                    severity === s
                      ? "bg-primary text-primary-foreground shadow-glow"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="divide-y divide-border">
          {filtered.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">
              No alerts match your search.
            </div>
          ) : (
            filtered.map((r, i) => (
              <div key={i} className="flex items-center gap-4 p-4 hover:bg-muted/40 transition-colors">
                <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
                  <r.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm">{r.type}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    Driver: <span className="text-foreground/80">{r.driver}</span> · front camera
                  </div>
                </div>
                <div className="text-xs font-mono text-muted-foreground hidden sm:block">{r.time}</div>
                <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${colorMap[r.color]}`}>
                  {r.severity}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}
