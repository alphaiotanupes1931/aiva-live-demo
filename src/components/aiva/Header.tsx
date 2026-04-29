import { X } from "lucide-react";
import uspsLogo from "@/assets/usps-logo.png";

interface HeaderProps {
  onHome?: () => void;
  onChat?: () => void;
  showHome?: boolean;
}

export const Header = ({ onHome, showHome = true }: HeaderProps) => (
  <header
    className="h-14 bg-[#e5e7eb] text-aiva-navy flex items-center justify-between px-3 shrink-0 relative z-10 border-b border-black/5"
    style={{ paddingTop: "env(safe-area-inset-top)" }}
  >
    <button
      onClick={onHome}
      disabled={!showHome || !onHome}
      aria-label="Home"
      className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-black/5 disabled:opacity-0 transition"
    >
      <X className="w-5 h-5" />
    </button>
    <div className="flex flex-col items-center leading-tight">
      <span className="font-semibold text-base">AIVA</span>
      <span className="text-[10px] opacity-70 -mt-0.5">USPS Virtual Assistant</span>
    </div>
    <div className="w-9 h-9 flex items-center justify-end">
      <img src={uspsLogo} alt="USPS" className="h-7 w-auto object-contain" />
    </div>
  </header>
);
