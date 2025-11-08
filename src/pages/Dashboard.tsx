import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { BookOpen, Brain, Clock, TrendingUp, Target, Flame } from "lucide-react";

const Dashboard = () => {
  const weeklyData = [
    { day: "Mon", minutes: 45, confidence: 75 },
    { day: "Tue", minutes: 60, confidence: 80 },
    { day: "Wed", minutes: 30, confidence: 65 },
    { day: "Thu", minutes: 75, confidence: 85 },
    { day: "Fri", minutes: 50, confidence: 70 },
    { day: "Sat", minutes: 90, confidence: 90 },
    { day: "Sun", minutes: 40, confidence: 60 },
  ];

  const subjects = [
    { name: "Mathematics", progress: 85, color: "hsl(var(--primary))" },
    { name: "Physics", progress: 70, color: "hsl(var(--accent))" },
    { name: "Chemistry", progress: 60, color: "hsl(var(--success))" },
    { name: "Biology", progress: 45, color: "hsl(var(--warning))" },
  ];

  const stats = [
    { icon: Clock, label: "Study Time", value: "12.5 hrs", subtext: "This week", color: "primary" },
    { icon: Brain, label: "Quizzes Taken", value: "24", subtext: "Last 7 days", color: "accent" },
    { icon: Target, label: "Avg Confidence", value: "78%", subtext: "+5% from last week", color: "success" },
    { icon: Flame, label: "Streak", value: "7 days", subtext: "Keep it up!", color: "warning" },
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Welcome back, Student! 👋</h1>
          <p className="text-muted-foreground">Here's your learning progress overview</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <Card key={stat.label} className="bg-card hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-${stat.color}/10`}>
                    <stat.icon className={`h-6 w-6 text-${stat.color}`} />
                  </div>
                </div>
                <div>
                  <p className="text-2xl font-bold mb-1">{stat.value}</p>
                  <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                  <p className="text-xs text-muted-foreground">{stat.subtext}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Weekly Activity Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Study Time</CardTitle>
              <CardDescription>Your study minutes per day this week</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="minutes" radius={[8, 8, 0, 0]}>
                    {weeklyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill="hsl(var(--primary))" opacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Subject Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Subject Mastery</CardTitle>
              <CardDescription>Your progress across different subjects</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {subjects.map((subject) => (
                <div key={subject.name}>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">{subject.name}</span>
                    <span className="text-sm text-muted-foreground">{subject.progress}%</span>
                  </div>
                  <Progress value={subject.progress} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Continue your learning journey</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Button className="gap-2">
              <BookOpen className="h-4 w-4" />
              Start Study Session
            </Button>
            <Button variant="outline" className="gap-2">
              <Brain className="h-4 w-4" />
              Take Quiz
            </Button>
            <Button variant="outline" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              View Insights
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
