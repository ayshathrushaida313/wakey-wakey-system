import { useSyncExternalStore } from "react";

export type SessionState = {
  active: boolean;
  startedAt: number | null;
  ear: number;
  blinkRate: number;
  blinkCount: number;
  closedFor: number;
  status: "idle" | "awake" | "drowsy" | "sleeping";
  alertsToday: number;
  criticalToday: number;
  fatigueScore: number; // 0-100
  trend: { t: number; score: number }[]; // rolling history
};

const initial: SessionState = {
  active: false,
  startedAt: null,
  ear: 0,
  blinkRate: 0,
  blinkCount: 0,
  closedFor: 0,
  status: "idle",
  alertsToday: 0,
  criticalToday: 0,
  fatigueScore: 0,
  trend: [],
};

let state: SessionState = initial;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export const sessionStore = {
  get: () => state,
  set: (patch: Partial<SessionState>) => {
    state = { ...state, ...patch };
    emit();
  },
  incAlert: (critical = false) => {
    state = {
      ...state,
      alertsToday: state.alertsToday + 1,
      criticalToday: state.criticalToday + (critical ? 1 : 0),
    };
    emit();
  },
  pushTrend: (score: number) => {
    const t = Date.now();
    const next = [...state.trend, { t, score }].slice(-60); // keep last 60 points
    state = { ...state, trend: next };
    emit();
  },
  reset: () => {
    state = { ...initial };
    emit();
  },
  subscribe: (l: () => void) => {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

export function useSession(): SessionState {
  return useSyncExternalStore(
    sessionStore.subscribe,
    sessionStore.get,
    sessionStore.get,
  );
}

export function formatDuration(ms: number): string {
  if (ms <= 0) return "0m";
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  if (h === 0) return `${m}m`;
  return `${h}h ${m.toString().padStart(2, "0")}m`;
}
