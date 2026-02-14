import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Challenge {
  id: string;
  title: string;
  description: string;
  category: string;
  bonus_points: number;
  icon: string;
  requirement_type: string;
  requirement_value: number;
}

interface Completion {
  id: string;
  challenge_id: string;
  completed_at: string;
  bonus_points_earned: number;
  challenge_date: string;
}

interface BonusPoints {
  total_points: number;
  weekly_points: number;
}

export const useDailyChallenges = (userId: string | undefined) => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [bonusPoints, setBonusPoints] = useState<BonusPoints>({ total_points: 0, weekly_points: 0 });
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split("T")[0];

  const fetchData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);

    const [challengesRes, completionsRes, pointsRes] = await Promise.all([
      supabase.from("daily_challenges").select("*"),
      supabase
        .from("user_challenge_completions")
        .select("*")
        .eq("user_id", userId)
        .eq("challenge_date", today),
      supabase.from("user_bonus_points").select("*").eq("user_id", userId).maybeSingle(),
    ]);

    setChallenges((challengesRes.data as Challenge[]) || []);
    setCompletions((completionsRes.data as Completion[]) || []);
    if (pointsRes.data) {
      setBonusPoints(pointsRes.data as BonusPoints);
    }
    setLoading(false);
  }, [userId, today]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const completeChallenge = async (challengeId: string) => {
    if (!userId) return;

    const challenge = challenges.find((c) => c.id === challengeId);
    if (!challenge) return;

    const alreadyDone = completions.find((c) => c.challenge_id === challengeId);
    if (alreadyDone) {
      toast.info("You've already completed this challenge today!");
      return;
    }

    // Insert completion
    const { error: compError } = await supabase.from("user_challenge_completions").insert({
      user_id: userId,
      challenge_id: challengeId,
      bonus_points_earned: challenge.bonus_points,
      challenge_date: today,
    });

    if (compError) {
      toast.error("Failed to complete challenge");
      return;
    }

    // Upsert bonus points
    const newTotal = bonusPoints.total_points + challenge.bonus_points;
    const newWeekly = bonusPoints.weekly_points + challenge.bonus_points;

    const { data: existing } = await supabase
      .from("user_bonus_points")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("user_bonus_points")
        .update({ total_points: newTotal, weekly_points: newWeekly, updated_at: new Date().toISOString() })
        .eq("user_id", userId);
    } else {
      await supabase.from("user_bonus_points").insert({
        user_id: userId,
        total_points: challenge.bonus_points,
        weekly_points: challenge.bonus_points,
      });
    }

    toast.success(`🎉 +${challenge.bonus_points} bonus points earned!`);
    fetchData();
  };

  const isChallengeCompleted = (challengeId: string) => {
    return completions.some((c) => c.challenge_id === challengeId);
  };

  const todayProgress = {
    completed: completions.length,
    total: challenges.length,
    percentage: challenges.length > 0 ? Math.round((completions.length / challenges.length) * 100) : 0,
  };

  return {
    challenges,
    completions,
    bonusPoints,
    loading,
    completeChallenge,
    isChallengeCompleted,
    todayProgress,
  };
};
