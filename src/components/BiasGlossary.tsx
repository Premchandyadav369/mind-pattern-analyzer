import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Search, X } from "lucide-react";

interface Entry {
  name: string;
  category: string;
  definition: string;
  example: string;
}

const GLOSSARY: Entry[] = [
  { name: "Confirmation Bias", category: "Cognitive", definition: "Favoring information that confirms existing beliefs.", example: "Only reading news that agrees with you." },
  { name: "Catastrophizing", category: "Emotional", definition: "Expecting the worst-case outcome with little evidence.", example: "I failed one test, my life is over." },
  { name: "Black-and-White Thinking", category: "Cognitive", definition: "Viewing situations in extremes with no middle ground.", example: "If I'm not perfect, I'm a failure." },
  { name: "Overgeneralization", category: "Cognitive", definition: "Drawing broad conclusions from a single event.", example: "I was rejected once, no one will ever like me." },
  { name: "Mind Reading", category: "Social", definition: "Assuming you know what others think without evidence.", example: "They didn't reply — they must hate me." },
  { name: "Emotional Reasoning", category: "Emotional", definition: "Treating feelings as factual evidence.", example: "I feel stupid, so I must be stupid." },
  { name: "Sunk Cost Fallacy", category: "Economic", definition: "Continuing because of past investment, not future value.", example: "We've spent too much to stop now." },
  { name: "Anchoring Bias", category: "Cognitive", definition: "Over-relying on the first piece of information seen.", example: "Original price $500, now $300 — must be a deal." },
  { name: "Availability Heuristic", category: "Cognitive", definition: "Judging probability by easily recalled examples.", example: "Plane crashes are everywhere — flying is dangerous." },
  { name: "Hindsight Bias", category: "Cognitive", definition: "Believing past events were predictable after they happened.", example: "I knew it all along." },
  { name: "Hasty Generalization", category: "Logical", definition: "Drawing a conclusion from too small a sample.", example: "Met two rude people from there, the whole city is rude." },
  { name: "Survivorship Bias", category: "Statistical", definition: "Focusing on survivors and ignoring failures.", example: "All billionaires dropped out, so dropping out works." },
  { name: "Personalization", category: "Social", definition: "Taking blame for events outside your control.", example: "The team failed because of me." },
  { name: "Should Statements", category: "Cognitive", definition: "Rigid rules about how things must be.", example: "I should always be productive." },
  { name: "Labeling", category: "Cognitive", definition: "Defining yourself or others by a single trait.", example: "I'm a loser." },
  { name: "Fortune Telling", category: "Emotional", definition: "Predicting negative future events without evidence.", example: "This presentation will definitely fail." },
];

const CATEGORIES = ["All", "Cognitive", "Emotional", "Social", "Logical", "Statistical", "Economic"];

interface Props {
  open: boolean;
  onClose: () => void;
}

const BiasGlossary = ({ open, onClose }: Props) => {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("All");

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return GLOSSARY.filter(
      (e) =>
        (cat === "All" || e.category === cat) &&
        (q === "" || e.name.toLowerCase().includes(q) || e.definition.toLowerCase().includes(q))
    );
  }, [query, cat]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl max-h-[80vh] glass-card rounded-2xl overflow-hidden flex flex-col border-primary/20"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" />
                <h3 className="font-display font-semibold">Bias Glossary</h3>
                <span className="text-[10px] font-mono text-muted-foreground">{GLOSSARY.length} entries</span>
              </div>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-5 py-3 border-b border-border/40 space-y-3">
              <div className="flex items-center gap-2 bg-muted/20 rounded-lg px-3 py-2">
                <Search className="w-3.5 h-3.5 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search biases..."
                  className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground/50"
                />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCat(c)}
                    className={`text-[10px] font-mono px-2.5 py-1 rounded-full border transition-colors ${
                      cat === c
                        ? "border-primary/50 text-primary bg-primary/10"
                        : "border-border/50 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2">
              {filtered.length === 0 ? (
                <p className="text-center py-8 text-sm text-muted-foreground">No biases found</p>
              ) : (
                filtered.map((e) => (
                  <div key={e.name} className="p-3 rounded-lg bg-muted/20 border border-border/30 hover:border-primary/30 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-display font-semibold text-sm">{e.name}</h4>
                      <span className="text-[9px] font-mono text-primary/70 uppercase">{e.category}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{e.definition}</p>
                    <p className="text-[11px] text-foreground/60 italic mt-1">e.g. "{e.example}"</p>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BiasGlossary;
