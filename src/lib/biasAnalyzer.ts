import { supabase } from "@/integrations/supabase/client";

export interface BiasResult {
  biasType: string;
  confidence: number;
  explanation: string;
  reasoning?: string;
  reframe?: string;
  triggers: string[];
  severity?: "low" | "medium" | "high";
  color: "cyan" | "green" | "orange" | "red" | "purple";
}

export interface SentimentData {
  overall: "positive" | "negative" | "neutral" | "mixed";
  valence: number;
  arousal: number;
  dominance: number;
  emotions: string[];
}

export interface NLPMetrics {
  readingLevel: string;
  emotionalIntensity: number;
  logicalCoherence: number;
  persuasionTactics: string[];
  cognitiveComplexity: "low" | "medium" | "high";
}

export interface AnalysisResult {
  biases: BiasResult[];
  overallText: string;
  translatedText?: string;
  originalLanguage?: string;
  overallInsight?: string;
  sentiment?: SentimentData;
  nlpMetrics?: NLPMetrics;
  analyzedAt: Date;
}

async function translateText(text: string, sourceLanguage: string): Promise<string> {
  if (sourceLanguage === "en") return text;

  try {
    const { data, error } = await supabase.functions.invoke('translate-text', {
      body: { text, sourceLanguage, targetLanguage: 'English' },
    });
    if (error || !data?.translatedText) {
      console.warn('Translation failed, using original text:', error);
      return text;
    }
    return data.translatedText;
  } catch {
    console.warn('Translation service unavailable');
    return text;
  }
}

export async function analyzeText(text: string, language: string = "en"): Promise<AnalysisResult> {
  try {
    const textToAnalyze = language !== "en" ? await translateText(text, language) : text;

    const { data, error } = await supabase.functions.invoke('analyze-bias', {
      body: { text: textToAnalyze },
    });

    if (error) {
      console.error('Edge function error:', error);
      return fallbackAnalysis(text);
    }

    if (data?.error) {
      console.error('Analysis error:', data.error);
      return fallbackAnalysis(text);
    }

    return {
      biases: (data.biases || []).map((b: any) => ({
        biasType: b.biasType,
        confidence: b.confidence,
        explanation: b.explanation,
        reasoning: b.reasoning,
        reframe: b.reframe,
        triggers: b.triggers || [],
        severity: b.severity || "medium",
        color: b.color || "cyan",
      })),
      overallText: text,
      translatedText: language !== "en" ? textToAnalyze : undefined,
      originalLanguage: language !== "en" ? language : undefined,
      overallInsight: data.overallInsight,
      sentiment: data.sentiment || undefined,
      nlpMetrics: data.nlpMetrics || undefined,
      analyzedAt: new Date(),
    };
  } catch (err) {
    console.error('Analysis failed:', err);
    return fallbackAnalysis(text);
  }
}

function fallbackAnalysis(text: string): AnalysisResult {
  const lower = text.toLowerCase();
  const biases: BiasResult[] = [];

  const BIAS_PATTERNS: Record<string, { keywords: string[]; color: BiasResult["color"]; severity: "low" | "medium" | "high" }> = {
    Overgeneralization: {
      keywords: ["everyone", "nobody", "always", "never", "all", "none", "every", "no one", "everything", "nothing"],
      color: "cyan", severity: "medium",
    },
    "Black-and-White Thinking": {
      keywords: ["completely", "totally", "either", "absolutely", "impossible", "perfect", "failure", "useless", "worthless"],
      color: "orange", severity: "medium",
    },
    "Emotional Reasoning": {
      keywords: ["i feel", "i am", "must be", "i hate", "makes me feel", "so i must", "therefore i am"],
      color: "red", severity: "high",
    },
    "Confirmation Bias": {
      keywords: ["i knew", "proves that", "just as i thought", "always ignored", "told you so"],
      color: "green", severity: "medium",
    },
    "Survivorship Bias": {
      keywords: ["dropped out", "didn't need", "successful people", "education is useless", "without a degree"],
      color: "purple", severity: "medium",
    },
    "Catastrophizing": {
      keywords: ["doomed", "end of the world", "disaster", "ruined", "worst thing", "life is over"],
      color: "red", severity: "high",
    },
    "Ad Hominem": {
      keywords: ["they're stupid", "idiot", "what do they know", "of course they'd say"],
      color: "red", severity: "high",
    },
    "Bandwagon Effect": {
      keywords: ["everyone thinks", "most people agree", "it's obvious that", "common knowledge"],
      color: "purple", severity: "low",
    },
    "Anchoring Bias": {
      keywords: ["first impression", "originally", "initially", "started at", "was told"],
      color: "green", severity: "low",
    },
    "Sunk Cost Fallacy": {
      keywords: ["already invested", "come this far", "too late to", "can't give up now", "wasted if"],
      color: "purple", severity: "medium",
    },
    "Should Statements": {
      keywords: ["should have", "must always", "ought to", "supposed to", "have to"],
      color: "orange", severity: "medium",
    },
    "Mind Reading": {
      keywords: ["they think", "they probably", "i know they", "they must think", "everyone thinks i"],
      color: "red", severity: "medium",
    },
  };

  for (const [biasType, { keywords, color, severity }] of Object.entries(BIAS_PATTERNS)) {
    const foundTriggers = keywords.filter((kw) => lower.includes(kw));
    if (foundTriggers.length > 0) {
      const confidence = Math.min(0.5 + foundTriggers.length * 0.15, 0.98);
      biases.push({
        biasType,
        confidence: parseFloat(confidence.toFixed(2)),
        explanation: `Detected patterns: ${foundTriggers.map(t => `"${t}"`).join(", ")}`,
        triggers: foundTriggers,
        severity,
        color,
      });
    }
  }

  return {
    biases: biases.sort((a, b) => b.confidence - a.confidence),
    overallText: text,
    overallInsight: "Analysis performed using local pattern matching (AI unavailable).",
    sentiment: {
      overall: "neutral",
      valence: 0,
      arousal: 0.5,
      dominance: 0.5,
      emotions: ["uncertain"],
    },
    nlpMetrics: {
      readingLevel: "General",
      emotionalIntensity: 50,
      logicalCoherence: 50,
      persuasionTactics: [],
      cognitiveComplexity: "medium",
    },
    analyzedAt: new Date(),
  };
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
  {
    name: "Catastrophizing",
    description: "Assuming the worst possible outcome will happen.",
    example: '"If I make one mistake, everything will be ruined."',
    icon: "🌋",
    color: "red" as const,
  },
  {
    name: "Anchoring Bias",
    description: "Over-relying on the first piece of information encountered.",
    example: '"The first estimate was $500, so $400 seems like a great deal."',
    icon: "⚓",
    color: "green" as const,
  },
  {
    name: "Bandwagon Effect",
    description: "Believing something because many others do.",
    example: '"Everyone is investing in crypto, so it must be smart."',
    icon: "🎪",
    color: "purple" as const,
  },
  {
    name: "Sunk Cost Fallacy",
    description: "Continuing investment because of previously invested resources.",
    example: '"I\'ve already spent 3 years on this degree, I can\'t quit now."',
    icon: "💰",
    color: "purple" as const,
  },
  {
    name: "Ad Hominem",
    description: "Attacking the person rather than addressing the argument.",
    example: '"You\'re too young to understand economics."',
    icon: "🎯",
    color: "red" as const,
  },
];
