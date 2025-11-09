import { motion } from "framer-motion";
import { Lock } from "lucide-react";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: string;
}

interface AchievementCardProps {
  achievement: Achievement;
  isUnlocked: boolean;
  earnedAt?: string;
}

const AchievementCard = ({ achievement, isUnlocked, earnedAt }: AchievementCardProps) => {
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "from-muted to-muted/50";
      case "rare":
        return "from-primary/40 to-primary/20";
      case "epic":
        return "from-accent/40 to-accent/20";
      case "legendary":
        return "from-warning/40 to-warning/20";
      default:
        return "from-muted to-muted/50";
    }
  };

  const getRarityBorder = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "border-muted";
      case "rare":
        return "border-primary/50";
      case "epic":
        return "border-accent/50";
      case "legendary":
        return "border-warning/50";
      default:
        return "border-muted";
    }
  };

  return (
    <motion.div
      whileHover={{ scale: isUnlocked ? 1.05 : 1 }}
      className={`relative rounded-xl border-2 ${getRarityBorder(achievement.rarity)} 
        bg-gradient-to-br ${getRarityColor(achievement.rarity)} p-4 
        ${!isUnlocked && "opacity-50 grayscale"} 
        transition-all duration-300 backdrop-blur-sm`}
    >
      {!isUnlocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/60 rounded-xl backdrop-blur-sm">
          <Lock className="h-8 w-8 text-muted-foreground" />
        </div>
      )}
      
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="text-5xl">{achievement.icon}</div>
        <div>
          <h3 className="font-bold text-foreground">{achievement.name}</h3>
          <p className="text-xs text-muted-foreground mt-1">{achievement.description}</p>
          {earnedAt && (
            <p className="text-xs text-primary mt-2">
              Earned {new Date(earnedAt).toLocaleDateString()}
            </p>
          )}
        </div>
        <div className="text-xs font-semibold uppercase text-muted-foreground">
          {achievement.rarity}
        </div>
      </div>
    </motion.div>
  );
};

export default AchievementCard;
