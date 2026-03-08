import { supabase } from "@/integrations/supabase/client";

export interface BiasResult {
  biasType: string;
  confidence: number;
  explanation: string;
  reasoning?: string;
  reframe?: string;
  triggers: string[];
  color: "cyan" | "green" | "orange" | "red" | "purple";
}

export interface AnalysisResult {
  biases: BiasResult[];
  overallText: string;
  translatedText?: string;
  originalLanguage?: string;
  overallInsight?: string;
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
    // Translate if needed
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
        color: b.color || "cyan",
      })),
      overallText: text,
      translatedText: language !== "en" ? textToAnalyze : undefined,
      originalLanguage: language !== "en" ? language : undefined,
      overallInsight: data.overallInsight,
      analyzedAt: new Date(),
    };
  } catch (err) {
    console.error('Analysis failed:', err);
    return fallbackAnalysis(text);
  }
}

// Fallback local analysis if AI is unavailable
function fallbackAnalysis(text: string): AnalysisResult {
  const lower = text.toLowerCase();
  const biases: BiasResult[] = [];

  const BIAS_PATTERNS: Record<string, { keywords: string[]; color: BiasResult["color"] }> = {
    Overgeneralization: {
      keywords: ["everyone", "nobody", "always", "never", "all", "none", "every", "no one", "everything", "nothing"],
      color: "cyan",
    },
    "Black-and-White Thinking": {
      keywords: ["completely", "totally", "either", "absolutely", "impossible", "perfect", "failure", "useless", "worthless"],
      color: "orange",
    },
    "Emotional Reasoning": {
      keywords: ["i feel", "i am", "must be", "i hate", "makes me feel", "so i must", "therefore i am"],
      color: "red",
    },
    "Confirmation Bias": {
      keywords: ["i knew", "proves that", "just as i thought", "always ignored", "told you so"],
      color: "green",
    },
    "Survivorship Bias": {
      keywords: ["dropped out", "didn't need", "successful people", "education is useless", "without a degree"],
      color: "purple",
    },
  };

  for (const [biasType, { keywords, color }] of Object.entries(BIAS_PATTERNS)) {
    const foundTriggers = keywords.filter((kw) => lower.includes(kw));
    if (foundTriggers.length > 0) {
      const confidence = Math.min(0.5 + foundTriggers.length * 0.15, 0.98);
      biases.push({
        biasType,
        confidence: parseFloat(confidence.toFixed(2)),
        explanation: `Detected patterns: ${foundTriggers.map(t => `"${t}"`).join(", ")}`,
        triggers: foundTriggers,
        color,
      });
    }
  }

  return {
    biases: biases.sort((a, b) => b.confidence - a.confidence),
    overallText: text,
    overallInsight: "Analysis performed using local pattern matching (AI unavailable).",
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
];
