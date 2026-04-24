import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { AlertTriangle, Eye, Wind, Filter } from "lucide-react";

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
  { time: "10:32 PM", type: "Drowsiness", icon: Eye, severity: "High", color: "warning" },
  { time: "10:35 PM", type: "Eyes Closed", icon: Eye, severity: "Critical", color: "destructive" },
  { time: "10:41 PM", type: "Yawning", icon: Wind, severity: "Low", color: "success" },
  { time: "10:58 PM", type: "Head Tilt", icon: AlertTriangle, severity: "Medium", color: "warning" },
  { time: "11:14 PM", type: "Drowsiness", icon: Eye, severity: "High", color: "warning" },
  { time: "11:20 PM", type: "Sleeping", icon: AlertTriangle, severity: "Critical", color: "destructive" },
] as const;

const colorMap = {
  success: "bg-success/15 text-success border-success/30",
  warning: "bg-warning/15 text-warning border-warning/30",
  destructive: "bg-destructive/15 text-destructive border-destructive/30",
} as const;

function Alerts() {
  return (
    <AppShell title="Alert History" subtitle="6 events recorded today">
      <div className="rounded-2xl border border-border bg-gradient-card shadow-card overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <h3 className="font-display text-lg font-semibold">Today's incidents</h3>
            <p className="text-xs text-muted-foreground">Sorted by latest</p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-lg bg-muted hover:bg-secondary px-3 py-1.5 text-xs font-medium transition-colors">
            <Filter className="h-3.5 w-3.5" /> Filter
          </button>
        </div>
        <div className="divide-y divide-border">
          {rows.map((r, i) => (
            <div key={i} className="flex items-center gap-4 p-4 hover:bg-muted/40 transition-colors">
              <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
                <r.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm">{r.type}</div>
                <div className="text-xs text-muted-foreground">Detected on front camera</div>
              </div>
              <div className="text-xs font-mono text-muted-foreground hidden sm:block">{r.time}</div>
              <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${colorMap[r.color]}`}>
                {r.severity}
              </span>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
