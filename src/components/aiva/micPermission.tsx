import { useEffect, useState } from "react";
import { Mic, X } from "lucide-react";

const STORAGE_KEY = "aiva-mic-explained";

/**
 * Ensures we explain WHY we need the mic before the browser's native
 * permission prompt appears (only the first time). Then requests access
 * via getUserMedia so the OS prompt fires on a real user gesture.
 *
 * Returns true if the user has (or just) granted access, false otherwise.
 */
export const ensureMicPermission = async (): Promise<boolean> => {
  // If we don't have getUserMedia, fall through — SpeechRecognition will
  // trigger its own prompt as a best effort.
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
    return true;
  }

  // If the Permissions API tells us it's already granted, skip the prompt.
  try {
    const status = await (navigator.permissions as any)?.query?.({ name: "microphone" as PermissionName });
    if (status?.state === "granted") return true;
    if (status?.state === "denied") return false;
  } catch {
    // Permissions API not available — continue.
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // Immediately release the mic; SpeechRecognition will reopen it.
    stream.getTracks().forEach((t) => t.stop());
    return true;
  } catch {
    return false;
  }
};

export const hasSeenMicExplainer = (): boolean => {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
};

export const markMicExplainerSeen = () => {
  try { localStorage.setItem(STORAGE_KEY, "1"); } catch {}
};

interface ExplainerProps {
  open: boolean;
  onAllow: () => void;
  onCancel: () => void;
}

/**
 * One-time modal that explains why we need the microphone before the
 * browser's native permission dialog appears.
 */
export const MicPermissionExplainer = ({ open, onAllow, onCancel }: ExplainerProps) => {
  // Lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  if (!open) return null;
  return (
    <div className="absolute inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 anim-fade-up">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="mic-explainer-title"
        className="w-full max-w-sm bg-white rounded-t-2xl sm:rounded-2xl p-5 shadow-xl space-y-4"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="w-12 h-12 rounded-full bg-aiva-blue-deep/10 flex items-center justify-center shrink-0">
            <Mic className="w-6 h-6 text-aiva-blue-deep" />
          </div>
          <button
            onClick={onCancel}
            aria-label="Close"
            className="w-8 h-8 rounded-full hover:bg-aiva-bot-bg flex items-center justify-center text-muted-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-1.5">
          <h2 id="mic-explainer-title" className="font-bold text-lg text-aiva-navy">
            Allow microphone access
          </h2>
          <p className="text-sm text-foreground/70 leading-relaxed">
            AIVA uses your microphone to convert what you say into text. Audio
            stays on your device — only the text is shared with USPS.
          </p>
        </div>
        <div className="bg-aiva-bot-bg rounded-lg p-3 text-[12px] text-foreground/80 leading-relaxed">
          Your browser will ask you to allow microphone access next. You can
          revoke this anytime in your browser settings.
        </div>
        <div className="space-y-2 pt-1">
          <button
            onClick={onAllow}
            className="w-full bg-aiva-blue-deep text-white px-6 py-3 rounded-full font-semibold text-sm shadow-lg hover:shadow-xl active:scale-[0.99] transition"
          >
            Continue
          </button>
          <button
            onClick={onCancel}
            className="w-full bg-white border border-border text-foreground px-6 py-2.5 rounded-full font-medium text-sm hover:bg-aiva-bot-bg transition"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
};
