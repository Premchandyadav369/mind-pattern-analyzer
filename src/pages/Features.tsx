import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import {
  ArrowLeft, Search, Mic, Gauge, Download, Lightbulb, Network, Radar, BarChart3,
  Trophy, Keyboard, Share2, Focus, Command, BookOpen, Volume2, Printer, Library,
  HelpCircle, ListChecks, Sparkles, Ruler, Activity, LineChart, FlaskConical,
  Quote, Grid3X3, ThumbsUp, Cloud, Sliders, AlertTriangle, Users2, GitCompare,
  Database, Languages, Atom, Layers, ArrowRight, Cpu, Sigma, Users, Workflow,
  History, Brain, Palette, Waves, ShieldCheck, TestTube2
} from "lucide-react";


type Feature = {
  icon: typeof Search;
  title: string;
  what: string;
  how: string;
  category: string;
  where: string;
};

const FEATURES: Feature[] = [
  { icon: Layers, title: "Bias Detector", category: "Core Analysis", where: "Home · Detector", what: "The main engine: paste any text and get a ranked list of cognitive biases with confidence scores, evidence spans and reframes.", how: "Text is sent to a cloud analysis function that runs a transformer-backed classifier, returns per-label probabilities, and filters them against your decision threshold." },
  { icon: Mic, title: "Voice Input", category: "Core Analysis", where: "Detector input", what: "Dictate text hands-free instead of typing or pasting it.", how: "Uses the browser Web Speech API for live transcription directly into the analysis box." },
  { icon: Languages, title: "Multilingual Analysis", category: "Core Analysis", where: "Detector language selector", what: "Analyze text in 13+ Indian and global languages.", how: "Non-English input is translated through a dedicated cloud function before classification, preserving the original for display." },
  { icon: Gauge, title: "Cognitive Clarity Score", category: "Core Analysis", where: "Results · Overview", what: "A single 0-100 number that summarises how clear and distortion-free a piece of writing is.", how: "Combines coherence, emotional intensity and a weighted penalty for each detected bias into an animated gauge." },
  { icon: Lightbulb, title: "Live Bias Suggestions", category: "Core Analysis", where: "While typing", what: "Warns you about loaded language, absolutes and unsupported generalisations before you even run an analysis.", how: "A client-side pattern engine scans the draft on every keystroke and surfaces nudges instantly, with zero network calls." },
  { icon: Sparkles, title: "Bias Correction Assistant", category: "Core Analysis", where: "Home · Correction", what: "Rewrites biased passages into neutral prose while keeping the author's meaning.", how: "A correction function returns a rewritten version plus a rationale for every change it made." },

  { icon: Radar, title: "Bias Radar Chart", category: "Visualisation", where: "Results · Visuals", what: "Shows how bias load is distributed across six thematic families at a glance.", how: "Detected labels are mapped into categories and plotted on an SVG radar polygon." },
  { icon: Network, title: "Bias Knowledge Graph", category: "Visualisation", where: "Results · Visuals", what: "Maps each detected bias to the broader cognitive-science family it belongs to.", how: "A two-ring SVG layout connects specific labels to parent categories such as heuristic distortion and social influence." },
  { icon: Atom, title: "Quantum Superposition View", category: "Visualisation", where: "Results · Visuals", what: "Treats biases as coexisting probability amplitudes rather than binary flags.", how: "Confidences are normalised into amplitudes and animated as a superposition that collapses on observation." },
  { icon: Grid3X3, title: "Confusion Heatmap", category: "Visualisation", where: "Research", what: "Reveals which bias classes the model confuses with each other.", how: "Confusion counts are reconstructed from per-class metrics and affinity partners, row-normalised, and exportable as CSV." },
  { icon: Activity, title: "NLP Metrics & Sentiment", category: "Visualisation", where: "Results · Language", what: "Readability, lexical density, sentiment polarity and attention highlights for the analysed text.", how: "Pure client-side linguistic computation plus model attention weights rendered as inline highlights." },

  { icon: LineChart, title: "Cognitive Profile", category: "Longitudinal", where: "Home · Profile", what: "Tracks your bias tendencies over time and tells you whether you are improving.", how: "Aggregates your local analysis history into dominant biases, severity distribution and a trend metric based on bias density." },
  { icon: BarChart3, title: "Stats Dashboard", category: "Longitudinal", where: "Home", what: "Session-level aggregates plus a sparkline of your recent analyses.", how: "Reads stored history and renders trend and average-severity summaries." },
  { icon: Trophy, title: "Achievement Badges", category: "Longitudinal", where: "Home", what: "Gamified milestones such as Critical Thinker and Objectivity Streak.", how: "Badge conditions are evaluated against your analysis history on every new result." },
  { icon: Sparkles, title: "Daily Insight", category: "Longitudinal", where: "Home", what: "A rotating bite-sized cognitive-science fact, with streaks and bookmarks.", how: "Persisted locally with day-streak tracking, seen-history and a bookmark store." },

  { icon: GitCompare, title: "A/B Comparison", category: "Tools", where: "Home · Compare", what: "Paste an original and a revision to see exactly which biases you removed or introduced.", how: "Runs both texts, computes per-label deltas and Jaccard overlap, and declares the cleaner version." },
  { icon: Users2, title: "Debate Analyzer", category: "Tools", where: "Home · Debate", what: "Splits a transcript by speaker and compares bias profiles across participants.", how: "Speaker segmentation followed by an independent analysis pass per speaker, then a comparative scoreboard." },
  { icon: Library, title: "Sample Text Library", category: "Tools", where: "Home", what: "Pre-tagged examples from news, social media and argumentation to try instantly.", how: "Selecting a sample dispatches an event that loads the text straight into the detector." },
  { icon: Ruler, title: "Linguistic Profiler", category: "Tools", where: "Home", what: "Live Flesch readability and lexical statistics as you type.", how: "Pure functions in the text-stats module, fully unit tested." },
  { icon: ListChecks, title: "Cognitive Checklist", category: "Tools", where: "Home", what: "A ten-point manual self-audit for reasoning quality.", how: "Interactive checklist with persistent completion state." },
  { icon: HelpCircle, title: "Bias Quiz", category: "Tools", where: "Home", what: "Practise recognising distortions in short passages.", how: "Randomised snippets with scoring and explanations after each answer." },

  { icon: FlaskConical, title: "Research Benchmarks", category: "Research", where: "Research", what: "Per-class precision, recall and F1 plus baseline and ablation comparisons.", how: "A curated evaluation suite over a 2,140-passage test split, rendered as tables and charts." },
  { icon: Database, title: "Batch Evaluation", category: "Research", where: "Research", what: "Upload a dataset and evaluate it end to end, then download the report.", how: "Parses CSV, JSON, JSONL or raw text, streams rows through the analysis function with live progress, and produces per-label breakdowns." },
  { icon: Sliders, title: "Threshold Tuner", category: "Research", where: "Research", what: "Interactively tune the decision threshold and watch precision/recall trade off.", how: "Threshold is persisted and applied to every subsequent detection run." },
  { icon: Gauge, title: "Calibration Panel", category: "Research", where: "Research", what: "Reliability diagrams with Expected Calibration Error and Brier score.", how: "Confidence bins are compared against empirical accuracy in the calibration module." },
  { icon: AlertTriangle, title: "Disagreement Deep Dive", category: "Research", where: "Research", what: "Explores high-confidence mistakes where humans and the model disagree.", how: "Cross-references annotations with predictions and ranks cases by confidence-weighted error." },
  { icon: Quote, title: "Citation Export", category: "Research", where: "Research", what: "One-click BibTeX and APA 7 citations for the system.", how: "Generates formatted reference strings ready to paste into a paper." },

  { icon: ThumbsUp, title: "Human Feedback Loop", category: "Collaboration", where: "Bias cards", what: "Rate every detection as correct, partly correct or wrong.", how: "Annotations are stored locally and synced to the cloud store with row-level security." },
  { icon: Cloud, title: "Shared Annotation Corpus", category: "Collaboration", where: "Research", what: "Browse and search community annotations and agreement rates.", how: "Reads the shared cloud annotation table with search, filtering and CSV export." },
  { icon: Share2, title: "Share Results", category: "Collaboration", where: "Results toolbar", what: "Send a link that reproduces an analysis without any account.", how: "Encodes the result payload into the URL hash so nothing is stored server-side." },
  { icon: Download, title: "Markdown Report Export", category: "Collaboration", where: "Results toolbar", what: "Export a full analysis as a Markdown report or copy it to the clipboard.", how: "Serialises scores, evidence and reframes into a structured document." },
  { icon: Printer, title: "Print Layout", category: "Collaboration", where: "Results toolbar", what: "A clean printable version of any report.", how: "Print-specific stylesheet hides chrome and expands collapsed sections." },

  { icon: Command, title: "Command Palette", category: "Experience", where: "Anywhere", what: "Jump to any section, load a sample or run an action from one search box.", how: "Opens with the palette shortcut and fuzzy-matches across registered commands." },
  { icon: Keyboard, title: "Keyboard Shortcuts", category: "Experience", where: "Anywhere", what: "Hotkeys for the palette, glossary, batch evaluation and help.", how: "A global key listener with an on-screen cheat sheet." },
  { icon: BookOpen, title: "Bias Glossary", category: "Experience", where: "Anywhere", what: "A searchable encyclopedia of 16+ cognitive distortions with examples.", how: "Categorised entries filterable by name, family or keyword." },
  { icon: Volume2, title: "Read Aloud", category: "Experience", where: "Results", what: "Listen to insights and reframes instead of reading them.", how: "Uses browser speech synthesis with per-section playback control." },
  { icon: Focus, title: "Focus Mode", category: "Experience", where: "Detector", what: "Hides auxiliary panels so you can concentrate on the findings.", how: "Toggles a reduced layout across the results area." },
  { icon: Search, title: "User & Research Modes", category: "Experience", where: "Navbar", what: "Switch between a guided essentials view and the full academic stack.", how: "A global mode context conditionally mounts sections across the whole app." },
  { icon: Palette, title: "Three-State Theme Engine", category: "Experience", where: "Navbar", what: "Neural, Quantum and Light themes with glassmorphic surfaces throughout.", how: "Semantic design tokens in the global stylesheet swap per theme; components read tokens, never raw colours." },
  { icon: Workflow, title: "Quick Start Guide", category: "Experience", where: "Home · Simple mode", what: "A three-step onboarding path from first paste to first reframe.", how: "Shown only in Simple mode and wired to scroll straight into the detector." },
  { icon: Layers, title: "Feature Showcase", category: "Experience", where: "Home", what: "A condensed tour of the workbench with links into every major surface.", how: "Card grid that anchors to the relevant section ids on the home page." },

  { icon: Cpu, title: "On-Device Embedding Lab", category: "Research", where: "Research · Embedding Lab", what: "Runs a real sentence-transformer inside your browser for zero-shot bias ranking — no text ever leaves the device after the model downloads.", how: "Lazy-loads Xenova/all-MiniLM-L6-v2 through transformers.js on WebAssembly, computes 384-d mean-pooled normalised embeddings, and ranks 12 calibrated class prototypes by cosine similarity with a softmax over scores. Exports the full embedding record as JSON." },
  { icon: Sigma, title: "Statistical Significance Suite", category: "Research", where: "Research · Significance", what: "Answers whether MindTrace's margin over each baseline is real or noise.", how: "Bootstrap 95% confidence intervals, paired permutation tests, McNemar's χ² on discordant pairs, Benjamini–Hochberg FDR-adjusted q-values and Cohen's d — all from a seeded, reproducible sampler with an adjustable iteration count and CSV export." },
  { icon: Ruler, title: "Power & Sample-Size Planner", category: "Research", where: "Research · Power Analysis", what: "Tells you how large a held-out split must be before a macro-F1 win is trustworthy.", how: "Two-proportion z-test planning: required n per group, achieved power at your current n, minimum detectable effect via bisection, and Wilson score intervals for both systems, against any baseline in the benchmark table." },
  { icon: Users, title: "Inter-Annotator Agreement Lab", category: "Research", where: "Research · Agreement", what: "Quantifies how reliably three human annotators label the same passages.", how: "Observed agreement, Fleiss' κ, Krippendorff's α (nominal, missing-data tolerant), Gwet's AC1 and every pairwise Cohen's κ, each mapped to Landis & Koch bands, over a seeded latent-gold annotation simulator with adjustable noise and missingness." },
  { icon: TestTube2, title: "Ablation & Baseline Study", category: "Research", where: "Research · Benchmarks", what: "Shows what each architectural component contributes and how the system compares to five baselines.", how: "Component-removal deltas against the full model, plus a baseline ladder from keyword lexicon to RoBERTa fine-tuned, reported on the same held-out split." },
  { icon: ShieldCheck, title: "Reproducibility Appendix", category: "Research", where: "Research · Appendix", what: "Dataset card, hardware, seeds, optimiser settings and an honest limitations section.", how: "A structured research appendix so any claim on the page can be traced to its experimental conditions." },
  { icon: Brain, title: "Cross-Lingual Transfer Report", category: "Research", where: "Research · Benchmarks", what: "Per-language accuracy for the multilingual pipeline.", how: "Transfer scores for each supported Indian language measured after neural machine translation into the classifier's language." },

  { icon: Waves, title: "Bias Entanglement Graph", category: "Visualisation", where: "Results · Visuals", what: "Shows which biases tend to co-occur in the same passage.", how: "Co-occurrence strengths are drawn as weighted edges between detected labels, borrowing the entanglement metaphor from quantum cognition." },
  { icon: Atom, title: "Quantum Collapse Animation", category: "Visualisation", where: "Results · Visuals", what: "Visualises measurement collapsing a superposition of candidate biases into the final classification.", how: "Amplitudes animate down to the winning label once the analysis resolves." },
  { icon: Network, title: "Reasoning Graph", category: "Visualisation", where: "Results · Visuals", what: "Traces the chain from trigger phrase to distortion to consequence.", how: "An SVG dependency graph built from the model's extracted evidence spans and rationale." },
  { icon: Grid3X3, title: "Bias Heatmap", category: "Visualisation", where: "Results · Visuals", what: "Highlights where in the text the bias density is concentrated.", how: "Sentence-level intensity mapped onto a colour scale over the original passage." },
  { icon: History, title: "Bias Evolution Timeline", category: "Longitudinal", where: "Home · Profile", what: "Plots how your bias profile shifts across consecutive analyses.", how: "Reads stored history and renders per-label trajectories over time." },
  { icon: History, title: "Analysis History", category: "Longitudinal", where: "Detector", what: "Recall, reload and compare any of your previous analyses.", how: "Locally persisted result records with one-click restore into the detector." },

];

const CATEGORIES = ["All", ...Array.from(new Set(FEATURES.map((f) => f.category)))];

const Features = () => {
  const navigate = useNavigate();
  const { isQuantum } = useTheme();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FEATURES.filter((f) => {
      const matchCat = category === "All" || f.category === category;
      const matchQ =
        !q ||
        f.title.toLowerCase().includes(q) ||
        f.what.toLowerCase().includes(q) ||
        f.how.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [query, category]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-28 pb-24 px-6">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" /> Back to app
          </button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <span className="text-xs font-mono text-primary/70 uppercase tracking-widest mb-3 block">
              Complete Capability Map
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Every <span className={isQuantum ? "text-gradient-quantum" : "text-gradient-cyan"}>feature</span>, explained
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              MindTrace AI is a research-grade cognitive bias workbench. Below is every capability in the
              system — what it does, where to find it, and how it works under the hood.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mt-6 text-xs font-mono text-muted-foreground">
              <span className="px-3 py-1.5 rounded-full border border-border/50 bg-muted/30">{FEATURES.length} features</span>
              <span className="px-3 py-1.5 rounded-full border border-border/50 bg-muted/30">{CATEGORIES.length - 1} categories</span>
              <span className="px-3 py-1.5 rounded-full border border-border/50 bg-muted/30">20+ biases · 13 languages</span>
            </div>
          </motion.div>

          {/* Search + filters */}
          <div className="mb-8 space-y-4">
            <div className="relative max-w-xl mx-auto">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search features, e.g. calibration, voice, export…"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-muted/20 border border-border/50 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all border ${
                    category === c
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((f, i) => (
              <motion.article
                key={f.title}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.4) }}
                className={`${isQuantum ? "quantum-glass" : "glass-card"} rounded-2xl p-5 hover:border-primary/30 transition-colors flex flex-col`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 shrink-0 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <f.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-display font-semibold text-sm text-foreground leading-tight">{f.title}</h2>
                    <p className="text-[10px] font-mono text-muted-foreground mt-1">{f.category} · {f.where}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">{f.what}</p>
                <p className="text-xs text-muted-foreground/80 leading-relaxed mt-auto pt-3 border-t border-border/30">
                  <span className="font-mono text-primary/70">How: </span>
                  {f.how}
                </p>
              </motion.article>
            ))}
          </div>

          {filtered.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-16">
              No features match “{query}”. Try a broader term.
            </p>
          )}

          <div className="mt-16 text-center">
            <button
              onClick={() => navigate("/")}
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:scale-105 transition-transform ${isQuantum ? "glow-quantum" : "glow-cyan"}`}
            >
              Try the detector <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-xs text-muted-foreground/60 mt-8 font-mono">
              Made by humans on Earth 🌍 · V C Premchand Yadav · 23BCE7167
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Features;
