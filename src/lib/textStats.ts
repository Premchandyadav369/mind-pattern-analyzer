export interface TextStats {
  words: number;
  sentences: number;
  chars: number;
  charsNoSpace: number;
  avgWord: string;
  readingMin: number;
  speakingMin: number;
  flesch: number;
  lexDensity: number;
}

const countSyllables = (word: string): number => {
  const s = word
    .toLowerCase()
    .replace(/[^a-z]/g, "")
    .replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "")
    .match(/[aeiouy]{1,2}/g);
  return Math.max(1, s ? s.length : 0);
};

export const computeTextStats = (text: string): TextStats => {
  const words = text.trim() ? text.trim().split(/\s+/) : [];
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim()).length;
  const chars = text.length;
  const charsNoSpace = text.replace(/\s/g, "").length;
  const avgWord = words.length ? (charsNoSpace / words.length).toFixed(1) : "0";
  const readingMin = Math.max(1, Math.round(words.length / 200));
  const speakingMin = Math.max(1, Math.round(words.length / 130));

  const syllables = words.reduce((acc, w) => acc + countSyllables(w), 0);
  const fleschRaw =
    words.length && sentences
      ? 206.835 - 1.015 * (words.length / sentences) - 84.6 * (syllables / words.length)
      : 0;
  const flesch = Math.round(Math.max(0, Math.min(100, fleschRaw)));

  const lower = words.map((w) => w.toLowerCase().replace(/[^a-z]/g, ""));
  const unique = new Set(lower.filter(Boolean)).size;
  const lexDensity = words.length ? Math.round((unique / words.length) * 100) : 0;

  return { words: words.length, sentences, chars, charsNoSpace, avgWord, readingMin, speakingMin, flesch, lexDensity };
};
