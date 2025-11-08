import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, Clock, Target, TrendingUp, Zap, BookOpen, Award, Calendar } from "lucide-react";
import heroImage from "@/assets/hero-study.jpg";

const Index = () => {
  const features = [
    {
      icon: Brain,
      title: "AI-Generated Quizzes",
      description: "Automatically creates revision quizzes after each study session tailored to what you learned",
    },
    {
      icon: Target,
      title: "Confidence-Based Learning",
      description: "Adapts difficulty and revision intervals based on your confidence ratings",
    },
    {
      icon: Clock,
      title: "Smart Revision Scheduler",
      description: "Uses spaced repetition to remind you just before you forget",
    },
    {
      icon: TrendingUp,
      title: "Progress Tracking",
      description: "Visualizes mastery level of each topic and highlights weak areas",
    },
    {
      icon: Zap,
      title: "Focus Mode & Timer",
      description: "Encourages distraction-free study sessions with built-in timer",
    },
    {
      icon: BookOpen,
      title: "Memory Tips & Insights",
      description: "Provides personalized mnemonics and study recommendations",
    },
  ];

  const benefits = [
    { icon: Award, text: "Remember topics longer" },
    { icon: Calendar, text: "Study smarter, not harder" },
    { icon: Brain, text: "Personalized learning path" },
    { icon: Target, text: "Track your progress" },
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-primary opacity-10" />
        <div className="container mx-auto px-4 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 z-10">
              <div className="inline-block">
                <div className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
                  <Brain className="h-4 w-4" />
                  <span>Your AI Study Companion</span>
                </div>
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                Learn Smarter with{" "}
                <span className="bg-gradient-primary bg-clip-text text-transparent">Smart Study Partner</span>
              </h1>
              <p className="text-xl text-muted-foreground">
                An intelligent learning app that combines AI-generated quizzes, confidence-based learning, and spaced
                repetition to help you remember topics longer with less stress.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/dashboard">
                  <Button size="lg" className="gap-2">
                    Get Started Free
                    <Brain className="h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/study">
                  <Button size="lg" variant="outline" className="gap-2">
                    Start Learning
                    <BookOpen className="h-5 w-5" />
                  </Button>
                </Link>
              </div>
              <div className="flex flex-wrap gap-6 pt-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <benefit.icon className="h-4 w-4 text-primary" />
                    <span>{benefit.text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-primary opacity-20 blur-3xl rounded-full" />
              <img
                src={heroImage}
                alt="Students learning with Smart Study Partner"
                className="relative rounded-2xl shadow-lg w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Everything You Need to Excel</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Smart Study Partner adapts to your learning style and helps you build lasting knowledge
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="bg-gradient-card border-border/50 hover:shadow-lg transition-all">
                <CardContent className="pt-6">
                  <div className="mb-4 p-3 rounded-lg bg-primary/10 w-fit">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A simple, proven approach to better learning
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: "1", title: "Study", desc: "Focus on your topic with our distraction-free timer" },
              { step: "2", title: "Quiz", desc: "Answer AI-generated questions about what you studied" },
              { step: "3", title: "Rate", desc: "Tell us how confident you feel about each answer" },
              { step: "4", title: "Review", desc: "Get personalized revision schedule using spaced repetition" },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-primary text-primary-foreground font-bold text-2xl flex items-center justify-center mx-auto mb-4 shadow-glow">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="bg-gradient-primary text-primary-foreground border-0 shadow-glow">
            <CardContent className="py-16 text-center">
              <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Learning?</h2>
              <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                Join thousands of students who are learning smarter, not harder
              </p>
              <Link to="/dashboard">
                <Button size="lg" variant="secondary" className="gap-2">
                  Start Your Journey
                  <Brain className="h-5 w-5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Index;
