import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Brain, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Notes = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSimplifying, setIsSimplifying] = useState(false);
  const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false);

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
    fetchSubjects(session.user.id);
    fetchNotes(session.user.id);
  };

  const fetchSubjects = async (userId: string) => {
    const { data } = await supabase
      .from("subjects")
      .select("*")
      .eq("user_id", userId)
      .order("subject_number");
    setSubjects(data || []);
  };

  const fetchNotes = async (userId: string) => {
    const { data } = await supabase
      .from("notes")
      .select("*, subjects(subject_name)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    setNotes(data || []);
  };

  const handleSaveNote = async () => {
    if (!title || !content || !selectedSubject) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setIsSimplifying(true);
      
      // Simplify the notes using AI
      const { data: simplifiedData, error: simplifyError } = await supabase.functions.invoke(
        "simplify-notes",
        {
          body: { content, gradeLevel: "middle school" },
        }
      );

      if (simplifyError) throw simplifyError;

      // Save the note with simplified content
      const { error } = await supabase.from("notes").insert({
        user_id: user.id,
        subject_id: selectedSubject,
        title,
        original_content: content,
        simplified_content: simplifiedData.simplifiedContent,
      });

      if (error) throw error;

      toast.success("Notes saved and simplified successfully!");
      setTitle("");
      setContent("");
      setSelectedSubject("");
      fetchNotes(user.id);
    } catch (error: any) {
      toast.error(error.message || "Failed to save notes");
    } finally {
      setIsSimplifying(false);
    }
  };

  const handleGenerateFlashcards = async (noteId: string, noteContent: string) => {
    try {
      setIsGeneratingFlashcards(true);
      const { data, error } = await supabase.functions.invoke("generate-flashcards", {
        body: { content: noteContent },
      });

      if (error) throw error;

      // Save flashcards to database
      const flashcardsToInsert = data.flashcards.map((card: any) => ({
        user_id: user.id,
        note_id: noteId,
        front: card.front,
        back: card.back,
      }));

      const { error: insertError } = await supabase
        .from("flashcards")
        .insert(flashcardsToInsert);

      if (insertError) throw insertError;

      toast.success(`Generated ${data.flashcards.length} flashcards!`);
    } catch (error: any) {
      toast.error(error.message || "Failed to generate flashcards");
    } finally {
      setIsGeneratingFlashcards(false);
    }
  };

  const handleGenerateQuiz = async (subjectId: string, noteContent: string, topic: string) => {
    try {
      const subject = subjects.find((s) => s.id === subjectId);
      const { data, error } = await supabase.functions.invoke("generate-quiz", {
        body: { 
          subject: subject.subject_name, 
          topic: topic,
          content: noteContent 
        },
      });

      if (error) throw error;

      sessionStorage.setItem("currentQuiz", JSON.stringify(data));
      sessionStorage.setItem("currentQuizSubject", subjectId);
      navigate("/quiz");
    } catch (error: any) {
      toast.error(error.message || "Failed to generate quiz");
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      const { error } = await supabase.from("notes").delete().eq("id", noteId);
      if (error) throw error;
      toast.success("Note deleted successfully");
      fetchNotes(user.id);
    } catch (error: any) {
      toast.error(error.message || "Failed to delete note");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Smart Notes</h1>
          <p className="text-muted-foreground">Upload your notes and let AI simplify them for better understanding</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create Note Card */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Add New Notes</CardTitle>
              <CardDescription>Write or paste your study notes here</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
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

              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Photosynthesis Overview"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Notes Content</Label>
                <Textarea
                  id="content"
                  placeholder="Paste or type your notes here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={10}
                  className="resize-none"
                />
              </div>

              <Button
                onClick={handleSaveNote}
                disabled={isSimplifying}
                className="w-full gap-2"
              >
                <Sparkles className="h-4 w-4" />
                {isSimplifying ? "Simplifying & Saving..." : "Save & Simplify Notes"}
              </Button>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>AI Features</CardTitle>
              <CardDescription>What can our AI do?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                <div className="flex items-start gap-2">
                  <Brain className="h-5 w-5 mt-0.5 text-primary" />
                  <div>
                    <h3 className="font-semibold text-sm">Simplify Notes</h3>
                    <p className="text-xs text-muted-foreground">
                      AI converts complex notes into easy-to-understand language
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-accent/5 border border-accent/10">
                <div className="flex items-start gap-2">
                  <FileText className="h-5 w-5 mt-0.5 text-accent" />
                  <div>
                    <h3 className="font-semibold text-sm">Generate Flashcards</h3>
                    <p className="text-xs text-muted-foreground">
                      Automatically create flashcards for quick revision
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-success/5 border border-success/10">
                <div className="flex items-start gap-2">
                  <Sparkles className="h-5 w-5 mt-0.5 text-success" />
                  <div>
                    <h3 className="font-semibold text-sm">Create Quizzes</h3>
                    <p className="text-xs text-muted-foreground">
                      Generate practice quizzes from your notes
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Saved Notes */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Your Saved Notes</CardTitle>
            <CardDescription>Access and manage your study notes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {notes.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No notes yet. Create your first note above!
                </p>
              ) : (
                notes.map((note) => (
                  <div
                    key={note.id}
                    className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold">{note.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {note.subjects?.subject_name}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteNote(note.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {note.simplified_content || note.original_content}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleGenerateQuiz(note.subject_id, note.simplified_content || note.original_content, note.title)}
                      >
                        <Brain className="h-3 w-3 mr-1" />
                        Generate Quiz
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleGenerateFlashcards(note.id, note.simplified_content || note.original_content)}
                        disabled={isGeneratingFlashcards}
                      >
                        <FileText className="h-3 w-3 mr-1" />
                        {isGeneratingFlashcards ? "Generating..." : "Create Flashcards"}
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Notes;
