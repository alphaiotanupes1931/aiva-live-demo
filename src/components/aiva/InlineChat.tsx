import { useEffect, useRef, useState } from "react";
import { Send, Loader2, Sparkles, RotateCcw } from "lucide-react";
import { VoiceTextInput } from "./VoiceTextInput";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type Msg = { role: "assistant" | "user"; content: string };

const SUGGESTED_QUESTIONS = [
  "What are the Post Office hours?",
  "How much to ship a 2 lb package to California?",
  "How do I track a package?",
  "Do you have PO Boxes available?",
];

interface InlineChatProps {
  location?: string;
}

/**
 * Inline chat composer for the home screen. Replaces the plain "type or dictate"
 * bar with a real chat experience: suggested hot buttons, message thread, and
 * dictation-enabled composer — all without leaving the screen.
 */
export const InlineChat = ({ location }: InlineChatProps) => {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const threadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const next: Msg[] = [...messages, { role: "user", content: trimmed }];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("aiva-chat", {
        body: {
          messages: next.map((m) => ({ role: m.role, content: m.content })),
          location: location || "unknown",
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
    } catch (err: any) {
      console.error("Inline chat error:", err);
      toast({
        title: "Couldn't reach AIVA",
        description: err?.message || "Please try again.",
        variant: "destructive",
      });
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Sorry, I had trouble connecting. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const showSuggestions = messages.length === 0 && !loading;

  return (
    <div className="border-t border-border bg-white shrink-0">
      {/* Conversation thread (only renders when there are messages) */}
      {messages.length > 0 && (
        <div className="flex flex-col bg-aiva-page">
          <div className="flex items-center justify-end px-3 pt-2">
            <button
              onClick={() => { setMessages([]); setInput(""); }}
              className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-aiva-navy transition"
            >
              <RotateCcw className="w-3 h-3" />
              New chat
            </button>
          </div>
          <div
            ref={threadRef}
            className="max-h-[240px] overflow-y-auto px-3 py-2 space-y-2 scrollbar-hide"
          >
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
        </div>
      )}

      {/* Suggested hot buttons */}
      {showSuggestions && (
        <div className="px-3 pt-3 pb-1">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-muted-foreground font-semibold mb-2">
            <Sparkles className="w-3 h-3" />
            Try asking
          </div>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTED_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                className="text-[12px] bg-aiva-bot-bg text-aiva-navy border border-aiva-navy/10 rounded-full px-3 py-1.5 hover:bg-aiva-blue-deep/5 hover:border-aiva-blue-deep/30 transition active:scale-[0.98]"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Composer */}
      <div className="p-3">
        <div className="flex items-end gap-2">
          <VoiceTextInput
            value={input}
            onChange={setInput}
            placeholder="Ask AIVA anything…"
            ariaLabel="Ask AIVA"
            className="flex-1"
          />
          <button
            onClick={() => sendMessage(input)}
            aria-label="Send"
            disabled={!input.trim() || loading}
            className="w-10 h-10 rounded-full bg-aiva-blue-deep text-white flex items-center justify-center shrink-0 disabled:opacity-40 active:scale-95 transition shadow-sm"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
