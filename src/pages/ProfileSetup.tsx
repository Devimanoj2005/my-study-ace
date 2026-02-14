import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Brain, Plus, Trash2 } from "lucide-react";

const ProfileSetup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    username: "",
    studentName: "",
    class: "",
    instituteType: "school" as "school" | "college",
    instituteName: "",
  });

  const [subjects, setSubjects] = useState([
    { number: 1, name: "", previousMarks: 0, totalMarks: 100 },
  ]);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      // If profile already exists, redirect to dashboard
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (profile) {
        navigate("/dashboard");
        return;
      }

      setUserId(session.user.id);
    };
    checkAuth();
  }, [navigate]);

  const addSubject = () => {
    setSubjects([
      ...subjects,
      { number: subjects.length + 1, name: "", previousMarks: 0, totalMarks: 100 },
    ]);
  };

  const removeSubject = (index: number) => {
    if (subjects.length <= 1) return;
    const updated = subjects.filter((_, i) => i !== index).map((s, i) => ({ ...s, number: i + 1 }));
    setSubjects(updated);
  };

  const updateSubject = (index: number, field: string, value: any) => {
    const newSubjects = [...subjects];
    newSubjects[index] = { ...newSubjects[index], [field]: value };
    setSubjects(newSubjects);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    const invalidSubjects = subjects.filter((s) => !s.name.trim());
    if (invalidSubjects.length > 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all subject names",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Create profile
      const { error: profileError } = await supabase.from("profiles").insert({
        user_id: userId,
        username: formData.username.trim(),
        student_name: formData.studentName.trim(),
        class: formData.class.trim(),
        institute_type: formData.instituteType,
        institute_name: formData.instituteName.trim(),
      });

      if (profileError) throw profileError;

      // Create subjects and marks
      for (const subject of subjects) {
        const { data: subjectData, error: subjectError } = await supabase
          .from("subjects")
          .insert({
            user_id: userId,
            subject_number: subject.number,
            subject_name: subject.name.trim(),
          })
          .select()
          .single();

        if (subjectError) throw subjectError;

        const { error: marksError } = await supabase.from("marks").insert({
          user_id: userId,
          subject_id: subjectData.id,
          exam_type: "previous",
          marks_obtained: subject.previousMarks,
          total_marks: subject.totalMarks,
        });

        if (marksError) throw marksError;
      }

      // Create streak record
      await supabase.from("user_streaks").insert({ user_id: userId });

      toast({
        title: "Profile Created! 🎉",
        description: "Welcome aboard! Redirecting to your dashboard...",
      });

      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-mesh">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-mesh p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 rounded-xl bg-gradient-primary w-fit shadow-glow">
            <Brain className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-3xl font-bold">Set Up Your Profile</CardTitle>
          <CardDescription className="text-base">
            Tell us about yourself to personalize your learning experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="studentName">Full Name</Label>
                <Input
                  id="studentName"
                  value={formData.studentName}
                  onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                  placeholder="Your full name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="Choose a username"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="class">Class / Year</Label>
                <Input
                  id="class"
                  value={formData.class}
                  onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                  placeholder="e.g., 10th Grade"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instituteType">Institute Type</Label>
                <Select
                  value={formData.instituteType}
                  onValueChange={(value: "school" | "college") =>
                    setFormData({ ...formData, instituteType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="school">School</SelectItem>
                    <SelectItem value="college">College</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="instituteName">Institute Name</Label>
                <Input
                  id="instituteName"
                  value={formData.instituteName}
                  onChange={(e) => setFormData({ ...formData, instituteName: e.target.value })}
                  placeholder="Your school or college name"
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-base font-semibold">Subjects & Previous Marks</Label>
                <Button type="button" variant="outline" size="sm" onClick={addSubject} className="gap-1">
                  <Plus className="h-4 w-4" />
                  Add Subject
                </Button>
              </div>

              {subjects.map((subject, index) => (
                <div key={index} className="grid grid-cols-[1fr_auto_auto_auto] gap-3 items-end p-4 border rounded-lg bg-muted/30">
                  <div className="space-y-2">
                    <Label>Subject Name</Label>
                    <Input
                      value={subject.name}
                      onChange={(e) => updateSubject(index, "name", e.target.value)}
                      placeholder="e.g., Mathematics"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Marks</Label>
                    <Input
                      type="number"
                      value={subject.previousMarks}
                      onChange={(e) => updateSubject(index, "previousMarks", parseFloat(e.target.value) || 0)}
                      min="0"
                      className="w-20"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Total</Label>
                    <Input
                      type="number"
                      value={subject.totalMarks}
                      onChange={(e) => updateSubject(index, "totalMarks", parseFloat(e.target.value) || 100)}
                      min="1"
                      className="w-20"
                      required
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeSubject(index)}
                    disabled={subjects.length <= 1}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <Button type="submit" className="w-full h-12 text-base" disabled={loading}>
              {loading ? "Setting up your profile..." : "Complete Setup"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileSetup;
