import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Brain, Sparkles, Trash2, Mic, Square, Upload, FileUp } from "lucide-react";
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
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

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

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await transcribeAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.success("Recording started");
    } catch (error) {
      toast.error("Failed to start recording. Please check microphone permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.info("Processing audio...");
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      setIsTranscribing(true);
      
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = reader.result?.toString().split(',')[1];
        
        const { data, error } = await supabase.functions.invoke('transcribe-audio', {
          body: { audio: base64Audio }
        });

        if (error) throw error;

        setContent(prev => prev + (prev ? '\n\n' : '') + data.text);
        toast.success("Audio transcribed successfully!");
      };
    } catch (error: any) {
      toast.error(error.message || "Failed to transcribe audio");
    } finally {
      setIsTranscribing(false);
    }
  };

  const handlePdfUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      const file = event.target.files[0];
      
      if (file.type !== 'application/pdf') {
        toast.error("Please upload a PDF file");
        return;
      }

      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;

      toast.info("Uploading PDF...");

      const { error: uploadError } = await supabase.storage
        .from('pdfs')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      toast.success("PDF uploaded! You can now take notes about it.");
      setTitle(file.name.replace('.pdf', ''));
    } catch (error: any) {
      toast.error(error.message || "Failed to upload PDF");
    }
  };

  const handleSaveNote = async () => {
    if (!title || !content || !selectedSubject) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setIsSimplifying(true);
      
      const { data: simplifiedData, error: simplifyError } = await supabase.functions.invoke(
        "simplify-notes",
        {
          body: { content, gradeLevel: "middle school" },
        }
      );

      if (simplifyError) throw simplifyError;

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
    <div className="min-h-screen bg-gradient-mesh">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">Smart Notes</h1>
          <p className="text-muted-foreground">Create, record, and organize your study notes with AI assistance</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 animate-fade-up">
            <CardHeader>
              <CardTitle>Add New Notes</CardTitle>
              <CardDescription>Write, record, or upload your study notes</CardDescription>
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
                  placeholder="Paste, type, or record your notes here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={10}
                  className="resize-none"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isTranscribing}
                  variant={isRecording ? "destructive" : "outline"}
                  className="gap-2"
                >
                  {isRecording ? (
                    <>
                      <Square className="h-4 w-4" />
                      Stop Recording
                    </>
                  ) : (
                    <>
                      <Mic className="h-4 w-4" />
                      {isTranscribing ? "Transcribing..." : "Record Audio"}
                    </>
                  )}
                </Button>

                <label htmlFor="pdf-upload">
                  <Button variant="outline" className="gap-2" asChild>
                    <span>
                      <FileUp className="h-4 w-4" />
                      Upload PDF
                    </span>
                  </Button>
                </label>
                <input
                  id="pdf-upload"
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={handlePdfUpload}
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

          <Card className="animate-fade-up" style={{ animationDelay: '0.1s' }}>
            <CardHeader>
              <CardTitle>AI Features</CardTitle>
              <CardDescription>Powerful tools at your fingertips</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-gradient-card border border-primary/20 hover:shadow-lg transition-all">
                <div className="flex items-start gap-3">
                  <Brain className="h-5 w-5 mt-0.5 text-primary" />
                  <div>
                    <h3 className="font-semibold text-sm mb-1">Simplify Notes</h3>
                    <p className="text-xs text-muted-foreground">
                      AI converts complex notes into easy-to-understand language
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-gradient-card border border-accent/20 hover:shadow-lg transition-all">
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 mt-0.5 text-accent" />
                  <div>
                    <h3 className="font-semibold text-sm mb-1">Generate Flashcards</h3>
                    <p className="text-xs text-muted-foreground">
                      Automatically create flashcards for quick revision
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-gradient-card border border-success/20 hover:shadow-lg transition-all">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-sm mb-1">Voice Recording</h3>
                    <p className="text-xs text-muted-foreground">
                      Record lectures and get instant transcriptions
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-gradient-card border border-warning/20 hover:shadow-lg transition-all">
                <div className="flex items-start gap-3">
                  <FileUp className="h-5 w-5 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-sm mb-1">PDF Support</h3>
                    <p className="text-xs text-muted-foreground">
                      Upload PDFs and create notes about them
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6 animate-fade-up" style={{ animationDelay: '0.2s' }}>
          <CardHeader>
            <CardTitle>Your Saved Notes</CardTitle>
            <CardDescription>Access and manage your study notes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {notes.length === 0 ? (
                <p className="text-center text-muted-foreground py-12">
                  No notes yet. Create your first note above!
                </p>
              ) : (
                notes.map((note, index) => (
                  <div
                    key={note.id}
                    className="p-4 rounded-lg border bg-gradient-card hover:shadow-xl transition-all animate-fade-up"
                    style={{ animationDelay: `${index * 0.05}s` }}
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
                        <Trash2 className="h-4 w-4 text-destructive" />
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