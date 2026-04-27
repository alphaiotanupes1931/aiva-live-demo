import { useEffect, useRef, useState, InputHTMLAttributes } from "react";
import { Mic, Square } from "lucide-react";
import {
  ensureMicPermission,
  hasSeenMicExplainer,
  markMicExplainerSeen,
  MicPermissionExplainer,
} from "./micPermission";

/**
 * Inline voice-to-text input. Renders a text field (or textarea) with a mic button.
 * Tapping the mic streams the user's speech directly into the field, live.
 * Works on the same screen — no navigation away.
 */
type CommonProps = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  multiline?: boolean;
  rows?: number;
  inputMode?: InputHTMLAttributes<HTMLInputElement>["inputMode"];
  type?: string;
  ariaLabel?: string;
};

export const VoiceTextInput = ({
  value, onChange, placeholder, className, multiline, rows = 3,
  inputMode, type = "text", ariaLabel,
}: CommonProps) => {
  const [supported, setSupported] = useState(true);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showExplainer, setShowExplainer] = useState(false);
  const recRef = useRef<any>(null);
  const baseRef = useRef<string>("");

  useEffect(() => {
    const Ctor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setSupported(!!Ctor);
    return () => {
      try { recRef.current?.stop(); } catch {}
    };
  }, []);

  // Real recognition start — only called after mic permission is granted.
  const beginRecognition = () => {
    setError(null);
    const Ctor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!Ctor) { setSupported(false); return; }
    if (listening) return;
    try {
      const rec = new Ctor();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "en-US";
      baseRef.current = value ? value.trimEnd() + " " : "";

      rec.onresult = (e: any) => {
        let finalText = "";
        let interim = "";
        for (let i = 0; i < e.results.length; i++) {
          const r = e.results[i];
          if (r.isFinal) finalText += r[0].transcript;
          else interim += r[0].transcript;
        }
        const combined = (baseRef.current + finalText + interim).replace(/\s+/g, " ").trimStart();
        onChange(combined);
      };
      rec.onerror = (e: any) => {
        if (e.error === "no-speech") return;
        if (e.error === "not-allowed" || e.error === "service-not-allowed") {
          setError("Microphone permission denied.");
        } else {
          setError(`Mic error: ${e.error}`);
        }
        setListening(false);
      };
      rec.onend = () => setListening(false);

      recRef.current = rec;
      rec.start();
      setListening(true);
    } catch {
      setListening(false);
    }
  };

  // User tapped the mic. Show explainer first time, otherwise request permission directly.
  const onMicClick = async () => {
    if (listening) { stop(); return; }
    if (!hasSeenMicExplainer()) {
      setShowExplainer(true);
      return;
    }
    const ok = await ensureMicPermission();
    if (!ok) {
      setError("Microphone permission denied. You can enable it in your browser settings.");
      return;
    }
    beginRecognition();
  };

  const onExplainerAllow = async () => {
    markMicExplainerSeen();
    setShowExplainer(false);
    const ok = await ensureMicPermission();
    if (!ok) {
      setError("Microphone permission denied. You can enable it in your browser settings.");
      return;
    }
    beginRecognition();
  };

  const stop = () => {
    try { recRef.current?.stop(); } catch {}
    setListening(false);
  };

  const baseField =
    "flex-1 bg-aiva-bot-bg rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-aiva-blue/40 placeholder:text-muted-foreground";

  return (
    <div className={`w-full space-y-1 ${className ?? ""}`}>
      <div className="flex items-end gap-2">
        {multiline ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            aria-label={ariaLabel}
            className={`${baseField} resize-none`}
          />
        ) : (
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            inputMode={inputMode}
            type={type}
            aria-label={ariaLabel}
            className={baseField}
          />
        )}
        {supported && (
          <button
            type="button"
            onClick={listening ? stop : start}
            aria-label={listening ? "Stop dictation" : "Start dictation"}
            aria-pressed={listening}
            className={`relative w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition active:scale-95 ${
              listening
                ? "bg-red-600 text-white shadow-md"
                : "bg-aiva-blue-deep text-white shadow-sm hover:shadow-md"
            }`}
          >
            {listening ? <Square className="w-4 h-4" fill="white" /> : <Mic className="w-5 h-5" />}
            {listening && (
              <span className="absolute inset-0 rounded-full bg-red-600/40 animate-ping" />
            )}
          </button>
        )}
      </div>
      {listening && (
        <div className="text-[11px] text-aiva-blue-deep font-medium px-1">
          Listening — speak now. Tap stop when done.
        </div>
      )}
      {error && (
        <div className="text-[11px] text-red-600 px-1">{error}</div>
      )}
    </div>
  );
};
