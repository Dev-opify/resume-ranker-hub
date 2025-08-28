-- Create enum for academic classes
CREATE TYPE public.academic_class AS ENUM ('freshman', 'sophomore', 'junior', 'senior', 'graduate');

-- Create enum for semesters
CREATE TYPE public.semester AS ENUM ('fall', 'spring', 'summer');

-- Create candidates table
CREATE TABLE public.candidates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  class academic_class NOT NULL,
  semester semester NOT NULL,
  github_link TEXT,
  linkedin_link TEXT,
  resume_url TEXT,
  ats_score INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public insert (for candidate registration)
CREATE POLICY "Anyone can insert candidates" 
ON public.candidates 
FOR INSERT 
TO public
WITH CHECK (true);

-- Create policy to allow authenticated users to view all candidates (for admin)
CREATE POLICY "Authenticated users can view candidates" 
ON public.candidates 
FOR SELECT 
TO authenticated
USING (true);

-- Create policy to allow authenticated users to update candidates (for ATS score updates)
CREATE POLICY "Authenticated users can update candidates" 
ON public.candidates 
FOR UPDATE 
TO authenticated
USING (true);

-- Create storage bucket for resumes
INSERT INTO storage.buckets (id, name, public) VALUES ('resumes', 'resumes', false);

-- Create storage policies for resumes
CREATE POLICY "Anyone can upload resumes" 
ON storage.objects 
FOR INSERT 
TO public
WITH CHECK (bucket_id = 'resumes');

CREATE POLICY "Authenticated users can view resumes" 
ON storage.objects 
FOR SELECT 
TO authenticated
USING (bucket_id = 'resumes');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_candidates_updated_at
BEFORE UPDATE ON public.candidates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();