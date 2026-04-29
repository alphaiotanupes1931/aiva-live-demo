import { X } from "lucide-react";

interface HeaderProps {
  onBack?: () => void;
  onChat?: () => void;
  showBack?: boolean;
}

export const Header = ({ onBack, showBack = true }: HeaderProps) => (
  <header
    className="h-14 bg-aiva-navy text-white flex items-center justify-between px-3 shrink-0 relative z-10"
    style={{ paddingTop: "env(safe-area-inset-top)" }}
  >
    <button
      onClick={onBack}
      disabled={!showBack || !onBack}
      aria-label="Close"
      className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/10 disabled:opacity-0 transition"
    >
      <X className="w-5 h-5" />
    </button>
    <div className="flex flex-col items-center leading-tight">
      <span className="font-semibold text-base">AIVA</span>
      <span className="text-[10px] opacity-80 -mt-0.5">USPS Virtual Assistant</span>
    </div>
    <div className="w-9 h-9" aria-hidden />
  </header>
);
