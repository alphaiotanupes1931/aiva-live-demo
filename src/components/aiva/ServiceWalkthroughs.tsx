import { useEffect, useState } from "react";
import { CheckCircle2, MapPin, ChevronLeft } from "lucide-react";
import apdPhoto from "@/assets/equip-apd.jpg";
import sskKioskPhoto from "@/assets/ssk-kiosk.jpg";
import parcelLockersPhoto from "@/assets/equip-parcel-lockers.jpg";
import poBoxesPhoto from "@/assets/equip-po-boxes.jpg";
import photoUnavailableImg from "@/assets/photo-unavailable.png";

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
  tertiaryLabel?: string;
  onTertiary?: () => void;
  banner?: { text: string };
  onBack?: () => void;
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
  tertiaryLabel,
  onTertiary,
  banner,
  onBack,
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
        <div className="rounded-2xl overflow-hidden bg-white border border-border shadow-sm">
          <img src={photoUnavailableImg} alt="Photo unavailable" loading="lazy" className="w-full h-auto object-cover block" />
        </div>
      ) : null}
    </div>
    <div className="px-5 pb-5 pt-2 space-y-2 shrink-0 bg-aiva-page">
      {tertiaryLabel && onTertiary && (
        <button
          onClick={onTertiary}
          className="w-full h-12 rounded-full bg-white text-aiva-navy font-semibold text-sm border-2 border-aiva-navy hover:bg-aiva-navy/5 transition active:scale-[0.99]"
        >
          {tertiaryLabel}
        </button>
      )}
      {secondaryLabel && onSecondary && (
        <button
          onClick={onSecondary}
          className="w-full h-12 rounded-full bg-white text-aiva-navy font-semibold text-sm border-2 border-aiva-navy hover:bg-aiva-navy/5 transition active:scale-[0.99]"
        >
          {secondaryLabel}
        </button>
      )}
      <div className="flex items-center gap-2">
        {onBack && (
          <button
            onClick={onBack}
            aria-label="Back"
            className="shrink-0 inline-flex items-center justify-center h-12 px-4 rounded-full bg-white text-aiva-navy font-semibold text-sm border-2 border-aiva-navy hover:bg-aiva-navy/5 transition active:scale-[0.99]"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        <button
          onClick={onPrimary}
          className="flex-1 h-12 rounded-full bg-aiva-navy text-white font-semibold text-sm hover:bg-aiva-navy/90 transition active:scale-[0.99]"
        >
          {primaryLabel}
        </button>
      </div>
    </div>
  </div>
);

/* ============== FLOW 1: Drop Off a Prepaid Package ============== */

export const DropIntro = ({ onNext, onBack }: { onNext: () => void; onBack: () => void }) => (
  <StepLayout
    title="Let's drop off your prepaid package"
    subtitle="I'll guide you to the Automated Parcel Drop. You'll scan your label, drop your package, and get a receipt."
    photo={apdPhoto}
    photoAlt="USPS Automated Parcel Drop"
    primaryLabel="Take me there"
    onPrimary={onNext}
    secondaryLabel="Back"
    onSecondary={onBack}
  />
);

export const DropFindAPD = ({ onNext, onHelp: _onHelp }: { onNext: () => void; onHelp: () => void }) => (
  <StepLayout
    title="Find the Automated Parcel Drop"
    subtitle="Look for it near the Drum Chute. It has a red SCAN » DROP » RECEIPT header."
    photo={apdPhoto}
    photoAlt="USPS Automated Parcel Drop"
    primaryLabel="I found it"
    onPrimary={onNext}
  />
);

export const DropStep1 = ({ onNext }: { onNext: () => void; onHelp?: () => void }) => (
  <StepLayout
    stepLabel="Step 1 of 3"
    title="Scan your shipping label"
    subtitle="Hold your label barcode up to the scanner. The drop door will open automatically."
    primaryLabel="Next"
    onPrimary={onNext}
  />
);

export const DropStep2 = ({ onNext, onTooBig }: { onNext: () => void; onTooBig: () => void }) => (
  <StepLayout
    stepLabel="Step 2 of 3"
    title="Place your package inside"
    subtitle={`Set your package inside the drop bay. Make sure it fits within 24" x 16" x 12".`}
    primaryLabel="Next"
    onPrimary={onNext}
    secondaryLabel="My package doesn't fit"
    onSecondary={onTooBig}
  />
);

export const DropTooBigRedirect = ({
  onDirections,
  onBack,
}: {
  onDirections: () => void;
  onBack: () => void;
}) => (
  <div className="flex flex-col flex-1 overflow-hidden bg-aiva-page anim-slide-right">
    <div className="flex-1 overflow-y-auto px-5 pt-4 pb-4 scrollbar-hide">
      <h1 className="text-xl font-bold text-aiva-navy mb-1.5">Your package is too big for the APD</h1>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        Packages larger than 24" x 16" x 12" can't be dropped here. Take it to the nearest staffed Post Office and a clerk will accept it.
      </p>
      <div className="bg-white border border-border rounded-2xl p-4 shadow-sm space-y-3">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
            Nearest staffed Post Office
          </div>
          <div className="text-sm font-semibold text-aiva-navy leading-snug">
            Vienna Post Office
          </div>
          <div className="text-[13px] text-foreground/75 leading-relaxed">
            301 Center St S, Vienna, VA 22180
          </div>
        </div>
        <div className="border-t border-border pt-3 grid grid-cols-2 gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
              Distance
            </div>
            <div className="text-sm font-semibold text-aiva-navy">2.3 mi</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
              Hours today
            </div>
            <div className="text-sm font-semibold text-aiva-navy">9 AM – 5 PM</div>
          </div>
        </div>
      </div>
    </div>
    <div className="px-5 pb-5 pt-2 space-y-2 shrink-0 bg-aiva-page">
      <button
        onClick={onDirections}
        className="w-full h-12 rounded-full bg-aiva-navy text-white font-semibold text-sm hover:bg-aiva-navy/90 transition active:scale-[0.99]"
      >
        Get directions
      </button>
      <button
        onClick={onBack}
        className="w-full h-12 rounded-full bg-white text-aiva-navy font-semibold text-sm border-2 border-aiva-navy hover:bg-aiva-navy/5 transition active:scale-[0.99]"
      >
        Back
      </button>
    </div>
  </div>
);

export const DropStep3 = ({ onNext, onReport }: { onNext: () => void; onReport: () => void }) => (
  <StepLayout
    stepLabel="Step 3 of 3"
    title="Find your receipt below"
    subtitle="The APD prints your confirmation receipt from the slot below the screen. Grab it and keep it for your records."
    primaryLabel="Next"
    onPrimary={onNext}
    secondaryLabel="Receipt didn't print"
    onSecondary={onReport}
  />
);

export const DropDone = ({ onDone, onElse }: { onDone: () => void; onElse: () => void }) => (
  <StepLayout
    title="Thanks for using AIVA"
    subtitle="Have a great day. Scan your QR code to track your package and stay updated on its delivery status."
    photoUnavailable={false}
    primaryLabel="Help me with something else"
    onPrimary={onElse}
  />
);

/* ============== FLOW 2: Buy Stamps ============== */

export const StampsIntro = ({ onNext, onBack }: { onNext: () => void; onBack: () => void }) => (
  <StepLayout
    title="Let's buy stamps"
    subtitle="I'll guide you through buying stamps at the Self-Service Kiosk."
    photo={sskKioskPhoto}
    photoAlt="USPS Self-Service Kiosk"
    primaryLabel="I'm at the kiosk"
    onPrimary={onNext}
    secondaryLabel="Back"
    onSecondary={onBack}
  />
);

export const StampsFindSSK = ({ onNext }: { onNext: () => void; onHelp?: () => void }) => (
  <StepLayout
    stepLabel="Step 1 of 3"
    title="Tap 'Buy Stamps' on the kiosk"
    subtitle="From the SSK home screen, select the 'Buy Stamps' option to get started."
    primaryLabel="Next"
    onPrimary={onNext}
  />
);

export const StampsStep1 = ({ onNext }: { onNext: () => void; onHelp?: () => void }) => (
  <StepLayout
    stepLabel="Step 2 of 3"
    title="Choose your stamps"
    subtitle="Pick the stamp design and quantity you'd like to purchase."
    primaryLabel="Next"
    onPrimary={onNext}
  />
);

export const StampsStep2 = ({ onNext }: { onNext: () => void; onHelp?: () => void }) => (
  <StepLayout
    stepLabel="Step 3 of 3"
    title="Pay for your stamps"
    subtitle="Insert your card or tap to pay. Your stamps will print from the kiosk."
    primaryLabel="Next"
    onPrimary={onNext}
  />
);

export const StampsStep3 = ({ onNext, onReport }: { onNext: () => void; onReport: () => void }) => (
  <StepLayout
    title="Take your stamps"
    subtitle="Grab your stamps from the printer slot. Don't forget your receipt."
    primaryLabel="I got them"
    onPrimary={onNext}
    secondaryLabel="Stamps didn't print"
    onSecondary={onReport}
  />
);

export const StampsDone = ({ onDone, onElse }: { onDone: () => void; onElse: () => void }) => (
  <StepLayout
    photoUnavailable={false}
    title="Stamps purchased"
    subtitle="Thanks for using AIVA. Have a great day."
    primaryLabel="Help me with something else"
    onPrimary={onElse}
  />
);

/* ============== FLOW 3: Pick Up Mail or Package ============== */

export const PickupTriage = ({
  onPackage,
  onPOBox,
  onHeld,
}: {
  onPackage: () => void;
  onPOBox: () => void;
  onHeld: () => void;
}) => (
  <div className="flex-1 flex flex-col anim-slide-right bg-aiva-page">
    <div className="flex-1 overflow-y-auto px-5 pt-5 pb-4 scrollbar-hide">
      <h1 className="text-xl font-bold text-aiva-navy mb-1.5">What are you picking up?</h1>
      <p className="text-sm text-muted-foreground">
        Pick one so I can point you to the right equipment.
      </p>
    </div>
    <div className="px-5 pb-5 pt-2 space-y-2 shrink-0 bg-aiva-page">
      <button
        onClick={onPackage}
        className="w-full h-12 rounded-full bg-aiva-navy text-white font-semibold text-sm hover:bg-aiva-navy/90 transition active:scale-[0.99]"
      >
        A package
      </button>
      <button
        onClick={onPOBox}
        className="w-full h-12 rounded-full bg-white text-aiva-navy font-semibold text-sm border-2 border-aiva-navy hover:bg-aiva-navy/5 transition active:scale-[0.99]"
      >
        Mail from my PO Box
      </button>
      <button
        onClick={onHeld}
        className="w-full h-12 rounded-full bg-white text-aiva-navy font-semibold text-sm border-2 border-aiva-navy hover:bg-aiva-navy/5 transition active:scale-[0.99]"
      >
        Held mail or a delivery notice
      </button>
    </div>
  </div>
);

/* Flow 3A — Package pickup */

export const PkgFindLockers = ({ onNext, onHelp: _onHelp }: { onNext: () => void; onHelp: () => void }) => (
  <StepLayout
    title="Find the Parcel Lockers"
    subtitle="You'll need the pickup code from your delivery notification."
    photo={parcelLockersPhoto}
    photoAlt="USPS Parcel Lockers"
    primaryLabel="I found them"
    onPrimary={onNext}
  />
);

export const PkgEnterCode = ({ onNext, onHelp }: { onNext: () => void; onHelp: () => void }) => (
  <StepLayout
    title="Enter your pickup code"
    subtitle="Use the keypad on the locker screen. The code is in your USPS delivery notification email or text."
    primaryLabel="Next"
    onPrimary={onNext}
    secondaryLabel="I don't have my code"
    onSecondary={onHelp}
  />
);

export const PkgDone = ({ onDone, onElse }: { onDone: () => void; onElse: () => void }) => (
  <StepLayout
    photoUnavailable={false}
    title="Thanks for using AIVA"
    subtitle="Have a great day. Scan your QR code to track your package and stay updated on its delivery status."
    primaryLabel="Help me with something else"
    onPrimary={onElse}
  />
);

/* Flow 3B — PO Box pickup */

export const POBoxFind = ({ onNext, onHelp: _onHelp }: { onNext: () => void; onHelp: () => void }) => (
  <StepLayout
    title="Find your PO Box"
    subtitle="Use your PO Box key or combination to unlock your box."
    photo={poBoxesPhoto}
    photoAlt="USPS PO Boxes"
    primaryLabel="I found it"
    onPrimary={onNext}
  />
);

export const POBoxDone = ({ onDone, onElse }: { onDone: () => void; onElse: () => void }) => (
  <StepLayout
    photoUnavailable={false}
    title="You're all set"
    subtitle="Thanks for using AIVA. Have a great day."
    primaryLabel="Help me with something else"
    onPrimary={onElse}
  />
);

/* Flow 3C — Held mail redirect */

export const HeldMailRedirect = ({
  onDirections,
  onBack,
}: {
  onDirections: () => void;
  onBack: () => void;
}) => (
  <div className="flex flex-col flex-1 overflow-hidden bg-aiva-page anim-slide-right">
    <div className="flex-1 overflow-y-auto px-5 pt-4 pb-4 scrollbar-hide">
      <h1 className="text-xl font-bold text-aiva-navy mb-1.5">This SOPO can't release held mail</h1>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        Held mail and delivery notices require a staffed Post Office. Here's the nearest one.
      </p>
      <div className="bg-white border border-border rounded-2xl p-4 shadow-sm space-y-3">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
            Nearest staffed Post Office
          </div>
          <div className="text-sm font-semibold text-aiva-navy leading-snug">
            Vienna Post Office
          </div>
          <div className="text-[13px] text-foreground/75 leading-relaxed">
            301 Center St S, Vienna, VA 22180
          </div>
        </div>
        <div className="border-t border-border pt-3 grid grid-cols-2 gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
              Distance
            </div>
            <div className="text-sm font-semibold text-aiva-navy">2.3 mi</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
              Hours today
            </div>
            <div className="text-sm font-semibold text-aiva-navy">9 AM – 5 PM</div>
          </div>
        </div>
      </div>
    </div>
    <div className="px-5 pb-5 pt-2 space-y-2 shrink-0 bg-aiva-page">
      <button
        onClick={onDirections}
        className="w-full h-12 rounded-full bg-aiva-navy text-white font-semibold text-sm hover:bg-aiva-navy/90 transition active:scale-[0.99]"
      >
        Get directions
      </button>
      <button
        onClick={onBack}
        className="w-full h-12 rounded-full bg-white text-aiva-navy font-semibold text-sm border-2 border-aiva-navy hover:bg-aiva-navy/5 transition active:scale-[0.99]"
      >
        Back
      </button>
    </div>
  </div>
);

/* ============== Drop Off — Receipt Didn't Print ============== */

export const DropReceiptIssue = ({
  onTrack,
  onReport,
}: {
  onTrack: () => void;
  onReport: () => void;
}) => {
  useEffect(() => {
    // Simulate notifying the local post office about the APD printer issue.
    // In production, this would invoke an edge function to send an email.
    console.log("[AIVA] Notified local post office: APD receipt printer issue at SOPO");
  }, []);

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-aiva-page anim-slide-right">
      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-4 scrollbar-hide">

        <h1 className="text-xl font-bold text-aiva-navy mb-1.5">No receipt? You're still good</h1>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          Your package was scanned and accepted by the APD. The drop is recorded in our system. We've also notified the local post office about the printer issue.
        </p>

        <div className="space-y-3">
          {/* Track package */}
          <div className="bg-white border border-border rounded-2xl p-4 shadow-sm">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-aiva-navy/10 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-aiva-navy" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-aiva-navy leading-snug">
                  Track your package
                </div>
                <div className="text-[13px] text-foreground/75 leading-relaxed mt-0.5">
                  Use the tracking number on your shipping label to confirm pickup.
                </div>
              </div>
            </div>
            <button
              onClick={onTrack}
              className="w-full h-11 rounded-full bg-white text-aiva-navy font-semibold text-sm border-2 border-aiva-navy hover:bg-aiva-navy/5 transition active:scale-[0.99]"
            >
              Track package
            </button>
          </div>
        </div>
      </div>
      <div className="px-5 pb-5 pt-2 shrink-0 bg-aiva-page border-t border-border/50">
        <div className="text-[13px] text-muted-foreground text-center mb-2">Still need help?</div>
        <button
          onClick={onReport}
          className="w-full h-12 rounded-full bg-white text-aiva-navy font-semibold text-sm border-2 border-aiva-navy hover:bg-aiva-navy/5 transition active:scale-[0.99]"
        >
          Report a problem
        </button>
      </div>
    </div>
  );
};
