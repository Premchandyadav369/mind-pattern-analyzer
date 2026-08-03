// Cloud persistence for the human-in-the-loop annotation corpus.
// Local storage stays the fast path; the backend gives a shared, durable corpus.

import { supabase } from "@/integrations/supabase/client";
import type { FeedbackRecord } from "./feedback";

const SESSION_KEY = "mindtrace:session:v1";

export function getSessionId(): string {
  if (typeof window === "undefined") return "server";
  let id = window.localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export interface CloudAnnotation extends FeedbackRecord {
  sessionId: string;
}

/** Best-effort push. Never throws — annotation UX must not break on network errors. */
export async function pushAnnotation(record: FeedbackRecord): Promise<boolean> {
  try {
    const { error } = await supabase.from("annotations").insert({
      bias_type: record.biasType,
      verdict: record.verdict,
      corrected_label: record.correctedLabel || null,
      confidence: Math.min(1, Math.max(0, record.confidence)),
      note: record.note || null,
      excerpt: record.excerpt.slice(0, 2000),
      session_id: getSessionId(),
    });
    return !error;
  } catch {
    return false;
  }
}

export async function fetchAnnotations(limit = 500): Promise<CloudAnnotation[]> {
  try {
    const { data, error } = await supabase
      .from("annotations")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error || !data) return [];
    return data.map((row) => ({
      id: row.id,
      biasType: row.bias_type,
      verdict: row.verdict as FeedbackRecord["verdict"],
      confidence: row.confidence ?? 0,
      correctedLabel: row.corrected_label ?? undefined,
      note: row.note ?? undefined,
      excerpt: row.excerpt,
      createdAt: row.created_at,
      sessionId: row.session_id,
    }));
  } catch {
    return [];
  }
}

export async function countAnnotations(): Promise<number> {
  try {
    const { count, error } = await supabase
      .from("annotations")
      .select("*", { count: "exact", head: true });
    return error ? 0 : count ?? 0;
  } catch {
    return 0;
  }
}
