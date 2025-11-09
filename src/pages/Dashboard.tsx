import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { BookOpen, Brain, AlertTriangle, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import AIChatBot from "@/components/AIChatBot";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [marks, setMarks] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [weakSubjects, setWeakSubjects] = useState<any[]>([]);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
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
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-primary/10">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2">Welcome back! 👋</h1>
            <p className="text-muted-foreground">Here's your learning progress overview</p>
          </div>
          <Button onClick={() => navigate("/profile")} variant="outline" className="gap-2">
            <User className="h-4 w-4" />
            Profile
          </Button>
        </div>

        {weakSubjects.length > 0 && (
          <Alert className="mb-6 border-warning bg-warning/10">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Focus Alert!</AlertTitle>
            <AlertDescription>
              You need to focus more on: {weakSubjects.join(", ")}. These subjects scored below 60%.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Previous Exam Performance</CardTitle>
              <CardDescription>Your marks distribution across subjects</CardDescription>
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

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Continue your learning journey</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Button onClick={() => navigate("/study")} className="gap-2 w-full">
                <BookOpen className="h-4 w-4" />
                Start Study Session
              </Button>
              <Button onClick={() => navigate("/quiz")} variant="outline" className="gap-2 w-full">
                <Brain className="h-4 w-4" />
                Take Quiz
              </Button>
              <Button onClick={() => navigate("/progress")} variant="outline" className="gap-2 w-full">
                View Full Progress
              </Button>
            </CardContent>
          </Card>
        </div>

        <AIChatBot />
      </main>
    </div>
  );
};

export default Dashboard;
