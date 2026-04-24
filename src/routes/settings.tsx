import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Volume2, Mic, Send, Camera } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
  head: () => ({
    meta: [
      { title: "Settings · DriveAware" },
      { name: "description", content: "Configure alerts, sensitivity, and integrations." },
    ],
  }),
});

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={`relative h-6 w-11 rounded-full transition-colors ${on ? "bg-gradient-primary" : "bg-muted"}`}
    >
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-background transition-transform ${on ? "translate-x-5" : "translate-x-0.5"}`} />
    </button>
  );
}

function SettingsPage() {
  const [sound, setSound] = useState(true);
  const [voice, setVoice] = useState(true);
  const [tg, setTg] = useState(false);
  const [sensitivity, setSensitivity] = useState(70);

  const items = [
    { icon: Volume2, label: "Sound alert", desc: "Audible beep on detection", val: sound, set: setSound },
    { icon: Mic, label: "Voice alert", desc: '"Wake up, please take a break"', val: voice, set: setVoice },
    { icon: Send, label: "Telegram alert", desc: "Send incident messages to your bot", val: tg, set: setTg },
  ];

  return (
    <AppShell title="Settings" subtitle="Tune detection and notifications">
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-3xl border border-border bg-gradient-card p-6 shadow-card">
          <h3 className="font-display text-lg font-semibold mb-1">Notifications</h3>
          <p className="text-xs text-muted-foreground mb-4">How you get notified during a drive</p>
          <div className="space-y-3">
            {items.map((it) => (
              <div key={it.label} className="flex items-center gap-4 rounded-xl bg-muted/40 p-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <it.icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold">{it.label}</div>
                  <div className="text-xs text-muted-foreground">{it.desc}</div>
                </div>
                <Toggle on={it.val} onChange={it.set} />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-gradient-card p-6 shadow-card">
          <h3 className="font-display text-lg font-semibold mb-1">Detection</h3>
          <p className="text-xs text-muted-foreground mb-4">Tune the model to your eyes</p>

          <div className="rounded-xl bg-muted/40 p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-sm font-semibold">Sensitivity</div>
                <div className="text-xs text-muted-foreground">Higher = more alerts</div>
              </div>
              <div className="font-display text-xl font-bold text-primary">{sensitivity}</div>
            </div>
            <input
              type="range" min={0} max={100} value={sensitivity}
              onChange={(e) => setSensitivity(+e.target.value)}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-[10px] uppercase tracking-wider text-muted-foreground mt-1">
              <span>Relaxed</span><span>Strict</span>
            </div>
          </div>

          <div className="rounded-xl bg-muted/40 p-4">
            <div className="flex items-center gap-3 mb-3">
              <Camera className="h-4 w-4 text-primary" />
              <div className="text-sm font-semibold">Camera</div>
            </div>
            <select className="w-full rounded-lg bg-background border border-border px-3 py-2 text-sm">
              <option>FaceTime HD Camera (built-in)</option>
              <option>Logitech C920</option>
              <option>External USB Cam</option>
            </select>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
