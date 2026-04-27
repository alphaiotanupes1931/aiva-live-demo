import { useEffect, useRef, useState } from "react";
import { PhoneFrame } from "./PhoneFrame";
import { Header } from "./Header";
import { BotBubble, UserBubble, Typing, ChoiceButton, Card } from "./ChatBits";
import { Wayfinding } from "./Wayfinding";

import {
  MapPin, CheckCircle2, AlertCircle, Mic, Send, Smartphone,
  ThumbsUp, ThumbsDown, Loader2, Square, MessageSquare, Map as MapIcon, ArrowRight,
} from "lucide-react";
import uspsLogo from "@/assets/usps-logo.png";

type Screen =
  | "consent"
  | "qr"
  | "greeting"
  | "wayfinding"
  | "confirmLocation"
  | "thanks"
  | "status"
  | "services"
  | "problemType"
  | "drumChute"
  | "submitting"
  | "submitted"
  | "notify"
  | "sms"
  | "smsSent"
  | "directions"
  | "nearest"
  | "anythingElse"
  | "csat"
  | "voiceListen"
  | "voiceConfirm"
  | "voiceUnclear";

interface ChatMsg {
  who: "bot" | "user";
  text: string;
}

export const AivaApp = () => {
  const [screen, setScreen] = useState<Screen>(() => {
    if (typeof window !== "undefined" && localStorage.getItem("aiva-consent") === "1") {
      return "qr";
    }
    return "consent";
  });
  const [history, setHistory] = useState<Screen[]>([]);
  const [problem, setProblem] = useState<string>("");
  const [problemDetail, setProblemDetail] = useState<string>("");
  const [phone, setPhone] = useState("");
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);
  const [comment, setComment] = useState("");
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [voiceConf, setVoiceConf] = useState(0);

  const goto = (s: Screen) => {
    setHistory((h) => [...h, screen]);
    setScreen(s);
  };
  const back = () => {
    setHistory((h) => {
      if (h.length === 0) return h;
      const prev = h[h.length - 1];
      setScreen(prev);
      return h.slice(0, -1);
    });
  };
  const restart = () => {
    setHistory([]);
    setScreen("qr");
    setProblem("");
    setProblemDetail("");
    setPhone("");
    setFeedback(null);
    setComment("");
    setVoiceTranscript("");
    setVoiceConf(0);
  };

  const showHeader = screen !== "qr" && screen !== "consent";

  return (
    <PhoneFrame>
      {showHeader && (
        <Header
          onBack={history.length > 0 ? back : undefined}
          onRestart={restart}
          showBack={history.length > 0}
        />
      )}
      <div className="flex-1 overflow-hidden flex flex-col bg-white">
        {screen === "consent" && (
          <ConsentScreen
            onAgree={() => {
              try { localStorage.setItem("aiva-consent", "1"); } catch {}
              goto("qr");
            }}
          />
        )}
        {screen === "qr" && <QrLanding onScan={() => goto("greeting")} />}
        {screen === "greeting" && (
          <Greeting
            onWayfinding={() => goto("wayfinding")}
            onReport={() => goto("confirmLocation")}
            onVoice={() => goto("voiceListen")}
          />
        )}
        {screen === "wayfinding" && <Wayfinding />}
        {screen === "confirmLocation" && (
          <ConfirmLocation onConfirm={() => goto("thanks")} onDeny={() => goto("thanks")} />
        )}
        {screen === "thanks" && <Thanks onNext={() => goto("status")} />}
        {screen === "status" && <StatusScreen onNext={() => goto("services")} />}
        {screen === "services" && <Services onReport={() => goto("problemType")} />}
        {screen === "problemType" && (
          <ProblemType
            onPick={(p) => {
              setProblem(p);
              if (p === "Drum Chute") goto("drumChute");
              else goto("submitting");
            }}
          />
        )}
        {screen === "drumChute" && (
          <DrumChute
            onPick={(d) => {
              setProblemDetail(d);
              goto("submitting");
            }}
          />
        )}
        {screen === "submitting" && (
          <Submitting onDone={() => goto("submitted")} problem={problem} detail={problemDetail} />
        )}
        {screen === "submitted" && <Submitted onNext={() => goto("notify")} />}
        {screen === "notify" && (
          <Notify onYes={() => goto("sms")} onNo={() => goto("directions")} />
        )}
        {screen === "sms" && (
          <SmsOptIn
            phone={phone}
            setPhone={setPhone}
            onSend={() => goto("smsSent")}
          />
        )}
        {screen === "smsSent" && <SmsSent onNext={() => goto("directions")} />}
        {screen === "directions" && (
          <Directions onYes={() => goto("nearest")} onNo={() => goto("anythingElse")} />
        )}
        {screen === "nearest" && <Nearest onNext={() => goto("anythingElse")} />}
        {screen === "anythingElse" && (
          <AnythingElse onAnother={() => { restart(); setTimeout(() => setScreen("greeting"), 0); }} onDone={() => goto("csat")} />
        )}
        {screen === "csat" && (
          <Csat
            feedback={feedback}
            setFeedback={setFeedback}
            comment={comment}
            setComment={setComment}
            onSubmit={restart}
          />
        )}
        {screen === "voiceListen" && (
          <VoiceListen
            onStop={(t, c) => {
              setVoiceTranscript(t);
              setVoiceConf(c);
              const intent = classifyVoiceIntent(t);
              if (intent === "wayfinding") goto("wayfinding");
              else if (intent === "report") goto("voiceConfirm");
              else goto("voiceUnclear");
            }}
          />
        )}
        {screen === "voiceConfirm" && (
          <VoiceConfirm
            transcript={voiceTranscript}
            confidence={voiceConf}
            onConfirm={() => goto("confirmLocation")}
            onRetry={() => goto("voiceListen")}
          />
        )}
        {screen === "voiceUnclear" && (
          <VoiceUnclear
            transcript={voiceTranscript}
            onWayfinding={() => goto("wayfinding")}
            onReport={() => goto("confirmLocation")}
            onRetry={() => goto("voiceListen")}
          />
        )}
      </div>
    </PhoneFrame>
  );
};

/* ---------- Screens ---------- */

const ConsentScreen = ({ onAgree }: { onAgree: () => void }) => {
  const [agreed, setAgreed] = useState(false);
  return (
    <div className="flex-1 flex flex-col p-6 bg-white text-aiva-navy anim-fade-up overflow-y-auto">
      <div className="flex-1 flex flex-col justify-center gap-5 py-6">
        <img src={uspsLogo} alt="USPS" className="w-32 h-auto object-contain mx-auto" />
        <div className="text-center space-y-2">
          <h1 className="text-xl font-bold tracking-tight">Before you continue</h1>
          <p className="text-[13px] text-foreground/70 leading-relaxed">
            Please review how AIVA handles your information.
          </p>
        </div>

        <div className="bg-aiva-bot-bg rounded-xl p-4 text-[12px] leading-relaxed space-y-3 text-foreground/80">
          <div>
            <div className="font-semibold text-foreground mb-1">What we collect</div>
            Your menu choices and any messages you send so AIVA can help you. If you opt in to SMS updates, we use your phone number only for that ticket.
          </div>
          <div>
            <div className="font-semibold text-foreground mb-1">Voice input</div>
            Voice is transcribed by your browser's built-in speech engine. Audio is processed on your device and is <span className="font-semibold">not recorded or stored</span> by USPS.
          </div>
          <div>
            <div className="font-semibold text-foreground mb-1">No tracking, no selling</div>
            AIVA does not sell your information or use it for advertising. This is a demo experience — no real account is created.
          </div>
        </div>

        <label className="flex items-start gap-3 text-[13px] cursor-pointer select-none">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-aiva-blue-deep cursor-pointer"
          />
          <span className="text-foreground/80">
            I agree to the{" "}
            <span className="text-aiva-blue-deep font-semibold underline">Terms of Use</span> and{" "}
            <span className="text-aiva-blue-deep font-semibold underline">Privacy Notice</span>.
          </span>
        </label>

        <button
          onClick={onAgree}
          disabled={!agreed}
          className="w-full bg-aiva-blue-deep text-white px-6 py-3.5 rounded-full font-semibold text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg"
        >
          Agree & Continue
        </button>
      </div>
      <p className="text-[10px] text-muted-foreground tracking-wide text-center">
        Demo only · Not a real USPS service
      </p>
    </div>
  );
};

const QrLanding = ({ onScan }: { onScan: () => void }) => (
  <div className="flex-1 flex flex-col items-center justify-between p-8 bg-white text-aiva-navy anim-fade-up">
    <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground pt-4">
      USPS · Self-Operating Post Office
    </div>
    <div className="flex flex-col items-center gap-8 text-center">
      <img
        src={uspsLogo}
        alt="USPS logo"
        className="w-56 h-auto object-contain animate-[fade-up_0.7s_ease-out]"
        style={{ animationDelay: "0.05s", animationFillMode: "both" }}
      />
      <div className="space-y-3 max-w-[280px]">
        <h1
          className="text-[26px] leading-tight font-bold tracking-tight anim-fade-up"
          style={{ animationDelay: "0.25s", animationFillMode: "both" }}
        >
          Welcome to <span className="text-aiva-blue-deep">AIVA</span>
        </h1>
        <p
          className="text-[14px] leading-relaxed text-foreground/70 anim-fade-up"
          style={{ animationDelay: "0.4s", animationFillMode: "both" }}
        >
          Your AI Virtual Assistant for Self-Operating Post Offices.
        </p>
      </div>
      <button
        onClick={onScan}
        className="group inline-flex items-center gap-2 bg-aiva-blue-deep text-white px-7 py-3.5 rounded-full font-semibold text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all anim-fade-up"
        style={{ animationDelay: "0.55s", animationFillMode: "both" }}
      >
        Get started
        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
      </button>
    </div>
    <p className="text-[10px] text-muted-foreground tracking-wide">
      Demo · No real account or data needed
    </p>
  </div>
);

const Greeting = ({
  onWayfinding, onReport, onVoice,
}: { onWayfinding: () => void; onReport: () => void; onVoice: () => void }) => {
  const [showButtons, setShowButtons] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShowButtons(true), 600);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="flex-1 flex flex-col anim-slide-right">
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
        {!showButtons ? <Typing /> : (
          <>
            <BotBubble>Hi, I'm AIVA. How can I help you today?</BotBubble>
            <div className="space-y-2 pt-2">
              <ChoiceButton onClick={onWayfinding}>
                <span className="inline-flex items-center gap-2"><MapIcon className="w-4 h-4" /> Help me find something</span>
              </ChoiceButton>
              <ChoiceButton onClick={onReport}>
                <span className="inline-flex items-center gap-2"><AlertCircle className="w-4 h-4" /> Report a problem</span>
              </ChoiceButton>
            </div>
          </>
        )}
      </div>
      <ComposerBar onMic={onVoice} />
    </div>
  );
};

const ComposerBar = ({ onMic }: { onMic: () => void }) => (
  <div className="border-t border-border bg-white p-2 flex items-center gap-2 shrink-0">
    <input
      placeholder="Type a message…"
      className="flex-1 bg-aiva-bot-bg rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-aiva-blue/40"
    />
    <button
      onClick={onMic}
      aria-label="Voice input"
      className="w-10 h-10 rounded-full bg-aiva-blue-deep text-white flex items-center justify-center active:scale-95 transition"
    >
      <Mic className="w-5 h-5" />
    </button>
    <button aria-label="Send" className="w-10 h-10 rounded-full bg-aiva-bot-bg text-muted-foreground flex items-center justify-center">
      <Send className="w-4 h-4" />
    </button>
  </div>
);

const ConvoLayout = ({ messages, children }: { messages: ChatMsg[]; children?: React.ReactNode }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior: "smooth" });
  }, [messages, children]);
  return (
    <div ref={ref} className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide anim-slide-right">
      {messages.map((m, i) =>
        m.who === "bot" ? <BotBubble key={i}>{m.text}</BotBubble> : <UserBubble key={i}>{m.text}</UserBubble>
      )}
      {children}
    </div>
  );
};

const useTypingDelay = (ms = 500) => {
  const [done, setDone] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setDone(true), ms);
    return () => clearTimeout(t);
  }, [ms]);
  return done;
};

const ConfirmLocation = ({ onConfirm, onDeny }: { onConfirm: () => void; onDeny: () => void }) => {
  const ready = useTypingDelay(500);
  return (
    <ConvoLayout messages={[{ who: "bot", text: "Is this your current location?" }]}>
      {!ready ? <Typing /> : (
        <>
          <Card>
            <div className="flex gap-3">
              <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-[#A7C7E7] to-[#5B8DBF] flex items-center justify-center shrink-0">
                <MapPin className="w-7 h-7 text-white" fill="white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm">Self-Operating Post Office</div>
                <div className="text-xs text-muted-foreground">8150 Leesburg Pike</div>
                <div className="text-xs text-muted-foreground">Vienna, VA 22182</div>
              </div>
            </div>
          </Card>
          <div className="space-y-2 pt-1">
            <ChoiceButton variant="primary" onClick={onConfirm}>Yes, confirm location</ChoiceButton>
            <ChoiceButton onClick={onDeny}>No, I'm at another location</ChoiceButton>
          </div>
        </>
      )}
    </ConvoLayout>
  );
};

const Thanks = ({ onNext }: { onNext: () => void }) => {
  const ready = useTypingDelay(450);
  useEffect(() => { if (ready) { const t = setTimeout(onNext, 700); return () => clearTimeout(t); } }, [ready, onNext]);
  return (
    <ConvoLayout
      messages={[
        { who: "user", text: "Yes, confirm location" },
        ...(ready ? [{ who: "bot" as const, text: "Thanks for confirming." }] : []),
      ]}
    >
      {!ready && <Typing />}
    </ConvoLayout>
  );
};

const EQUIP_STATUS = [
  { name: "Self-Service Kiosk (SSK)", ok: true },
  { name: "Drum Chute", ok: true },
  { name: "Automated Parcel Drop (APD)", ok: true },
  { name: "Parcel Lockers", ok: true },
  { name: "Mail Chute", ok: true },
];

const StatusScreen = ({ onNext }: { onNext: () => void }) => {
  const ready = useTypingDelay(500);
  return (
    <ConvoLayout messages={[{ who: "bot", text: "Here's the current status of your location." }]}>
      {!ready ? <Typing /> : (
        <>
          <Card>
            <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Equipment</div>
            <ul className="space-y-2">
              {EQUIP_STATUS.map((e) => (
                <li key={e.name} className="flex items-center justify-between text-sm">
                  <span>{e.name}</span>
                  <span className="inline-flex items-center gap-1 text-aiva-success text-xs font-semibold">
                    <span className="w-2 h-2 rounded-full bg-aiva-success" /> Operational
                  </span>
                </li>
              ))}
            </ul>
          </Card>
          <ChoiceButton variant="primary" onClick={onNext}>Continue</ChoiceButton>
        </>
      )}
    </ConvoLayout>
  );
};

const Services = ({ onReport }: { onReport: () => void }) => {
  const ready = useTypingDelay(500);
  return (
    <ConvoLayout messages={[{ who: "bot", text: "What services can I help with today?" }]}>
      {!ready ? <Typing /> : <ChoiceButton variant="primary" onClick={onReport}>Report a Problem</ChoiceButton>}
    </ConvoLayout>
  );
};

const PROBLEMS = ["Self-Service Kiosk (SSK)", "Drum Chute", "Automated Parcel Drop (APD)", "Parcel Lockers", "Mail Chute", "Something else"];
const ProblemType = ({ onPick }: { onPick: (p: string) => void }) => {
  const ready = useTypingDelay(500);
  return (
    <ConvoLayout messages={[{ who: "bot", text: "What kind of problem are you having?" }]}>
      {!ready ? <Typing /> : (
        <div className="space-y-2">
          {PROBLEMS.map((p) => (
            <ChoiceButton key={p} onClick={() => onPick(p)}>{p}</ChoiceButton>
          ))}
        </div>
      )}
    </ConvoLayout>
  );
};

const DRUM = ["It's full", "It's jammed", "Won't open", "Something else"];
const DrumChute = ({ onPick }: { onPick: (d: string) => void }) => {
  const ready = useTypingDelay(500);
  return (
    <ConvoLayout
      messages={[
        { who: "user", text: "Drum Chute" },
        ...(ready ? [{ who: "bot" as const, text: "Got it, the Drum Chute. What's happening with it?" }] : []),
      ]}
    >
      {!ready ? <Typing /> : (
        <div className="space-y-2">
          {DRUM.map((d) => (
            <ChoiceButton key={d} onClick={() => onPick(d)}>{d}</ChoiceButton>
          ))}
        </div>
      )}
    </ConvoLayout>
  );
};

const Submitting = ({ onDone, problem, detail }: { onDone: () => void; problem: string; detail: string }) => {
  useEffect(() => { const t = setTimeout(onDone, 1800); return () => clearTimeout(t); }, [onDone]);
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 anim-fade-up">
      <Loader2 className="w-12 h-12 text-aiva-blue animate-spin" />
      <div className="text-base font-semibold">Submitting your report…</div>
      <div className="text-xs text-muted-foreground text-center">
        {problem}{detail ? ` · ${detail}` : ""}
      </div>
    </div>
  );
};

const Submitted = ({ onNext }: { onNext: () => void }) => {
  const ready = useTypingDelay(700);
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide anim-slide-right">
      <div className="flex flex-col items-center gap-2 pt-4 anim-fade-up">
        <div className="w-16 h-16 rounded-full bg-aiva-success-bg flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 text-aiva-success" />
        </div>
        <div className="font-semibold text-base">Report submitted</div>
      </div>
      <div className="bg-aiva-success-bg border border-aiva-success/30 text-aiva-success rounded-xl p-3 text-sm font-medium anim-fade-up">
        Thank you for reporting this issue. The local post office has been notified and will investigate shortly.
      </div>
      <Card>
        <div className="text-xs font-semibold uppercase text-muted-foreground tracking-wide mb-1">What happens next</div>
        <p className="text-sm text-foreground/80 leading-relaxed">
          The local post office will dispatch staff to investigate the Drum Chute. You don't need to do anything else — your report is in the queue.
        </p>
      </Card>
      {ready && <ChoiceButton variant="primary" onClick={onNext}>Continue</ChoiceButton>}
      {!ready && <Typing />}
    </div>
  );
};

const Notify = ({ onYes, onNo }: { onYes: () => void; onNo: () => void }) => {
  const ready = useTypingDelay(450);
  return (
    <ConvoLayout messages={[{ who: "bot", text: "Want a text when it's resolved?" }]}>
      {!ready ? <Typing /> : (
        <div className="space-y-2">
          <ChoiceButton variant="primary" onClick={onYes}>Yes, notify me</ChoiceButton>
          <ChoiceButton onClick={onNo}>No thanks</ChoiceButton>
        </div>
      )}
    </ConvoLayout>
  );
};

const SmsOptIn = ({ phone, setPhone, onSend }: { phone: string; setPhone: (s: string) => void; onSend: () => void }) => (
  <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide anim-slide-right">
    <BotBubble>Enter a mobile number and we'll text you when it's fixed.</BotBubble>
    <Card>
      <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Mobile number</label>
      <div className="flex items-center gap-2 mt-2 border border-border rounded-lg px-3 py-2">
        <Smartphone className="w-4 h-4 text-muted-foreground" />
        <input
          type="tel"
          inputMode="tel"
          placeholder="(555) 123-4567"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="flex-1 outline-none text-sm bg-transparent"
        />
      </div>
      <p className="text-[11px] text-muted-foreground mt-2">Number used once, not stored.</p>
    </Card>
    <ChoiceButton variant="primary" onClick={onSend}>Send</ChoiceButton>
  </div>
);

const SmsSent = ({ onNext }: { onNext: () => void }) => {
  const ready = useTypingDelay(700);
  useEffect(() => { if (ready) { const t = setTimeout(onNext, 900); return () => clearTimeout(t); } }, [ready, onNext]);
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8 anim-fade-up">
      <CheckCircle2 className="w-12 h-12 text-aiva-success" />
      <div className="font-semibold">You're all set</div>
      <div className="text-sm text-muted-foreground text-center">We'll text you when the issue is resolved.</div>
    </div>
  );
};

const Directions = ({ onYes, onNo }: { onYes: () => void; onNo: () => void }) => {
  const ready = useTypingDelay(500);
  return (
    <ConvoLayout messages={[{ who: "bot", text: "Want directions to the nearest staffed post office?" }]}>
      {!ready ? <Typing /> : (
        <div className="space-y-2">
          <ChoiceButton variant="primary" onClick={onYes}>Yes</ChoiceButton>
          <ChoiceButton onClick={onNo}>No</ChoiceButton>
        </div>
      )}
    </ConvoLayout>
  );
};

const Nearest = ({ onNext }: { onNext: () => void }) => (
  <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide anim-slide-right">
    <BotBubble>Here's the nearest staffed location.</BotBubble>
    <Card>
      <div className="flex gap-3">
        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-[#A7C7E7] to-[#5B8DBF] flex items-center justify-center shrink-0">
          <MapPin className="w-7 h-7 text-white" fill="white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm">McLean Post Office</div>
          <div className="text-xs text-muted-foreground">1544 Spring Hill Rd</div>
          <div className="text-xs text-muted-foreground">McLean, VA · 2 mi away</div>
        </div>
      </div>
    </Card>
    <ChoiceButton variant="primary" onClick={onNext}>Text me the address</ChoiceButton>
    <ChoiceButton onClick={onNext}>Skip</ChoiceButton>
  </div>
);

const AnythingElse = ({ onAnother, onDone }: { onAnother: () => void; onDone: () => void }) => {
  const ready = useTypingDelay(450);
  return (
    <ConvoLayout messages={[{ who: "bot", text: "Anything else before you go?" }]}>
      {!ready ? <Typing /> : (
        <div className="space-y-2">
          <ChoiceButton onClick={onAnother}>Yes, another question</ChoiceButton>
          <ChoiceButton variant="primary" onClick={onDone}>No, I'm done</ChoiceButton>
        </div>
      )}
    </ConvoLayout>
  );
};

const Csat = ({
  feedback, setFeedback, comment, setComment, onSubmit,
}: {
  feedback: "up" | "down" | null;
  setFeedback: (f: "up" | "down") => void;
  comment: string;
  setComment: (s: string) => void;
  onSubmit: () => void;
}) => (
  <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-hide anim-slide-right">
    <div className="text-center pt-2">
      <h2 className="font-semibold text-lg">How was this experience?</h2>
      <p className="text-sm text-muted-foreground mt-1">Your feedback helps us improve AIVA.</p>
    </div>
    <div className="flex gap-3 justify-center pt-2">
      {(["up", "down"] as const).map((v) => {
        const Icon = v === "up" ? ThumbsUp : ThumbsDown;
        const active = feedback === v;
        return (
          <button
            key={v}
            onClick={() => setFeedback(v)}
            className={`w-20 h-20 rounded-2xl border-2 flex items-center justify-center transition ${
              active ? "border-aiva-blue-deep bg-aiva-blue-deep/10 text-aiva-blue-deep" : "border-border text-muted-foreground"
            }`}
            aria-label={v === "up" ? "Thumbs up" : "Thumbs down"}
          >
            <Icon className="w-8 h-8" />
          </button>
        );
      })}
    </div>
    <div>
      <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Add a comment (optional)
      </label>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        placeholder="Tell us more…"
        className="w-full mt-2 border border-border rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-aiva-blue/40 resize-none"
      />
    </div>
    <ChoiceButton variant="primary" onClick={onSubmit}>Submit feedback</ChoiceButton>
  </div>
);

/* ------- Voice ------- */

type VoiceIntent = "wayfinding" | "report" | "unclear";

const classifyVoiceIntent = (raw: string): VoiceIntent => {
  const t = (raw || "").toLowerCase().trim();
  if (!t) return "unclear";

  const wayfindingKeywords = [
    "find", "where", "locate", "location", "directions", "direction",
    "show me", "help me find", "look for", "looking for",
    "drop off", "drop-off", "mailbox", "drop box", "kiosk",
    "stamps", "stamp machine", "package", "packages", "parcel",
    "scale", "weigh", "po box", "p.o. box", "pickup", "pick up",
    "hours", "open", "closed", "wayfinding", "navigate",
  ];
  const reportKeywords = [
    "report", "problem", "issue", "broken", "not working", "doesn't work",
    "doesnt work", "isn't working", "isnt working", "stuck", "jam", "jammed",
    "error", "complaint", "complain", "bug", "fix", "out of order",
    "malfunction", "trouble", "help with", "something wrong", "not functioning",
  ];

  if (wayfindingKeywords.some((k) => t.includes(k))) return "wayfinding";
  if (reportKeywords.some((k) => t.includes(k))) return "report";
  return "unclear";
};

const VoiceUnclear = ({
  transcript, onWayfinding, onReport, onRetry,
}: {
  transcript: string;
  onWayfinding: () => void;
  onReport: () => void;
  onRetry: () => void;
}) => {
  const ready = useTypingDelay(500);
  return (
    <ConvoLayout
      messages={[
        { who: "user", text: transcript || "(no audio)" },
        ...(ready
          ? [{
              who: "bot" as const,
              text: `Sorry, I didn't quite catch that as one of my options. I can help you with two things — would you like to find something, or report a problem?`,
            }]
          : []),
      ]}
    >
      {!ready ? <Typing /> : (
        <>
          <ChoiceButton variant="primary" onClick={onWayfinding}>
            <span className="inline-flex items-center gap-2"><MapIcon className="w-4 h-4" /> Help me find something</span>
          </ChoiceButton>
          <ChoiceButton onClick={onReport}>
            <span className="inline-flex items-center gap-2"><AlertCircle className="w-4 h-4" /> Report a problem</span>
          </ChoiceButton>
          <ChoiceButton onClick={onRetry}>
            <span className="inline-flex items-center gap-2"><Mic className="w-4 h-4" /> Try voice again</span>
          </ChoiceButton>
        </>
      )}
    </ConvoLayout>
  );
};


const VoiceListen = ({ onStop }: { onStop: (transcript: string, conf: number) => void }) => {
  const [supported, setSupported] = useState<boolean>(true);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interim, setInterim] = useState("");
  const [confidence, setConfidence] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [manualText, setManualText] = useState("");
  const recRef = useRef<any>(null);
  const finalRef = useRef<string>("");

  // Detect support on mount but DO NOT auto-start (gesture required)
  useEffect(() => {
    const Ctor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setSupported(!!Ctor);
    return () => {
      try { recRef.current?.stop(); } catch {}
    };
  }, []);

  // Synchronous start inside the click handler — preserves the gesture chain
  const startListening = () => {
    setError(null);
    const Ctor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!Ctor) { setSupported(false); return; }
    if (listening) return;

    try {
      const rec = new Ctor();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "en-US";

      rec.onresult = (e: any) => {
        let interimText = "";
        let conf = 0;
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const r = e.results[i];
          if (r.isFinal) {
            finalRef.current += r[0].transcript + " ";
            conf = Math.max(conf, r[0].confidence || 0.9);
          } else {
            interimText += r[0].transcript;
          }
        }
        setTranscript(finalRef.current.trim());
        setInterim(interimText);
        if (conf) setConfidence(conf);
      };
      rec.onerror = (e: any) => {
        if (e.error === "no-speech") return; // keep listening
        if (e.error === "not-allowed" || e.error === "service-not-allowed") {
          setError("Microphone permission was denied. Please allow access in your browser.");
        } else {
          setError(`Mic error: ${e.error}`);
        }
        setListening(false);
      };
      rec.onend = () => setListening(false);

      finalRef.current = "";
      setTranscript("");
      setInterim("");
      setConfidence(0);
      recRef.current = rec;
      rec.start();
      setListening(true);
    } catch (err: any) {
      setError(err?.message || "Could not start microphone.");
      setListening(false);
    }
  };

  const stopAndContinue = () => {
    try { recRef.current?.stop(); } catch {}
    setListening(false);
    const final = (finalRef.current + " " + interim).trim();
    onStop(final || transcript || "I'd like to report a problem", confidence || 0.92);
  };

  if (!supported) {
    return (
      <div className="flex-1 flex flex-col p-5 gap-4 anim-fade-up">
        <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-3 text-sm">
          Voice input isn't supported in this browser. Try Chrome or Safari, or type below.
        </div>
        <textarea
          value={manualText}
          onChange={(e) => setManualText(e.target.value)}
          rows={4}
          placeholder="Type your problem here…"
          className="w-full border border-border rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-aiva-blue/40 resize-none"
        />
        <ChoiceButton variant="primary" onClick={() => onStop(manualText || "I'd like to report a problem", 1)}>
          Continue
        </ChoiceButton>
      </div>
    );
  }

  const liveText = (transcript + (interim ? " " + interim : "")).trim();

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-6 p-6 bg-gradient-to-b from-white to-aiva-page anim-fade-up">
      <div className="relative">
        <div className={`relative w-32 h-32 rounded-full bg-aiva-blue text-white flex items-center justify-center shadow-xl ${listening ? "pulse-ring" : ""}`}>
          <Mic className="w-12 h-12" />
        </div>
      </div>
      <div className="text-center">
        <div className="font-semibold">
          {listening ? "Listening…" : transcript ? "Tap stop when done" : "Tap the mic to start"}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {listening ? "Speak naturally — your words appear live below." : "We'll transcribe what you say in real time."}
        </div>
      </div>

      <div className="w-full bg-aiva-bot-bg rounded-xl p-4 min-h-[90px] text-sm">
        {liveText ? (
          <span>
            <span className="text-foreground">{transcript}</span>
            {interim && <span className="text-muted-foreground italic"> {interim}</span>}
          </span>
        ) : (
          <span className="text-muted-foreground">Your words will appear here…</span>
        )}
      </div>

      <div className="w-full flex items-start gap-2 text-[11px] text-muted-foreground bg-aiva-bot-bg/60 border border-border rounded-lg px-3 py-2">
        <span aria-hidden className="mt-0.5">🔒</span>
        <span>
          Voice is transcribed by your browser. Audio isn't recorded or sent to USPS — only the text you confirm is shared.
        </span>
      </div>

      {error && (
        <div className="w-full bg-red-50 border border-red-200 text-red-800 rounded-lg p-3 text-xs">{error}</div>
      )}

      {!listening ? (
        <button
          onClick={startListening}
          className="w-16 h-16 rounded-full bg-aiva-blue-deep text-white flex items-center justify-center shadow-lg active:scale-95 transition"
          aria-label="Start recording"
        >
          <Mic className="w-7 h-7" />
        </button>
      ) : (
        <button
          onClick={stopAndContinue}
          className="w-16 h-16 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg active:scale-95 transition"
          aria-label="Stop recording"
        >
          <Square className="w-6 h-6" fill="white" />
        </button>
      )}

      {!listening && transcript && (
        <ChoiceButton variant="primary" onClick={stopAndContinue}>Continue</ChoiceButton>
      )}
    </div>
  );
};

const VoiceConfirm = ({
  transcript, confidence, onConfirm, onRetry,
}: { transcript: string; confidence: number; onConfirm: () => void; onRetry: () => void }) => {
  const ready = useTypingDelay(500);
  const pct = Math.round((confidence || 0.92) * 100);
  return (
    <ConvoLayout
      messages={[
        { who: "user", text: transcript || "(no audio)" },
        ...(ready ? [{ who: "bot" as const, text: `I heard: "${transcript}" — does that sound right?` }] : []),
      ]}
    >
      {!ready ? <Typing /> : (
        <>
          <Card>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground inline-flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5" /> Confidence</span>
              <span className="font-semibold text-aiva-blue-deep">{pct}%</span>
            </div>
            <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-aiva-blue-deep rounded-full" style={{ width: `${pct}%` }} />
            </div>
          </Card>
          <ChoiceButton variant="primary" onClick={onConfirm}>Yes, that's right</ChoiceButton>
          <ChoiceButton onClick={onRetry}>Let me try again</ChoiceButton>
        </>
      )}
    </ConvoLayout>
  );
};
