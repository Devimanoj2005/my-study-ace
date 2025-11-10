import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";
import Navbar from "@/components/Navbar";

interface Subject {
  id: string;
  subject_name: string;
}

interface Equation {
  id: string;
  title: string;
  equation_text: string;
  description: string | null;
  subject_id: string;
}

const Equations = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [equations, setEquations] = useState<Equation[]>([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [title, setTitle] = useState("");
  const [equationText, setEquationText] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    setUser(user);
    fetchSubjects(user.id);
    fetchEquations(user.id);
  };

  const fetchSubjects = async (userId: string) => {
    const { data, error } = await supabase
      .from("subjects")
      .select("*")
      .eq("user_id", userId)
      .order("subject_name");

    if (error) {
      toast.error("Failed to load subjects");
      return;
    }
    setSubjects(data || []);
  };

  const fetchEquations = async (userId: string) => {
    const { data, error } = await supabase
      .from("equations")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load equations");
      return;
    }
    setEquations(data || []);
  };

  const handleSaveEquation = async () => {
    if (!selectedSubject || !title || !equationText) {
      toast.error("Please fill in all required fields");
      return;
    }

    const { error } = await supabase.from("equations").insert({
      user_id: user.id,
      subject_id: selectedSubject,
      title,
      equation_text: equationText,
      description,
    });

    if (error) {
      toast.error("Failed to save equation");
      return;
    }

    toast.success("Equation saved successfully!");
    setTitle("");
    setEquationText("");
    setDescription("");
    setSelectedSubject("");
    fetchEquations(user.id);
  };

  const handleDeleteEquation = async (equationId: string) => {
    const { error } = await supabase
      .from("equations")
      .delete()
      .eq("id", equationId);

    if (error) {
      toast.error("Failed to delete equation");
      return;
    }

    toast.success("Equation deleted");
    fetchEquations(user.id);
  };

  const getSubjectName = (subjectId: string) => {
    const subject = subjects.find((s) => s.id === subjectId);
    return subject?.subject_name || "Unknown";
  };

  return (
    <div className="min-h-screen bg-gradient-mesh">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
            Important Equations
          </h1>
          <p className="text-muted-foreground">Save and organize your important formulas and equations</p>
        </div>

        <Card className="mb-8 animate-fade-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add New Equation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Subject *</label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
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

            <div>
              <label className="text-sm font-medium mb-2 block">Title *</label>
              <Input
                placeholder="e.g., Pythagorean Theorem"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Equation *</label>
              <Textarea
                placeholder="e.g., a² + b² = c²"
                value={equationText}
                onChange={(e) => setEquationText(e.target.value)}
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Description (optional)</label>
              <Textarea
                placeholder="Add notes or explanation about this equation..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            </div>

            <Button onClick={handleSaveEquation} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Save Equation
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Your Saved Equations</h2>
          {equations.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No equations saved yet. Add your first equation above!
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {equations.map((equation, index) => (
                <Card key={equation.id} className="animate-fade-up" style={{ animationDelay: `${index * 0.1}s` }}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{equation.title}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteEquation(equation.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">{getSubjectName(equation.subject_id)}</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="p-4 bg-muted rounded-lg font-mono text-lg">
                      {equation.equation_text}
                    </div>
                    {equation.description && (
                      <p className="text-sm text-muted-foreground">{equation.description}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Equations;