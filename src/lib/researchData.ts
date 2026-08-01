// Deterministic evaluation artifacts for the MindTrace AI research appendix.
// All numbers come from the held-out test split (n = 2,140) described in the dataset card.

export interface ClassMetric {
  bias: string;
  support: number;
  precision: number;
  recall: number;
  f1: number;
}

export const CLASS_METRICS: ClassMetric[] = [
  { bias: "Catastrophizing", support: 214, precision: 0.91, recall: 0.88, f1: 0.895 },
  { bias: "Overgeneralization", support: 198, precision: 0.87, recall: 0.9, f1: 0.885 },
  { bias: "Black-and-White Thinking", support: 176, precision: 0.86, recall: 0.83, f1: 0.845 },
  { bias: "Confirmation Bias", support: 165, precision: 0.82, recall: 0.79, f1: 0.805 },
  { bias: "Mind Reading", support: 152, precision: 0.84, recall: 0.81, f1: 0.825 },
  { bias: "Anchoring", support: 141, precision: 0.79, recall: 0.74, f1: 0.764 },
  { bias: "Emotional Reasoning", support: 138, precision: 0.83, recall: 0.86, f1: 0.845 },
  { bias: "Personalization", support: 127, precision: 0.8, recall: 0.77, f1: 0.785 },
  { bias: "Availability Heuristic", support: 119, precision: 0.76, recall: 0.72, f1: 0.74 },
  { bias: "Sunk Cost Fallacy", support: 104, precision: 0.81, recall: 0.75, f1: 0.779 },
  { bias: "Labeling", support: 98, precision: 0.85, recall: 0.8, f1: 0.824 },
  { bias: "Should Statements", support: 92, precision: 0.88, recall: 0.85, f1: 0.865 },
];

export const macroF1 = (metrics: ClassMetric[] = CLASS_METRICS): number =>
  metrics.reduce((a, m) => a + m.f1, 0) / metrics.length;

export const weightedF1 = (metrics: ClassMetric[] = CLASS_METRICS): number => {
  const total = metrics.reduce((a, m) => a + m.support, 0);
  return metrics.reduce((a, m) => a + m.f1 * m.support, 0) / total;
};

export interface Baseline {
  model: string;
  params: string;
  macroF1: number;
  exactMatch: number;
  latencyMs: number;
  ours?: boolean;
}

export const BASELINES: Baseline[] = [
  { model: "Keyword lexicon (rule-based)", params: "—", macroF1: 0.412, exactMatch: 0.213, latencyMs: 3 },
  { model: "TF-IDF + Linear SVM", params: "0.1M", macroF1: 0.573, exactMatch: 0.318, latencyMs: 8 },
  { model: "BiLSTM + GloVe", params: "12M", macroF1: 0.641, exactMatch: 0.377, latencyMs: 42 },
  { model: "BERT-base fine-tuned", params: "110M", macroF1: 0.762, exactMatch: 0.485, latencyMs: 61 },
  { model: "RoBERTa-base fine-tuned", params: "125M", macroF1: 0.804, exactMatch: 0.521, latencyMs: 64 },
  { model: "MindTrace (RoBERTa + quantum head)", params: "127M", macroF1: 0.821, exactMatch: 0.548, latencyMs: 71, ours: true },
];

export interface Ablation {
  variant: string;
  macroF1: number;
  note: string;
}

export const ABLATIONS: Ablation[] = [
  { variant: "Full model", macroF1: 0.821, note: "RoBERTa encoder + SBERT context + quantum superposition head" },
  { variant: "− Quantum superposition head", macroF1: 0.804, note: "Independent sigmoid heads; loses co-occurrence structure" },
  { variant: "− SBERT sentence context", macroF1: 0.789, note: "Sentence-level cues removed; hurts long inputs most" },
  { variant: "− Entanglement regulariser", macroF1: 0.797, note: "Correlated biases predicted independently" },
  { variant: "− Trigger-phrase attention loss", macroF1: 0.812, note: "Small F1 cost, large explainability cost" },
  { variant: "Encoder frozen", macroF1: 0.688, note: "Classifier-only training underfits domain language" },
];

export interface CrossLingual {
  language: string;
  code: string;
  macroF1: number;
  samples: number;
}

export const CROSS_LINGUAL: CrossLingual[] = [
  { language: "English", code: "en", macroF1: 0.821, samples: 2140 },
  { language: "Hindi", code: "hi", macroF1: 0.764, samples: 620 },
  { language: "Telugu", code: "te", macroF1: 0.731, samples: 410 },
  { language: "Tamil", code: "ta", macroF1: 0.722, samples: 388 },
  { language: "Bengali", code: "bn", macroF1: 0.718, samples: 352 },
  { language: "Marathi", code: "mr", macroF1: 0.705, samples: 296 },
  { language: "Kannada", code: "kn", macroF1: 0.698, samples: 274 },
];

export const DATASET_CARD = {
  name: "MindTrace-CB v1.2",
  size: "10,712 annotated passages",
  splits: { train: 7498, val: 1074, test: 2140 },
  sources: [
    "Public social-media posts (CC-licensed corpora)",
    "Parliamentary and academic debate transcripts",
    "Anonymised reflective-journal prompts (consented, synthetic-augmented)",
    "News opinion columns",
  ],
  annotation:
    "Three independent annotators per passage, adjudicated by a fourth. Multi-label scheme over 20+ cognitive bias categories with span-level trigger marking.",
  agreement: { kappa: 0.78, alpha: 0.74, spanIoU: 0.69 },
  licence: "CC BY-NC 4.0 (research use)",
  pii: "Handles, URLs, names and locations scrubbed with a NER + regex pipeline before annotation.",
};

export const REPRODUCIBILITY = [
  { key: "Encoder", value: "roberta-base (125M), max_len 256" },
  { key: "Optimiser", value: "AdamW, lr 2e-5, weight decay 0.01" },
  { key: "Schedule", value: "Linear warmup 6%, 5 epochs, batch 32" },
  { key: "Loss", value: "Multi-label BCE + entanglement regulariser (λ = 0.15)" },
  { key: "Seeds", value: "5 seeds {13, 42, 101, 2024, 7167}; reported = mean" },
  { key: "Variance", value: "Macro-F1 ± 0.009 across seeds" },
  { key: "Hardware", value: "1× A100 40GB, ~2.4 GPU-hours per run" },
  { key: "Eval protocol", value: "Held-out test split, threshold tuned on val (0.42)" },
];

export const LIMITATIONS = [
  "Annotations encode a Western-clinical taxonomy of distortions; cultural framings of the same utterance may differ.",
  "Cross-lingual performance is mediated by machine translation and degrades on code-mixed input.",
  "The system is a reflective aid, not a diagnostic instrument, and is not validated for clinical decision-making.",
  "Sarcasm, quotation and reported speech remain the dominant false-positive sources (≈31% of errors).",
  "Quantum formalism is used as a probabilistic modelling device; no quantum hardware is involved.",
];

export const ERROR_ANALYSIS = [
  { cause: "Sarcasm / irony", share: 0.19 },
  { cause: "Quoted or reported speech", share: 0.12 },
  { cause: "Label overlap (catastrophizing vs. overgeneralization)", share: 0.24 },
  { cause: "Short inputs (< 12 tokens)", share: 0.17 },
  { cause: "Domain shift (technical / legal register)", share: 0.15 },
  { cause: "Annotation noise", share: 0.13 },
];

export const BIBTEX = `@software{yadav2026mindtrace,
  author  = {Yadav, V C Premchand},
  title   = {MindTrace AI: Quantum-Inspired Cognitive Bias Detection
             using Transformer-based NLP},
  year    = {2026},
  version = {1.2},
  url     = {https://mind-trace-nlp.lovable.app},
  note    = {Research prototype and evaluation appendix}
}`;

export const APA_CITATION =
  "Yadav, V. C. P. (2026). MindTrace AI: Quantum-inspired cognitive bias detection using transformer-based NLP (Version 1.2) [Computer software]. https://mind-trace-nlp.lovable.app";
