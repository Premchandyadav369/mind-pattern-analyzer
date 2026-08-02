import { useEffect, useState } from "react";
import { ThumbsUp, ThumbsDown, CircleSlash, Check } from "lucide-react";
import {
  loadFeedback,
  recordFeedback,
  makeFeedbackId,
  type FeedbackVerdict,
} from "@/lib/feedback";
import { BIAS_INFO } from "@/lib/biasAnalyzer";

interface Props {
  biasType: string;
  confidence: number;
  excerpt: string;
}

const OPTIONS: { verdict: FeedbackVerdict; label: string; icon: typeof ThumbsUp }[] = [
  { verdict: "correct", label: "Correct", icon: ThumbsUp },
  { verdict: "partial", label: "Partly", icon: CircleSlash },
  { verdict: "incorrect", label: "Wrong", icon: ThumbsDown },
];

const FeedbackControls = ({ biasType, confidence, excerpt }: Props) => {
  const [verdict, setVerdict] = useState<FeedbackVerdict | null>(null);
  const [corrected, setCorrected] = useState("");
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const id = makeFeedbackId(biasType, excerpt);
    const existing = loadFeedback().find((r) => r.id === id);
    if (existing) {
      setVerdict(existing.verdict);
      setCorrected(existing.correctedLabel ?? "");
      setNote(existing.note ?? "");
    }
  }, [biasType, excerpt]);

  const persist = (v: FeedbackVerdict, label = corrected, n = note) => {
    setVerdict(v);
    recordFeedback({
      biasType,
      verdict: v,
      confidence,
      excerpt,
      correctedLabel: label || undefined,
      note: n || undefined,
    });
    setSaved(true);
    window.dispatchEvent(new CustomEvent("mindtrace:feedback"));
    setTimeout(() => setSaved(false), 1600);
  };

  return (
    <div className="mt-5 pt-4 border-t border-border/30">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] text-muted-foreground/60 uppercase tracking-wider mr-1">
          Is this label right?
        </span>
        {OPTIONS.map(({ verdict: v, label, icon: Icon }) => (
          <button
            key={v}
            onClick={() => persist(v)}
            className={`text-[11px] px-2.5 py-1 rounded-lg border flex items-center gap-1 transition-colors ${
              verdict === v
                ? "bg-primary/15 text-primary border-primary/40"
                : "border-border/40 text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="w-3 h-3" /> {label}
          </button>
        ))}
        {saved && (
          <span className="text-[10px] text-secondary flex items-center gap-1">
            <Check className="w-3 h-3" /> saved to feedback corpus
          </span>
        )}
      </div>

      {verdict && verdict !== "correct" && (
        <div className="mt-3 flex flex-col sm:flex-row gap-2">
          <select
            value={corrected}
            onChange={(e) => {
              setCorrected(e.target.value);
              persist(verdict, e.target.value, note);
            }}
            className="text-xs bg-muted/30 border border-border/40 rounded-lg px-2 py-1.5 text-foreground"
          >
            <option value="">Correct label…</option>
            {BIAS_INFO.map((b) => (
              <option key={b.name} value={b.name}>
                {b.name}
              </option>
            ))}
            <option value="No bias">No bias</option>
          </select>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onBlur={() => persist(verdict, corrected, note)}
            placeholder="Annotator note (optional)"
            className="flex-1 text-xs bg-muted/30 border border-border/40 rounded-lg px-2 py-1.5 text-foreground placeholder:text-muted-foreground/50"
          />
        </div>
      )}
    </div>
  );
};

export default FeedbackControls;
