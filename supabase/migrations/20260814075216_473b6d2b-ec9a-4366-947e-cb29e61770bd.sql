ALTER TABLE public.training_attempts
  ADD COLUMN IF NOT EXISTS language TEXT NOT NULL DEFAULT 'en',
  ADD COLUMN IF NOT EXISTS attempt_number INTEGER NOT NULL DEFAULT 1;

CREATE INDEX IF NOT EXISTS idx_training_attempts_emp ON public.training_attempts (employee_code);