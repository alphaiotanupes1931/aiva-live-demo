import { ReactNode } from "react";
import uspsLogo from "@/assets/usps-logo.png";

const BotAvatar = () => (
  <div className="w-7 h-7 rounded-full bg-white border border-border flex items-center justify-center shrink-0 overflow-hidden p-0.5">
    <img src={uspsLogo} alt="USPS" className="w-full h-full object-contain" />
  </div>
);

export const BotBubble = ({ children }: { children: ReactNode }) => (
  <div className="flex items-end gap-2 max-w-[85%] anim-fade-up">
    <BotAvatar />
    <div className="bg-aiva-bot-bg text-foreground rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm leading-relaxed">
      {children}
    </div>
  </div>
);

export const UserBubble = ({ children }: { children: ReactNode }) => (
  <div className="flex justify-end anim-fade-up">
    <div className="bg-aiva-blue text-white rounded-2xl rounded-br-sm px-4 py-2.5 text-sm leading-relaxed max-w-[75%]">
      {children}
    </div>
  </div>
);

export const Typing = () => (
  <div className="flex items-end gap-2 anim-fade-up">
    <BotAvatar />
    <div className="bg-aiva-bot-bg rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1 items-center">
      <span className="typing-dot" />
      <span className="typing-dot" />
      <span className="typing-dot" />
    </div>
  </div>
);

export const ChoiceButton = ({
  children,
  onClick,
  variant = "outline",
}: {
  children: ReactNode;
  onClick: () => void;
  variant?: "outline" | "primary";
}) => (
  <button
    onClick={onClick}
    className={
      variant === "primary"
        ? "w-full bg-aiva-blue-deep text-white rounded-lg py-3 px-4 text-sm font-semibold hover:opacity-90 active:scale-[0.99] transition"
        : "w-full bg-white border border-aiva-blue-deep text-aiva-blue-deep rounded-lg py-3 px-4 text-sm font-medium hover:bg-aiva-blue-deep/5 active:scale-[0.99] transition text-left"
    }
  >
    {children}
  </button>
);

export const Card = ({ children }: { children: ReactNode }) => (
  <div className="bg-white border border-border rounded-xl p-3 shadow-sm anim-fade-up">{children}</div>
);
