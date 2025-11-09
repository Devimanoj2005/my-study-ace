import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TrendingUp, TrendingDown } from "lucide-react";

interface Subject {
  id: string;
  subject_name: string;
  subject_number: number;
}

interface Mark {
  subject_id: string;
  marks_obtained: number;
  total_marks: number;
  exam_type: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [newMarks, setNewMarks] = useState<{ [key: string]: { marks: number; total: number } }>({});
  const [progress, setProgress] = useState<{ [key: string]: number }>({});

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
    fetchProfileData(session.user.id);
  };

  const fetchProfileData = async (userId: string) => {
    try {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      const { data: subjectsData } = await supabase
        .from("subjects")
        .select("*")
        .eq("user_id", userId)
        .order("subject_number");

      const { data: marksData } = await supabase
        .from("marks")
        .select("*")
        .eq("user_id", userId);

      setProfile(profileData);
      setSubjects(subjectsData || []);
      setMarks(marksData || []);

      // Calculate progress for each subject
      if (subjectsData && marksData) {
        const progressData: { [key: string]: number } = {};
        subjectsData.forEach((subject) => {
          const previousMark = marksData.find(
            (m) => m.subject_id === subject.id && m.exam_type === "previous"
          );
          const currentMark = marksData.find(
            (m) => m.subject_id === subject.id && m.exam_type === "current"
          );

          if (previousMark && currentMark) {
            const prevPercentage = (previousMark.marks_obtained / previousMark.total_marks) * 100;
            const currPercentage = (currentMark.marks_obtained / currentMark.total_marks) * 100;
            progressData[subject.id] = currPercentage - prevPercentage;
          }
        });
        setProgress(progressData);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAddNewMarks = async (subjectId: string) => {
    if (!newMarks[subjectId]) {
      toast({
        title: "Error",
        description: "Please enter marks first",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.from("marks").insert({
        user_id: user.id,
        subject_id: subjectId,
        exam_type: "current",
        marks_obtained: newMarks[subjectId].marks,
        total_marks: newMarks[subjectId].total,
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Marks added successfully",
      });

      fetchProfileData(user.id);
      setNewMarks({ ...newMarks, [subjectId]: { marks: 0, total: 100 } });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (!profile) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-primary/10">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-3xl">Student Profile</CardTitle>
                <CardDescription>Manage your marks and track progress</CardDescription>
              </div>
              <Button onClick={handleLogout} variant="outline">
                Logout
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Username</p>
                <p className="font-medium">{profile.username}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Student Name</p>
                <p className="font-medium">{profile.student_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Class</p>
                <p className="font-medium">{profile.class}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Institute</p>
                <p className="font-medium">{profile.institute_name}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Add New Exam Marks</CardTitle>
            <CardDescription>Enter your latest exam marks to track progress</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {subjects.map((subject) => {
              const previousMark = marks.find(
                (m) => m.subject_id === subject.id && m.exam_type === "previous"
              );
              const currentMark = marks.find(
                (m) => m.subject_id === subject.id && m.exam_type === "current"
              );
              const hasProgress = progress[subject.id] !== undefined;

              return (
                <div key={subject.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-lg">{subject.subject_name}</h3>
                    {hasProgress && (
                      <div className="flex items-center gap-2">
                        {progress[subject.id] > 0 ? (
                          <>
                            <TrendingUp className="h-5 w-5 text-green-500" />
                            <span className="text-green-500 font-medium">
                              +{progress[subject.id].toFixed(1)}%
                            </span>
                          </>
                        ) : (
                          <>
                            <TrendingDown className="h-5 w-5 text-red-500" />
                            <span className="text-red-500 font-medium">
                              {progress[subject.id].toFixed(1)}%
                            </span>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Previous Exam</p>
                      <p className="font-medium">
                        {previousMark
                          ? `${previousMark.marks_obtained}/${previousMark.total_marks}`
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Current Exam</p>
                      <p className="font-medium">
                        {currentMark
                          ? `${currentMark.marks_obtained}/${currentMark.total_marks}`
                          : "Not entered"}
                      </p>
                    </div>
                  </div>

                  {!currentMark && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                      <div className="space-y-2">
                        <Label>Marks Obtained</Label>
                        <Input
                          type="number"
                          placeholder="Enter marks"
                          value={newMarks[subject.id]?.marks || ""}
                          onChange={(e) =>
                            setNewMarks({
                              ...newMarks,
                              [subject.id]: {
                                ...newMarks[subject.id],
                                marks: parseFloat(e.target.value) || 0,
                              },
                            })
                          }
                          min="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Total Marks</Label>
                        <Input
                          type="number"
                          placeholder="Total marks"
                          value={newMarks[subject.id]?.total || 100}
                          onChange={(e) =>
                            setNewMarks({
                              ...newMarks,
                              [subject.id]: {
                                ...newMarks[subject.id],
                                total: parseFloat(e.target.value) || 100,
                              },
                            })
                          }
                          min="1"
                        />
                      </div>
                      <Button onClick={() => handleAddNewMarks(subject.id)}>Add Marks</Button>
                    </div>
                  )}

                  {hasProgress && (
                    <Alert className={progress[subject.id] > 0 ? "border-green-500" : "border-red-500"}>
                      <AlertDescription>
                        {progress[subject.id] > 0
                          ? `Great job! You've improved by ${progress[subject.id].toFixed(1)}%`
                          : `You need to work harder. Performance decreased by ${Math.abs(
                              progress[subject.id]
                            ).toFixed(1)}%`}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Profile;