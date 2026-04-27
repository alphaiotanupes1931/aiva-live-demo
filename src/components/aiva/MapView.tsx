import { MapPin } from "lucide-react";

/**
 * Lightweight static map illustration. Renders street grid, block fills,
 * a highlighted route segment and a pin — clean Google Maps-inspired look
 * without any external API calls.
 */
interface MapViewProps {
  label?: string;
  className?: string;
  height?: number;
}

export const MapView = ({ label, className, height = 180 }: MapViewProps) => {
  return (
    <div
      className={`relative w-full rounded-xl overflow-hidden border border-border bg-[#E8EEF4] ${className ?? ""}`}
      style={{ height }}
      role="img"
      aria-label={label ? `Map showing ${label}` : "Map"}
    >
      <svg viewBox="0 0 300 180" className="w-full h-full block" preserveAspectRatio="xMidYMid slice">
        {/* base */}
        <rect width="300" height="180" fill="#E8EEF4" />

        {/* parks / blocks */}
        <rect x="12" y="14" width="60" height="44" fill="#D6E7CF" rx="3" />
        <rect x="220" y="120" width="68" height="48" fill="#D6E7CF" rx="3" />
        <rect x="80" y="14" width="56" height="44" fill="#F0EFE9" rx="2" />
        <rect x="144" y="14" width="64" height="44" fill="#F0EFE9" rx="2" />
        <rect x="216" y="14" width="72" height="44" fill="#F0EFE9" rx="2" />
        <rect x="12" y="66" width="60" height="46" fill="#F0EFE9" rx="2" />
        <rect x="80" y="66" width="56" height="46" fill="#F0EFE9" rx="2" />
        <rect x="144" y="66" width="64" height="46" fill="#F0EFE9" rx="2" />
        <rect x="216" y="66" width="72" height="46" fill="#F0EFE9" rx="2" />
        <rect x="12" y="120" width="60" height="48" fill="#F0EFE9" rx="2" />
        <rect x="80" y="120" width="56" height="48" fill="#F0EFE9" rx="2" />
        <rect x="144" y="120" width="64" height="48" fill="#F0EFE9" rx="2" />

        {/* river */}
        <path
          d="M -10 150 C 60 130, 110 170, 180 150 S 280 140, 320 160 L 320 200 L -10 200 Z"
          fill="#BDD6E8"
          opacity="0.7"
        />

        {/* streets */}
        <g stroke="#FFFFFF" strokeLinecap="round">
          <line x1="0" y1="60" x2="300" y2="60" strokeWidth="6" />
          <line x1="0" y1="114" x2="300" y2="114" strokeWidth="6" />
          <line x1="76" y1="0" x2="76" y2="180" strokeWidth="5" />
          <line x1="140" y1="0" x2="140" y2="180" strokeWidth="5" />
          <line x1="212" y1="0" x2="212" y2="180" strokeWidth="5" />
        </g>
        <g stroke="#FFFFFF" strokeLinecap="round" opacity="0.7">
          <line x1="0" y1="30" x2="300" y2="30" strokeWidth="2" />
          <line x1="40" y1="0" x2="40" y2="180" strokeWidth="2" />
          <line x1="180" y1="0" x2="180" y2="180" strokeWidth="2" />
          <line x1="260" y1="0" x2="260" y2="180" strokeWidth="2" />
        </g>

        {/* highlighted route */}
        <path
          d="M 30 150 L 76 150 L 76 114 L 168 114 L 168 88"
          fill="none"
          stroke="hsl(var(--aiva-blue))"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.9"
        />
        <path
          d="M 30 150 L 76 150 L 76 114 L 168 114 L 168 88"
          fill="none"
          stroke="hsl(var(--aiva-blue))"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="2 5"
          opacity="0.5"
        />

        {/* origin dot */}
        <circle cx="30" cy="150" r="5" fill="hsl(var(--aiva-success))" stroke="white" strokeWidth="2" />
      </svg>

      {/* pin overlay */}
      <div
        className="absolute"
        style={{ left: "calc(56% - 12px)", top: "calc(45% - 28px)" }}
        aria-hidden
      >
        <div className="relative">
          <div className="w-6 h-6 rounded-full bg-aiva-blue-deep text-white flex items-center justify-center shadow-lg ring-4 ring-white">
            <MapPin className="w-3.5 h-3.5" fill="white" />
          </div>
          <div className="absolute left-1/2 -translate-x-1/2 top-5 w-2 h-2 bg-aiva-blue-deep rotate-45 shadow" />
        </div>
      </div>

      {/* attribution */}
      <div className="absolute bottom-1 right-2 text-[9px] text-foreground/50 bg-white/60 backdrop-blur-sm px-1.5 py-0.5 rounded">
        Map preview
      </div>
    </div>
  );
};
