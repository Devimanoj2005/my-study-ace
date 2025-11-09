-- Add exam_date column to subjects table
ALTER TABLE public.subjects 
ADD COLUMN exam_date timestamp with time zone;

-- Create revision_schedule table to track study plans
CREATE TABLE public.revision_schedule (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  subject_id uuid NOT NULL,
  topic text NOT NULL,
  scheduled_date timestamp with time zone NOT NULL,
  priority text NOT NULL DEFAULT 'medium',
  completed boolean NOT NULL DEFAULT false,
  confidence_level text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on revision_schedule
ALTER TABLE public.revision_schedule ENABLE ROW LEVEL SECURITY;

-- Create policies for revision_schedule
CREATE POLICY "Users can view their own schedule"
ON public.revision_schedule
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own schedule"
ON public.revision_schedule
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own schedule"
ON public.revision_schedule
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own schedule"
ON public.revision_schedule
FOR DELETE
USING (auth.uid() = user_id);