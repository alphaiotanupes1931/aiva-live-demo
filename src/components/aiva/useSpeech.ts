import { useEffect, useRef, useState } from "react";

type SR = any;
declare global {
  interface Window {
    SpeechRecognition?: SR;
    webkitSpeechRecognition?: SR;
  }
}

export interface VoiceState {
  supported: boolean;
  listening: boolean;
  transcript: string;
  confidence: number;
  error: string | null;
  start: () => void;
  stop: () => void;
  reset: () => void;
}

export const useSpeech = (): VoiceState => {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [confidence, setConfidence] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const recRef = useRef<any>(null);

  useEffect(() => {
    const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Ctor) {
      setSupported(false);
      return;
    }
    setSupported(true);
    const rec = new Ctor();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";

    rec.onresult = (e: any) => {
      let finalText = "";
      let interim = "";
      let conf = 0;
      for (let i = 0; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) {
          finalText += r[0].transcript;
          conf = Math.max(conf, r[0].confidence || 0.9);
        } else {
          interim += r[0].transcript;
        }
      }
      setTranscript((finalText + " " + interim).trim());
      if (conf) setConfidence(conf);
    };
    rec.onerror = (e: any) => {
      setError(e.error || "speech-error");
      setListening(false);
    };
    rec.onend = () => setListening(false);
    recRef.current = rec;

    return () => {
      try { rec.stop(); } catch {}
    };
  }, []);

  const start = () => {
    if (!recRef.current) return;
    setTranscript("");
    setConfidence(0);
    setError(null);
    try {
      recRef.current.start();
      setListening(true);
    } catch {
      // already started
    }
  };
  const stop = () => {
    try { recRef.current?.stop(); } catch {}
    setListening(false);
  };
  const reset = () => {
    setTranscript("");
    setConfidence(0);
    setError(null);
  };

  return { supported, listening, transcript, confidence, error, start, stop, reset };
};
