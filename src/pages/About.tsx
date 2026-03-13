import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { ArrowLeft, Brain, Atom, Shield, Globe, Sparkles, Target, Layers, BarChart3, MessageSquare, HeartPulse, Scale, GraduationCap, TrendingUp, Mic, Network } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";

const UNIQUENESS = [
  {
    icon: Atom,
    title: "Quantum-Inspired Cognition Modeling",
    description: "Unlike traditional NLP classifiers, MindTrace models biases as quantum superposition states — multiple biases can coexist with different probabilities until observation collapses them. This mirrors how real human cognition works.",
  },
  {
    icon: Layers,
    title: "20+ Cognitive Biases Detected",
    description: "Most bias tools focus on 3–5 biases. MindTrace covers 20+ types including Dunning-Kruger, sunk cost fallacy, anchoring, bandwagon effect, and more — with severity scoring for each.",
  },
  {
    icon: Brain,
    title: "Explainable AI (XAI) Built-In",
    description: "Every detection comes with attention highlights, reasoning graphs, and confidence scores. You don't just see the result — you understand WHY the AI flagged it.",
  },
  {
    icon: Globe,
    title: "Multilingual Support (13+ Languages)",
    description: "Bias doesn't stop at English. MindTrace supports Hindi, Tamil, Spanish, French, Arabic, and more — making it globally applicable for cross-cultural research.",
  },
  {
    icon: BarChart3,
    title: "Research-Grade NLP Metrics",
    description: "Full analytical dashboard with lexical diversity, reading level, logical coherence, VAD sentiment analysis, and bias heatmaps — not just surface-level analysis.",
  },
  {
    icon: Network,
    title: "Bias Entanglement Graphs",
    description: "Visualize how biases interact and reinforce each other. See the chain from emotional reasoning → overgeneralization → black-white thinking in real time.",
  },
];

const USE_CASES = [
  {
    icon: HeartPulse,
    title: "Mental Health & Therapy",
    description: "Detect cognitive distortions in patient journaling. Support CBT exercises by identifying negative thinking patterns like catastrophizing and all-or-nothing thinking.",
    tag: "Healthcare",
    color: "text-red-400",
  },
  {
    icon: Scale,
    title: "Legal & Debate Analysis",
    description: "Analyze courtroom arguments, political debates, and policy documents for logical fallacies, emotional manipulation, and biased reasoning patterns.",
    tag: "Legal",
    color: "text-yellow-400",
  },
  {
    icon: GraduationCap,
    title: "Critical Thinking Education",
    description: "Teach students to recognize biases in essays, research papers, and media. Gamified exercises that build stronger analytical reasoning skills.",
    tag: "Education",
    color: "text-green-400",
  },
  {
    icon: TrendingUp,
    title: "Business Strategy Review",
    description: "Review strategic documents, investor pitches, and meeting notes for confirmation bias, sunk cost fallacy, and anchoring. Improve decision-making quality.",
    tag: "Enterprise",
    color: "text-blue-400",
  },
  {
    icon: Shield,
    title: "Content Moderation & Trust",
    description: "Augment content review pipelines with bias-aware NLP. Detect misinformation patterns, emotional manipulation, and polarizing rhetoric at scale.",
    tag: "Trust & Safety",
    color: "text-purple-400",
  },
  {
    icon: Mic,
    title: "Interview & Speech Analysis",
    description: "Analyze interview transcripts, podcast dialogues, and public speeches for hidden biases, logical inconsistencies, and persuasion techniques.",
    tag: "Media",
    color: "text-cyan-400",
  },
  {
    icon: MessageSquare,
    title: "Social Media Monitoring",
    description: "Track cognitive manipulation tactics across Twitter, Reddit, and news comments. Detect misinformation campaigns and emotionally charged rhetoric.",
    tag: "Research",
    color: "text-orange-400",
  },
  {
    icon: Sparkles,
    title: "AI Bias Auditing",
    description: "Use MindTrace to audit outputs from other AI systems. Detect if LLMs or chatbots produce biased, manipulative, or logically flawed responses.",
    tag: "AI Ethics",
    color: "text-pink-400",
  },
];

const COMPARISON = [
  { feature: "Cognitive bias types", mindtrace: "20+", others: "3–5" },
  { feature: "Quantum cognition modeling", mindtrace: "✓", others: "✗" },
  { feature: "Explainable AI (XAI)", mindtrace: "✓", others: "Limited" },
  { feature: "Multilingual support", mindtrace: "13+ languages", others: "English only" },
  { feature: "Sentiment analysis (VAD)", mindtrace: "✓", others: "Basic polarity" },
  { feature: "Bias entanglement graphs", mindtrace: "✓", others: "✗" },
  { feature: "Real-time NLP metrics", mindtrace: "✓", others: "✗" },
  { feature: "Debate / multi-speaker analysis", mindtrace: "✓", others: "✗" },
];

const About = () => {
  const navigate = useNavigate();
  const { isQuantum } = useTheme();

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
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-20">
            <span className="text-xs font-mono text-primary/70 uppercase tracking-widest mb-3 block">Why MindTrace AI</span>
            <h1 className="font-display text-4xl md:text-6xl font-bold mb-6 leading-tight">
              The Only <span className={isQuantum ? "text-gradient-quantum" : "text-gradient-cyan"}>Quantum-Inspired</span>
              <br />Cognitive Bias Detector
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl leading-relaxed">
              MindTrace AI isn't just another sentiment analysis tool. It's a research-grade framework that combines 
              transformer-based NLP, quantum cognition theory, and explainable AI to detect how humans really think — 
              with all the hidden biases, logical fallacies, and reasoning patterns that shape our decisions.
            </p>
          </motion.div>

          {/* What Makes Us Unique */}
          <section className="mb-24">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mb-10">
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
          </section>

          {/* Comparison Table */}
          <section className="mb-24">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mb-10">
              <h2 className="font-display text-2xl md:text-4xl font-bold mb-3">
                MindTrace vs <span className="text-muted-foreground">Others</span>
              </h2>
              <p className="text-muted-foreground">A side-by-side comparison with existing NLP bias tools.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card rounded-2xl overflow-hidden"
            >
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
          </section>

          {/* Use Cases */}
          <section className="mb-24">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mb-10">
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
                      <item.icon className={`w-5 h-5 ${item.color}`} />
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
          </section>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center glass-card rounded-2xl p-12"
          >
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-4">Ready to Detect Hidden Biases?</h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              Try the live bias detector — paste any text and see quantum-inspired cognitive analysis in action.
            </p>
            <button
              onClick={() => navigate("/")}
              className={`px-8 py-3 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:scale-105 transition-transform ${isQuantum ? "glow-quantum" : "glow-cyan"}`}
            >
              Try the Detector →
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default About;