GRANT DELETE ON public.training_attempts TO anon, authenticated;
CREATE POLICY "Panel admin can delete training attempts" ON public.training_attempts FOR DELETE TO anon, authenticated USING (true);