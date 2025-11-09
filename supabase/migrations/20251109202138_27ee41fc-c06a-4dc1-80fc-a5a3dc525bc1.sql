-- Create achievements table to define all available badges
CREATE TABLE public.achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  category text NOT NULL CHECK (category IN ('study', 'quiz', 'streak', 'milestone')),
  requirement_type text NOT NULL CHECK (requirement_type IN ('count', 'streak', 'score', 'time')),
  requirement_value integer NOT NULL,
  rarity text NOT NULL DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create user_achievements table to track earned badges
CREATE TABLE public.user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  achievement_id uuid NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  earned_at timestamp with time zone NOT NULL DEFAULT now(),
  progress integer DEFAULT 0,
  UNIQUE(user_id, achievement_id)
);

-- Create user_streaks table to track daily activity
CREATE TABLE public.user_streaks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  current_streak integer NOT NULL DEFAULT 0,
  longest_streak integer NOT NULL DEFAULT 0,
  last_activity_date date,
  total_study_sessions integer NOT NULL DEFAULT 0,
  total_quizzes integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for achievements (public read)
CREATE POLICY "Anyone can view achievements"
ON public.achievements
FOR SELECT
USING (true);

-- RLS Policies for user_achievements
CREATE POLICY "Users can view their own achievements"
ON public.user_achievements
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements"
ON public.user_achievements
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own achievements"
ON public.user_achievements
FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for user_streaks
CREATE POLICY "Users can view their own streaks"
ON public.user_streaks
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own streaks"
ON public.user_streaks
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own streaks"
ON public.user_streaks
FOR UPDATE
USING (auth.uid() = user_id);

-- Create trigger for user_streaks updated_at
CREATE TRIGGER update_user_streaks_updated_at
BEFORE UPDATE ON public.user_streaks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default achievements
INSERT INTO public.achievements (name, description, icon, category, requirement_type, requirement_value, rarity) VALUES
  ('First Steps', 'Complete your first study session', '🎯', 'study', 'count', 1, 'common'),
  ('Study Enthusiast', 'Complete 10 study sessions', '📚', 'study', 'count', 10, 'common'),
  ('Study Master', 'Complete 50 study sessions', '🏆', 'study', 'count', 50, 'rare'),
  ('Quiz Rookie', 'Complete your first quiz', '🎓', 'quiz', 'count', 1, 'common'),
  ('Quiz Champion', 'Complete 25 quizzes', '🥇', 'quiz', 'count', 25, 'rare'),
  ('Perfect Score', 'Get 100% on any quiz', '💯', 'quiz', 'score', 100, 'epic'),
  ('3-Day Streak', 'Study for 3 days in a row', '🔥', 'streak', 'streak', 3, 'common'),
  ('Week Warrior', 'Study for 7 days in a row', '⚡', 'streak', 'streak', 7, 'rare'),
  ('Month Master', 'Study for 30 days in a row', '💪', 'streak', 'streak', 30, 'epic'),
  ('Unstoppable', 'Study for 100 days in a row', '👑', 'streak', 'streak', 100, 'legendary'),
  ('Quick Learner', 'Complete 5 quizzes with 80%+ score', '🚀', 'quiz', 'score', 80, 'rare'),
  ('Knowledge Seeker', 'Study 100 hours total', '📖', 'milestone', 'time', 100, 'epic');
