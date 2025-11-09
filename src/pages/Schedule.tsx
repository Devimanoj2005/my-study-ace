import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { CalendarDays, Plus, CheckCircle2, Clock } from "lucide-react";
import { format, differenceInDays, addDays } from "date-fns";

interface Subject {
  id: string;
  subject_name: string;
  subject_number: number;
  exam_date?: string;
}

interface ScheduleItem {
  id: string;
  subject_id: string;
  topic: string;
  scheduled_date: string;
  priority: string;
  completed: boolean;
  subject_name?: string;
}

const Schedule = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [newTopic, setNewTopic] = useState("");
  const [newPriority, setNewPriority] = useState("medium");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }
    fetchData(session.user.id);
  };

  const fetchData = async (userId: string) => {
    try {
      const { data: subjectsData, error: subjectsError } = await supabase
        .from("subjects")
        .select("*")
        .eq("user_id", userId)
        .order("subject_number");

      if (subjectsError) throw subjectsError;
      setSubjects(subjectsData || []);

      const { data: scheduleData, error: scheduleError } = await supabase
        .from("revision_schedule")
        .select("*")
        .eq("user_id", userId)
        .order("scheduled_date");

      if (scheduleError) throw scheduleError;

      const enrichedSchedule = scheduleData?.map(item => {
        const subject = subjectsData?.find(s => s.id === item.subject_id);
        return {
          ...item,
          subject_name: subject?.subject_name || "Unknown"
        };
      }) || [];

      setSchedule(enrichedSchedule);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load schedule",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateAutoSchedule = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Get subjects with exam dates
      const subjectsWithExams = subjects.filter(s => s.exam_date);
      if (subjectsWithExams.length === 0) {
        toast({
          title: "No Exam Dates",
          description: "Please add exam dates to your subjects in the Profile page first.",
          variant: "destructive"
        });
        return;
      }

      const scheduleItems = [];
      const today = new Date();

      for (const subject of subjectsWithExams) {
        if (!subject.exam_date) continue;
        
        const examDate = new Date(subject.exam_date);
        const daysUntilExam = differenceInDays(examDate, today);

        // Skip if exam is in the past
        if (daysUntilExam < 0) continue;

        // Calculate revision sessions using spaced repetition
        const revisionDays = [
          Math.floor(daysUntilExam * 0.7), // First review at 70% of time
          Math.floor(daysUntilExam * 0.85), // Second review at 85%
          Math.floor(daysUntilExam * 0.95), // Final review at 95%
          daysUntilExam - 1 // Day before exam
        ].filter(day => day > 0);

        for (let i = 0; i < revisionDays.length; i++) {
          const reviewDate = addDays(today, revisionDays[i]);
          const priority = i === revisionDays.length - 1 ? "high" : i === 0 ? "low" : "medium";
          
          scheduleItems.push({
            user_id: session.user.id,
            subject_id: subject.id,
            topic: `${subject.subject_name} - Revision ${i + 1}`,
            scheduled_date: reviewDate.toISOString(),
            priority,
            completed: false
          });
        }
      }

      const { error } = await supabase
        .from("revision_schedule")
        .insert(scheduleItems);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Auto-generated revision schedule based on your exam dates."
      });

      fetchData(session.user.id);
    } catch (error) {
      console.error("Error generating schedule:", error);
      toast({
        title: "Error",
        description: "Failed to generate schedule",
        variant: "destructive"
      });
    }
  };

  const addScheduleItem = async () => {
    if (!selectedSubject || !newTopic) {
      toast({
        title: "Missing Information",
        description: "Please select a subject and enter a topic.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase
        .from("revision_schedule")
        .insert({
          user_id: session.user.id,
          subject_id: selectedSubject,
          topic: newTopic,
          scheduled_date: selectedDate.toISOString(),
          priority: newPriority,
          completed: false
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Added to revision schedule"
      });

      setNewTopic("");
      setSelectedSubject("");
      fetchData(session.user.id);
    } catch (error) {
      console.error("Error adding schedule item:", error);
      toast({
        title: "Error",
        description: "Failed to add schedule item",
        variant: "destructive"
      });
    }
  };

  const toggleComplete = async (itemId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("revision_schedule")
        .update({ completed: !currentStatus })
        .eq("id", itemId);

      if (error) throw error;

      const { data: { session } } = await supabase.auth.getSession();
      if (session) fetchData(session.user.id);
    } catch (error) {
      console.error("Error updating schedule:", error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "destructive";
      case "medium": return "default";
      case "low": return "secondary";
      default: return "default";
    }
  };

  const upcomingSchedule = schedule
    .filter(item => new Date(item.scheduled_date) >= new Date() && !item.completed)
    .slice(0, 5);

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-foreground">Loading...</p></div>;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">📅 Smart Revision Timeline</h1>
          <p className="text-muted-foreground">Plan your studies with AI-powered scheduling</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5" />
                Select Date
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-md border"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Add Study Session
              </CardTitle>
              <CardDescription>Schedule a topic for revision</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map(subject => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.subject_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                placeholder="Topic to revise"
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
              />

              <Select value={newPriority} onValueChange={setNewPriority}>
                <SelectTrigger>
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                <Button onClick={addScheduleItem} className="flex-1">
                  Add to Schedule
                </Button>
                <Button onClick={generateAutoSchedule} variant="secondary">
                  Auto-Generate
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Upcoming Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingSchedule.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No upcoming reviews. Add some or use auto-generate!
              </p>
            ) : (
              <div className="space-y-3">
                {upcomingSchedule.map(item => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/10 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">{item.topic}</h3>
                        <Badge variant={getPriorityColor(item.priority)}>
                          {item.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {item.subject_name} • {format(new Date(item.scheduled_date), "MMM dd, yyyy")}
                      </p>
                    </div>
                    <Button
                      size="icon"
                      variant={item.completed ? "default" : "outline"}
                      onClick={() => toggleComplete(item.id, item.completed)}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Schedule;
