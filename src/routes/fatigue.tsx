import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export const Route = createFileRoute("/fatigue")({
  component: Fatigue,
  head: () => ({
    meta: [
      { title: "Fatigue Score · DriveAware" },
      { name: "description", content: "Driver fatigue score breakdown across the week." },
    ],
  }),
});

const score = 72;
const week = [
  { d: "Mon", v: 32 }, { d: "Tue", v: 41 }, { d: "Wed", v: 28 },
  { d: "Thu", v: 55 }, { d: "Fri", v: 64 }, { d: "Sat", v: 72 }, { d: "Sun", v: 48 },
];

function Fatigue() {
  const tone = score > 70 ? "destructive" : score > 40 ? "warning" : "success";
  const label = score > 70 ? "Critical" : score > 40 ? "Risky" : "Safe";
  const colorVar = tone === "destructive" ? "oklch(0.65 0.26 25)" : tone === "warning" ? "oklch(0.80 0.17 80)" : "oklch(0.72 0.18 150)";

  return (
    <AppShell title="Fatigue Score" subtitle="Composite signal from EAR, blinks, yawning, and head pose">
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-1 rounded-3xl border border-border bg-gradient-card p-8 shadow-card flex flex-col items-center text-center">
          <div className="relative h-48 w-48">
            <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
              <circle cx="50" cy="50" r="42" stroke="oklch(0.28 0.02 280)" strokeWidth="8" fill="none" />
              <circle
                cx="50" cy="50" r="42"
                stroke={colorVar}
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${(score / 100) * 264} 264`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="font-display text-5xl font-bold">{score}</div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground">/ 100</div>
            </div>
          </div>
          <div className={`mt-4 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
            tone === "destructive" ? "bg-destructive/15 text-destructive" :
            tone === "warning" ? "bg-warning/15 text-warning" :
            "bg-success/15 text-success"
          }`}>
            ⚠️ {label}
          </div>
          <p className="mt-3 text-sm text-muted-foreground max-w-xs">
            Your fatigue is rising. Consider taking a 15-minute break before continuing your drive.
          </p>
        </div>

        <div className="lg:col-span-2 rounded-3xl border border-border bg-gradient-card p-6 shadow-card">
          <h3 className="font-display text-lg font-semibold">Weekly trend</h3>
          <p className="text-xs text-muted-foreground mb-4">Average daily fatigue score</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={week}>
                <CartesianGrid stroke="oklch(0.28 0.02 280)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="d" stroke="oklch(0.65 0.02 280)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(0.65 0.02 280)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "oklch(0.20 0.015 280)",
                    border: "1px solid oklch(0.28 0.02 280)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="v" fill="oklch(0.70 0.25 350)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: "Eye closure duration", value: "1.4s avg", pct: 65 },
          { label: "Blink frequency", value: "12/min", pct: 80 },
          { label: "Yawning events", value: "5 today", pct: 45 },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-gradient-card p-5 shadow-card">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</div>
            <div className="mt-2 font-display text-2xl font-bold">{s.value}</div>
            <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-gradient-primary" style={{ width: `${s.pct}%` }} />
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
