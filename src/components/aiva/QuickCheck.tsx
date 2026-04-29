import { useState } from "react";
import { AlertTriangle, Ruler, Globe, CheckCircle2, ChevronDown } from "lucide-react";

type CheckKey = "hazmat" | "oversized" | "international" | "none";

const HAZMAT_ITEMS = [
  "Lithium batteries (loose or in devices)",
  "Aerosols and pressurized containers",
  "Flammable liquids (perfume, nail polish, lighter fluid)",
  "Explosives or fireworks",
  "Corrosive substances (bleach, drain cleaner)",
  "Compressed gas cylinders",
  "Toxic or infectious materials",
  "Marijuana or cannabis products",
];

const OVERSIZED_ITEMS = [
  `Larger than 24" x 16" x 12"`,
  "Heavier than 70 lbs",
  `Longer than 108" in combined length and girth`,
  `Tubes longer than 36"`,
];

const INTERNATIONAL_ITEMS = [
  "Any address outside the United States and its territories",
  "Packages going to APO, FPO, or DPO military addresses",
  "U.S. territories like Puerto Rico, Guam, and U.S. Virgin Islands are domestic — not international",
  "International packages require a customs declaration form (PS Form 2976 or 2976-A)",
  "A postal clerk must verify contents and accept the package — this SOPO can't process them",
];

type CardProps = {
  icon: React.ReactNode;
  label: string;
  selected: boolean;
  onToggle: () => void;
  expanded?: boolean;
  onExpand?: () => void;
  items?: string[];
  expandable: boolean;
};

const CheckCard = ({ icon, label, selected, onToggle, expanded, onExpand, items, expandable }: CardProps) => (
  <div className={`transition-colors ${selected ? "bg-aiva-navy/[0.04]" : "bg-white"}`}>
    <button
      onClick={onToggle}
      className="w-full flex items-center gap-3 p-4 text-left"
    >
      <div className="shrink-0">{icon}</div>
      <div className="flex-1 text-sm font-semibold text-aiva-navy leading-snug">{label}</div>
      {expandable && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onExpand?.();
          }}
          className="shrink-0 w-8 h-8 rounded-full hover:bg-aiva-bot-bg/40 flex items-center justify-center transition"
          aria-label={expanded ? "Hide details" : "Show details"}
        >
          <ChevronDown
            className={`w-5 h-5 text-aiva-navy transition-transform ${expanded ? "rotate-180" : ""}`}
          />
        </button>
      )}
      {!expandable && selected && (
        <div className="shrink-0 w-5 h-5 rounded-full bg-aiva-navy flex items-center justify-center">
          <CheckCircle2 className="w-4 h-4 text-white" />
        </div>
      )}
    </button>
    {expandable && expanded && items && (
      <div className="px-4 pb-4 pt-0 -mt-1">
        <ul className="space-y-1.5 border-t border-border pt-3">
          {items.map((item) => (
            <li key={item} className="text-[13px] text-foreground/75 leading-relaxed flex gap-2">
              <span className="text-muted-foreground shrink-0">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    )}
  </div>
);

export type QuickCheckResult = "none" | "hazmat" | "oversized" | "international" | "multiple";

export const QuickCheck = ({
  onContinue,
  onBack,
}: {
  onContinue: (result: QuickCheckResult) => void;
  onBack: () => void;
}) => {
  const [selected, setSelected] = useState<Set<CheckKey>>(new Set());
  const [expanded, setExpanded] = useState<Set<CheckKey>>(new Set());

  const toggle = (key: CheckKey) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        if (key === "none") {
          next.clear();
          next.add("none");
        } else {
          next.delete("none");
          next.add(key);
        }
      }
      return next;
    });
  };

  const toggleExpand = (key: CheckKey) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const canContinue = selected.size > 0;

  const handleContinue = () => {
    if (selected.has("none")) { onContinue("none"); return; }
    const restrictions = (["hazmat", "oversized", "international"] as const).filter((k) => selected.has(k));
    if (restrictions.length > 1) onContinue("multiple");
    else if (restrictions.length === 1) onContinue(restrictions[0]);
    else onContinue("none");
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-aiva-page anim-slide-right">
      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-4 scrollbar-hide">
        <h1 className="text-xl font-bold text-aiva-navy mb-1.5">Quick check before you start</h1>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          A few items can't be processed at this SOPO. Tap any that apply to your package.
        </p>
        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden divide-y divide-border">
          <CheckCard
            icon={
              <div className="w-10 h-10 rounded-full bg-aiva-error/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-aiva-error" />
              </div>
            }
            label="My package contains hazardous materials"
            selected={selected.has("hazmat")}
            onToggle={() => toggle("hazmat")}
            expanded={expanded.has("hazmat")}
            onExpand={() => toggleExpand("hazmat")}
            items={HAZMAT_ITEMS}
            expandable
          />
          <CheckCard
            icon={
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <Ruler className="w-5 h-5 text-amber-600" />
              </div>
            }
            label="My package is oversized"
            selected={selected.has("oversized")}
            onToggle={() => toggle("oversized")}
            expanded={expanded.has("oversized")}
            onExpand={() => toggleExpand("oversized")}
            items={OVERSIZED_ITEMS}
            expandable
          />
          <CheckCard
            icon={
              <div className="w-10 h-10 rounded-full bg-aiva-blue-deep/10 flex items-center justify-center">
                <Globe className="w-5 h-5 text-aiva-blue-deep" />
              </div>
            }
            label="My package is going to an international address"
            selected={selected.has("international")}
            onToggle={() => toggle("international")}
            expanded={expanded.has("international")}
            onExpand={() => toggleExpand("international")}
            items={INTERNATIONAL_ITEMS}
            expandable
          />
          <CheckCard
            icon={
              <div className="w-10 h-10 rounded-full bg-aiva-success/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-aiva-success" />
              </div>
            }
            label="None of these apply"
            selected={selected.has("none")}
            onToggle={() => toggle("none")}
            expandable={false}
          />
        </div>
      </div>
      <div className="px-5 pb-5 pt-2 space-y-2 shrink-0 bg-aiva-page">
        <button
          onClick={handleContinue}
          disabled={!canContinue}
          className="w-full h-12 rounded-full bg-aiva-navy text-white font-semibold text-sm hover:bg-aiva-navy/90 transition active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continue
        </button>
        <button
          onClick={onBack}
          className="w-full h-12 rounded-full bg-white text-aiva-navy font-semibold text-sm border-2 border-aiva-navy hover:bg-aiva-navy/5 transition active:scale-[0.99]"
        >
          Back
        </button>
      </div>
    </div>
  );
};

export const StaffedPORedirect = ({
  reason,
  onDirections,
  onBack,
}: {
  reason: "hazmat" | "oversized" | "international" | "multiple";
  onDirections: () => void;
  onBack: () => void;
}) => {
  const config = {
    hazmat: {
      title: "Hazardous materials can't be shipped here",
      subtitle:
        "This SOPO is unstaffed and can't accept hazardous materials. You'll need to bring this package to a staffed Post Office where a postal worker can verify and accept it.",
    },
    oversized: {
      title: "Your package is too big for this SOPO",
      subtitle:
        "This SOPO can only accept packages within standard size limits. Here's the nearest staffed Post Office where larger packages can be processed.",
    },
    international: {
      title: "International packages need a staffed Post Office",
      subtitle:
        "International shipments require customs forms and clerk verification, which this SOPO can't provide. Here's the nearest staffed Post Office that ships internationally.",
    },
    multiple: {
      title: "This package needs a staffed Post Office",
      subtitle:
        "Based on what you selected, your package needs a staffed Post Office where a postal worker can verify and accept it.",
    },
  }[reason];

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-aiva-page anim-slide-right">
      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-4 scrollbar-hide">
        <h1 className="text-xl font-bold text-aiva-navy mb-1.5">{config.title}</h1>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">{config.subtitle}</p>
        <div className="bg-white border border-border rounded-2xl p-4 shadow-sm space-y-3">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
              Nearest staffed Post Office
            </div>
            <div className="text-sm font-semibold text-aiva-navy leading-snug">Vienna Post Office</div>
            <div className="text-[13px] text-foreground/75 leading-relaxed">
              301 Center St S, Vienna, VA 22180
            </div>
          </div>
          <div className="border-t border-border pt-3 grid grid-cols-2 gap-3">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
                Distance
              </div>
              <div className="text-sm font-semibold text-aiva-navy">2.3 mi</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
                Hours today
              </div>
              <div className="text-sm font-semibold text-aiva-navy">9 AM – 5 PM</div>
            </div>
          </div>
        </div>
      </div>
      <div className="px-5 pb-5 pt-2 space-y-2 shrink-0 bg-aiva-page">
        <button
          onClick={onDirections}
          className="w-full h-12 rounded-full bg-aiva-navy text-white font-semibold text-sm hover:bg-aiva-navy/90 transition active:scale-[0.99]"
        >
          Get directions
        </button>
        <button
          onClick={onBack}
          className="w-full h-12 rounded-full bg-white text-aiva-navy font-semibold text-sm border-2 border-aiva-navy hover:bg-aiva-navy/5 transition active:scale-[0.99]"
        >
          Back
        </button>
      </div>
    </div>
  );
};
