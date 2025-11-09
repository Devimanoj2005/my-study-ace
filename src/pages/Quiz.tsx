import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Brain } from "lucide-react";
import { toast } from "sonner";
import { useAchievements } from "@/hooks/useAchievements";
import { useStreak } from "@/hooks/useStreak";
import { useNavigate } from "react-router-dom";

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

const Quiz = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [confidence, setConfidence] = useState<"low" | "medium" | "high" | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [userId, setUserId] = useState<string | undefined>();
  const [correctCount, setCorrectCount] = useState(0);

  const { checkAndAwardAchievement } = useAchievements(userId);
  const { updateStreak } = useStreak(userId);

  useEffect(() => {
    checkUser();
    // Load quiz from session storage
    const quizData = sessionStorage.getItem("currentQuiz");
    if (quizData) {
      const parsedQuiz = JSON.parse(quizData);
      setQuestions(parsedQuiz.questions || []);
    }
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setUserId(session.user.id);
    }
  };

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">No Quiz Available</h1>
            <p className="text-muted-foreground">Please generate a quiz from the Notes or Study page first.</p>
          </div>
        </main>
      </div>
    );
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleSubmit = async () => {
    if (!selectedAnswer) {
      toast.error("Please select an answer");
      return;
    }

    if (!confidence) {
      toast.error("Please rate your confidence");
      return;
    }

    const correct = parseInt(selectedAnswer) === questions[currentQuestion].correctAnswer;
    setIsCorrect(correct);
    setShowResult(true);
    
    if (correct) {
      setCorrectCount(prev => prev + 1);
    }

    // Save quiz result to database
    const subjectId = sessionStorage.getItem("currentQuizSubject");
    if (subjectId) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await supabase.from("quiz_results").insert({
          user_id: session.user.id,
          subject_id: subjectId,
          topic: questions[currentQuestion].question,
          score: correct ? 1 : 0,
          total_questions: 1,
          confidence_level: confidence,
        });
      }
    }

    toast.success(correct ? "Correct! 🎉" : "Keep practicing! 💪");
  };

  const handleNext = async () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer("");
      setConfidence(null);
      setShowResult(false);
    } else {
      toast.success("Quiz completed! Great job!");
      
      // Update streak and check for achievements
      if (userId) {
        const result = await updateStreak("quiz");
        if (result) {
          await checkAndAwardAchievement("quiz", result.totalQuiz, "count");
          await checkAndAwardAchievement("streak", result.currentStreak, "streak");
          
          // Check for perfect score achievement
          const score = (correctCount / questions.length) * 100;
          if (score === 100) {
            await checkAndAwardAchievement("quiz", 100, "score");
          }
        }
      }
      
      // Navigate to dashboard after a short delay
      setTimeout(() => navigate("/dashboard"), 2000);
    }
  };

  const confidenceLevels = [
    { value: "low", label: "Low", color: "text-warning" },
    { value: "medium", label: "Medium", color: "text-primary" },
    { value: "high", label: "High", color: "text-success" },
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">AI-Generated Quiz</h1>
            <p className="text-muted-foreground">Test your knowledge from your last study session</p>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">
                Question {currentQuestion + 1} of {questions.length}
              </span>
              <span className="text-sm text-muted-foreground">{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Quiz Card */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl mb-2">{questions[currentQuestion].question}</CardTitle>
                  <CardDescription>Select the correct answer and rate your confidence</CardDescription>
                </div>
                <Badge variant="outline" className="flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  Calculus
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Answer Options */}
              <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer}>
                <div className="space-y-3">
                  {questions[currentQuestion].options.map((option, index) => (
                    <div
                      key={index}
                      className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all ${
                        selectedAnswer === index.toString()
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      } ${
                        showResult &&
                        index === questions[currentQuestion].correctAnswer &&
                        "border-success bg-success/5"
                      } ${
                        showResult &&
                        selectedAnswer === index.toString() &&
                        !isCorrect &&
                        "border-destructive bg-destructive/5"
                      }`}
                    >
                      <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                      <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                        {option}
                      </Label>
                      {showResult && index === questions[currentQuestion].correctAnswer && (
                        <CheckCircle2 className="h-5 w-5 text-success" />
                      )}
                      {showResult &&
                        selectedAnswer === index.toString() &&
                        index !== questions[currentQuestion].correctAnswer && (
                          <XCircle className="h-5 w-5 text-destructive" />
                        )}
                    </div>
                  ))}
                </div>
              </RadioGroup>

              {/* Confidence Rating */}
              <div className="space-y-3">
                <Label>How confident are you in your answer?</Label>
                <div className="grid grid-cols-3 gap-3">
                  {confidenceLevels.map((level) => (
                    <Button
                      key={level.value}
                      variant={confidence === level.value ? "default" : "outline"}
                      onClick={() => setConfidence(level.value as "low" | "medium" | "high")}
                      className={confidence === level.value ? "" : "hover:border-primary"}
                    >
                      {level.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                {!showResult ? (
                  <Button onClick={handleSubmit} className="flex-1">
                    Submit Answer
                  </Button>
                ) : (
                  <Button onClick={handleNext} className="flex-1">
                    {currentQuestion < questions.length - 1 ? "Next Question" : "Complete Quiz"}
                  </Button>
                )}
              </div>

              {/* Result Feedback */}
              {showResult && (
                <div
                  className={`p-4 rounded-lg ${
                    isCorrect ? "bg-success/10 border border-success/20" : "bg-warning/10 border border-warning/20"
                  }`}
                >
                  <p className="font-medium mb-2">
                    {isCorrect ? "🎉 Excellent!" : "📚 Keep Learning!"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isCorrect
                      ? "Your understanding of this concept is strong. We'll review this less frequently."
                      : "This topic will be scheduled for more frequent review to strengthen your understanding."}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Study Tips */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">💡 Learning Insight</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Your confidence ratings help us personalize your learning schedule. Lower confidence answers will be
                reviewed more frequently using spaced repetition techniques.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Quiz;
