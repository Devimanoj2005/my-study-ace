import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface StudyBuddyProps {
  mood: "happy" | "encouraging" | "neutral" | "celebrating";
  message?: string;
}

const StudyBuddy = ({ mood, message }: StudyBuddyProps) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 1000);
    return () => clearTimeout(timer);
  }, [mood]);

  const buddyVariants = {
    happy: { y: [0, -10, 0], rotate: [0, 5, -5, 0] },
    celebrating: { y: [0, -20, 0], scale: [1, 1.1, 1], rotate: [0, 10, -10, 0] },
    encouraging: { x: [0, -5, 5, 0] },
    neutral: { y: 0 },
  };

  const getBuddyEmoji = () => {
    switch (mood) {
      case "happy": return "🦉";
      case "celebrating": return "🎉";
      case "encouraging": return "💪";
      default: return "🐧";
    }
  };

  const getBuddyColor = () => {
    switch (mood) {
      case "happy": return "hsl(var(--primary))";
      case "celebrating": return "hsl(142 76% 36%)";
      case "encouraging": return "hsl(262 83% 58%)";
      default: return "hsl(var(--accent))";
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {message && (
        <motion.div
          initial={{ opacity: 0, x: 20, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 20, scale: 0.9 }}
          className="bg-gradient-card border-2 border-primary/20 rounded-2xl p-4 shadow-xl max-w-xs backdrop-blur-sm"
        >
          <p className="text-sm font-medium text-foreground">{message}</p>
        </motion.div>
      )}
      
      <motion.div
        animate={isAnimating ? buddyVariants[mood] : {}}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        className="relative"
      >
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          className="w-24 h-24 rounded-full flex items-center justify-center text-5xl shadow-xl cursor-pointer"
          style={{ 
            backgroundColor: getBuddyColor(),
            boxShadow: `0 0 30px ${getBuddyColor()}80`
          }}
        >
          {getBuddyEmoji()}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default StudyBuddy;
