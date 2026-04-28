import { useEffect, useRef, useState } from "react";
import { X, Send, Mic, MicOff } from "lucide-react";
import { useSpeech } from "./useSpeech";

interface ChatbotModalProps {
  open: boolean;
  onClose: () => void;
}

type Msg = { who: "bot" | "user"; text: string };

const DEMO_QA: { q: string; a: string }[] = [
  {
    q: "What are USPS hours?",
    a: "Most USPS Post Offices are open Monday–Friday 9 AM to 5 PM, and Saturdays 9 AM to 1 PM. Hours vary by location — check usps.com/locator for your nearest branch.",
  },
  {
    q: "How much does it cost to ship a package?",
    a: "USPS Ground Advantage starts at $5.50 for small packages. Priority Mail starts around $10.40. Final price depends on weight, size, and destination — use the Self-Service Kiosk or usps.com to get an exact quote.",
  },
];

export const ChatbotModal = ({ open, onClose }: ChatbotModalProps) => {
  const [messages, setMessages] = useState<Msg[]>([
    {
      who: "bot",
      text: "Hi! I'm AIVA. This is a demo, so I can answer 2 sample USPS questions. Tap one below or use the mic to ask.",
    },
  ]);
  const [asked, setAsked] = useState<Set<number>>(new Set());
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const speech = useSpeech();

  useEffect(() => {
    if (speech.transcript) setInput(speech.transcript);
  }, [speech.transcript]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  if (!open) return null;

  const askDemo = (idx: number) => {
    const { q, a } = DEMO_QA[idx];
    setMessages((m) => [...m, { who: "user", text: q }, { who: "bot", text: a }]);
    setAsked((s) => new Set(s).add(idx));
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    setMessages((m) => [
      ...m,
      { who: "user", text },
      {
        who: "bot",
        text: "This is a demo — I can only answer the two sample questions below. Try one of those!",
      },
    ]);
    setInput("");
    speech.reset();
  };

  const toggleMic = () => {
    if (speech.listening) speech.stop();
    else speech.start();
  };

  return (
    <div
      className="absolute inset-0 z-50 bg-black/40 flex flex-col anim-fade-up"
      onClick={onClose}
    >
      <div
        className="mt-auto bg-white rounded-t-2xl flex flex-col h-[85%] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="h-12 bg-aiva-navy text-white flex items-center justify-between px-4 rounded-t-2xl shrink-0">
          <div className="flex flex-col leading-tight">
            <span className="font-semibold text-sm">Chat with AIVA</span>
            <span className="text-[10px] opacity-80 -mt-0.5">Demo · 2 sample questions</span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close chat"
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-2 bg-aiva-page scrollbar-hide">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`max-w-[80%] px-3 py-2 rounded-2xl text-[13px] leading-relaxed ${
                m.who === "bot"
                  ? "bg-aiva-bot-bg text-aiva-navy rounded-bl-sm"
                  : "ml-auto bg-aiva-blue-deep text-white rounded-br-sm"
              }`}
            >
              {m.text}
            </div>
          ))}

          {/* Suggested questions */}
          {asked.size < DEMO_QA.length && (
            <div className="pt-2 space-y-1.5">
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
                Try asking
              </div>
              {DEMO_QA.map((qa, idx) =>
                asked.has(idx) ? null : (
                  <button
                    key={idx}
                    onClick={() => askDemo(idx)}
                    className="block w-full text-left text-[12px] bg-white border border-border rounded-xl px-3 py-2 hover:bg-aiva-bot-bg transition"
                  >
                    {qa.q}
                  </button>
                )
              )}
            </div>
          )}
        </div>

        {/* Composer */}
        <div className="p-3 border-t border-border bg-white shrink-0">
          {speech.listening && (
            <div className="text-[11px] text-aiva-blue-deep font-semibold mb-1.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-aiva-blue-deep animate-pulse" />
              Listening…
            </div>
          )}
          <div className="flex items-center gap-2">
            {speech.supported && (
              <button
                onClick={toggleMic}
                aria-label={speech.listening ? "Stop voice" : "Start voice"}
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition ${
                  speech.listening
                    ? "bg-aiva-blue-deep text-white"
                    : "bg-aiva-bot-bg text-aiva-navy hover:bg-aiva-bot-bg/70"
                }`}
              >
                {speech.listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            )}
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask AIVA…"
              className="flex-1 h-10 px-3 rounded-full bg-aiva-bot-bg text-[13px] text-aiva-navy placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-aiva-blue-deep/30"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              aria-label="Send"
              className="w-10 h-10 rounded-full bg-aiva-blue-deep text-white flex items-center justify-center shrink-0 disabled:opacity-40 hover:bg-aiva-blue-deep/90 transition"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
