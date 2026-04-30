import { useEffect, useRef, useState } from "react";
import { X, Send, Mic, MicOff, Loader2, RotateCcw } from "lucide-react";
import { useSpeech } from "./useSpeech";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface ChatbotModalProps {
  open: boolean;
  onClose: () => void;
  location?: string;
  pageContext?: string;
  suggestions?: string[];
}

type Msg = { role: "assistant" | "user"; content: string };

const DEFAULT_SUGGESTIONS = [
  "What are the Post Office hours near me?",
  "How much does it cost to ship a 2 lb package to California?",
];

export const ChatbotModal = ({ open, onClose, location, pageContext, suggestions }: ChatbotModalProps) => {
  const tips = suggestions && suggestions.length > 0 ? suggestions : DEFAULT_SUGGESTIONS;

  const makeGreeting = (ctx?: string): Msg => ({
    role: "assistant",
    content: ctx
      ? `Hi! I'm AIVA. I can see you're on **${ctx}**. Ask me anything about this step or USPS in general.`
      : "Hi! I'm AIVA. Ask me anything about USPS — hours, shipping prices, tracking, PO Boxes — and I'll give you a real answer based on your location.",
  });

  const [messages, setMessages] = useState<Msg[]>([makeGreeting(pageContext)]);
  const prevContextRef = useRef(pageContext);

  // Reset greeting when the user opens chat on a different step
  useEffect(() => {
    if (open && pageContext !== prevContextRef.current) {
      setMessages([makeGreeting(pageContext)]);
      prevContextRef.current = pageContext;
    }
  }, [open, pageContext]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const speech = useSpeech();

  useEffect(() => {
    if (speech.transcript) setInput(speech.transcript);
  }, [speech.transcript]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  if (!open) return null;

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const newMessages: Msg[] = [...messages, { role: "user", content: trimmed }];
    setMessages(newMessages);
    setInput("");
    speech.reset();
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("aiva-chat", {
        body: {
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          location: location || "unknown",
          pageContext: pageContext || undefined,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
    } catch (err: any) {
      console.error("Chat error:", err);
      toast({
        title: "Couldn't reach AIVA",
        description: err?.message || "Please try again.",
        variant: "destructive",
      });
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: "Sorry, I had trouble connecting. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const toggleMic = () => {
    if (speech.listening) speech.stop();
    else speech.start();
  };

  const showSuggestions = messages.length === 1 && !loading;

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
            <span className="text-[10px] opacity-80 -mt-0.5">
              {location ? `Local to ${location}` : "USPS Virtual Assistant"}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                setMessages([{
                  role: "assistant",
                  content: pageContext
                    ? `Hi! I'm AIVA. I can see you're on **${pageContext}** — ask me anything about this step or USPS in general.`
                    : "Hi! I'm AIVA. Ask me anything about USPS — hours, shipping prices, tracking, PO Boxes — and I'll give you a real answer based on your location.",
                }]);
                setInput("");
              }}
              aria-label="Reset chat"
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              aria-label="Close chat"
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-2 bg-aiva-page scrollbar-hide">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`max-w-[85%] px-3 py-2 rounded-2xl text-[13px] leading-relaxed whitespace-pre-wrap ${
                m.role === "assistant"
                  ? "bg-aiva-bot-bg text-aiva-navy rounded-bl-sm"
                  : "ml-auto bg-aiva-blue-deep text-white rounded-br-sm"
              }`}
            >
              {m.content}
            </div>
          ))}

          {loading && (
            <div className="bg-aiva-bot-bg text-aiva-navy rounded-2xl rounded-bl-sm px-3 py-2 inline-flex items-center gap-2 text-[13px]">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              AIVA is typing…
            </div>
          )}

          {showSuggestions && (
            <div className="pt-2 space-y-1.5">
              <div className="text-[10px] text-muted-foreground font-semibold">
                Try asking
              </div>
              {tips.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="block w-full text-left text-[12px] bg-white border border-border rounded-xl px-3 py-2 hover:bg-aiva-bot-bg transition"
                >
                  {q}
                </button>
              ))}
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
              onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
              placeholder="Ask AIVA…"
              disabled={loading}
              className="flex-1 h-10 px-3 rounded-full bg-aiva-bot-bg text-[13px] text-aiva-navy placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-aiva-blue-deep/30 disabled:opacity-60"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
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
