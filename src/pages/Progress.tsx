import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress as ProgressBar } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { TrendingUp, Calendar, BookOpen, Award } from "lucide-react";

const Progress = () => {
  const confidenceTrendData = [
    { date: "Jan 1", confidence: 60, retention: 55 },
    { date: "Jan 8", confidence: 65, retention: 60 },
    { date: "Jan 15", confidence: 70, retention: 68 },
    { date: "Jan 22", confidence: 75, retention: 72 },
    { date: "Jan 29", confidence: 78, retention: 75 },
    { date: "Feb 5", confidence: 82, retention: 80 },
  ];

  const upcomingReviews = [
    { topic: "Calculus - Derivatives", dueDate: "Today", confidence: "Medium", priority: "high" },
    { topic: "Physics - Newton's Laws", dueDate: "Tomorrow", confidence: "High", priority: "medium" },
    { topic: "Chemistry - Atomic Structure", dueDate: "In 2 days", confidence: "Low", priority: "high" },
    { topic: "Biology - Cell Division", dueDate: "In 3 days", confidence: "Medium", priority: "medium" },
  ];

  const achievements = [
    { title: "7-Day Streak", description: "Studied for 7 consecutive days", icon: "🔥", unlocked: true },
    { title: "Quiz Master", description: "Completed 25 quizzes", icon: "🎯", unlocked: true },
    { title: "Speed Learner", description: "Finished 5 topics in a week", icon: "⚡", unlocked: false },
    { title: "Confidence King", description: "Achieved 90% average confidence", icon: "👑", unlocked: false },
  ];

  const subjectDetails = [
    { subject: "Mathematics", topics: 12, completed: 10, avgConfidence: 85, nextReview: "Today" },
    { subject: "Physics", topics: 10, completed: 7, avgConfidence: 72, nextReview: "Tomorrow" },
    { subject: "Chemistry", topics: 8, completed: 5, avgConfidence: 68, nextReview: "In 2 days" },
    { subject: "Biology", topics: 9, completed: 4, avgConfidence: 55, nextReview: "In 3 days" },
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Learning Progress</h1>
          <p className="text-muted-foreground">Track your journey and celebrate your achievements</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="subjects">Subjects</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Confidence Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Confidence & Retention Trend
                </CardTitle>
                <CardDescription>Your learning progress over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={confidenceTrendData}>
                    <defs>
                      <linearGradient id="confidence" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="retention" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="confidence"
                      stroke="hsl(var(--primary))"
                      fill="url(#confidence)"
                      name="Confidence %"
                    />
                    <Area
                      type="monotone"
                      dataKey="retention"
                      stroke="hsl(var(--accent))"
                      fill="url(#retention)"
                      name="Retention %"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-success/10">
                      <Award className="h-6 w-6 text-success" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">26/39</p>
                      <p className="text-sm text-muted-foreground">Topics Mastered</p>
                    </div>
                  </div>
                  <ProgressBar value={67} className="mt-4" />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">78%</p>
                      <p className="text-sm text-muted-foreground">Avg Confidence</p>
                    </div>
                  </div>
                  <ProgressBar value={78} className="mt-4" />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-warning/10">
                      <Calendar className="h-6 w-6 text-warning" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">4</p>
                      <p className="text-sm text-muted-foreground">Reviews Due</p>
                    </div>
                  </div>
                  <div className="mt-4 text-xs text-muted-foreground">Next review: Today</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="subjects" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {subjectDetails.map((subject) => (
                <Card key={subject.subject}>
                  <CardHeader>
                    <CardTitle>{subject.subject}</CardTitle>
                    <CardDescription>
                      {subject.completed} of {subject.topics} topics completed
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Progress</span>
                        <span className="text-sm font-medium">
                          {Math.round((subject.completed / subject.topics) * 100)}%
                        </span>
                      </div>
                      <ProgressBar value={(subject.completed / subject.topics) * 100} />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Avg Confidence</span>
                        <span className="text-sm font-medium">{subject.avgConfidence}%</span>
                      </div>
                      <ProgressBar value={subject.avgConfidence} />
                    </div>
                    <div className="flex justify-between items-center pt-2 text-sm">
                      <span className="text-muted-foreground">Next review</span>
                      <Badge variant="outline">{subject.nextReview}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Reviews</CardTitle>
                <CardDescription>Spaced repetition schedule for optimal retention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingReviews.map((review, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                    >
                      <div className="flex-1">
                        <h3 className="font-medium mb-1">{review.topic}</h3>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {review.dueDate}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {review.confidence} Confidence
                          </Badge>
                        </div>
                      </div>
                      <Badge variant={review.priority === "high" ? "destructive" : "default"}>
                        {review.priority === "high" ? "High Priority" : "Normal"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {achievements.map((achievement, index) => (
                <Card
                  key={index}
                  className={achievement.unlocked ? "border-primary/50 bg-primary/5" : "opacity-60"}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="text-4xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-1">{achievement.title}</h3>
                        <p className="text-sm text-muted-foreground mb-3">{achievement.description}</p>
                        <Badge variant={achievement.unlocked ? "default" : "outline"}>
                          {achievement.unlocked ? "Unlocked" : "Locked"}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Progress;
