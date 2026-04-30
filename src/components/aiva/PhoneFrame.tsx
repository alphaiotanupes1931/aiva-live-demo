import { ReactNode } from "react";

export const PhoneFrame = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#e8eaf0] to-[#f5f5f7] flex items-center justify-center p-0 md:p-6">
      {/* Mobile: full screen */}
      <div className="md:hidden w-full h-screen bg-white overflow-hidden flex flex-col">
        {children}
      </div>
      {/* Desktop: tablet-style frame */}
      <div className="hidden md:flex flex-col items-center gap-3 anim-fade-up">
        <div
          className="relative bg-black rounded-[36px] p-[10px] shadow-2xl"
          style={{ boxShadow: "0 30px 60px -15px rgba(0,0,0,0.35), 0 0 0 1px rgba(0,0,0,0.05)" }}
        >
          <div
            className="bg-white rounded-[28px] overflow-hidden flex flex-col relative"
            style={{ width: 420, height: 780 }}
          >
            {children}
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground tracking-wide">AIVA · Stakeholder Demo</p>
      </div>
    </div>
  );
};
