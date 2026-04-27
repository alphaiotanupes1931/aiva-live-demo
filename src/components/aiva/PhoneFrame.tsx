import { ReactNode } from "react";

export const PhoneFrame = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen w-full bg-aiva-page flex items-center justify-center p-0 md:p-8">
      {/* Mobile: full screen */}
      <div className="md:hidden w-full h-screen bg-white overflow-hidden flex flex-col">
        {children}
      </div>
      {/* Desktop: phone frame */}
      <div className="hidden md:flex flex-col items-center gap-4">
        <div
          className="relative bg-black rounded-[48px] p-[10px] shadow-2xl"
          style={{ boxShadow: "0 30px 60px -15px rgba(0,0,0,0.3), 0 0 0 1px rgba(0,0,0,0.05)" }}
        >
          <div
            className="bg-white rounded-[40px] overflow-hidden flex flex-col relative"
            style={{ width: 375, height: 812 }}
          >
            {/* Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[140px] h-[28px] bg-black rounded-b-[18px] z-50" />
            {children}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">AIVA · Stakeholder Demo</p>
      </div>
    </div>
  );
};
