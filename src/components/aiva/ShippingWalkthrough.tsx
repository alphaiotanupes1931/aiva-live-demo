import { CheckCircle2 } from "lucide-react";
import sskKioskPhoto from "@/assets/ssk-kiosk.jpg";

type StepLayoutProps = {
  stepLabel?: string;
  title: string;
  subtitle: string;
  photo?: string;
  photoAlt?: string;
  photoUnavailable?: boolean;
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  banner?: { text: string };
};

const StepLayout = ({
  stepLabel,
  title,
  subtitle,
  photo,
  photoAlt,
  photoUnavailable,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  banner,
}: StepLayoutProps) => (
  <div className="flex flex-col flex-1 overflow-hidden bg-aiva-page anim-slide-right">
    <div className="flex-1 overflow-y-auto px-5 pt-4 pb-4 scrollbar-hide">
      {banner && (
        <div className="flex items-center gap-2 rounded-xl bg-aiva-success/10 border border-aiva-success/30 px-3 py-2.5 mb-4">
          <CheckCircle2 className="w-5 h-5 text-aiva-success shrink-0" />
          <div className="text-sm font-semibold text-aiva-success">{banner.text}</div>
        </div>
      )}
      {stepLabel && (
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">
          {stepLabel}
        </div>
      )}
      <h1 className="text-xl font-bold text-aiva-navy mb-1.5">{title}</h1>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">{subtitle}</p>
      {photo ? (
        <div className="rounded-2xl overflow-hidden bg-white border border-border shadow-sm">
          <img src={photo} alt={photoAlt || ""} loading="lazy" className="w-full h-auto object-cover block" />
        </div>
      ) : photoUnavailable !== false ? (
        <div className="rounded-2xl bg-aiva-bot-bg/40 border border-dashed border-border flex items-center justify-center aspect-[4/3]">
          <span className="text-xs text-muted-foreground font-medium">Photo unavailable</span>
        </div>
      ) : null}
    </div>
    <div className="px-5 pb-5 pt-2 space-y-2 shrink-0 bg-aiva-page">
      <button
        onClick={onPrimary}
        className="w-full h-12 rounded-full bg-aiva-navy text-white font-semibold text-sm hover:bg-aiva-navy/90 transition active:scale-[0.99]"
      >
        {primaryLabel}
      </button>
      {secondaryLabel && onSecondary && (
        <button
          onClick={onSecondary}
          className="w-full h-12 rounded-full bg-white text-aiva-navy font-semibold text-sm border-2 border-aiva-navy hover:bg-aiva-navy/5 transition active:scale-[0.99]"
        >
          {secondaryLabel}
        </button>
      )}
    </div>
  </div>
);

export const ShipIntro = ({ onNext, onBack }: { onNext: () => void; onBack: () => void }) => (
  <StepLayout
    title="Let's get your package shipped"
    subtitle="I'll guide you through each step at the kiosk. Tap 'Tap to Get Started' on the SSK screen when you're ready."
    photo={sskKioskPhoto}
    photoAlt="USPS Self-Service Kiosk welcome screen"
    primaryLabel="I'm at the kiosk"
    onPrimary={onNext}
    secondaryLabel="Back"
    onSecondary={onBack}
  />
);

export const ShipStep1 = ({ onNext, onHelp }: { onNext: () => void; onHelp: () => void }) => (
  <StepLayout
    stepLabel="Step 1 of 5"
    title="Place your package on the scale"
    subtitle="The kiosk will weigh your package automatically. Make sure it's centered on the scale."
    primaryLabel="Done"
    onPrimary={onNext}
    secondaryLabel="I need help"
    onSecondary={onHelp}
  />
);

export const ShipStep2 = ({ onNext, onHelp }: { onNext: () => void; onHelp: () => void }) => (
  <StepLayout
    stepLabel="Step 2 of 5"
    title="Enter package details"
    subtitle="The kiosk will ask for the destination ZIP code and package dimensions. Have your shipping label or recipient address ready."
    primaryLabel="Done"
    onPrimary={onNext}
    secondaryLabel="I need help"
    onSecondary={onHelp}
  />
);

export const ShipStep3 = ({ onNext, onMore }: { onNext: () => void; onMore: () => void }) => (
  <StepLayout
    stepLabel="Step 3 of 5"
    title="Pick a shipping service"
    subtitle="Priority Mail is the most common option — 1–3 day delivery with tracking. Ground Advantage is the most affordable for packages under 70 lbs."
    primaryLabel="Done"
    onPrimary={onNext}
    secondaryLabel="Tell me more about options"
    onSecondary={onMore}
  />
);

export const ShipServiceCompare = ({ onBack }: { onBack: () => void }) => (
  <div className="flex flex-col flex-1 overflow-hidden bg-aiva-page anim-slide-right">
    <div className="flex-1 overflow-y-auto px-5 pt-4 pb-4 scrollbar-hide">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">
        Shipping options
      </div>
      <h1 className="text-xl font-bold text-aiva-navy mb-3">Compare services</h1>
      <div className="space-y-2.5">
        {[
          { name: "Priority Mail Express", desc: "Overnight to most U.S. addresses. Includes tracking and insurance up to $100." },
          { name: "Priority Mail", desc: "1–3 business days. Tracking and insurance up to $100 included. Most popular." },
          { name: "Ground Advantage", desc: "2–5 business days. Most affordable for packages up to 70 lbs." },
          { name: "Media Mail", desc: "2–8 business days. Books, films, and educational material only." },
        ].map((s) => (
          <div key={s.name} className="bg-white border border-border rounded-xl p-3">
            <div className="text-sm font-semibold text-aiva-navy">{s.name}</div>
            <div className="text-[12px] text-foreground/75 leading-relaxed mt-0.5">{s.desc}</div>
          </div>
        ))}
      </div>
    </div>
    <div className="px-5 pb-5 pt-2 shrink-0 bg-aiva-page">
      <button
        onClick={onBack}
        className="w-full h-12 rounded-full bg-aiva-navy text-white font-semibold text-sm hover:bg-aiva-navy/90 transition active:scale-[0.99]"
      >
        Got it
      </button>
    </div>
  </div>
);

export const ShipStep4 = ({ onNext, onHelp }: { onNext: () => void; onHelp: () => void }) => (
  <StepLayout
    stepLabel="Step 4 of 5"
    title="Pay and print your label"
    subtitle="Insert your card or tap to pay. The kiosk will print your shipping label automatically."
    primaryLabel="Done"
    onPrimary={onNext}
    secondaryLabel="I need help"
    onSecondary={onHelp}
  />
);

export const ShipStep5 = ({ onNext, onWhere }: { onNext: () => void; onWhere: () => void }) => (
  <StepLayout
    stepLabel="Step 5 of 5"
    title="Drop off your package"
    subtitle="Take your labeled package to the Drum Chute in Zone 3 and drop it in. You're almost done."
    photoUnavailable
    primaryLabel="I dropped it off"
    onPrimary={onNext}
    secondaryLabel="Where is the Drum Chute?"
    onSecondary={onWhere}
  />
);

export const ShipDrumChuteWhere = ({ onBack }: { onBack: () => void }) => (
  <StepLayout
    title="Drum Chute"
    subtitle="Head to Zone 3 — the Send It area. Look for the large round chute mounted on the wall. Drop your labeled package in and you're done."
    photoUnavailable
    primaryLabel="Got it"
    onPrimary={onBack}
  />
);

export const ShipDone = ({ onDone, onElse }: { onDone: () => void; onElse: () => void }) => (
  <StepLayout
    banner={{ text: "✓ You're all set" }}
    title="Your package is on its way"
    subtitle="Thanks for using AIVA. Have a great day."
    primaryLabel="Done"
    onPrimary={onDone}
    secondaryLabel="Help me with something else"
    onSecondary={onElse}
  />
);
