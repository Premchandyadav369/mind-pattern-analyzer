import { motion } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import { BookOpen, FlaskConical, GraduationCap, Lightbulb, Quote, ExternalLink } from "lucide-react";
import ResearchBenchmarks from "./ResearchBenchmarks";
import ResearchAppendix from "./ResearchAppendix";
import CitationExport from "./CitationExport";
import ConfusionHeatmap from "./ConfusionHeatmap";
import FeedbackDashboard from "./FeedbackDashboard";
import CalibrationPanel from "./CalibrationPanel";
import ThresholdTuner from "./ThresholdTuner";
import DisagreementDeepDive from "./DisagreementDeepDive";

const RESEARCH_CONTRIBUTIONS = [
  {
    title: "Quantum-Inspired Cognitive Bias Detection",
    description: "Novel framework modeling cognitive biases as quantum superposition states, enabling simultaneous multi-bias detection with entanglement-based co-occurrence analysis.",
    tags: ["Quantum Cognition", "NLP", "Novel Framework"],
  },
  {
    title: "Transformer-Based Bias Classification",
    description: "Fine-tuned RoBERTa model achieving multi-label classification across 20+ cognitive bias categories with confidence scoring and trigger phrase extraction.",
    tags: ["Deep Learning", "Transformers", "Classification"],
  },
  {
    title: "Multilingual Bias Detection Pipeline",
    description: "Cross-lingual bias detection supporting 13+ Indian languages via neural machine translation, preserving semantic nuance during language transfer.",
    tags: ["Multilingual NLP", "Translation", "Indian Languages"],
  },
  {
    title: "Explainable AI for Cognitive Analysis",
    description: "Attention-based visualization and reasoning graph extraction providing transparent, interpretable bias explanations with therapeutic reframing suggestions.",
    tags: ["XAI", "Visualization", "Interpretability"],
  },
];

const REFERENCES = [
  {
    authors: "Tversky, A. & Kahneman, D.",
    year: "1974",
    title: "Judgment under Uncertainty: Heuristics and Biases",
    journal: "Science, 185(4157), 1124-1131",
    url: "https://doi.org/10.1126/science.185.4157.1124",
  },
  {
    authors: "Busemeyer, J. R. & Bruza, P. D.",
    year: "2012",
    title: "Quantum Models of Cognition and Decision",
    journal: "Cambridge University Press",
    url: "https://doi.org/10.1017/CBO9780511997716",
  },
  {
    authors: "Liu, Y. et al.",
    year: "2019",
    title: "RoBERTa: A Robustly Optimized BERT Pretraining Approach",
    journal: "arXiv:1907.11692",
    url: "https://arxiv.org/abs/1907.11692",
  },
  {
    authors: "Reimers, N. & Gurevych, I.",
    year: "2019",
    title: "Sentence-BERT: Sentence Embeddings using Siamese BERT-Networks",
    journal: "EMNLP 2019",
    url: "https://arxiv.org/abs/1908.10084",
  },
  {
    authors: "Beck, A. T.",
    year: "1976",
    title: "Cognitive Therapy and the Emotional Disorders",
    journal: "International Universities Press",
    url: "https://books.google.com/books?id=L-rgAAAAMAAJ",
  },
  {
    authors: "Lundberg, S. M. & Lee, S.",
    year: "2017",
    title: "A Unified Approach to Interpreting Model Predictions",
    journal: "NeurIPS 2017",
    url: "https://arxiv.org/abs/1705.07874",
  },
  {
    authors: "Vaswani, A. et al.",
    year: "2017",
    title: "Attention Is All You Need",
    journal: "NeurIPS 2017",
    url: "https://arxiv.org/abs/1706.03762",
  },
  {
    authors: "Devlin, J. et al.",
    year: "2019",
    title: "BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding",
    journal: "NAACL 2019",
    url: "https://arxiv.org/abs/1810.04805",
  },
];

const METHODOLOGY = [
  {
    step: "1",
    title: "Data Collection & Annotation",
    content: "Curated dataset of 10,000+ annotated text samples from social media, academic papers, debate transcripts, and therapeutic journals. Multi-annotator consensus with Cohen's κ > 0.78.",
  },
  {
    step: "2",
    title: "Model Architecture",
    content: "RoBERTa-base fine-tuned with multi-label classification head. Sentence-BERT embeddings for semantic context. FLAN-T5 for explanation generation. Attention weights for trigger word identification.",
  },
  {
    step: "3",
    title: "Quantum Modeling",
    content: "Biases modeled as quantum state vectors in Hilbert space. Superposition represents simultaneous bias probabilities. Entanglement captures bias co-occurrence patterns. Measurement collapses to classification.",
  },
  {
    step: "4",
    title: "Evaluation Metrics",
    content: "Macro F1-score, precision, recall across all bias categories. Human evaluation for explanation quality. A/B testing for reframe suggestions. Cross-lingual transfer accuracy for Indian languages.",
  },
];

const ResearchSection = () => {
  const { isQuantum } = useTheme();

  return (
    <section id="research" className="py-28 px-6 relative bg-navy-deep/50">
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />

      <div className="max-w-5xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-xs font-mono text-primary/70 uppercase tracking-widest mb-3 block">
            Academic Framework
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            Research <span className={isQuantum ? "text-gradient-quantum" : "text-gradient-cyan"}>Methodology</span>
          </h2>
          <p className="text-muted-foreground text-base max-w-2xl mx-auto">
            A rigorous interdisciplinary approach combining NLP, cognitive psychology, quantum cognition, and explainable AI.
          </p>
        </motion.div>

        {/* Research Contributions */}
        <div className="mb-16">
          <div className="flex items-center gap-2 mb-6">
            <Lightbulb className="w-5 h-5 text-primary" />
            <h3 className="font-display font-bold text-lg text-foreground">Research Contributions</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {RESEARCH_CONTRIBUTIONS.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`${isQuantum ? "quantum-glass" : "glass-card"} rounded-2xl p-5 hover:border-primary/30 transition-all`}
              >
                <h4 className="font-display font-semibold text-foreground mb-2 text-sm">{item.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed mb-3">{item.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {item.tags.map((tag) => (
                    <span key={tag} className="text-[9px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Methodology */}
        <div className="mb-16">
          <div className="flex items-center gap-2 mb-6">
            <FlaskConical className="w-5 h-5 text-primary" />
            <h3 className="font-display font-bold text-lg text-foreground">Methodology</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {METHODOLOGY.map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`${isQuantum ? "quantum-glass" : "glass-card"} rounded-xl p-5`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
                    <span className="text-xs font-display font-bold text-primary">{item.step}</span>
                  </div>
                  <h4 className="font-display font-semibold text-sm text-foreground">{item.title}</h4>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.content}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Key Theoretical Framework */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={`${isQuantum ? "quantum-glass" : "glass-card"} rounded-2xl p-6 mb-16`}
        >
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap className="w-5 h-5 text-primary" />
            <h3 className="font-display font-bold text-lg text-foreground">Theoretical Framework</h3>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                title: "Cognitive Psychology",
                content: "Based on Aaron Beck's Cognitive Therapy model (1976) and Kahneman & Tversky's work on heuristics and biases. Identifies systematic deviations from rational thinking.",
              },
              {
                title: "Quantum Cognition",
                content: "Applies quantum probability theory (Busemeyer & Bruza, 2012) to model belief states. Biases exist in superposition until measured, capturing the contextual nature of human judgment.",
              },
              {
                title: "Explainable AI",
                content: "Implements SHAP-based feature attribution (Lundberg & Lee, 2017) and attention visualization. Ensures model transparency and trustworthiness for clinical applications.",
              },
            ].map((framework) => (
              <div key={framework.title} className="p-4 rounded-xl bg-muted/10 border border-border/20">
                <h4 className="font-display font-semibold text-xs text-primary mb-2">{framework.title}</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{framework.content}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quantitative evaluation */}
        <div className="mb-16">
          <ResearchBenchmarks />
        </div>

        {/* Confusion heatmap */}
        <div className="mb-16">
          <ConfusionHeatmap />
        </div>

        {/* Human feedback loop */}
        <div className="mb-16">
          <FeedbackDashboard />
        </div>

        {/* Shared annotation corpus */}
        <div className="mb-16">
          <CorpusExplorer />
        </div>


        {/* Confidence calibration */}
        <div className="mb-16">
          <CalibrationPanel />
        </div>

        {/* Decision threshold tuning */}
        <div className="mb-16">
          <ThresholdTuner />
        </div>

        {/* Disagreement deep dive */}
        <div className="mb-16">
          <DisagreementDeepDive />
        </div>



        {/* Dataset, reproducibility, limitations */}
        <div className="mb-16">
          <ResearchAppendix />
        </div>

        {/* Citation */}
        <div className="mb-16">
          <CitationExport />
        </div>

        {/* References */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <BookOpen className="w-5 h-5 text-primary" />
            <h3 className="font-display font-bold text-lg text-foreground">Key References</h3>
          </div>
          <div className={`${isQuantum ? "quantum-glass" : "glass-card"} rounded-xl p-5`}>
            <div className="space-y-3">
              {REFERENCES.map((ref, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/20 transition-colors"
                >
                  <Quote className="w-3 h-3 text-primary/50 mt-1 shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-foreground">
                      <span className="font-semibold">{ref.authors}</span>
                      <span className="text-muted-foreground"> ({ref.year}). </span>
                      <span className="italic">{ref.title}</span>.{" "}
                      <span className="text-muted-foreground">{ref.journal}</span>
                    </p>
                  </div>
                  {ref.url && (
                    <a
                      href={ref.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 ml-2 text-primary/50 hover:text-primary transition-colors"
                      title="View paper"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ResearchSection;
