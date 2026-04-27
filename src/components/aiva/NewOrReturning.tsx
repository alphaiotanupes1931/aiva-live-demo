import { UserPlus, UserCheck } from "lucide-react";
import uspsLogo from "@/assets/usps-logo.png";

interface NewOrReturningProps {
  onNew: () => void;
  onReturning: () => void;
}

export const NewOrReturning = ({ onNew, onReturning }: NewOrReturningProps) => (
  <div className="flex-1 flex flex-col bg-white text-aiva-navy anim-fade-up">
    <div className="flex-1 flex flex-col items-center justify-center text-center px-8 gap-7">
      <img src={uspsLogo} alt="USPS" className="w-32 h-auto object-contain" />
      <div className="space-y-3 max-w-[280px]">
        <h1 className="text-[24px] leading-tight font-bold tracking-tight">
          Welcome to <span className="text-aiva-blue-deep">AIVA</span>
        </h1>
        <p className="text-[14px] leading-relaxed text-foreground/70">
          Have you used AIVA before?
        </p>
      </div>

      <div className="w-full space-y-3 max-w-[300px]">
        <button
          onClick={onNew}
          className="w-full flex items-center gap-3 bg-white border-2 border-aiva-blue-deep text-aiva-blue-deep px-5 py-4 rounded-2xl font-semibold text-sm hover:bg-aiva-blue-deep hover:text-white transition-all text-left"
        >
          <div className="w-10 h-10 rounded-full bg-aiva-blue-deep/10 flex items-center justify-center shrink-0">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <div>I'm new to AIVA</div>
            <div className="text-[11px] font-normal opacity-70">Quick intro &middot; about 30 seconds</div>
          </div>
        </button>
        <button
          onClick={onReturning}
          className="w-full flex items-center gap-3 bg-white border-2 border-border text-foreground px-5 py-4 rounded-2xl font-semibold text-sm hover:border-aiva-blue-deep hover:text-aiva-blue-deep transition-all text-left"
        >
          <div className="w-10 h-10 rounded-full bg-aiva-bot-bg flex items-center justify-center shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div>I'm a returning user</div>
            <div className="text-[11px] font-normal opacity-70">Skip the intro</div>
          </div>
        </button>
      </div>
    </div>
    <p className="text-[10px] text-muted-foreground tracking-wide text-center pb-5">
      Demo &middot; No real account or data needed
    </p>
  </div>
);
