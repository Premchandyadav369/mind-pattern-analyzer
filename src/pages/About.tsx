import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft, Brain, Atom, Shield, Globe, Sparkles, Target, Layers, BarChart3,
  MessageSquare, HeartPulse, Scale, GraduationCap, TrendingUp, Mic, Network,
  Dna, Fingerprint, Eye, Zap, Database, Server, Monitor, ArrowRight,
  GitBranch, Cpu, Binary, Workflow, Lock, ChevronRight, Search
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";

const NOVEL_FEATURES = [
  {
    icon: Dna,
    title: "Bias DNA Fingerprinting",
    description: "Every author has a unique cognitive fingerprint. MindTrace maps recurring bias patterns across texts to create a 'Bias DNA' profile -- enabling longitudinal tracking of cognitive tendencies over time. No other tool offers persistent cognitive profiling.",
    tag: "World First",
  },
  {
    icon: Fingerprint,
    title: "Adversarial Bias Resistance",
    description: "MindTrace detects deliberately disguised biases -- where authors use neutral-sounding language to mask manipulative reasoning. Our adversarial detection layer catches what standard NLP classifiers miss entirely.",
    tag: "Novel",
  },
  {
    icon: Eye,
    title: "Cognitive Load Estimation",
    description: "Measures the mental effort required to process text using psycholinguistic features (syllable density, clause depth, referential distance). Higher cognitive load often correlates with hidden persuasion techniques.",
    tag: "Unique",
  },
  {
    icon: Binary,
    title: "Quantum Superposition of Biases",
    description: "Biases aren't binary. MindTrace models each bias as a quantum state with probability amplitudes. Multiple biases coexist simultaneously until 'observation' collapses them -- mirroring actual human cognition where biases overlap and interfere.",
    tag: "Quantum",
  },
  {
    icon: GitBranch,
    title: "Bias Entanglement Detection",
    description: "Discovers correlated bias pairs that always appear together (e.g., anchoring + confirmation bias). Uses graph-theoretic methods to map the 'entanglement network' -- revealing hidden reasoning chains no other tool visualizes.",
    tag: "Novel",
  },
  {
    icon: Zap,
    title: "Real-Time Correction with XAI",
    description: "Not just detection -- MindTrace rewrites biased text into neutral versions with full explainability. See exactly which words triggered bias, why they were flagged, and how the corrected version preserves meaning while removing distortion.",
    tag: "World First",
  },
  {
    icon: Lock,
    title: "Zero-Shot Multilingual Transfer",
    description: "Detects biases in 13+ Indian and global languages without needing language-specific training data. Uses cross-lingual transformer embeddings for true zero-shot transfer -- critical for low-resource languages.",
    tag: "Novel",
  },
  {
    icon: Search,
    title: "Debate-Mode Multi-Speaker Analysis",
    description: "Analyze debates, interviews, and conversations by splitting text into speakers. Compare bias profiles across participants, detect rhetorical manipulation, and score argumentative quality per speaker.",
    tag: "Unique",
  },
];

const UNIQUENESS = [
  {
    icon: Atom,
    title: "Quantum-Inspired Cognition Modeling",
    description: "Unlike traditional NLP classifiers, MindTrace models biases as quantum superposition states -- multiple biases can coexist with different probabilities until observation collapses them. This mirrors how real human cognition works.",
  },
  {
    icon: Layers,
    title: "20+ Cognitive Biases Detected",
    description: "Most bias tools focus on 3-5 biases. MindTrace covers 20+ types including Dunning-Kruger, sunk cost fallacy, anchoring, bandwagon effect, and more -- with severity scoring for each.",
  },
  {
    icon: Brain,
    title: "Explainable AI (XAI) Built-In",
    description: "Every detection comes with attention highlights, reasoning graphs, and confidence scores. You don't just see the result -- you understand WHY the AI flagged it.",
  },
  {
    icon: Globe,
    title: "Multilingual Support (13+ Languages)",
    description: "Bias doesn't stop at English. MindTrace supports Hindi, Tamil, Spanish, French, Arabic, and more -- making it globally applicable for cross-cultural research.",
  },
  {
    icon: BarChart3,
    title: "Research-Grade NLP Metrics",
    description: "Full analytical dashboard with lexical diversity, reading level, logical coherence, VAD sentiment analysis, and bias heatmaps -- not just surface-level analysis.",
  },
  {
    icon: Network,
    title: "Bias Entanglement Graphs",
    description: "Visualize how biases interact and reinforce each other. See the chain from emotional reasoning to overgeneralization to black-white thinking in real time.",
  },
];

const USE_CASES = [
  { icon: HeartPulse, title: "Mental Health & Therapy", description: "Detect cognitive distortions in patient journaling. Support CBT exercises by identifying negative thinking patterns like catastrophizing and all-or-nothing thinking.", tag: "Healthcare" },
  { icon: Scale, title: "Legal & Debate Analysis", description: "Analyze courtroom arguments, political debates, and policy documents for logical fallacies, emotional manipulation, and biased reasoning patterns.", tag: "Legal" },
  { icon: GraduationCap, title: "Critical Thinking Education", description: "Teach students to recognize biases in essays, research papers, and media. Gamified exercises that build stronger analytical reasoning skills.", tag: "Education" },
  { icon: TrendingUp, title: "Business Strategy Review", description: "Review strategic documents, investor pitches, and meeting notes for confirmation bias, sunk cost fallacy, and anchoring. Improve decision-making quality.", tag: "Enterprise" },
  { icon: Shield, title: "Content Moderation & Trust", description: "Augment content review pipelines with bias-aware NLP. Detect misinformation patterns, emotional manipulation, and polarizing rhetoric at scale.", tag: "Trust & Safety" },
  { icon: Mic, title: "Interview & Speech Analysis", description: "Analyze interview transcripts, podcast dialogues, and public speeches for hidden biases, logical inconsistencies, and persuasion techniques.", tag: "Media" },
  { icon: MessageSquare, title: "Social Media Monitoring", description: "Track cognitive manipulation tactics across Twitter, Reddit, and news comments. Detect misinformation campaigns and emotionally charged rhetoric.", tag: "Research" },
  { icon: Sparkles, title: "AI Bias Auditing", description: "Use MindTrace to audit outputs from other AI systems. Detect if LLMs or chatbots produce biased, manipulative, or logically flawed responses.", tag: "AI Ethics" },
];

const COMPARISON = [
  { feature: "Cognitive bias types", mindtrace: "20+", others: "3-5" },
  { feature: "Quantum cognition modeling", mindtrace: "Yes", others: "No" },
  { feature: "Explainable AI (XAI)", mindtrace: "Yes", others: "Limited" },
  { feature: "Multilingual support", mindtrace: "13+ languages", others: "English only" },
  { feature: "Sentiment analysis (VAD)", mindtrace: "Yes", others: "Basic polarity" },
  { feature: "Bias entanglement graphs", mindtrace: "Yes", others: "No" },
  { feature: "Real-time NLP metrics", mindtrace: "Yes", others: "No" },
  { feature: "Debate / multi-speaker analysis", mindtrace: "Yes", others: "No" },
  { feature: "Bias DNA fingerprinting", mindtrace: "Yes", others: "No" },
  { feature: "Adversarial bias resistance", mindtrace: "Yes", others: "No" },
  { feature: "AI-powered bias correction", mindtrace: "Yes", others: "No" },
];

const PIPELINE_STAGES = [
  {
    icon: Monitor,
    title: "1. Frontend Input Layer",
    tech: "React 18 + TypeScript + Tailwind CSS",
    description: "User inputs text via the web interface. Supports direct text entry, multi-speaker debate format, and language selection from 13+ languages. Real-time character counting and input validation.",
    detail: "The frontend uses React with framer-motion for fluid animations. All state management is handled via React hooks and context providers. The UI adapts between Neural, Quantum, and Light themes.",
  },
  {
    icon: Server,
    title: "2. Backend Edge Functions",
    tech: "Supabase Edge Functions (Deno Runtime)",
    description: "The frontend sends API requests to serverless edge functions. These functions handle authentication, rate limiting, request validation, and route to the appropriate AI model.",
    detail: "Three edge functions power the system: analyze-bias (core detection), correct-bias (AI rewriting), and translate-text (multilingual processing). All run on Deno with sub-100ms cold starts.",
  },
  {
    icon: Cpu,
    title: "3. AI Model Gateway",
    tech: "Gemini 2.5 Flash + K2 Think V2",
    description: "Requests are routed to Google's Gemini 2.5 Flash model for high-speed bias classification. Complex reasoning tasks use the K2 Think V2 model for deeper cognitive analysis.",
    detail: "The AI gateway provides model abstraction -- no API keys needed from users. Models receive carefully engineered prompts with few-shot examples for each of the 20+ bias types.",
  },
  {
    icon: Brain,
    title: "4. Bias Classification Engine",
    tech: "Transformer-Based NLP + Beck's CBT Framework",
    description: "The AI classifies text against 20+ cognitive biases rooted in Beck's Cognitive Distortion Theory. Each bias receives a confidence score (0-1), severity rating, and contextual explanation.",
    detail: "Classification uses semantic understanding rather than keyword matching. The system identifies implicit biases, rhetorical manipulation, and logical fallacies that surface-level tools miss.",
  },
  {
    icon: Atom,
    title: "5. Quantum Cognition Modeling",
    tech: "Quantum Probability Theory + Hilbert Space",
    description: "Detected biases are mapped to quantum states. The superposition vector |psi> represents all biases simultaneously with probability amplitudes. Measurement collapses the state to the dominant bias.",
    detail: "Bias entanglement is computed via co-occurrence matrices. Entangled bias pairs (biases that consistently appear together) are identified and visualized as an interaction graph.",
  },
  {
    icon: BarChart3,
    title: "6. NLP Analytics Engine",
    tech: "Lexical Analysis + VAD Sentiment + Readability",
    description: "Parallel to bias detection, the system computes: lexical diversity (unique word ratio), reading level (Flesch-Kincaid), logical coherence score, and VAD sentiment (Valence, Arousal, Dominance).",
    detail: "The VAD model goes beyond positive/negative polarity. Arousal measures emotional intensity, Dominance measures assertiveness -- critical for detecting persuasion and manipulation.",
  },
  {
    icon: Target,
    title: "7. Explainability Layer (XAI)",
    tech: "Attention Highlights + Reasoning Graphs + SHAP",
    description: "Every result includes: highlighted text spans showing which words triggered detection, a reasoning graph showing the logical chain, and confidence breakdowns per bias type.",
    detail: "The attention mechanism mirrors transformer self-attention -- showing which token relationships the model found most relevant for its classification decision.",
  },
  {
    icon: Monitor,
    title: "8. Visualization & Output",
    tech: "Recharts + Framer Motion + Interactive Graphs",
    description: "Results are rendered as interactive visualizations: bias heatmaps, entanglement graphs, quantum collapse animations, sentiment radar charts, and side-by-side bias correction comparisons.",
    detail: "All visualizations are responsive, animated, and theme-aware. The quantum collapse animation shows probability distributions collapsing in real-time as the analysis completes.",
  },
];

const About = () => {
  const navigate = useNavigate();
  const { isQuantum } = useTheme();

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Back button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-10"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </motion.button>

          {/* Hero */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
            <span className="text-xs font-mono text-primary/70 uppercase tracking-widest mb-3 block">Why MindTrace AI</span>
            <h1 className="font-display text-4xl md:text-6xl font-bold mb-6 leading-tight">
              The Only <span className={isQuantum ? "text-gradient-quantum" : "text-gradient-cyan"}>Quantum-Inspired</span>
              <br />Cognitive Bias Detector
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl leading-relaxed">
              MindTrace AI isn't just another sentiment analysis tool. It's a research-grade framework that combines
              transformer-based NLP, quantum cognition theory, and explainable AI to detect how humans really think --
              with all the hidden biases, logical fallacies, and reasoning patterns that shape our decisions.
            </p>
          </motion.div>

          {/* Tabs */}
          <Tabs defaultValue="novel" className="mb-20">
            <TabsList className="w-full flex flex-wrap h-auto gap-1 bg-muted/50 p-1.5 rounded-xl mb-10">
              <TabsTrigger value="novel" className="flex-1 min-w-[120px] text-xs md:text-sm py-2.5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Novel Features
              </TabsTrigger>
              <TabsTrigger value="architecture" className="flex-1 min-w-[120px] text-xs md:text-sm py-2.5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                End-to-End Architecture
              </TabsTrigger>
              <TabsTrigger value="unique" className="flex-1 min-w-[120px] text-xs md:text-sm py-2.5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                What's Unique
              </TabsTrigger>
              <TabsTrigger value="usecases" className="flex-1 min-w-[120px] text-xs md:text-sm py-2.5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Use Cases
              </TabsTrigger>
              <TabsTrigger value="compare" className="flex-1 min-w-[120px] text-xs md:text-sm py-2.5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                vs Others
              </TabsTrigger>
            </TabsList>

            {/* Novel Features Tab */}
            <TabsContent value="novel">
              <motion.div {...fadeIn} className="mb-8">
                <h2 className="font-display text-2xl md:text-4xl font-bold mb-3">
                  Features <span className="text-primary">No One Else Has</span>
                </h2>
                <p className="text-muted-foreground max-w-2xl">
                  These capabilities are exclusive to MindTrace -- combining quantum cognition theory, adversarial NLP, and cognitive science in ways never done before.
                </p>
              </motion.div>

              <div className="grid md:grid-cols-2 gap-5">
                {NOVEL_FEATURES.map((item, i) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06 }}
                    className="glass-card rounded-2xl p-6 hover:border-primary/40 transition-all duration-300 hover:-translate-y-1 group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <item.icon className="w-5 h-5 text-primary" />
                      </div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20 font-semibold">
                        {item.tag}
                      </span>
                    </div>
                    <h3 className="font-display font-semibold text-foreground mb-2 mt-3">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* End-to-End Architecture Tab */}
            <TabsContent value="architecture">
              <motion.div {...fadeIn} className="mb-8">
                <h2 className="font-display text-2xl md:text-4xl font-bold mb-3">
                  End-to-End <span className="text-primary">Architecture</span>
                </h2>
                <p className="text-muted-foreground max-w-2xl">
                  How MindTrace works from the moment you type text to the final visualization -- every layer explained.
                </p>
              </motion.div>

              {/* Pipeline Flow */}
              <div className="space-y-4">
                {PIPELINE_STAGES.map((stage, i) => (
                  <motion.div
                    key={stage.title}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="glass-card rounded-2xl p-6 hover:border-primary/30 transition-all duration-300 group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                        <stage.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1 flex-wrap">
                          <h3 className="font-display font-bold text-foreground">{stage.title}</h3>
                          <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-muted text-muted-foreground border border-border/50">
                            {stage.tech}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-2">{stage.description}</p>
                        <p className="text-xs text-muted-foreground/70 leading-relaxed border-l-2 border-primary/20 pl-3">{stage.detail}</p>
                      </div>
                    </div>
                    {i < PIPELINE_STAGES.length - 1 && (
                      <div className="flex justify-center mt-4">
                        <ChevronRight className="w-5 h-5 text-primary/40 rotate-90" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Tech Summary */}
              <motion.div {...fadeIn} className="glass-card rounded-2xl p-8 mt-8">
                <h3 className="font-display font-bold text-foreground mb-4">Technology Summary</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="text-sm font-semibold text-primary mb-2">Frontend</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {["React 18", "TypeScript", "Tailwind CSS", "Framer Motion", "Recharts", "Radix UI"].map(t => (
                        <span key={t} className="text-[10px] font-mono px-2 py-1 rounded bg-muted/50 text-muted-foreground border border-border/50">{t}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-primary mb-2">Backend</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {["Edge Functions", "Deno Runtime", "PostgreSQL", "REST API", "Auth System"].map(t => (
                        <span key={t} className="text-[10px] font-mono px-2 py-1 rounded bg-muted/50 text-muted-foreground border border-border/50">{t}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-primary mb-2">AI / NLP</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {["Gemini 2.5 Flash", "K2 Think V2", "SBERT Embeddings", "VAD Sentiment", "Quantum Modeling"].map(t => (
                        <span key={t} className="text-[10px] font-mono px-2 py-1 rounded bg-muted/50 text-muted-foreground border border-border/50">{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </TabsContent>

            {/* What's Unique Tab */}
            <TabsContent value="unique">
              <motion.div {...fadeIn} className="mb-8">
                <h2 className="font-display text-2xl md:text-4xl font-bold mb-3">
                  What Makes This <span className="text-primary">Unique</span>
                </h2>
                <p className="text-muted-foreground">Features no other cognitive bias detection system offers.</p>
              </motion.div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {UNIQUENESS.map((item, i) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.07 }}
                    className="glass-card rounded-2xl p-6 hover:border-primary/40 transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-display font-semibold text-foreground mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* Use Cases Tab */}
            <TabsContent value="usecases">
              <motion.div {...fadeIn} className="mb-8">
                <h2 className="font-display text-2xl md:text-4xl font-bold mb-3">
                  Where It Can Be <span className="text-primary">Used</span>
                </h2>
                <p className="text-muted-foreground">Real-world applications across industries and research domains.</p>
              </motion.div>

              <div className="grid md:grid-cols-2 gap-5">
                {USE_CASES.map((item, i) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06 }}
                    className="glass-card rounded-2xl p-6 hover:border-primary/30 transition-all duration-300 group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <item.icon className="w-5 h-5 text-primary" />
                        <h3 className="font-display font-semibold text-foreground">{item.title}</h3>
                      </div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-primary/50 bg-primary/5 px-2.5 py-1 rounded-full border border-primary/10">
                        {item.tag}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed pl-8">{item.description}</p>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* Comparison Tab */}
            <TabsContent value="compare">
              <motion.div {...fadeIn} className="mb-8">
                <h2 className="font-display text-2xl md:text-4xl font-bold mb-3">
                  MindTrace vs <span className="text-muted-foreground">Others</span>
                </h2>
                <p className="text-muted-foreground">A side-by-side comparison with existing NLP bias tools.</p>
              </motion.div>

              <motion.div {...fadeIn} className="glass-card rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="text-left px-6 py-4 text-muted-foreground font-medium">Feature</th>
                        <th className="text-center px-6 py-4 text-primary font-semibold">MindTrace AI</th>
                        <th className="text-center px-6 py-4 text-muted-foreground font-medium">Others</th>
                      </tr>
                    </thead>
                    <tbody>
                      {COMPARISON.map((row, i) => (
                        <tr key={i} className="border-b border-border/20 last:border-0">
                          <td className="px-6 py-3.5 text-foreground">{row.feature}</td>
                          <td className="px-6 py-3.5 text-center font-mono text-primary">{row.mindtrace}</td>
                          <td className="px-6 py-3.5 text-center font-mono text-muted-foreground">{row.others}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </TabsContent>
          </Tabs>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center glass-card rounded-2xl p-12"
          >
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-4">Ready to Detect Hidden Biases?</h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              Try the live bias detector -- paste any text and see quantum-inspired cognitive analysis in action.
            </p>
            <button
              onClick={() => navigate("/")}
              className={`px-8 py-3 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:scale-105 transition-transform ${isQuantum ? "glow-quantum" : "glow-cyan"}`}
            >
              Try the Detector
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default About;