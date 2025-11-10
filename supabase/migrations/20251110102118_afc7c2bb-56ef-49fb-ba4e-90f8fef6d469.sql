-- Create storage buckets for profile pictures and PDFs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('profile-pictures', 'profile-pictures', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]),
  ('pdfs', 'pdfs', false, 10485760, ARRAY['application/pdf']::text[]);

-- Storage policies for profile pictures
CREATE POLICY "Anyone can view profile pictures"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-pictures');

CREATE POLICY "Users can upload their own profile picture"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'profile-pictures' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own profile picture"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'profile-pictures' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own profile picture"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'profile-pictures' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Storage policies for PDFs
CREATE POLICY "Users can view their own PDFs"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'pdfs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can upload their own PDFs"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'pdfs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own PDFs"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'pdfs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Add profile_picture_url to profiles table
ALTER TABLE public.profiles 
ADD COLUMN profile_picture_url text;

-- Create equations table
CREATE TABLE public.equations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  subject_id UUID NOT NULL,
  title TEXT NOT NULL,
  equation_text TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.equations ENABLE ROW LEVEL SECURITY;

-- RLS policies for equations
CREATE POLICY "Users can view their own equations"
ON public.equations FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own equations"
ON public.equations FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own equations"
ON public.equations FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own equations"
ON public.equations FOR DELETE
USING (auth.uid() = user_id);

-- Add trigger for equations updated_at
CREATE TRIGGER update_equations_updated_at
BEFORE UPDATE ON public.equations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();