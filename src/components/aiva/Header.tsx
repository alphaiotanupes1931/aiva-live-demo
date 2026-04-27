import { ArrowLeft, RotateCcw } from "lucide-react";

interface HeaderProps {
  onBack?: () => void;
  onRestart: () => void;
  showBack?: boolean;
}

export const Header = ({ onBack, onRestart, showBack = true }: HeaderProps) => (
  <header
    className="h-14 bg-aiva-navy text-white flex items-center justify-between px-3 shrink-0 relative z-10"
    style={{ paddingTop: "env(safe-area-inset-top)" }}
  >
    <button
      onClick={onBack}
      disabled={!showBack || !onBack}
      aria-label="Back"
      className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/10 disabled:opacity-0 transition"
    >
      <ArrowLeft className="w-5 h-5" />
    </button>
    <div className="flex flex-col items-center leading-tight">
      <span className="font-semibold text-base">AIVA</span>
      <span className="text-[10px] opacity-80 -mt-0.5">USPS Virtual Assistant</span>
    </div>
    <button
      onClick={onRestart}
      aria-label="Restart"
      className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/10 transition"
    >
      <RotateCcw className="w-5 h-5" />
    </button>
  </header>
);
