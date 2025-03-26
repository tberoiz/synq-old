-- Create user_reports table
CREATE TABLE IF NOT EXISTS public.user_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  parameters JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS user_reports_user_id_idx ON public.user_reports(user_id);

-- Add RLS policies
ALTER TABLE public.user_reports ENABLE ROW LEVEL SECURITY;

-- Policy for select (read) operations
CREATE POLICY "Users can view their own reports" 
  ON public.user_reports
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Policy for insert operations
CREATE POLICY "Users can create their own reports" 
  ON public.user_reports
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Policy for update operations
CREATE POLICY "Users can update their own reports" 
  ON public.user_reports
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy for delete operations
CREATE POLICY "Users can delete their own reports" 
  ON public.user_reports
  FOR DELETE 
  USING (auth.uid() = user_id); 