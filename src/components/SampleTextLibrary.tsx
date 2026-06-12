import { useState } from "react";
import { motion } from "framer-motion";
import { BookMarked, Copy, Check } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { toast } from "sonner";

interface Sample {
  title: string;
  category: string;
  text: string;
  biases: string[];
}

const SAMPLES: Sample[] = [
  {
    title: "Catastrophic Thinking",
    category: "Emotional",
    text: "Everyone always ignores me. My life is over. Nothing ever works out for me and it never will.",
    biases: ["Catastrophizing", "Overgeneralization", "All-or-Nothing"],
  },
  {
    title: "Sunk Cost Reasoning",
    category: "Economic",
    text: "I've already invested two years in this startup. I can't quit now even though the metrics keep falling.",
    biases: ["Sunk Cost Fallacy", "Loss Aversion"],
  },
  {
    title: "Survivorship Logic",
    category: "Statistical",
    text: "Every billionaire dropped out of college, so dropping out clearly leads to success.",
    biases: ["Survivorship Bias", "Selection Bias"],
  },
  {
    title: "Confirmation Loop",
    category: "Cognitive",
    text: "I only read news from sources I agree with because they always confirm what I already know is true.",
    biases: ["Confirmation Bias", "Filter Bubble"],
  },
  {
    title: "Mind Reading",
    category: "Social",
    text: "She didn't reply for an hour. She must hate me. Everyone in the office is judging me right now.",
    biases: ["Mind Reading", "Personalization"],
  },
  {
    title: "Anchoring Effect",
    category: "Cognitive",
    text: "The first quote was $10,000 so the $7,000 offer feels like an amazing deal even without comparison.",
    biases: ["Anchoring Bias", "Framing Effect"],
  },
];

const SampleTextLibrary = () => {
  const { isQuantum } = useTheme();
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (sample: Sample) => {
    navigator.clipboard.writeText(sample.text);
    setCopied(sample.title);
    toast.success(`Copied: ${sample.title}`);
    setTimeout(() => setCopied(null), 1500);
  };

  const handleUse = (sample: Sample) => {
    const event = new CustomEvent("mindtrace:loadSample", { detail: sample.text });
    window.dispatchEvent(event);
    toast.success("Loaded into detector — scroll down");
    document.querySelector("#detector")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-xs font-mono text-primary/70 uppercase tracking-widest mb-3 block">
            Sample Library
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            <span className={isQuantum ? "text-gradient-quantum" : "text-gradient-cyan"}>Pre-tagged</span> Bias Examples
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Curated passages used in cognitive psychology research. One click loads them into the detector.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SAMPLES.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className={`${isQuantum ? "quantum-glass" : "glass-card"} rounded-2xl p-5 flex flex-col`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono px-2 py-1 rounded bg-primary/10 text-primary border border-primary/20">
                  {s.category}
                </span>
                <BookMarked className="w-4 h-4 text-muted-foreground" />
              </div>
              <h4 className="font-display font-semibold text-sm mb-2">{s.title}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed flex-1 italic">"{s.text}"</p>
              <div className="flex flex-wrap gap-1 mt-3 mb-3">
                {s.biases.map((b) => (
                  <span key={b} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-muted/40 text-muted-foreground">
                    {b}
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleUse(s)}
                  className="flex-1 text-xs font-semibold px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition"
                >
                  Analyze
                </button>
                <button
                  onClick={() => handleCopy(s)}
                  className="text-xs px-3 py-2 border border-border/50 rounded-lg hover:border-primary/40 transition flex items-center gap-1"
                >
                  {copied === s.title ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SampleTextLibrary;
