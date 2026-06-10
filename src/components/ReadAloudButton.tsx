import { useState, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";

interface Props {
  text: string;
  lang?: string;
}

const LANG_MAP: Record<string, string> = {
  en: "en-US",
  hi: "hi-IN",
  bn: "bn-IN",
  ta: "ta-IN",
  te: "te-IN",
  mr: "mr-IN",
};

const ReadAloudButton = ({ text, lang = "en" }: Props) => {
  const [speaking, setSpeaking] = useState(false);
  const supported = typeof window !== "undefined" && "speechSynthesis" in window;

  useEffect(() => {
    return () => {
      if (supported) window.speechSynthesis.cancel();
    };
  }, [supported]);

  if (!supported) return null;

  const toggle = () => {
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = LANG_MAP[lang] || "en-US";
    utt.rate = 0.95;
    utt.onend = () => setSpeaking(false);
    utt.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utt);
    setSpeaking(true);
  };

  return (
    <button
      onClick={toggle}
      className={`px-3 py-1.5 rounded-lg text-xs border transition-colors flex items-center gap-1.5 ${
        speaking
          ? "border-primary/50 bg-primary/10 text-primary"
          : "border-border/50 hover:border-primary/40 text-muted-foreground hover:text-foreground"
      }`}
      title={speaking ? "Stop reading" : "Read aloud"}
    >
      {speaking ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
      {speaking ? "Stop" : "Listen"}
    </button>
  );
};

export default ReadAloudButton;
