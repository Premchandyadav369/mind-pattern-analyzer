// Lightweight client-side bias suggestion engine — pattern-based, no API calls.
// Used to give live hints while the user is typing.

export interface LiveSuggestion {
  biasType: string;
  triggerPhrase: string;
  hint: string;
  color: "cyan" | "green" | "orange" | "red" | "purple";
}

interface Pattern {
  biasType: string;
  color: LiveSuggestion["color"];
  hint: string;
  // Match either a regex or a list of phrase fragments
  patterns: RegExp[];
}

const PATTERNS: Pattern[] = [
  {
    biasType: "Overgeneralization",
    color: "cyan",
    hint: "Sweeping language — does it really apply to everyone?",
    patterns: [/\b(everyone|everybody|nobody|no one|all of them|always|never|every time)\b/i],
  },
  {
    biasType: "Black-and-White Thinking",
    color: "orange",
    hint: "Extreme framing — consider middle ground.",
    patterns: [/\b(completely|totally|utterly|absolutely|entirely)\s+(useless|worthless|broken|ruined|perfect|terrible)\b/i, /\b(either)\b.*\b(or)\b/i],
  },
  {
    biasType: "Catastrophizing",
    color: "red",
    hint: "Worst-case framing — how likely is this really?",
    patterns: [/\b(my life is over|disaster|the end|ruined forever|never recover|worst (thing|case))\b/i],
  },
  {
    biasType: "Mind Reading",
    color: "red",
    hint: "Assuming others' thoughts without evidence.",
    patterns: [/\b(they (think|believe|assume)|everyone (thinks|knows)|people probably think)\b/i],
  },
  {
    biasType: "Fortune Telling",
    color: "red",
    hint: "Predicting the future without evidence.",
    patterns: [/\b(i('|\s+a)?ll never|will never|going to fail|won't work|i know it will|bound to)\b/i],
  },
  {
    biasType: "Should Statements",
    color: "orange",
    hint: "Rigid 'should/must' rules can create pressure.",
    patterns: [/\b(should have|must (be|do)|have to be|ought to)\b/i],
  },
  {
    biasType: "Labeling",
    color: "red",
    hint: "Global label from a single event.",
    patterns: [/\bi am (a )?(loser|failure|idiot|stupid|useless|worthless|incompetent)\b/i],
  },
  {
    biasType: "Emotional Reasoning",
    color: "red",
    hint: "Treating a feeling as proof of fact.",
    patterns: [/\bi feel\s+\w+,?\s*(so|therefore|which means)\b/i],
  },
  {
    biasType: "Confirmation Bias",
    color: "green",
    hint: "Cherry-picking supportive info.",
    patterns: [/\b(i knew it|i always (said|knew)|just as i (thought|expected))\b/i],
  },
  {
    biasType: "Bandwagon Effect",
    color: "purple",
    hint: "Popularity isn't proof.",
    patterns: [/\b(everyone (is|is doing|knows|agrees)|most people|the majority)\b/i],
  },
  {
    biasType: "Sunk Cost Fallacy",
    color: "purple",
    hint: "Past investment shouldn't dictate future choices.",
    patterns: [/\b(already (spent|invested|put in)|too late to (stop|quit)|can't (stop|give up) now)\b/i],
  },
  {
    biasType: "Appeal to Authority",
    color: "green",
    hint: "Authority alone isn't evidence.",
    patterns: [/\b(experts? (say|agree)|scientists? (say|agree)|because (the )?(ceo|president|professor) said)\b/i],
  },
  {
    biasType: "Ad Hominem",
    color: "red",
    hint: "Attacking the person, not the argument.",
    patterns: [/\b(you('?re| are) (just )?(stupid|an idiot|ignorant|biased)|typical of someone like you)\b/i],
  },
  {
    biasType: "False Dichotomy",
    color: "orange",
    hint: "More than two options likely exist.",
    patterns: [/\b(you('?re| are) (either|with us or against us))\b/i, /\bonly (two|2) (choices|options)\b/i],
  },
  {
    biasType: "Survivorship Bias",
    color: "purple",
    hint: "Don't ignore the failures.",
    patterns: [/\b(dropped out and (still )?(succeeded|got rich|made it)|every (successful|winner))\b/i],
  },
];

export function getLiveSuggestions(text: string): LiveSuggestion[] {
  if (!text || text.trim().length < 12) return [];
  const found: LiveSuggestion[] = [];
  const seen = new Set<string>();
  for (const p of PATTERNS) {
    for (const rx of p.patterns) {
      const m = text.match(rx);
      if (m && !seen.has(p.biasType)) {
        seen.add(p.biasType);
        found.push({
          biasType: p.biasType,
          triggerPhrase: m[0],
          hint: p.hint,
          color: p.color,
        });
        break;
      }
    }
  }
  return found.slice(0, 5);
}
