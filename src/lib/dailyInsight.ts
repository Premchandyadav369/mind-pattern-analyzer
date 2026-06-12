export interface Insight {
  title: string;
  body: string;
  source: string;
}

export const INSIGHTS: Insight[] = [
  {
    title: "The Spotlight Effect",
    body: "People notice you about 50% less than you think. The 'spotlight' on you is mostly imagined — most observers are absorbed in their own internal narrative.",
    source: "Gilovich, Medvec & Savitsky (2000)",
  },
  {
    title: "Negativity Asymmetry",
    body: "One negative event carries roughly 3–5x the cognitive weight of an equivalent positive event. Counteract by deliberately re-cataloguing positives.",
    source: "Baumeister et al. (2001)",
  },
  {
    title: "The Planning Fallacy",
    body: "Humans underestimate task duration by ~40% on average — even after being told about the planning fallacy. Use reference-class forecasting instead of intuition.",
    source: "Kahneman & Tversky (1979)",
  },
  {
    title: "Affective Forecasting Error",
    body: "We systematically overestimate how long emotions — both joy and grief — will last. Hedonic adaptation kicks in faster than we predict.",
    source: "Wilson & Gilbert (2003)",
  },
  {
    title: "Quantum Indeterminacy of Beliefs",
    body: "Per quantum cognition models, a held belief is often a superposition collapsed by the question's framing — not a stable prior. Rephrase the question, get a different answer.",
    source: "Busemeyer & Bruza (2012)",
  },
  {
    title: "The Backfire Effect",
    body: "Correcting misinformation can sometimes strengthen the original belief. Lead with the truth as the headline, never as the rebuttal.",
    source: "Nyhan & Reifler (2010)",
  },
  {
    title: "Decision Fatigue",
    body: "Self-control depletes with each decision. Sequence high-stakes choices early; automate the trivial ones.",
    source: "Vohs et al. (2008)",
  },
];

export const STORAGE_KEY = "mindtrace:daily-insight";

export interface InsightState {
  lastSeenDay: number;          // epoch days
  seenTitles: string[];         // ordered unique
  streak: number;               // consecutive-day streak
  totalViews: number;
  bookmarks: string[];          // saved insight titles
}

export const emptyState = (): InsightState => ({
  lastSeenDay: -1,
  seenTitles: [],
  streak: 0,
  totalViews: 0,
  bookmarks: [],
});

export const epochDay = (ts: number = Date.now()) => Math.floor(ts / 86_400_000);

export const insightForDay = (day: number): Insight => INSIGHTS[((day % INSIGHTS.length) + INSIGHTS.length) % INSIGHTS.length];

/** Returns new state after recording today's visit. Pure for testing. */
export const recordVisit = (state: InsightState, today: number): InsightState => {
  if (state.lastSeenDay === today) return state;
  const insight = insightForDay(today);
  const seenTitles = state.seenTitles.includes(insight.title)
    ? state.seenTitles
    : [...state.seenTitles, insight.title];
  const streak =
    state.lastSeenDay === today - 1 ? state.streak + 1 : 1;
  return {
    ...state,
    lastSeenDay: today,
    seenTitles,
    streak,
    totalViews: state.totalViews + 1,
  };
};

export const toggleBookmark = (state: InsightState, title: string): InsightState => {
  const has = state.bookmarks.includes(title);
  return {
    ...state,
    bookmarks: has ? state.bookmarks.filter((t) => t !== title) : [...state.bookmarks, title],
  };
};

export const loadState = (storage: Storage = typeof localStorage !== "undefined" ? localStorage : (undefined as unknown as Storage)): InsightState => {
  if (!storage) return emptyState();
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw);
    return { ...emptyState(), ...parsed };
  } catch {
    return emptyState();
  }
};

export const saveState = (state: InsightState, storage: Storage = typeof localStorage !== "undefined" ? localStorage : (undefined as unknown as Storage)) => {
  if (!storage) return;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
};
