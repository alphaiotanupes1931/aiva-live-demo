import { useState, useEffect } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { VoiceTextInput } from "./VoiceTextInput";

interface FlowFeedbackProps {
  flowName: string;
  onDone: () => void;
  onReportIssue?: () => void;
}

export const FlowFeedback = ({ flowName, onDone }: FlowFeedbackProps) => {
  const [rating, setRating] = useState<"up" | "down" | null>(null);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    console.log("[AIVA] Feedback:", { flowName, rating, comment });
    setSubmitted(true);
  };

  // Auto-dismiss after showing thank you
  useEffect(() => {
    if (submitted) {
      const t = setTimeout(onDone, 2000);
      return () => clearTimeout(t);
    }
  }, [submitted, onDone]);

  if (submitted) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-5 p-6 anim-fade-up bg-aiva-page">
        <div className="w-16 h-16 rounded-full bg-aiva-success/10 flex items-center justify-center">
          <ThumbsUp className="w-8 h-8 text-aiva-success" />
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-lg font-bold text-aiva-navy">Thanks for your feedback!</h2>
          <p className="text-sm text-muted-foreground">Your input helps us improve AIVA.</p>
        </div>
        <p className="text-xs text-muted-foreground animate-pulse">Returning home…</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-aiva-page anim-fade-up">
      <div className="flex-1 overflow-y-auto px-5 pt-6 pb-4 scrollbar-hide">
        <div className="text-center space-y-2 mb-6">
          <h2 className="text-lg font-bold text-aiva-navy">How was your experience?</h2>
          <p className="text-sm text-muted-foreground">
            You just completed: <span className="font-semibold text-aiva-navy">{flowName}</span>
          </p>
        </div>

        <div className="flex gap-3 justify-center mb-6">
          {(["up", "down"] as const).map((v) => {
            const Icon = v === "up" ? ThumbsUp : ThumbsDown;
            const active = rating === v;
            return (
              <button
                key={v}
                onClick={() => setRating(v)}
                className={`w-20 h-20 rounded-2xl border-2 flex items-center justify-center transition ${
                  active ? "border-aiva-blue-deep bg-aiva-blue-deep/10 text-aiva-blue-deep" : "border-border text-muted-foreground hover:border-aiva-navy/30"
                }`}
                aria-label={v === "up" ? "Thumbs up" : "Thumbs down"}
              >
                <Icon className="w-8 h-8" />
              </button>
            );
          })}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground">
            Tell us more (optional)
          </label>
          <VoiceTextInput
            value={comment}
            onChange={setComment}
            placeholder="What went well? What could be better?"
            ariaLabel="Feedback comment"
            multiline
            rows={3}
          />
        </div>
      </div>

      <div className="px-5 pb-5 pt-2 shrink-0 bg-aiva-page">
        <button
          onClick={handleSubmit}
          className="w-full h-12 rounded-full bg-aiva-navy text-white font-semibold text-sm hover:bg-aiva-navy/90 transition active:scale-[0.99]"
        >
          {rating ? "Submit feedback" : "Skip and go home"}
        </button>
      </div>
    </div>
  );
};
