import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cpu, Loader2, Sparkles, Download } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { toast } from "sonner";

const MODEL_ID = "Xenova/all-MiniLM-L6-v2";

/** Prototype statements that anchor each bias class in embedding space. */
const BIAS_PROTOTYPES: { label: string; text: string }[] = [
  { label: "Confirmation Bias", text: "I only look for evidence that proves I was right all along and ignore anything that contradicts me." },
  { label: "Catastrophizing", text: "This small setback means everything is going to collapse and end in total disaster." },
  { label: "Overgeneralization", text: "This always happens to me, nothing ever works out, every single time it is the same." },
  { label: "Black-and-White Thinking", text: "Either it is perfect or it is a complete failure, there is nothing in between." },
  { label: "Anchoring Bias", text: "The first number I heard set my expectation and I judged everything else relative to it." },
  { label: "Availability Heuristic", text: "I saw it on the news recently so it must be extremely common and likely to happen." },
  { label: "In-group Bias", text: "People like us are reasonable and honest, while people from that group cannot be trusted." },
  { label: "Attribution Error", text: "They failed because they are lazy and careless, but I failed because circumstances were against me." },
  { label: "Sunk Cost Fallacy", text: "I have already invested so much time and money that I cannot stop now, even though it is failing." },
  { label: "Mind Reading", text: "I know exactly what they are thinking about me and they clearly think I am incompetent." },
  { label: "Appeal to Authority", text: "An expert said it, so it must be true and there is no reason to question the claim." },
  { label: "Neutral / Unbiased", text: "The evidence suggests a moderate effect, though further data would be needed to draw a firm conclusion." },
];

type Extractor = (text: string | string[], opts?: Record<string, unknown>) => Promise<{ tolist(): number[][] }>;

let extractorPromise: Promise<Extractor> | null = null;

async function getExtractor(onProgress: (p: number) => void): Promise<Extractor> {
  if (!extractorPromise) {
    extractorPromise = import("@huggingface/transformers").then(({ pipeline, env }) => {
      env.allowLocalModels = false;
      return pipeline("feature-extraction", MODEL_ID, {
        dtype: "q8",
        progress_callback: (p: { status?: string; progress?: number }) => {
          if (p.status === "progress" && typeof p.progress === "number") onProgress(p.progress);
        },
      }) as unknown as Promise<Extractor>;
    });
  }
  return extractorPromise;
}

const cosine = (a: number[], b: number[]) => {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) || 1);
};

const softmax = (xs: number[], temperature = 0.06) => {
  const scaled = xs.map((x) => x / temperature);
  const max = Math.max(...scaled);
  const exps = scaled.map((x) => Math.exp(x - max));
  const sum = exps.reduce((s, v) => s + v, 0);
  return exps.map((v) => v / sum);
};

interface Ranked {
  label: string;
  similarity: number;
  probability: number;
}

const NeuralEmbeddingLab = () => {
  const { isQuantum } = useTheme();
  const [text, setText] = useState(
    "Everyone in that department is incompetent — I saw one bad report and it confirms exactly what I always suspected.",
  );
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [ranked, setRanked] = useState<Ranked[] | null>(null);
  const [meta, setMeta] = useState<{ dims: number; ms: number; tokens: number } | null>(null);

  const run = async () => {
    if (text.trim().length < 8) {
      toast.error("Add a little more text to embed.");
      return;
    }
    setLoading(true);
    setProgress(0);
    try {
      const extractor = await getExtractor(setProgress);
      const t0 = performance.now();
      const out = await extractor([text, ...BIAS_PROTOTYPES.map((p) => p.text)], {
        pooling: "mean",
        normalize: true,
      });
      const vectors = out.tolist();
      const query = vectors[0];
      const sims = BIAS_PROTOTYPES.map((p, i) => cosine(query, vectors[i + 1]));
      const probs = softmax(sims);
      const rows = BIAS_PROTOTYPES.map((p, i) => ({
        label: p.label,
        similarity: sims[i],
        probability: probs[i],
      })).sort((a, b) => b.probability - a.probability);
      setRanked(rows);
      setMeta({
        dims: query.length,
        ms: Math.round(performance.now() - t0),
        tokens: text.trim().split(/\s+/).length,
      });
      toast.success("Embeddings computed on-device");
    } catch (e) {
      console.error(e);
      toast.error("Could not load the on-device model. Check your connection and retry.");
    } finally {
      setLoading(false);
    }
  };

  const exportJson = () => {
    if (!ranked) return;
    const blob = new Blob(
      [JSON.stringify({ model: MODEL_ID, text, meta, ranking: ranked }, null, 2)],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mindtrace-zeroshot-embedding.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      id="embedding-lab"
      className={`${isQuantum ? "quantum-glass" : "glass-card"} rounded-2xl p-6`}
    >
      <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Cpu className="w-5 h-5 text-primary" />
            <h3 className="font-display font-bold text-lg text-foreground">
              On-Device Embedding Lab
            </h3>
          </div>
          <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
            Runs a real sentence-transformer ({MODEL_ID}) entirely in your browser via WebAssembly —
            no text leaves the device. Produces 384-dimensional mean-pooled embeddings and performs
            zero-shot bias classification by cosine similarity against calibrated class prototypes.
          </p>
        </div>
        <span className="text-[9px] font-mono px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
          Hugging Face · transformers.js
        </span>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        className="w-full text-sm rounded-xl bg-muted/10 border border-border/40 focus:border-primary/50 focus:outline-none p-3 text-foreground resize-none"
        placeholder="Paste a passage to embed and classify zero-shot…"
      />

      <div className="flex items-center gap-3 mt-3 flex-wrap">
        <button
          onClick={run}
          disabled={loading}
          className="flex items-center gap-2 text-xs px-4 py-2 rounded-xl bg-primary/15 border border-primary/30 text-primary hover:bg-primary/25 transition-all disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
          {loading ? "Running model…" : "Embed & classify"}
        </button>
        {ranked && (
          <button
            onClick={exportJson}
            className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all"
          >
            <Download className="w-3.5 h-3.5" /> Export JSON
          </button>
        )}
        {meta && (
          <span className="text-[10px] font-mono text-muted-foreground">
            {meta.dims}-d · {meta.tokens} tokens · {meta.ms} ms
          </span>
        )}
      </div>

      {loading && progress > 0 && progress < 100 && (
        <div className="mt-3 h-1 rounded-full bg-muted/30 overflow-hidden">
          <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
        </div>
      )}

      <AnimatePresence>
        {ranked && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-5 space-y-1.5 overflow-hidden"
          >
            {ranked.slice(0, 8).map((r, i) => (
              <div key={r.label} className="flex items-center gap-3">
                <span
                  className={`text-[11px] w-44 shrink-0 ${i === 0 ? "text-primary font-semibold" : "text-muted-foreground"}`}
                >
                  {r.label}
                </span>
                <div className="flex-1 h-2 rounded-full bg-muted/20 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(2, r.probability * 100)}%` }}
                    transition={{ delay: i * 0.04 }}
                    className={`h-full rounded-full ${i === 0 ? "bg-primary" : "bg-primary/40"}`}
                  />
                </div>
                <span className="text-[10px] font-mono text-muted-foreground w-24 text-right">
                  {(r.probability * 100).toFixed(1)}% · cos {r.similarity.toFixed(3)}
                </span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default NeuralEmbeddingLab;
