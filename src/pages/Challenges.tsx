import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Zap, Trophy, CheckCircle2, Star, Flame } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useDailyChallenges } from "@/hooks/useDailyChallenges";

const categoryColors: Record<string, string> = {
  study: "bg-primary/20 text-primary border-primary/30",
  quiz: "bg-accent/20 text-accent border-accent/30",
  notes: "bg-[hsl(var(--success))]/20 text-[hsl(var(--success))] border-[hsl(var(--success))]/30",
  flashcards: "bg-[hsl(var(--warning))]/20 text-[hsl(var(--warning))] border-[hsl(var(--warning))]/30",
  equations: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  streak: "bg-orange-500/20 text-orange-400 border-orange-500/30",
};

const Challenges = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/auth"); return; }
      setUser(session.user);
    };
    check();
  }, [navigate]);

  const { challenges, bonusPoints, loading, completeChallenge, isChallengeCompleted, todayProgress } =
    useDailyChallenges(user?.id);

  if (!user || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center text-muted-foreground py-20">Loading challenges...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-mesh bg-fixed">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-extrabold mb-2 bg-gradient-primary bg-clip-text text-transparent flex items-center gap-3">
            <Zap className="h-9 w-9 text-primary" />
            Daily Challenges
          </h1>
          <p className="text-muted-foreground text-lg">Complete challenges to earn bonus points and level up!</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="backdrop-blur-sm bg-gradient-card border-primary/10">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/20">
                <Trophy className="h-7 w-7 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Points</p>
                <p className="text-3xl font-bold text-foreground">{bonusPoints.total_points}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-gradient-card border-accent/10">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-accent/20">
                <Star className="h-7 w-7 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">This Week</p>
                <p className="text-3xl font-bold text-foreground">{bonusPoints.weekly_points}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-gradient-card border-[hsl(var(--success))]/10">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-[hsl(var(--success))]/20">
                <Flame className="h-7 w-7 text-[hsl(var(--success))]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Today's Progress</p>
                <p className="text-3xl font-bold text-foreground">
                  {todayProgress.completed}/{todayProgress.total}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress bar */}
        <Card className="mb-8 backdrop-blur-sm bg-gradient-card border-primary/10">
          <CardContent className="p-5">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium text-foreground">Daily Progress</span>
              <span className="text-sm text-muted-foreground">{todayProgress.percentage}%</span>
            </div>
            <Progress value={todayProgress.percentage} className="h-3" />
            {todayProgress.percentage === 100 && (
              <p className="text-sm text-[hsl(var(--success))] mt-2 font-medium">
                🎉 All challenges completed today! Amazing work!
              </p>
            )}
          </CardContent>
        </Card>

        {/* Challenge Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {challenges.map((challenge) => {
            const completed = isChallengeCompleted(challenge.id);
            return (
              <Card
                key={challenge.id}
                className={`backdrop-blur-sm border transition-all duration-300 ${
                  completed
                    ? "bg-[hsl(var(--success))]/5 border-[hsl(var(--success))]/20 opacity-80"
                    : "bg-gradient-card border-border hover:border-primary/30 hover:shadow-lg"
                }`}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="text-3xl flex-shrink-0 mt-0.5">{challenge.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-foreground text-lg">{challenge.title}</h3>
                          <Badge variant="outline" className={`text-xs ${categoryColors[challenge.category] || ""}`}>
                            {challenge.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{challenge.description}</p>
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-[hsl(var(--warning))]" />
                          <span className="text-sm font-semibold text-[hsl(var(--warning))]">
                            +{challenge.bonus_points} pts
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      {completed ? (
                        <div className="flex items-center gap-1.5 text-[hsl(var(--success))]">
                          <CheckCircle2 className="h-6 w-6" />
                          <span className="text-sm font-medium">Done</span>
                        </div>
                      ) : (
                        <Button size="sm" onClick={() => completeChallenge(challenge.id)}>
                          Complete
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default Challenges;
