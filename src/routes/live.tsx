import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { MetricCard } from "@/components/MetricCard";
import {
  Activity,
  Eye,
  Timer,
  Wind,
  Camera,
  Volume2,
  Phone,
  AlertTriangle,
  Play,
  Square,
  Loader2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useFaceDetection } from "@/hooks/useFaceDetection";
import { sessionStore } from "@/lib/sessionStore";

export const Route = createFileRoute("/live")({
  component: Live,
  head: () => ({
    meta: [
      { title: "Live Monitoring · DriveAware" },
      {
        name: "description",
        content: "Real-time camera feed with eye tracking and drowsiness alerts.",
      },
    ],
  }),
});

const EAR_DROWSY = 0.23;
const EAR_SLEEP = 0.20;

function Live() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const [streaming, setStreaming] = useState(false);
  const [camError, setCamError] = useState<string | null>(null);
  const [closedFor, setClosedFor] = useState(0); // seconds eyes have been closed
  const [blinkCount, setBlinkCount] = useState(0);
  const [blinkRate, setBlinkRate] = useState(0); // per minute
  const [yawnCount] = useState(0);

  const { ready: modelReady, error: modelError, metrics } = useFaceDetection(
    videoRef,
    streaming,
  );

  // Start / stop webcam
  const startCamera = async () => {
    setCamError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: "user" },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setStreaming(true);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setCamError(msg);
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream | null;
    stream?.getTracks().forEach((t) => t.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
    setStreaming(false);
  };

  useEffect(() => () => stopCamera(), []);

  // Track eyes-closed duration (seconds)
  useEffect(() => {
    if (!streaming) return;
    const id = setInterval(() => {
      setClosedFor((c) => {
        if (metrics.faceDetected && metrics.ear > 0 && metrics.ear < EAR_DROWSY) {
          return +(c + 0.5).toFixed(1);
        }
        return 0;
      });
    }, 500);
    return () => clearInterval(id);
  }, [streaming, metrics.ear, metrics.faceDetected]);

  // Blink detection: rising edge when EAR crosses below threshold then back up
  const wasClosedRef = useRef(false);
  const blinkTimesRef = useRef<number[]>([]);
  useEffect(() => {
    if (!streaming || !metrics.faceDetected) return;
    const closedNow = metrics.ear > 0 && metrics.ear < EAR_DROWSY;
    if (closedNow && !wasClosedRef.current) {
      wasClosedRef.current = true;
    } else if (!closedNow && wasClosedRef.current) {
      wasClosedRef.current = false;
      const now = Date.now();
      // Only count short blinks (not sustained closures)
      if (closedFor < 0.7) {
        blinkTimesRef.current.push(now);
        setBlinkCount((c) => c + 1);
      }
    }
    // Update rolling 60s blink rate
    const cutoff = Date.now() - 60_000;
    blinkTimesRef.current = blinkTimesRef.current.filter((t) => t > cutoff);
    setBlinkRate(blinkTimesRef.current.length);
  }, [metrics.ear, metrics.faceDetected, streaming, closedFor]);

  // Determine status
  const status: "awake" | "drowsy" | "sleeping" = !metrics.faceDetected
    ? "awake"
    : closedFor >= 1.5 || metrics.ear < EAR_SLEEP
    ? "sleeping"
    : metrics.ear < EAR_DROWSY
    ? "drowsy"
    : "awake";

  const isAlert = status !== "awake" && metrics.faceDetected;

  // Audible alert beep when sleeping
  useEffect(() => {
    if (status !== "sleeping" || !streaming) return;
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.value = 880;
    gain.gain.value = 0.08;
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    const id = setTimeout(() => {
      osc.stop();
    }, 250);
    return () => {
      clearTimeout(id);
      try {
        osc.stop();
      } catch {
        /* noop */
      }
    };
  }, [status, streaming]);

  // Draw overlay landmarks on canvas
  useEffect(() => {
    const canvas = overlayRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = video.clientWidth;
    const h = video.clientHeight;
    canvas.width = w;
    canvas.height = h;
    ctx.clearRect(0, 0, w, h);

    if (!metrics.faceDetected || !metrics.faceBox) return;

    const { x, y, w: bw, h: bh } = metrics.faceBox;
    const px = x * w;
    const py = y * h;
    const pw = bw * w;
    const ph = bh * h;

    // Mirror x because video is mirrored
    const mx = w - px - pw;

    ctx.strokeStyle = isAlert ? "oklch(0.65 0.25 25)" : "oklch(0.70 0.25 350)";
    ctx.lineWidth = 2;
    ctx.strokeRect(mx, py, pw, ph);

    ctx.fillStyle = ctx.strokeStyle;
    ctx.font = "bold 11px ui-sans-serif, system-ui";
    ctx.fillText(`FACE · EAR ${metrics.ear.toFixed(2)}`, mx, py - 6);

    // Eye points
    const drawEye = (pts: { x: number; y: number }[] | null) => {
      if (!pts) return;
      ctx.beginPath();
      pts.forEach((p, i) => {
        const ex = w - p.x * w;
        const ey = p.y * h;
        if (i === 0) ctx.moveTo(ex, ey);
        else ctx.lineTo(ex, ey);
      });
      ctx.closePath();
      ctx.stroke();
    };
    drawEye(metrics.leftEye);
    drawEye(metrics.rightEye);
  }, [metrics, isAlert]);

  return (
    <AppShell
      title="Live Monitoring"
      subtitle="Real-time webcam · MediaPipe face mesh"
      status={isAlert ? "alert" : streaming ? "monitoring" : "monitoring"}
    >
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Camera feed */}
        <div className="lg:col-span-2">
          <div
            ref={containerRef}
            className={`relative aspect-video overflow-hidden rounded-2xl border-2 ${
              isAlert ? "border-destructive shadow-glow" : "border-border"
            } bg-black shadow-card`}
          >
            <video
              ref={videoRef}
              playsInline
              muted
              className="absolute inset-0 h-full w-full object-cover scale-x-[-1]"
            />
            <canvas
              ref={overlayRef}
              className="absolute inset-0 h-full w-full pointer-events-none"
            />

            {/* Idle state */}
            {!streaming && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-950 to-black gap-4">
                <Camera className="h-14 w-14 text-primary" />
                <div className="text-center">
                  <div className="font-display text-xl font-bold text-white">
                    Camera is off
                  </div>
                  <div className="text-sm text-white/60 mt-1">
                    {modelReady
                      ? "Press Start to begin face tracking"
                      : modelError
                      ? "Failed to load detection model"
                      : "Loading detection model..."}
                  </div>
                </div>
                <button
                  onClick={startCamera}
                  disabled={!modelReady}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-50"
                >
                  {modelReady ? (
                    <>
                      <Play className="h-4 w-4" /> Start Camera
                    </>
                  ) : (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Loading...
                    </>
                  )}
                </button>
                {camError && (
                  <div className="text-xs text-destructive max-w-md text-center px-4">
                    {camError}
                  </div>
                )}
              </div>
            )}

            {/* HUD */}
            {streaming && (
              <>
                <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur px-3 py-1 text-xs font-medium text-white">
                    <span className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
                    LIVE
                  </span>
                  <span className="rounded-full bg-black/60 backdrop-blur px-3 py-1 text-xs font-mono text-white">
                    {metrics.fps} fps
                  </span>
                  {!metrics.faceDetected && (
                    <span className="rounded-full bg-warning/80 px-3 py-1 text-xs font-semibold text-warning-foreground">
                      No face detected
                    </span>
                  )}
                </div>

                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between z-10">
                  <div
                    className={`rounded-xl backdrop-blur px-4 py-3 ${
                      status === "awake"
                        ? "bg-success/20 text-success"
                        : status === "drowsy"
                        ? "bg-warning/20 text-warning"
                        : "bg-destructive/20 text-destructive"
                    }`}
                  >
                    <div className="text-[10px] uppercase tracking-widest opacity-80">
                      Status
                    </div>
                    <div className="font-display text-2xl font-bold">
                      {status === "awake"
                        ? "AWAKE ✅"
                        : status === "drowsy"
                        ? "DROWSY ⚠️"
                        : "SLEEPING 🚨"}
                    </div>
                  </div>
                  <div className="rounded-xl bg-black/60 backdrop-blur px-4 py-2 text-white text-xs font-mono">
                    EAR: {metrics.ear.toFixed(2)}
                  </div>
                </div>

                {status === "sleeping" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-destructive/40 backdrop-blur-sm animate-alert-flash z-20 pointer-events-none">
                    <div className="text-center">
                      <AlertTriangle className="h-16 w-16 text-white mx-auto mb-2 animate-pulse" />
                      <div className="font-display text-5xl font-bold text-white tracking-tight">
                        WAKE UP!
                      </div>
                      <div className="mt-2 text-white/90">Pull over safely.</div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Camera controls */}
          <div className="mt-4 flex flex-wrap gap-2">
            {streaming ? (
              <button
                onClick={stopCamera}
                className="inline-flex items-center gap-2 rounded-xl bg-destructive px-4 py-2.5 text-sm font-semibold text-destructive-foreground shadow-glow"
              >
                <Square className="h-4 w-4" /> Stop Camera
              </button>
            ) : (
              <button
                onClick={startCamera}
                disabled={!modelReady}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-50"
              >
                <Play className="h-4 w-4" /> Start Camera
              </button>
            )}
            <button
              onClick={() => {
                const ctx =
                  audioCtxRef.current ??
                  new (window.AudioContext ||
                    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
                audioCtxRef.current = ctx;
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = "square";
                osc.frequency.value = 880;
                gain.gain.value = 0.1;
                osc.connect(gain).connect(ctx.destination);
                osc.start();
                setTimeout(() => osc.stop(), 400);
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-muted hover:bg-secondary px-4 py-2.5 text-sm font-semibold transition-colors"
            >
              <Volume2 className="h-4 w-4" /> Test Alert
            </button>
            <button className="inline-flex items-center gap-2 rounded-xl bg-muted hover:bg-secondary px-4 py-2.5 text-sm font-semibold transition-colors">
              <Phone className="h-4 w-4" /> Send to Telegram
            </button>
          </div>
        </div>

        {/* Side panel */}
        <div className="space-y-4">
          <MetricCard
            icon={Eye}
            label="Eye Aspect Ratio"
            value={metrics.ear.toFixed(2)}
            hint={
              !metrics.faceDetected
                ? "Waiting for face..."
                : metrics.ear < EAR_DROWSY
                ? "Below threshold"
                : "Normal"
            }
            tone={metrics.faceDetected && metrics.ear < EAR_DROWSY ? "destructive" : "success"}
          />
          <MetricCard
            icon={Activity}
            label="Blink Rate"
            value={`${blinkRate}/min`}
            hint={`Total: ${blinkCount}`}
            tone="primary"
          />
          <MetricCard
            icon={Timer}
            label="Eyes Closed"
            value={`${closedFor.toFixed(1)}s`}
            hint="Continuous"
            tone={closedFor > 1 ? "destructive" : "default"}
          />
          <MetricCard
            icon={Wind}
            label="Yawning"
            value={`${yawnCount}x`}
            hint="Coming soon"
            tone="warning"
          />
        </div>
      </div>
    </AppShell>
  );
}
