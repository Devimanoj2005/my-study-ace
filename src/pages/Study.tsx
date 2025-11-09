import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Pause, Square, Clock, Brain } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAchievements } from "@/hooks/useAchievements";
import { useStreak } from "@/hooks/useStreak";

const Study = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [isStudying, setIsStudying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [topic, setTopic] = useState("");
  const [generatingQuiz, setGeneratingQuiz] = useState(false);

  const { checkAndAwardAchievement } = useAchievements(user?.id);
  const { updateStreak, streak } = useStreak(user?.id);

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isStudying && !isPaused) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isStudying, isPaused]);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }
    setUser(session.user);
    fetchSubjects(session.user.id);
  };

  const fetchSubjects = async (userId: string) => {
    const { data } = await supabase
      .from("subjects")
      .select("*")
      .eq("user_id", userId)
      .order("subject_number");
    setSubjects(data || []);
  };

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStart = () => {
    if (!topic || !selectedSubject) {
      toast.error("Please select a subject and enter a topic to study");
      return;
    }
    setIsStudying(true);
    setIsPaused(false);
    toast.success("Study session started!");
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
    toast.info(isPaused ? "Session resumed" : "Session paused");
  };

  const handleStop = async () => {
    setIsStudying(false);
    setIsPaused(false);
    toast.success(`Study session completed! Duration: ${formatTime(seconds)}`);
    
    // Save study session
    if (user && selectedSubject) {
      await supabase.from("study_sessions").insert({
        user_id: user.id,
        subject_id: selectedSubject,
        topic: topic,
        completed_at: new Date().toISOString(),
      });

      // Update streak and check for achievements
      const result = await updateStreak("study");
      if (result) {
        await checkAndAwardAchievement("study", result.totalStudy, "count");
        await checkAndAwardAchievement("streak", result.currentStreak, "streak");
      }
    }

    // Reset timer
    setSeconds(0);
  };

  const handleGenerateQuiz = async () => {
    if (!selectedSubject || !topic) {
      toast.error("Please select a subject and topic first");
      return;
    }

    setGeneratingQuiz(true);
    try {
      const subject = subjects.find((s) => s.id === selectedSubject);
      const { data, error } = await supabase.functions.invoke("generate-quiz", {
        body: { subject: subject.subject_name, topic },
      });

      if (error) throw error;

      // Store quiz in session storage and navigate to quiz page
      sessionStorage.setItem("currentQuiz", JSON.stringify(data));
      navigate("/quiz");
    } catch (error: any) {
      toast.error(error.message || "Failed to generate quiz");
    } finally {
      setGeneratingQuiz(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Study Session</h1>
          <p className="text-muted-foreground">Focus on your learning, we'll track the rest</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Timer Card */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Focus Timer</CardTitle>
              <CardDescription>Track your study time with our distraction-free timer</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12">
                <div className="relative mb-8">
                  <div className="w-64 h-64 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow">
                    <div className="w-56 h-56 rounded-full bg-background flex items-center justify-center">
                      <p className="text-6xl font-bold font-mono">{formatTime(seconds)}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  {!isStudying ? (
                    <Button size="lg" onClick={handleStart} className="gap-2">
                      <Play className="h-5 w-5" />
                      Start Session
                    </Button>
                  ) : (
                    <>
                      <Button size="lg" variant="outline" onClick={handlePause} className="gap-2">
                        {isPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
                        {isPaused ? "Resume" : "Pause"}
                      </Button>
                      <Button size="lg" variant="destructive" onClick={handleStop} className="gap-2">
                        <Square className="h-5 w-5" />
                        End Session
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Session Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Session Details</CardTitle>
              <CardDescription>What are you studying today?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject} disabled={isStudying}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.subject_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="topic">Topic</Label>
                <Input
                  id="topic"
                  placeholder="e.g., Integration by Parts"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  disabled={isStudying}
                />
              </div>

              <Button
                onClick={handleGenerateQuiz}
                disabled={!selectedSubject || !topic || generatingQuiz}
                className="w-full gap-2"
                variant="outline"
              >
                <Brain className="h-4 w-4" />
                {generatingQuiz ? "Generating..." : "Generate Quiz on This Topic"}
              </Button>

              <div className="pt-4 space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Average session: 45 minutes</span>
                </div>
                <p className="text-xs">
                  💡 Tip: Take short breaks every 25-30 minutes for better retention
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Study Tips */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Study Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                <h3 className="font-semibold mb-2">🎯 Stay Focused</h3>
                <p className="text-sm text-muted-foreground">
                  Minimize distractions and focus on one topic at a time
                </p>
              </div>
              <div className="p-4 rounded-lg bg-accent/5 border border-accent/10">
                <h3 className="font-semibold mb-2">📝 Take Notes</h3>
                <p className="text-sm text-muted-foreground">
                  Active note-taking helps improve understanding and memory
                </p>
              </div>
              <div className="p-4 rounded-lg bg-success/5 border border-success/10">
                <h3 className="font-semibold mb-2">🔄 Review Often</h3>
                <p className="text-sm text-muted-foreground">
                  Regular review sessions strengthen long-term retention
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Study;
