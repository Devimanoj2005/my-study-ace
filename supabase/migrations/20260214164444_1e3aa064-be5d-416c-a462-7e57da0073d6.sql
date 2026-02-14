
-- Daily challenges table (pre-defined challenge templates)
CREATE TABLE public.daily_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'study',
  challenge_type TEXT NOT NULL DEFAULT 'daily',
  bonus_points INTEGER NOT NULL DEFAULT 10,
  icon TEXT NOT NULL DEFAULT '🎯',
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.daily_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view daily challenges"
  ON public.daily_challenges FOR SELECT
  USING (true);

-- User challenge completions tracking
CREATE TABLE public.user_challenge_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  challenge_id UUID NOT NULL REFERENCES public.daily_challenges(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  bonus_points_earned INTEGER NOT NULL DEFAULT 0,
  challenge_date DATE NOT NULL DEFAULT CURRENT_DATE
);

ALTER TABLE public.user_challenge_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own completions"
  ON public.user_challenge_completions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own completions"
  ON public.user_challenge_completions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Unique constraint: one completion per challenge per day per user
CREATE UNIQUE INDEX idx_unique_daily_completion 
  ON public.user_challenge_completions(user_id, challenge_id, challenge_date);

-- User bonus points tracker
CREATE TABLE public.user_bonus_points (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  total_points INTEGER NOT NULL DEFAULT 0,
  weekly_points INTEGER NOT NULL DEFAULT 0,
  last_reset_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_bonus_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own points"
  ON public.user_bonus_points FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own points"
  ON public.user_bonus_points FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own points"
  ON public.user_bonus_points FOR UPDATE
  USING (auth.uid() = user_id);

-- Seed daily challenges
INSERT INTO public.daily_challenges (title, description, category, bonus_points, icon, requirement_type, requirement_value) VALUES
  ('Study Sprint', 'Complete a 30-minute study session', 'study', 15, '📚', 'study_session', 1),
  ('Quiz Master', 'Score 80% or above on any quiz', 'quiz', 20, '🧠', 'quiz_score', 80),
  ('Note Taker', 'Create or update a study note', 'notes', 10, '📝', 'create_note', 1),
  ('Flash Card Pro', 'Review 10 flashcards', 'flashcards', 15, '🃏', 'review_flashcards', 10),
  ('Equation Collector', 'Add a new equation to your collection', 'equations', 10, '🔢', 'add_equation', 1),
  ('Streak Keeper', 'Maintain your daily study streak', 'streak', 25, '🔥', 'maintain_streak', 1),
  ('Double Down', 'Complete 2 study sessions in one day', 'study', 30, '⚡', 'study_session', 2),
  ('Perfect Score', 'Get 100% on a quiz', 'quiz', 50, '🏆', 'quiz_score', 100);
