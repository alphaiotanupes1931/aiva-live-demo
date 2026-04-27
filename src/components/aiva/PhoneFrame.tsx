import { ReactNode } from "react";
import { Lock, ArrowLeft, ArrowRight, RotateCw, Plus, Search } from "lucide-react";

const BrowserChrome = ({ children }: { children: ReactNode }) => (
  <div className="w-full max-w-[1200px] bg-white rounded-2xl overflow-hidden shadow-2xl border border-black/5">
    {/* Tab strip */}
    <div className="bg-[#dee1e6] px-3 pt-2 flex items-end gap-1">
      <div className="flex items-center gap-2 bg-white rounded-t-lg px-3 py-2 max-w-[240px] shadow-sm">
        <div className="w-4 h-4 rounded-sm bg-aiva-navy shrink-0" />
        <span className="text-xs text-foreground/80 truncate">AIVA · USPS Virtual Assistant</span>
      </div>
      <button className="w-7 h-7 rounded-full hover:bg-black/5 flex items-center justify-center text-foreground/60 mb-1">
        <Plus className="w-4 h-4" />
      </button>
    </div>
    {/* Address bar */}
    <div className="bg-white border-b border-black/5 px-4 py-2 flex items-center gap-3">
      <div className="flex items-center gap-1 text-foreground/40">
        <button className="w-7 h-7 rounded-full hover:bg-black/5 flex items-center justify-center"><ArrowLeft className="w-4 h-4" /></button>
        <button className="w-7 h-7 rounded-full hover:bg-black/5 flex items-center justify-center"><ArrowRight className="w-4 h-4" /></button>
        <button className="w-7 h-7 rounded-full hover:bg-black/5 flex items-center justify-center"><RotateCw className="w-3.5 h-3.5" /></button>
      </div>
      <div className="flex-1 bg-[#f1f3f4] rounded-full px-3 py-1.5 flex items-center gap-2">
        <Lock className="w-3 h-3 text-foreground/50" />
        <span className="text-xs text-foreground/70 truncate">aiva.usps.com/sopo/vienna-va</span>
      </div>
      <Search className="w-4 h-4 text-foreground/40" />
    </div>
    {/* Page area */}
    <div className="bg-aiva-page flex items-center justify-center py-10 px-4">
      {children}
    </div>
  </div>
);

export const PhoneFrame = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#e8eaf0] to-[#f5f5f7] flex items-center justify-center p-0 md:p-6">
      {/* Mobile: full screen */}
      <div className="md:hidden w-full h-screen bg-white overflow-hidden flex flex-col">
        {children}
      </div>
      {/* Desktop: browser chrome + phone frame */}
      <div className="hidden md:block w-full">
        <BrowserChrome>
          <div className="flex flex-col items-center gap-3 anim-fade-up">
            <div
              className="relative bg-black rounded-[48px] p-[10px] shadow-2xl"
              style={{ boxShadow: "0 30px 60px -15px rgba(0,0,0,0.35), 0 0 0 1px rgba(0,0,0,0.05)" }}
            >
              <div
                className="bg-white rounded-[40px] overflow-hidden flex flex-col relative"
                style={{ width: 375, height: 760 }}
              >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[140px] h-[28px] bg-black rounded-b-[18px] z-50" />
                {children}
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground tracking-wide">AIVA · Stakeholder Demo</p>
          </div>
        </BrowserChrome>
      </div>
    </div>
  );
};
