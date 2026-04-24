import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import {
  Line,
  LineChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";

export const Route = createFileRoute("/history")({
  component: History,
  head: () => ({
    meta: [
      { title: "Reports · DriveAware" },
      { name: "description", content: "Driving sessions and detection trends over time." },
    ],
  }),
});

const data = Array.from({ length: 14 }, (_, i) => ({
  day: `D${i + 1}`,
  fatigue: 20 + Math.round(Math.sin(i / 2) * 20 + Math.random() * 10),
  blinks: 12 + Math.round(Math.cos(i / 3) * 4 + Math.random() * 3),
}));

const sessions = [
  { date: "25 Apr 2026", duration: "3h 22m", alerts: 4, score: 68 },
  { date: "24 Apr 2026", duration: "1h 45m", alerts: 1, score: 32 },
  { date: "23 Apr 2026", duration: "5h 10m", alerts: 7, score: 81 },
  { date: "22 Apr 2026", duration: "2h 02m", alerts: 2, score: 41 },
];

function History() {
  return (
    <AppShell title="Reports & History" subtitle="Two-week analytics overview">
      <div className="rounded-3xl border border-border bg-gradient-card p-6 shadow-card mb-6">
        <h3 className="font-display text-lg font-semibold">Fatigue vs blink trends</h3>
        <p className="text-xs text-muted-foreground mb-4">Last 14 days</p>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid stroke="oklch(0.28 0.02 280)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" stroke="oklch(0.65 0.02 280)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="oklch(0.65 0.02 280)" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  background: "oklch(0.20 0.015 280)",
                  border: "1px solid oklch(0.28 0.02 280)",
                  borderRadius: 12,
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="fatigue" stroke="oklch(0.70 0.25 350)" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="blinks" stroke="oklch(0.70 0.20 220)" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-gradient-card shadow-card overflow-hidden">
        <div className="p-5 border-b border-border">
          <h3 className="font-display text-lg font-semibold">Recent sessions</h3>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left px-5 py-3 font-medium">Date</th>
              <th className="text-left px-5 py-3 font-medium">Duration</th>
              <th className="text-left px-5 py-3 font-medium">Alerts</th>
              <th className="text-left px-5 py-3 font-medium">Avg Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sessions.map((s) => (
              <tr key={s.date} className="hover:bg-muted/30 transition-colors">
                <td className="px-5 py-3.5 font-medium">{s.date}</td>
                <td className="px-5 py-3.5 text-muted-foreground">{s.duration}</td>
                <td className="px-5 py-3.5">{s.alerts}</td>
                <td className="px-5 py-3.5">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    s.score > 70 ? "bg-destructive/15 text-destructive" :
                    s.score > 40 ? "bg-warning/15 text-warning" :
                    "bg-success/15 text-success"
                  }`}>
                    {s.score}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
