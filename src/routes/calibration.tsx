import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Eye, EyeOff, CheckCircle2, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/calibration")({
  component: Calibration,
  head: () => ({
    meta: [
      { title: "Calibration · DriveAware" },
      { name: "description", content: "Calibrate the eye-aspect-ratio model to your face." },
    ],
  }),
});

type Phase = "intro" | "open" | "close" | "done";

function Calibration() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [count, setCount] = useState(5);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (phase === "intro" || phase === "done") return;
    setCount(5);
    setProgress(0);
    const id = setInterval(() => {
      setCount((c) => {
        const n = c - 1;
        setProgress(((5 - n) / 5) * 100);
        if (n <= 0) {
          clearInterval(id);
          setPhase((p) => (p === "open" ? "close" : "done"));
        }
        return n;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [phase]);

  const reset = () => setPhase("intro");

  return (
    <AppShell title="Eye Calibration" subtitle="One-time setup for accurate detection">
      <div className="max-w-3xl mx-auto">
        <div className="rounded-3xl border border-border bg-gradient-card p-8 shadow-card">
          {/* Stepper */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {(["intro", "open", "close", "done"] as Phase[]).map((p, i) => {
              const order = ["intro", "open", "close", "done"];
              const active = order.indexOf(phase) >= i;
              return (
                <div key={p} className="flex items-center gap-2">
                  <div className={`h-2.5 w-2.5 rounded-full ${active ? "bg-primary shadow-glow" : "bg-muted"}`} />
                  {i < 3 && <div className={`h-px w-12 ${active ? "bg-primary" : "bg-muted"}`} />}
                </div>
              );
            })}
          </div>

          {phase === "intro" && (
            <div className="text-center">
              <div className="mx-auto h-24 w-24 rounded-3xl bg-gradient-primary flex items-center justify-center shadow-glow mb-4">
                <Eye className="h-10 w-10 text-primary-foreground" />
              </div>
              <h2 className="font-display text-3xl font-bold">Let's calibrate your eyes</h2>
              <p className="mt-2 text-muted-foreground max-w-md mx-auto">
                We'll measure your natural eye openness so DriveAware can detect drowsiness accurately.
              </p>
              <button
                onClick={() => setPhase("open")}
                className="mt-6 rounded-xl bg-gradient-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow hover:scale-105 transition-transform"
              >
                Start Calibration
              </button>
            </div>
          )}

          {(phase === "open" || phase === "close") && (
            <div className="text-center">
              <div className={`mx-auto h-32 w-32 rounded-full flex items-center justify-center animate-pulse-ring ${
                phase === "open" ? "bg-success/20 text-success" : "bg-primary/20 text-primary"
              }`}>
                {phase === "open" ? <Eye className="h-14 w-14" /> : <EyeOff className="h-14 w-14" />}
              </div>
              <h2 className="mt-6 font-display text-2xl font-bold">
                {phase === "open" ? "Keep your eyes OPEN" : "Now CLOSE your eyes"}
              </h2>
              <p className="text-muted-foreground text-sm">Hold steady and look at the camera</p>

              <div className="mt-8 max-w-sm mx-auto">
                <div className="font-display text-7xl font-bold text-gradient-primary">{count}</div>
                <div className="mt-4 h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-gradient-primary transition-all duration-1000" style={{ width: `${progress}%` }} />
                </div>
              </div>
            </div>
          )}

          {phase === "done" && (
            <div className="text-center">
              <div className="mx-auto h-24 w-24 rounded-full bg-success/20 text-success flex items-center justify-center mb-4">
                <CheckCircle2 className="h-12 w-12" />
              </div>
              <h2 className="font-display text-3xl font-bold">Calibration complete</h2>
              <p className="mt-2 text-muted-foreground">
                Baseline EAR: <span className="font-mono text-foreground">0.31</span> · Threshold: <span className="font-mono text-foreground">0.21</span>
              </p>
              <button
                onClick={reset}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-muted hover:bg-secondary px-5 py-2.5 text-sm font-semibold transition-colors"
              >
                <RotateCcw className="h-4 w-4" /> Recalibrate
              </button>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
