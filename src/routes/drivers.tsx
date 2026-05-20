import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Search, UserPlus, Phone, Mail } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/drivers")({
  component: Drivers,
  head: () => ({
    meta: [
      { title: "Drivers · DriveAware" },
      { name: "description", content: "Manage drivers monitored by DriveAware." },
    ],
  }),
});

type Driver = {
  id: string;
  name: string;
  age: number;
  license: string;
  phone: string;
  email: string;
  status: "Active" | "On Break" | "Offline";
  fatigue: number;
};

const drivers: Driver[] = [
  { id: "02841", name: "Aysha", age: 29, license: "DL-IN-029481", phone: "+91 98xxxx 12 34", email: "aysha@driveaware.app", status: "Active", fatigue: 42 },
  { id: "02842", name: "Rahul Verma", age: 35, license: "DL-IN-118274", phone: "+91 99xxxx 22 18", email: "rahul.v@driveaware.app", status: "Active", fatigue: 67 },
  { id: "02843", name: "Priya Singh", age: 31, license: "DL-IN-552310", phone: "+91 90xxxx 87 11", email: "priya.s@driveaware.app", status: "On Break", fatigue: 23 },
  { id: "02844", name: "Karthik Iyer", age: 42, license: "DL-IN-883920", phone: "+91 91xxxx 65 04", email: "k.iyer@driveaware.app", status: "Offline", fatigue: 0 },
];

const statusTone = {
  Active: "bg-success/15 text-success border-success/30",
  "On Break": "bg-warning/15 text-warning border-warning/30",
  Offline: "bg-muted text-muted-foreground border-border",
} as const;

function Drivers() {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return drivers;
    return drivers.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.id.includes(q) ||
        d.license.toLowerCase().includes(q) ||
        d.status.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <AppShell title="Drivers" subtitle={`${filtered.length} of ${drivers.length} drivers`}>
      <div className="rounded-2xl border border-border bg-gradient-card shadow-card overflow-hidden">
        <div className="flex flex-col gap-3 p-5 border-b border-border md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search drivers by name, ID, license…"
              className="w-full rounded-lg bg-muted/60 border border-border pl-9 pr-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow">
            <UserPlus className="h-4 w-4" /> Add Driver
          </button>
        </div>

        <div className="divide-y divide-border">
          {filtered.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">No drivers match your search.</div>
          ) : (
            filtered.map((d) => (
              <div key={d.id} className="flex flex-wrap items-center gap-4 p-4 hover:bg-muted/40 transition-colors">
                <div className="h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center text-sm font-bold text-primary-foreground shrink-0">
                  {d.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </div>
                <div className="flex-1 min-w-[180px]">
                  <div className="font-semibold text-sm">{d.name} <span className="text-muted-foreground font-normal">· {d.age}y</span></div>
                  <div className="text-xs text-muted-foreground">ID {d.id} · {d.license}</div>
                </div>
                <div className="hidden md:flex flex-col text-xs text-muted-foreground gap-0.5">
                  <span className="inline-flex items-center gap-1.5"><Phone className="h-3 w-3" />{d.phone}</span>
                  <span className="inline-flex items-center gap-1.5"><Mail className="h-3 w-3" />{d.email}</span>
                </div>
                <div className="text-center">
                  <div className="text-xs text-muted-foreground">Fatigue</div>
                  <div className={`font-display text-lg font-bold ${d.fatigue >= 55 ? "text-destructive" : d.fatigue >= 25 ? "text-warning" : "text-success"}`}>
                    {d.status === "Offline" ? "—" : d.fatigue}
                  </div>
                </div>
                <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${statusTone[d.status]}`}>
                  {d.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}
