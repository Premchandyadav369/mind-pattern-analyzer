import { useEffect, useRef, useState } from "react";
import { Mic, MicOff } from "lucide-react";
import { toast } from "sonner";

interface Props {
  onTranscript: (text: string) => void;
  language?: string;
}

const langMap: Record<string, string> = {
  en: "en-US",
  hi: "hi-IN",
  bn: "bn-IN",
  ta: "ta-IN",
  te: "te-IN",
  mr: "mr-IN",
};

const VoiceInputButton = ({ onTranscript, language = "en" }: Props) => {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const supported =
    typeof window !== "undefined" &&
    ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

  useEffect(() => {
    return () => {
      try {
        recognitionRef.current?.stop();
      } catch {}
    };
  }, []);

  const toggle = () => {
    if (!supported) {
      toast.error("Voice input not supported in this browser");
      return;
    }
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const rec = new SR();
    rec.lang = langMap[language] || "en-US";
    rec.continuous = true;
    rec.interimResults = true;
    let finalTranscript = "";
    rec.onresult = (e: any) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalTranscript += t + " ";
        else interim += t;
      }
      onTranscript((finalTranscript + interim).trim());
    };
    rec.onerror = (e: any) => {
      console.error("Speech error", e);
      setListening(false);
      toast.error(`Voice error: ${e.error || "unknown"}`);
    };
    rec.onend = () => setListening(false);
    rec.start();
    recognitionRef.current = rec;
    setListening(true);
    toast.success("Listening… speak now");
  };

  if (!supported) return null;

  return (
    <button
      onClick={toggle}
      title={listening ? "Stop recording" : "Voice input"}
      className={`px-3 py-2 rounded-lg text-xs border transition-colors flex items-center gap-1.5 ${
        listening
          ? "border-destructive/60 bg-destructive/10 text-destructive animate-pulse"
          : "border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/40"
      }`}
    >
      {listening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
      {listening ? "Stop" : "Voice"}
    </button>
  );
};

export default VoiceInputButton;
