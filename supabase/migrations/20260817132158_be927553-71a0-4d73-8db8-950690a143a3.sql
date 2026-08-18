CREATE TABLE public.training_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  packer_name TEXT NOT NULL,
  employee_code TEXT NOT NULL,
  warehouse_code TEXT NOT NULL,
  warehouse_name TEXT NOT NULL,
  city TEXT NOT NULL,
  shift TEXT,
  answers JSONB NOT NULL DEFAULT '[]'::jsonb,
  score INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL DEFAULT 0,
  percentage NUMERIC(5,2) NOT NULL DEFAULT 0,
  result TEXT NOT NULL DEFAULT 'fail',
  time_taken_seconds INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.training_attempts TO anon;
GRANT SELECT, INSERT ON public.training_attempts TO authenticated;
GRANT ALL ON public.training_attempts TO service_role;

ALTER TABLE public.training_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a training attempt"
  ON public.training_attempts FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can view training attempts"
  ON public.training_attempts FOR SELECT TO anon, authenticated
  USING (true);

CREATE INDEX idx_training_attempts_wh ON public.training_attempts (warehouse_code);
CREATE INDEX idx_training_attempts_created ON public.training_attempts (created_at DESC);

ALTER TABLE public.training_attempts
  ADD COLUMN IF NOT EXISTS language TEXT NOT NULL DEFAULT 'en',
  ADD COLUMN IF NOT EXISTS attempt_number INTEGER NOT NULL DEFAULT 1;

CREATE INDEX IF NOT EXISTS idx_training_attempts_emp ON public.training_attempts (employee_code);

GRANT DELETE ON public.training_attempts TO anon, authenticated;
CREATE POLICY "Panel admin can delete training attempts" ON public.training_attempts FOR DELETE TO anon, authenticated USING (true);