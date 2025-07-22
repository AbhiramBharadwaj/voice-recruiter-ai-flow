-- Create enum for interview status
CREATE TYPE public.interview_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled');

-- Create enum for candidate status
CREATE TYPE public.candidate_status AS ENUM ('active', 'hired', 'rejected', 'withdrawn');

-- Create candidates table
CREATE TABLE public.candidates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  resume_url TEXT,
  resume_content TEXT,
  skills TEXT[],
  experience_years INTEGER,
  current_position TEXT,
  current_company TEXT,
  status candidate_status NOT NULL DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create interviews table
CREATE TABLE public.interviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER DEFAULT 30,
  status interview_status NOT NULL DEFAULT 'scheduled',
  interview_type TEXT DEFAULT 'voice',
  questions JSONB,
  responses JSONB,
  transcript TEXT,
  sentiment_score DECIMAL(3,2),
  technical_score DECIMAL(3,2),
  communication_score DECIMAL(3,2),
  overall_score DECIMAL(3,2),
  ai_feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create job_positions table
CREATE TABLE public.job_positions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  requirements TEXT[],
  skills_required TEXT[],
  experience_level TEXT,
  salary_range TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create candidate_applications table (many-to-many between candidates and positions)
CREATE TABLE public.candidate_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  job_position_id UUID NOT NULL REFERENCES public.job_positions(id) ON DELETE CASCADE,
  application_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT DEFAULT 'applied',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_applications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for candidates
CREATE POLICY "Users can view their own candidates" 
ON public.candidates 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own candidates" 
ON public.candidates 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own candidates" 
ON public.candidates 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own candidates" 
ON public.candidates 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for interviews
CREATE POLICY "Users can view their own interviews" 
ON public.interviews 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own interviews" 
ON public.interviews 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own interviews" 
ON public.interviews 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own interviews" 
ON public.interviews 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for job_positions
CREATE POLICY "Users can view their own job positions" 
ON public.job_positions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own job positions" 
ON public.job_positions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own job positions" 
ON public.job_positions 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own job positions" 
ON public.job_positions 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for candidate_applications
CREATE POLICY "Users can view applications for their candidates and positions" 
ON public.candidate_applications 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.candidates c 
    WHERE c.id = candidate_id AND c.user_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM public.job_positions jp 
    WHERE jp.id = job_position_id AND jp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create applications for their data" 
ON public.candidate_applications 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.candidates c 
    WHERE c.id = candidate_id AND c.user_id = auth.uid()
  ) AND
  EXISTS (
    SELECT 1 FROM public.job_positions jp 
    WHERE jp.id = job_position_id AND jp.user_id = auth.uid()
  )
);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_candidates_updated_at
BEFORE UPDATE ON public.candidates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_interviews_updated_at
BEFORE UPDATE ON public.interviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_job_positions_updated_at
BEFORE UPDATE ON public.job_positions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();