export interface BiasResult {
  biasType: string;
  confidence: number;
  explanation: string;
  triggers: string[];
  color: "cyan" | "green" | "orange" | "red" | "purple";
}

export interface AnalysisResult {
  biases: BiasResult[];
  overallText: string;
  analyzedAt: Date;
}

const BIAS_PATTERNS: Record<string, { keywords: string[]; color: BiasResult["color"] }> = {
  Overgeneralization: {
    keywords: ["everyone", "nobody", "always", "never", "all", "none", "every", "no one", "everything", "nothing", "entire", "whole"],
    color: "cyan",
  },
  "Black-and-White Thinking": {
    keywords: ["completely", "totally", "either", "or", "absolutely", "impossible", "perfect", "failure", "ruined", "useless", "worthless", "life is over"],
    color: "orange",
  },
  "Emotional Reasoning": {
    keywords: ["i feel", "i am", "must be", "i hate", "i love", "makes me feel", "so i must", "therefore i am"],
    color: "red",
  },
  "Confirmation Bias": {
    keywords: ["i knew", "proves that", "just as i thought", "see i was right", "always ignored", "told you so", "as expected"],
    color: "green",
  },
  "Survivorship Bias": {
    keywords: ["dropped out", "didn't need", "successful people", "who needs", "education is useless", "without a degree"],
    color: "purple",
  },
};

export function analyzeText(text: string): AnalysisResult {
  const lower = text.toLowerCase();
  const biases: BiasResult[] = [];

  for (const [biasType, { keywords, color }] of Object.entries(BIAS_PATTERNS)) {
    const foundTriggers = keywords.filter((kw) => lower.includes(kw));
    if (foundTriggers.length > 0) {
      const confidence = Math.min(0.5 + foundTriggers.length * 0.15, 0.98);
      biases.push({
        biasType,
        confidence: parseFloat(confidence.toFixed(2)),
        explanation: getExplanation(biasType, foundTriggers),
        triggers: foundTriggers,
        color,
      });
    }
  }

  // If no pattern match, check for general negativity / strong statements
  if (biases.length === 0) {
    const hasStrongLanguage = /!{2,}|[A-Z]{4,}/.test(text);
    if (hasStrongLanguage) {
      biases.push({
        biasType: "Potential Bias Detected",
        confidence: 0.35,
        explanation: "The text contains strong language patterns that may indicate biased reasoning, but no specific cognitive bias pattern was clearly identified.",
        triggers: [],
        color: "cyan",
      });
    }
  }

  return {
    biases: biases.sort((a, b) => b.confidence - a.confidence),
    overallText: text,
    analyzedAt: new Date(),
  };
}

function getExplanation(biasType: string, triggers: string[]): string {
  const triggerList = triggers.map((t) => `"${t}"`).join(", ");
  
  switch (biasType) {
    case "Overgeneralization":
      return `The statement uses universal language (${triggerList}), making a broad conclusion that likely extends beyond available evidence.`;
    case "Black-and-White Thinking":
      return `The text contains extreme language (${triggerList}), framing the situation in absolute terms without acknowledging middle ground.`;
    case "Emotional Reasoning":
      return `The reasoning appears to treat emotional states as factual evidence (${triggerList}), conflating feelings with objective reality.`;
    case "Confirmation Bias":
      return `The statement selectively validates a pre-existing belief (${triggerList}), ignoring potential counterevidence.`;
    case "Survivorship Bias":
      return `The argument focuses on successful outliers (${triggerList}) while ignoring the larger population of cases that don't support the conclusion.`;
    default:
      return `Detected bias patterns: ${triggerList}`;
  }
}

export const BIAS_INFO = [
  {
    name: "Overgeneralization",
    description: "Making broad conclusions from limited data.",
    example: '"Nobody ever helps me."',
    icon: "🌐",
    color: "cyan" as const,
  },
  {
    name: "Confirmation Bias",
    description: "Focusing only on information that supports an existing belief.",
    example: '"I knew this plan would fail because my ideas are always ignored."',
    icon: "🔍",
    color: "green" as const,
  },
  {
    name: "Emotional Reasoning",
    description: "Treating emotions as factual evidence.",
    example: '"I feel useless, so I must be incompetent."',
    icon: "💭",
    color: "red" as const,
  },
  {
    name: "Black-and-White Thinking",
    description: "Viewing situations as extremes with no middle ground.",
    example: '"If I fail this test, my life is over."',
    icon: "⚖️",
    color: "orange" as const,
  },
  {
    name: "Survivorship Bias",
    description: "Ignoring failures while focusing only on successful cases.",
    example: '"Successful entrepreneurs dropped out, so education is useless."',
    icon: "🏆",
    color: "purple" as const,
  },
];
