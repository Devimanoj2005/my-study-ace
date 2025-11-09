import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Streak {
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  total_study_sessions: number;
  total_quizzes: number;
}

export const useStreak = (userId: string | undefined) => {
  const [streak, setStreak] = useState<Streak | null>(null);

  useEffect(() => {
    if (!userId) return;
    fetchStreak();
  }, [userId]);

  const fetchStreak = async () => {
    if (!userId) return;

    const { data } = await supabase
      .from("user_streaks")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (data) {
      setStreak(data);
    } else {
      // Create initial streak record
      const { data: newStreak } = await supabase
        .from("user_streaks")
        .insert({
          user_id: userId,
          current_streak: 0,
          longest_streak: 0,
          total_study_sessions: 0,
          total_quizzes: 0,
        })
        .select()
        .single();

      if (newStreak) setStreak(newStreak);
    }
  };

  const updateStreak = async (activityType: "study" | "quiz") => {
    if (!userId || !streak) return;

    const today = new Date().toISOString().split("T")[0];
    const lastDate = streak.last_activity_date;
    
    let newStreak = streak.current_streak;
    
    if (lastDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      if (lastDate === yesterdayStr) {
        newStreak += 1;
      } else if (lastDate !== today) {
        newStreak = 1;
      }
    }

    const longestStreak = Math.max(newStreak, streak.longest_streak);
    const totalStudy = activityType === "study" ? streak.total_study_sessions + 1 : streak.total_study_sessions;
    const totalQuiz = activityType === "quiz" ? streak.total_quizzes + 1 : streak.total_quizzes;

    const { data } = await supabase
      .from("user_streaks")
      .update({
        current_streak: newStreak,
        longest_streak: longestStreak,
        last_activity_date: today,
        total_study_sessions: totalStudy,
        total_quizzes: totalQuiz,
      })
      .eq("user_id", userId)
      .select()
      .single();

    if (data) setStreak(data);
    return { currentStreak: newStreak, totalStudy, totalQuiz };
  };

  return {
    streak,
    updateStreak,
    refetch: fetchStreak,
  };
};
