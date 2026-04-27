import { useState } from "react";
import { MapPin, AlertCircle, MessageSquare, ArrowRight, ChevronLeft } from "lucide-react";
import uspsLogo from "@/assets/usps-logo.png";

interface OnboardingProps {
  onDone: () => void;
  onSkip: () => void;
}

const SLIDES = [
  {
    icon: MapPin,
    title: "What is a SOPO?",
    body:
      "A Self-Operating Post Office (SOPO) is an unstaffed USPS location where you can drop off mail and packages, buy stamps, and use kiosks 24/7 — no clerk needed.",
  },
  {
    icon: MessageSquare,
    title: "Meet AIVA",
    body:
      "AIVA is your AI Virtual Assistant. Ask questions, find equipment inside the SOPO, or get directions — by typing or using your voice.",
  },
  {
    icon: AlertCircle,
    title: "Report problems instantly",
    body:
      "If a kiosk, drum chute, or locker isn't working, AIVA submits a ticket to your local post office in seconds and can text you when it's fixed.",
  },
];

export const Onboarding = ({ onDone, onSkip }: OnboardingProps) => {
  const [i, setI] = useState(0);
  const isLast = i === SLIDES.length - 1;
  const slide = SLIDES[i];
  const Icon = slide.icon;

  return (
    <div className="flex-1 flex flex-col bg-white text-aiva-navy anim-fade-up">
      {/* Top bar: back + skip */}
      <div className="flex items-center justify-between px-4 pt-4 shrink-0">
        <button
          onClick={() => i > 0 && setI(i - 1)}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition ${
            i > 0 ? "text-foreground hover:bg-aiva-bot-bg" : "opacity-0 pointer-events-none"
          }`}
          aria-label="Back"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <img src={uspsLogo} alt="USPS" className="h-7 w-auto object-contain" />
        <button
          onClick={onSkip}
          className="text-sm font-semibold text-aiva-blue-deep px-3 py-1.5 rounded-full hover:bg-aiva-bot-bg transition"
        >
          Skip
        </button>
      </div>

      {/* Slide content */}
      <div key={i} className="flex-1 flex flex-col items-center justify-center text-center px-8 gap-6 anim-fade-up">
        <div className="w-24 h-24 rounded-full bg-aiva-blue-deep/10 flex items-center justify-center">
          <Icon className="w-12 h-12 text-aiva-blue-deep" />
        </div>
        <div className="space-y-3 max-w-[300px]">
          <h1 className="text-2xl font-bold tracking-tight">{slide.title}</h1>
          <p className="text-[14px] leading-relaxed text-foreground/70">{slide.body}</p>
        </div>
      </div>

      {/* Dots + CTA */}
      <div className="px-6 pb-7 space-y-5 shrink-0">
        <div className="flex items-center justify-center gap-2">
          {SLIDES.map((_, idx) => (
            <span
              key={idx}
              className={`h-1.5 rounded-full transition-all ${
                idx === i ? "w-6 bg-aiva-blue-deep" : "w-1.5 bg-border"
              }`}
            />
          ))}
        </div>
        <button
          onClick={() => (isLast ? onDone() : setI(i + 1))}
          className="group w-full inline-flex items-center justify-center gap-2 bg-aiva-blue-deep text-white px-7 py-3.5 rounded-full font-semibold text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all"
        >
          {isLast ? "Get started" : "Next"}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
};
