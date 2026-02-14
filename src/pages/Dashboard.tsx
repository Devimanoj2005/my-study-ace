import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { BookOpen, Brain, AlertTriangle, User, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import AIChatBot from "@/components/AIChatBot";
import StudyBuddy from "@/components/StudyBuddy";
import { useAchievements } from "@/hooks/useAchievements";
import { useStreak } from "@/hooks/useStreak";
import AchievementCard from "@/components/AchievementCard";
import StreakDisplay from "@/components/StreakDisplay";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [marks, setMarks] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [weakSubjects, setWeakSubjects] = useState<any[]>([]);
  const [buddyMood, setBuddyMood] = useState<"happy" | "encouraging" | "neutral" | "celebrating">("neutral");
  const [buddyMessage, setBuddyMessage] = useState<string>("");
  
  const { achievements, userAchievements, checkAndAwardAchievement } = useAchievements(user?.id);
  const { streak, updateStreak } = useStreak(user?.id);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    // Check if user has a profile, redirect to setup if not
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", session.user.id)
      .maybeSingle();

    if (!profile) {
      navigate("/profile-setup");
      return;
    }

    setUser(session.user);
    fetchData(session.user.id);
  };

  const fetchData = async (userId: string) => {
    try {
      const { data: subjectsData } = await supabase
        .from("subjects")
        .select("*")
        .eq("user_id", userId);

      const { data: marksData } = await supabase
        .from("marks")
        .select("*")
        .eq("user_id", userId)
        .eq("exam_type", "previous");

      setSubjects(subjectsData || []);
      setMarks(marksData || []);

      if (subjectsData && marksData) {
        const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];
        const data = subjectsData.map((subject, index) => {
          const mark = marksData.find((m) => m.subject_id === subject.id);
          const percentage = mark ? (mark.marks_obtained / mark.total_marks) * 100 : 0;
          return {
            name: subject.subject_name,
            value: percentage,
            color: COLORS[index % COLORS.length],
          };
        });
        setChartData(data);

        const weak = data.filter((d) => d.value < 60).map((d) => d.name);
        setWeakSubjects(weak);

        // Update study buddy mood based on performance
        const avgPerformance = data.reduce((acc, curr) => acc + curr.value, 0) / data.length;
        if (avgPerformance >= 80) {
          setBuddyMood("celebrating");
          setBuddyMessage("Outstanding! You're crushing it! 🎉");
        } else if (avgPerformance >= 60) {
          setBuddyMood("happy");
          setBuddyMessage("Great work! Keep up the good progress! 😊");
        } else if (weak.length > 0) {
          setBuddyMood("encouraging");
          setBuddyMessage("Don't give up! Focus on weak areas and you'll improve! 💪");
        } else {
          setBuddyMood("neutral");
          setBuddyMessage("Ready to learn? Let's get started! 📚");
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-mesh bg-fixed">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center animate-fade-in">
          <div>
            <h1 className="text-5xl font-extrabold mb-3 bg-gradient-primary bg-clip-text text-transparent">
              Welcome back! 👋
            </h1>
            <p className="text-muted-foreground text-lg">Here's your learning progress overview</p>
          </div>
          <Button onClick={() => navigate("/profile")} variant="outline" className="gap-2 group">
            <User className="h-4 w-4 group-hover:rotate-12 transition-transform" />
            Profile
          </Button>
        </div>

        {weakSubjects.length > 0 && (
          <Alert className="mb-6 border-warning bg-gradient-accent/10 backdrop-blur-sm animate-fade-up shadow-lg">
            <AlertTriangle className="h-5 w-5 text-warning animate-pulse" />
            <AlertTitle className="text-lg font-bold">Focus Alert!</AlertTitle>
            <AlertDescription className="text-base">
              You need to focus more on: <span className="font-semibold text-foreground">{weakSubjects.join(", ")}</span>. These subjects scored below 60%.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="animate-fade-up overflow-hidden backdrop-blur-sm bg-gradient-card border-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-2 h-8 bg-gradient-primary rounded-full" />
                Previous Exam Performance
              </CardTitle>
              <CardDescription className="text-base">Your marks distribution across subjects</CardDescription>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No exam data available yet
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="animate-fade-up overflow-hidden backdrop-blur-sm bg-gradient-card border-accent/10" style={{ animationDelay: "0.1s" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-2 h-8 bg-gradient-accent rounded-full" />
                Quick Actions
              </CardTitle>
              <CardDescription className="text-base">Continue your learning journey</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Button onClick={() => navigate("/study")} className="gap-2 w-full h-14 text-base group">
                <BookOpen className="h-5 w-5 group-hover:scale-110 transition-transform" />
                Start Study Session
              </Button>
              <Button onClick={() => navigate("/quiz")} variant="secondary" className="gap-2 w-full h-14 text-base group">
                <Brain className="h-5 w-5 group-hover:scale-110 transition-transform" />
                Take Quiz
              </Button>
              <Button onClick={() => navigate("/progress")} variant="outline" className="gap-2 w-full h-14 text-base group">
                View Full Progress
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Achievements and Streaks Section */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="achievements" className="gap-2">
              <Award className="h-4 w-4" />
              Achievements
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {streak && (
              <StreakDisplay
                currentStreak={streak.current_streak}
                longestStreak={streak.longest_streak}
                totalStudySessions={streak.total_study_sessions}
                totalQuizzes={streak.total_quizzes}
              />
            )}
          </TabsContent>

          <TabsContent value="achievements">
            <Card className="backdrop-blur-sm bg-gradient-card border-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-2 h-8 bg-gradient-primary rounded-full" />
                  Achievement Collection
                </CardTitle>
                <CardDescription className="text-base">
                  Unlock badges by completing challenges - {userAchievements.length} of {achievements.length} earned
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {achievements.map((achievement) => {
                    const userAchievement = userAchievements.find(
                      (ua) => ua.achievement_id === achievement.id
                    );
                    return (
                      <AchievementCard
                        key={achievement.id}
                        achievement={achievement}
                        isUnlocked={!!userAchievement}
                        earnedAt={userAchievement?.earned_at}
                      />
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <AIChatBot />
        <StudyBuddy mood={buddyMood} message={buddyMessage} />
      </main>
    </div>
  );
};

export default Dashboard;
