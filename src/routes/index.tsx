import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { MetricCard } from "@/components/MetricCard";
import {
  Activity,
  AlertTriangle,
  Eye,
  Timer,
  TrendingUp,
  TrendingDown,
  Zap,
  Camera,
  ChevronRight,
  BellRing,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useEffect, useState } from "react";
import { useSession, formatDuration } from "@/lib/sessionStore";

export const Route = createFileRoute("/")({
  component: Dashboard,
  head: () => ({
    meta: [
      { title: "Dashboard · DriveAware" },
      { name: "description", content: "Real-time drowsiness detection dashboard for safer driving." },
    ],
  }),
});

const seedData = [
  { t: "08:00", score: 18 }, { t: "09:00", score: 22 },
  { t: "10:00", score: 31 }, { t: "11:00", score: 28 },
  { t: "12:00", score: 45 }, { t: "13:00", score: 52 },
  { t: "14:00", score: 61 }, { t: "15:00", score: 58 },
  { t: "16:00", score: 72 }, { t: "17:00", score: 68 },
];

function fatigueLabel(score: number) {
  if (score < 25) return { label: "Low · stay sharp", tone: "success" as const };
  if (score < 55) return { label: "Moderate · stay alert", tone: "warning" as const };
  return { label: "High · take a break", tone: "destructive" as const };
}

function Dashboard() {
  const session = useSession();
  const [now, setNow] = useState(Date.now());

  // Tick once per minute for drive time display
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  const driveTimeMs = session.startedAt ? now - session.startedAt : 0;
  const fatigue = fatigueLabel(session.fatigueScore);

  // Build chart data: use live trend if present, otherwise demo seed
  const liveTrend = session.trend.map((p) => ({
    t: new Date(p.t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    score: p.score,
  }));
  const chartData = liveTrend.length > 3 ? liveTrend : seedData;

  // Trend direction
  const trendUp =
    chartData.length >= 2 &&
    chartData[chartData.length - 1].score > chartData[0].score;

  return (
    <AppShell title="Welcome back, Aysha 👋" subtitle="Your drive is being monitored in real time">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-primary p-8 shadow-glow mb-6">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: "radial-gradient(circle at 80% 20%, white 1px, transparent 1px), radial-gradient(circle at 20% 80%, white 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }} />
        <div className="relative flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 rounded-full bg-black/30 backdrop-blur px-3 py-1 text-xs font-medium text-primary-foreground">
              <span className={`h-2 w-2 rounded-full ${session.active ? "bg-success animate-pulse" : "bg-muted-foreground"}`} />
              {session.active ? "System Active" : "System Idle"}{dateLabel ? ` · ${dateLabel}` : ""}
            </div>
            <h2 className="mt-4 font-display text-3xl md:text-4xl font-bold text-primary-foreground">
              Stay sharp, stay safe.
            </h2>
            <p className="mt-2 text-primary-foreground/80 max-w-lg">
              DriveAware is monitoring your eyes, blink rate, and head position to keep you awake on every mile.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/live" className="inline-flex items-center gap-2 rounded-xl bg-background text-foreground px-4 py-2.5 text-sm font-semibold hover:bg-card transition-colors">
                <Camera className="h-4 w-4" /> Open Live Monitor
              </Link>
              <Link to="/calibration" className="inline-flex items-center gap-2 rounded-xl bg-black/30 backdrop-blur text-primary-foreground px-4 py-2.5 text-sm font-semibold hover:bg-black/40 transition-colors">
                Calibrate <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className="md:w-64 shrink-0">
            <div className="rounded-2xl bg-black/30 backdrop-blur p-5 text-primary-foreground">
              <div className="text-xs uppercase tracking-wider opacity-80">Current Fatigue</div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-display text-5xl font-bold">{session.fatigueScore}</span>
                <span className="text-sm opacity-80">/ 100</span>
              </div>
              <div className="mt-1 text-sm font-medium">{fatigue.label}</div>
              <div className="mt-3 h-2 rounded-full bg-black/30 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    fatigue.tone === "success"
                      ? "bg-success"
                      : fatigue.tone === "warning"
                      ? "bg-warning"
                      : "bg-destructive"
                  }`}
                  style={{ width: `${session.fatigueScore}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          icon={Eye}
          label="Blink Rate"
          value={session.active ? `${session.blinkRate}/min` : "—"}
          hint={
            !session.active
              ? "Start camera"
              : session.blinkRate >= 10 && session.blinkRate <= 25
              ? "Healthy range"
              : session.blinkRate < 10
              ? "Below normal"
              : "Above normal"
          }
          tone={!session.active ? "default" : session.blinkRate >= 10 && session.blinkRate <= 25 ? "success" : "warning"}
        />
        <MetricCard
          icon={Activity}
          label="EAR"
          value={session.active ? session.ear.toFixed(2) : "—"}
          hint={!session.active ? "Start camera" : session.ear < 0.23 ? "Below threshold" : "Above threshold"}
          tone={!session.active ? "default" : session.ear < 0.23 ? "destructive" : "primary"}
        />
        <MetricCard
          icon={Timer}
          label="Drive Time"
          value={session.startedAt ? formatDuration(driveTimeMs) : "0m"}
          hint={driveTimeMs > 2 * 60 * 60 * 1000 ? "Consider a break" : "Keep going"}
          tone="default"
        />
        <MetricCard
          icon={AlertTriangle}
          label="Alerts Today"
          value={String(session.alertsToday)}
          hint={`${session.criticalToday} critical`}
          tone={session.criticalToday > 0 ? "destructive" : session.alertsToday > 0 ? "warning" : "default"}
        />
      </div>

      {/* Charts + side */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-border bg-gradient-card p-6 shadow-card">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-display text-lg font-semibold">Fatigue Trend</h3>
              <p className="text-xs text-muted-foreground">
                {liveTrend.length > 3 ? "Live session" : "Sample data — start the camera to record"}
              </p>
            </div>
            <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
              trendUp ? "bg-warning/10 text-warning" : "bg-success/10 text-success"
            }`}>
              {trendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {trendUp ? "Rising" : "Falling"}
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="fg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.70 0.25 350)" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="oklch(0.70 0.25 350)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="oklch(0.28 0.02 280)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="t" stroke="oklch(0.65 0.02 280)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(0.65 0.02 280)" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    background: "oklch(0.20 0.015 280)",
                    border: "1px solid oklch(0.28 0.02 280)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Area type="monotone" dataKey="score" stroke="oklch(0.70 0.25 350)" strokeWidth={2.5} fill="url(#fg)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-gradient-card p-6 shadow-card">
          <h3 className="font-display text-lg font-semibold">Quick Actions</h3>
          <p className="text-xs text-muted-foreground mb-4">Jump back in</p>
          <div className="space-y-2">
            {[
              { to: "/live", icon: Camera, label: "Live Monitor", desc: "Open camera feed" },
              { to: "/alerts", icon: BellRing, label: "Alert History", desc: "Review past events" },
              { to: "/calibration", icon: Zap, label: "Calibrate Eyes", desc: "Tune detection" },
            ].map((a) => (
              <Link
                key={a.to}
                to={a.to}
                className="group flex items-center gap-3 rounded-xl bg-muted/50 p-3 hover:bg-muted transition-colors"
              >
                <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <a.icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold">{a.label}</div>
                  <div className="text-xs text-muted-foreground">{a.desc}</div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
