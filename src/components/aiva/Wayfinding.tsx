import { useState } from "react";
import { Navigation, MapPin } from "lucide-react";

interface Equip {
  id: string;
  name: string;
  zone: number;
  status: "Operational" | "Offline";
  x: number; // 0-100
  y: number;
  distance: number;
}

const EQUIP: Equip[] = [
  { id: "ssk", name: "Self-Service Kiosk", zone: 2, status: "Operational", x: 55, y: 50, distance: 12 },
  { id: "drum", name: "Drum Chute", zone: 3, status: "Offline", x: 78, y: 40, distance: 18 },
  { id: "apd", name: "Automated Parcel Drop", zone: 3, status: "Operational", x: 78, y: 65, distance: 20 },
  { id: "lockers", name: "Parcel Lockers", zone: 4, status: "Operational", x: 90, y: 80, distance: 26 },
  { id: "chute", name: "Mail Chute", zone: 1, status: "Operational", x: 30, y: 35, distance: 8 },
];

const ZONES = [
  { label: "Zone 0 · Entry", x: 5, y: 80, w: 18, h: 15 },
  { label: "Zone 1 · Prep", x: 23, y: 25, w: 22, h: 35 },
  { label: "Zone 2 · Purchase", x: 45, y: 35, w: 22, h: 40 },
  { label: "Zone 3 · Send It", x: 67, y: 30, w: 22, h: 50 },
  { label: "Zone 4 · Pickup", x: 80, y: 70, w: 18, h: 22 },
];

const ENTRY = { x: 12, y: 88 };

export const Wayfinding = () => {
  const [target, setTarget] = useState<Equip>(EQUIP[0]);

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-aiva-page anim-slide-right">
      {/* Banner */}
      <div className="bg-aiva-blue text-white px-4 py-3 flex items-center gap-3 shrink-0">
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
          <Navigation className="w-5 h-5" fill="white" />
        </div>
        <div className="flex-1">
          <div className="text-[11px] uppercase tracking-wide opacity-80">Walk to</div>
          <div className="font-semibold text-sm leading-tight">
            {target.name} · {target.distance} ft
          </div>
        </div>
      </div>

      {/* Floor plan */}
      <div className="relative flex-1 bg-[#EAEFF5] overflow-hidden">
        <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
          {ZONES.map((z) => (
            <g key={z.label}>
              <rect
                x={z.x}
                y={z.y}
                width={z.w}
                height={z.h}
                fill="white"
                stroke="#C5D2E0"
                strokeWidth="0.3"
                rx="1"
              />
            </g>
          ))}
          {/* Walking path */}
          <path
            d={`M ${ENTRY.x} ${ENTRY.y} Q ${(ENTRY.x + target.x) / 2} ${target.y + 10}, ${target.x} ${target.y}`}
            fill="none"
            stroke="hsl(var(--aiva-blue))"
            strokeWidth="1.2"
            strokeLinecap="round"
            className="walk-path"
          />
          {/* Entry dot */}
          <circle cx={ENTRY.x} cy={ENTRY.y} r="2" fill="hsl(var(--aiva-success))" />
          {/* Target dot */}
          <circle cx={target.x} cy={target.y} r="2.5" fill="hsl(var(--aiva-blue))" />
          <circle cx={target.x} cy={target.y} r="4" fill="hsl(var(--aiva-blue))" opacity="0.25" />
        </svg>

        {/* Zone labels overlay */}
        {ZONES.map((z) => (
          <div
            key={z.label}
            className="absolute text-[9px] font-medium text-muted-foreground pointer-events-none"
            style={{ left: `${z.x + 1}%`, top: `${z.y + 1}%` }}
          >
            {z.label}
          </div>
        ))}
        <div
          className="absolute text-[10px] font-semibold text-aiva-success"
          style={{ left: `${ENTRY.x - 2}%`, top: `${ENTRY.y - 8}%` }}
        >
          You
        </div>
      </div>

      {/* Bottom sheet */}
      <div className="bg-white rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.06)] p-4 shrink-0 max-h-[40%] overflow-y-auto scrollbar-hide">
        <div className="w-10 h-1 bg-border rounded-full mx-auto mb-3" />
        <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
          Equipment at this SOPO
        </div>
        <div className="space-y-2">
          {EQUIP.map((e) => {
            const active = e.id === target.id;
            return (
              <button
                key={e.id}
                onClick={() => setTarget(e)}
                className={`w-full flex items-center gap-3 p-2.5 rounded-lg border transition text-left ${
                  active ? "border-aiva-blue bg-aiva-blue/5" : "border-border hover:bg-muted/40"
                }`}
              >
                <MapPin className={`w-4 h-4 ${active ? "text-aiva-blue" : "text-muted-foreground"}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{e.name}</div>
                  <div className="text-[11px] text-muted-foreground">Zone {e.zone} · {e.distance} ft</div>
                </div>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    e.status === "Operational"
                      ? "bg-aiva-success-bg text-aiva-success"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {e.status}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
