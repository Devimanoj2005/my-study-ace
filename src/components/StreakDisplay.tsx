import { motion } from "framer-motion";
import { Flame, Trophy, BookOpen, Brain } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface StreakDisplayProps {
  currentStreak: number;
  longestStreak: number;
  totalStudySessions: number;
  totalQuizzes: number;
}

const StreakDisplay = ({
  currentStreak,
  longestStreak,
  totalStudySessions,
  totalQuizzes,
}: StreakDisplayProps) => {
  return (
    <Card className="overflow-hidden backdrop-blur-sm bg-gradient-card border-warning/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-2 h-8 bg-gradient-accent rounded-full" />
          Your Streaks & Stats
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex flex-col items-center p-4 rounded-lg bg-gradient-primary/10 border border-primary/20"
          >
            <Flame className="h-8 w-8 text-warning mb-2 animate-pulse" />
            <div className="text-3xl font-bold text-foreground">{currentStreak}</div>
            <div className="text-xs text-muted-foreground text-center">Current Streak</div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex flex-col items-center p-4 rounded-lg bg-gradient-accent/10 border border-accent/20"
          >
            <Trophy className="h-8 w-8 text-accent mb-2" />
            <div className="text-3xl font-bold text-foreground">{longestStreak}</div>
            <div className="text-xs text-muted-foreground text-center">Longest Streak</div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex flex-col items-center p-4 rounded-lg bg-gradient-secondary/10 border border-primary/20"
          >
            <BookOpen className="h-8 w-8 text-primary mb-2" />
            <div className="text-3xl font-bold text-foreground">{totalStudySessions}</div>
            <div className="text-xs text-muted-foreground text-center">Study Sessions</div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex flex-col items-center p-4 rounded-lg bg-gradient-accent/10 border border-accent/20"
          >
            <Brain className="h-8 w-8 text-accent mb-2" />
            <div className="text-3xl font-bold text-foreground">{totalQuizzes}</div>
            <div className="text-xs text-muted-foreground text-center">Quizzes Taken</div>
          </motion.div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StreakDisplay;
