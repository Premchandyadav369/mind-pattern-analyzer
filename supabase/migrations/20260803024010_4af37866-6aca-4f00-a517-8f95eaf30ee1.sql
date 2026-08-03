CREATE TABLE public.annotations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bias_type TEXT NOT NULL,
  verdict TEXT NOT NULL CHECK (verdict IN ('correct','partial','incorrect')),
  corrected_label TEXT,
  confidence DOUBLE PRECISION NOT NULL DEFAULT 0 CHECK (confidence >= 0 AND confidence <= 1),
  note TEXT,
  excerpt TEXT NOT NULL,
  session_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.annotations TO anon;
GRANT SELECT, INSERT ON public.annotations TO authenticated;
GRANT ALL ON public.annotations TO service_role;

ALTER TABLE public.annotations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read annotations"
  ON public.annotations FOR SELECT
  USING (true);

CREATE POLICY "Anyone can submit annotations"
  ON public.annotations FOR INSERT
  WITH CHECK (char_length(excerpt) BETWEEN 1 AND 2000 AND char_length(bias_type) BETWEEN 1 AND 120);

CREATE INDEX idx_annotations_created_at ON public.annotations (created_at DESC);
CREATE INDEX idx_annotations_bias_type ON public.annotations (bias_type);