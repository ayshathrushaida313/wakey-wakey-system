import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { MetricCard } from "@/components/MetricCard";
import { Activity, Eye, Timer, Wind, Camera, Volume2, Phone, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/live")({
  component: Live,
  head: () => ({
    meta: [
      { title: "Live Monitoring · DriveAware" },
      { name: "description", content: "Real-time camera feed with eye tracking and drowsiness alerts." },
    ],
  }),
});

function Live() {
  const [ear, setEar] = useState(0.28);
  const [blink, setBlink] = useState(15);
  const [closedFor, setClosedFor] = useState(0);
  const [status, setStatus] = useState<"awake" | "drowsy" | "sleeping">("awake");

  useEffect(() => {
    const id = setInterval(() => {
      const e = +(0.18 + Math.random() * 0.18).toFixed(2);
      setEar(e);
      setBlink(12 + Math.floor(Math.random() * 8));
      setClosedFor(e < 0.21 ? (c => c + 1) as unknown as number : 0);
      setStatus(e < 0.20 ? "sleeping" : e < 0.24 ? "drowsy" : "awake");
    }, 1500);
    return () => clearInterval(id);
  }, []);

  const isAlert = status !== "awake";

  return (
    <AppShell title="Live Monitoring" subtitle="Camera feed · facial landmark tracking" status={isAlert ? "alert" : "monitoring"}>
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Camera feed */}
        <div className="lg:col-span-2">
          <div className={`relative aspect-video overflow-hidden rounded-2xl border-2 ${isAlert ? "border-destructive shadow-glow" : "border-border"} bg-black shadow-card`}>
            {/* Mock camera */}
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-800 to-black" />
            <div className="absolute inset-0 opacity-30 animate-scanline" style={{
              background: "linear-gradient(180deg, transparent, oklch(0.70 0.25 350 / 0.4), transparent)",
              height: "20%",
            }} />

            {/* Face silhouette */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <div className="h-56 w-44 rounded-[50%] bg-gradient-to-b from-zinc-700 to-zinc-800 opacity-70" />
                {/* Detection box */}
                <div className={`absolute -inset-4 border-2 rounded-xl ${isAlert ? "border-destructive animate-alert-flash" : "border-primary"}`}>
                  <div className={`absolute -top-7 left-0 px-2 py-0.5 rounded-md text-xs font-bold ${isAlert ? "bg-destructive text-destructive-foreground" : "bg-primary text-primary-foreground"}`}>
                    FACE · 98%
                  </div>
                </div>
                {/* Eye landmarks */}
                <div className="absolute top-20 left-8 h-3 w-8 rounded-full border-2 border-primary" />
                <div className="absolute top-20 right-8 h-3 w-8 rounded-full border-2 border-primary" />
              </div>
            </div>

            {/* Overlay HUD */}
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur px-3 py-1 text-xs font-medium text-white">
                <span className="h-2 w-2 rounded-full bg-destructive animate-pulse" /> REC
              </span>
              <span className="rounded-full bg-black/60 backdrop-blur px-3 py-1 text-xs font-mono text-white">
                1080p · 30fps
              </span>
            </div>

            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
              <div className={`rounded-xl backdrop-blur px-4 py-3 ${
                status === "awake" ? "bg-success/20 text-success" :
                status === "drowsy" ? "bg-warning/20 text-warning" :
                "bg-destructive/20 text-destructive"
              }`}>
                <div className="text-[10px] uppercase tracking-widest opacity-80">Status</div>
                <div className="font-display text-2xl font-bold">
                  {status === "awake" ? "AWAKE ✅" : status === "drowsy" ? "DROWSY ⚠️" : "SLEEPING 🚨"}
                </div>
              </div>
              <div className="rounded-xl bg-black/60 backdrop-blur px-4 py-2 text-white text-xs font-mono">
                EAR: {ear.toFixed(2)}
              </div>
            </div>

            {isAlert && status === "sleeping" && (
              <div className="absolute inset-0 flex items-center justify-center bg-destructive/40 backdrop-blur-sm animate-alert-flash">
                <div className="text-center">
                  <AlertTriangle className="h-16 w-16 text-white mx-auto mb-2 animate-pulse" />
                  <div className="font-display text-5xl font-bold text-white tracking-tight">WAKE UP!</div>
                  <div className="mt-2 text-white/90">Pull over safely.</div>
                </div>
              </div>
            )}
          </div>

          {/* Camera controls */}
          <div className="mt-4 flex flex-wrap gap-2">
            <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow">
              <Camera className="h-4 w-4" /> Switch Camera
            </button>
            <button className="inline-flex items-center gap-2 rounded-xl bg-muted hover:bg-secondary px-4 py-2.5 text-sm font-semibold transition-colors">
              <Volume2 className="h-4 w-4" /> Test Alert
            </button>
            <button className="inline-flex items-center gap-2 rounded-xl bg-muted hover:bg-secondary px-4 py-2.5 text-sm font-semibold transition-colors">
              <Phone className="h-4 w-4" /> Send to Telegram
            </button>
          </div>
        </div>

        {/* Side panel */}
        <div className="space-y-4">
          <MetricCard icon={Eye} label="Eye Aspect Ratio" value={ear.toFixed(2)} hint={ear < 0.21 ? "Below threshold" : "Normal"} tone={ear < 0.21 ? "destructive" : "success"} />
          <MetricCard icon={Activity} label="Blink Rate" value={`${blink}/min`} hint="Last 60 seconds" tone="primary" />
          <MetricCard icon={Timer} label="Eyes Closed" value={`${closedFor}s`} hint="Continuous" tone={closedFor > 2 ? "destructive" : "default"} />
          <MetricCard icon={Wind} label="Yawning" value="2x" hint="In last 5 min" tone="warning" />
        </div>
      </div>
    </AppShell>
  );
}
