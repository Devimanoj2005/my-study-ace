import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Signup form state
  const [signupData, setSignupData] = useState({
    email: "",
    password: "",
    username: "",
    studentName: "",
    class: "",
    instituteType: "school" as "school" | "college",
    instituteName: "",
    subjects: [{ number: 1, name: "", previousMarks: 0, totalMarks: 100 }],
  });

  // Login form state
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const addSubject = () => {
    setSignupData({
      ...signupData,
      subjects: [
        ...signupData.subjects,
        { number: signupData.subjects.length + 1, name: "", previousMarks: 0, totalMarks: 100 },
      ],
    });
  };

  const updateSubject = (index: number, field: string, value: any) => {
    const newSubjects = [...signupData.subjects];
    newSubjects[index] = { ...newSubjects[index], [field]: value };
    setSignupData({ ...signupData, subjects: newSubjects });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate subjects
      const invalidSubjects = signupData.subjects.filter(s => !s.name || s.previousMarks < 0);
      if (invalidSubjects.length > 0) {
        toast({
          title: "Validation Error",
          description: "Please fill in all subject details correctly",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        // Create profile
        const { error: profileError } = await supabase.from("profiles").insert({
          user_id: authData.user.id,
          username: signupData.username,
          student_name: signupData.studentName,
          class: signupData.class,
          institute_type: signupData.instituteType,
          institute_name: signupData.instituteName,
        });

        if (profileError) throw profileError;

        // Create subjects and marks
        for (const subject of signupData.subjects) {
          const { data: subjectData, error: subjectError } = await supabase
            .from("subjects")
            .insert({
              user_id: authData.user.id,
              subject_number: subject.number,
              subject_name: subject.name,
            })
            .select()
            .single();

          if (subjectError) throw subjectError;

          // Insert previous marks
          const { error: marksError } = await supabase.from("marks").insert({
            user_id: authData.user.id,
            subject_id: subjectData.id,
            exam_type: "previous",
            marks_obtained: subject.previousMarks,
            total_marks: subject.totalMarks,
          });

          if (marksError) throw marksError;
        }

        toast({
          title: "Success!",
          description: "Account created successfully. Redirecting to dashboard...",
        });

        setTimeout(() => navigate("/dashboard"), 1000);
      }
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Logged in successfully. Redirecting...",
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/20 to-primary/10 p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">Smart Study Partner</CardTitle>
          <CardDescription className="text-center">Sign up or login to start your learning journey</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Logging in..." : "Login"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={signupData.email}
                      onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={signupData.password}
                      onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={signupData.username}
                      onChange={(e) => setSignupData({ ...signupData, username: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="studentName">Student Name</Label>
                    <Input
                      id="studentName"
                      value={signupData.studentName}
                      onChange={(e) => setSignupData({ ...signupData, studentName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="class">Class</Label>
                    <Input
                      id="class"
                      value={signupData.class}
                      onChange={(e) => setSignupData({ ...signupData, class: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instituteType">Institute Type</Label>
                    <Select
                      value={signupData.instituteType}
                      onValueChange={(value: "school" | "college") =>
                        setSignupData({ ...signupData, instituteType: value })
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
                      value={signupData.instituteName}
                      onChange={(e) => setSignupData({ ...signupData, instituteName: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label>Subjects & Previous Marks</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addSubject}>
                      Add Subject
                    </Button>
                  </div>

                  {signupData.subjects.map((subject, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
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
                        <Label>Previous Marks</Label>
                        <Input
                          type="number"
                          value={subject.previousMarks}
                          onChange={(e) => updateSubject(index, "previousMarks", parseFloat(e.target.value))}
                          min="0"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Total Marks</Label>
                        <Input
                          type="number"
                          value={subject.totalMarks}
                          onChange={(e) => updateSubject(index, "totalMarks", parseFloat(e.target.value))}
                          min="1"
                          required
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creating Account..." : "Sign Up"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;