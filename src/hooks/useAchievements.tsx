import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  requirement_type: string;
  requirement_value: number;
  rarity: string;
}

interface UserAchievement {
  id: string;
  achievement_id: string;
  earned_at: string;
  progress: number;
  achievement: Achievement;
}

export const useAchievements = (userId: string | undefined) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (!userId) return;
    
    fetchAchievements();
    fetchUserAchievements();
  }, [userId]);

  const fetchAchievements = async () => {
    const { data } = await supabase
      .from("achievements")
      .select("*")
      .order("rarity", { ascending: true });
    
    if (data) setAchievements(data);
  };

  const fetchUserAchievements = async () => {
    if (!userId) return;
    
    const { data } = await supabase
      .from("user_achievements")
      .select(`
        *,
        achievement:achievements(*)
      `)
      .eq("user_id", userId);
    
    if (data) setUserAchievements(data as any);
  };

  const checkAndAwardAchievement = async (
    category: string,
    currentValue: number,
    requirementType: string
  ) => {
    if (!userId) return;

    const eligibleAchievements = achievements.filter(
      (a) =>
        a.category === category &&
        a.requirement_type === requirementType &&
        a.requirement_value <= currentValue &&
        !userAchievements.find((ua) => ua.achievement_id === a.id)
    );

    for (const achievement of eligibleAchievements) {
      const { error } = await supabase
        .from("user_achievements")
        .insert({
          user_id: userId,
          achievement_id: achievement.id,
          progress: currentValue,
        });

      if (!error) {
        toast({
          title: "🎉 Achievement Unlocked!",
          description: `${achievement.icon} ${achievement.name}: ${achievement.description}`,
          duration: 5000,
        });
        fetchUserAchievements();
      }
    }
  };

  return {
    achievements,
    userAchievements,
    checkAndAwardAchievement,
    refetch: fetchUserAchievements,
  };
};
