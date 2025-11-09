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
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {message && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className="bg-card border border-border rounded-lg p-3 shadow-lg max-w-xs"
        >
          <p className="text-sm text-foreground">{message}</p>
        </motion.div>
      )}
      
      <motion.div
        animate={isAnimating ? buddyVariants[mood] : {}}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        className="relative"
      >
        <div 
          className="w-20 h-20 rounded-full flex items-center justify-center text-4xl shadow-lg cursor-pointer hover:scale-110 transition-transform"
          style={{ backgroundColor: getBuddyColor() }}
        >
          {getBuddyEmoji()}
        </div>
      </motion.div>
    </div>
  );
};

export default StudyBuddy;
