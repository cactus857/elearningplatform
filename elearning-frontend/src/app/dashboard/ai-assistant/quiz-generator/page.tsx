"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  BookOpen,
  ChevronRight,
  Loader2,
  Save,
  Plus,
  Trash2,
  GripVertical,
  Check,
  Settings,
  Eye,
  Edit2,
  ArrowLeft,
  Search,
  Zap,
  Layers,
  Clock,
  Calendar,
  Signal,
  Flame,
  Sprout,
  LayoutDashboard,
  Brain,
  Code2,
  Database,
  Terminal,
  Cpu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  getAllCoursesBaseRole,
  ICourseRes,
  getCourseById,
} from "@/services/course.service";
import Image from "next/image";
import {
  aiGenerateQuizFromCourse,
  aiSaveQuiz,
  QuizDifficulty,
  IQuizQuestion,
} from "@/services/ai.service";
import { cn } from "@/lib/utils";

// --- TYPES (Giữ nguyên) ---
interface UIQuizQuestion extends IQuizQuestion {
  id: string;
}

interface UIGeneratedQuiz {
  title: string;
  description: string;
  timeLimitMinutes: number | null;
  passingScore: number;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  showCorrectAnswers: boolean;
  questions: UIQuizQuestion[];
}

// --- VISUAL COMPONENTS ---

const DifficultyBadge = ({
  level,
  className,
}: {
  level: string;
  className?: string;
}) => {
  const styles = {
    BEGINNER: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    INTERMEDIATE: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    ADVANCED: "text-rose-500 bg-rose-500/10 border-rose-500/20",
  };

  const icons = {
    BEGINNER: Sprout,
    INTERMEDIATE: Signal,
    ADVANCED: Flame,
  };

  const Icon = icons[level as keyof typeof icons] || Signal;
  const style = styles[level as keyof typeof styles] || styles.INTERMEDIATE;

  return (
    <span
      className={cn(
        "flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium border",
        style,
        className
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      <span className="capitalize">{level.toLowerCase()}</span>
    </span>
  );
};

const BackgroundPattern = () => (
  <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]">
    <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]"></div>
  </div>
);

const StepProgress = ({ current }: { current: string }) => {
  const steps = ["select", "configure", "preview"];
  const idx = steps.indexOf(current);
  const progress = ((idx + 1) / steps.length) * 100;

  return (
    <div className="w-full max-w-xs space-y-2">
      <div className="flex justify-between text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
        <span className={cn(idx >= 0 && "text-primary")}>Source</span>
        <span className={cn(idx >= 1 && "text-primary")}>Config</span>
        <span className={cn(idx >= 2 && "text-primary")}>Review</span>
      </div>
      <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-500 ease-out shadow-[0_0_10px_theme('colors.primary.DEFAULT')]"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

// FIX: Terminal UI for Light Mode
const ProcessingLog = () => {
  return (
    // Luôn sử dụng text sáng màu (zinc-400/300) vì nền terminal luôn đen
    <div className="font-mono text-[10px] text-muted-foreground space-y-1.5 opacity-90">
      <div className="flex gap-2">
        <span className="text-emerald-400">✔</span>{" "}
        <span>Initializing NLP engine...</span>
      </div>
      <div className="flex gap-2">
        <span className="text-emerald-400">✔</span>{" "}
        <span>Parsing chapter context...</span>
      </div>
      <div className="flex gap-2">
        <span className="text-blue-400">ℹ</span>{" "}
        <span>Identifying key concepts...</span>
      </div>
      <div className="flex gap-2 animate-pulse">
        <span className="text-primary">➤</span>{" "}
        <span className="text-foreground">Awaiting parameters...</span>
      </div>
    </div>
  );
};

const AIQuizGenerator = () => {
  // State
  const [step, setStep] = useState<"select" | "configure" | "preview">(
    "select"
  );
  const [courses, setCourses] = useState<ICourseRes[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  // Config
  const [selectedCourse, setSelectedCourse] = useState<ICourseRes | null>(null);
  const [courseChapters, setCourseChapters] = useState<any[]>([]);
  const [selectedChapterIds, setSelectedChapterIds] = useState<string[]>([]);
  const [numberOfQuestions, setNumberOfQuestions] = useState(10);
  const [difficulty, setDifficulty] = useState<QuizDifficulty>("INTERMEDIATE");
  const [availableFrom, setAvailableFrom] = useState("");
  const [availableTo, setAvailableTo] = useState("");
  const [maxAttempts, setMaxAttempts] = useState<number | null>(3);

  // Data
  const [generatedQuiz, setGeneratedQuiz] = useState<UIGeneratedQuiz | null>(
    null
  );
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(
    null
  );
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // --- LOGIC ---
  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = await getAllCoursesBaseRole(1, 100);
      setCourses(response.data);
    } catch (error) {
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseDetails = async (courseId: string) => {
    try {
      const courseDetail = await getCourseById(courseId);
      setCourseChapters(courseDetail.chapters || []);
      setSelectedChapterIds([]);
    } catch (error) {
      toast.error("Failed to load details");
    }
  };

  const handleSelectCourse = (course: ICourseRes) => {
    setSelectedCourse(course);
    fetchCourseDetails(course.id);
    setStep("configure");
  };

  const toggleChapter = (chapterId: string) => {
    setSelectedChapterIds((prev) =>
      prev.includes(chapterId)
        ? prev.filter((id) => id !== chapterId)
        : [...prev, chapterId]
    );
  };

  const handleGenerateQuiz = async () => {
    if (!selectedCourse) return;
    setGenerating(true);
    try {
      const response = await aiGenerateQuizFromCourse({
        courseId: selectedCourse.id,
        numberOfQuestions,
        difficulty,
        chapterIds:
          selectedChapterIds.length > 0 ? selectedChapterIds : undefined,
      });

      const quizWithIds: UIGeneratedQuiz = {
        ...response,
        questions: response.questions.map((q, index) => ({
          ...q,
          id: `q-${Date.now()}-${index}`,
          explanation: q.explanation || "",
        })),
      };

      setGeneratedQuiz(quizWithIds);
      setStep("preview");
      toast.success("Quiz generated successfully!");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Generation failed.");
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveQuiz = async () => {
    if (!generatedQuiz || !selectedCourse) return;
    setSaving(true);
    try {
      await aiSaveQuiz({
        title: generatedQuiz.title,
        courseId: selectedCourse.id,
        chapterId: null,
        timeLimitMinutes: generatedQuiz.timeLimitMinutes,
        passingScore: generatedQuiz.passingScore,
        shuffleQuestions: generatedQuiz.shuffleQuestions,
        shuffleOptions: generatedQuiz.shuffleOptions,
        showCorrectAnswers: generatedQuiz.showCorrectAnswers,
        availableFrom: availableFrom || null,
        availableTo: availableTo || null,
        maxAttempts: maxAttempts,
        questions: generatedQuiz.questions.map((q) => ({
          text: q.text,
          options: q.options,
          correctAnswerIndex: q.correctAnswerIndex,
          explanation: q.explanation,
        })),
      });

      toast.success("Quiz saved to database!");
      setGeneratedQuiz(null);
      setSelectedCourse(null);
      setSelectedChapterIds([]);
      setStep("select");
    } catch (error: any) {
      toast.error("Save failed.");
    } finally {
      setSaving(false);
    }
  };

  // Helper Functions
  const updateQuestion = (id: string, updates: Partial<UIQuizQuestion>) => {
    if (!generatedQuiz) return;
    setGeneratedQuiz({
      ...generatedQuiz,
      questions: generatedQuiz.questions.map((q) =>
        q.id === id ? { ...q, ...updates } : q
      ),
    });
  };
  const deleteQuestion = (id: string) => {
    if (!generatedQuiz) return;
    setGeneratedQuiz({
      ...generatedQuiz,
      questions: generatedQuiz.questions.filter((q) => q.id !== id),
    });
    toast.success("Question removed");
  };
  const addNewQuestion = () => {
    if (!generatedQuiz) return;
    setGeneratedQuiz({
      ...generatedQuiz,
      questions: [
        ...generatedQuiz.questions,
        {
          id: `q-${Date.now()}`,
          text: "New Question",
          options: ["Option A", "Option B", "Option C", "Option D"],
          correctAnswerIndex: 0,
          explanation: "Explain correct answer...",
          difficulty: "MEDIUM",
          topic: "General",
        },
      ],
    });
  };
  const handleDragStart = (idx: number) => setDraggedIndex(idx);
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === idx || !generatedQuiz) return;
    const newList = [...generatedQuiz.questions];
    const item = newList[draggedIndex];
    newList.splice(draggedIndex, 1);
    newList.splice(idx, 0, item);
    setGeneratedQuiz({ ...generatedQuiz, questions: newList });
    setDraggedIndex(idx);
  };
  const handleDragEnd = () => setDraggedIndex(null);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-background font-sans text-sm text-foreground overflow-hidden">
      {/* --- HEADER --- */}
      <div className="h-16 px-6 border-b border-border bg-background/80 backdrop-blur-md flex items-center justify-between shrink-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shadow-sm ring-1 ring-primary/20">
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-base leading-none">Quiz Generator</h1>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mt-1">
              AI-Powered Assessment
            </p>
          </div>
        </div>
        <StepProgress current={step} />
        <div className="w-32 flex justify-end">
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative">
        <BackgroundPattern />

        {/* --- STEP 1: SELECT COURSE (Giữ nguyên) --- */}
        {step === "select" && (
          <div className="h-full overflow-y-auto p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="max-w-6xl mx-auto">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">
                    Select Course
                  </h2>
                  <p className="text-muted-foreground">
                    Choose the knowledge base for your new quiz.
                  </p>
                </div>
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search library..."
                    className="pl-9 bg-card border-border shadow-sm rounded-lg"
                  />
                </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-64 rounded-xl bg-muted/50 animate-pulse"
                    />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-10">
                  {courses.map((course) => (
                    <div
                      key={course.id}
                      onClick={() => handleSelectCourse(course)}
                      className="group bg-card rounded-xl border border-border p-3 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 cursor-pointer flex flex-col h-full"
                    >
                      <div className="aspect-video relative rounded-lg overflow-hidden bg-muted mb-4">
                        {course.thumbnail ? (
                          <Image
                            src={course.thumbnail}
                            alt={course.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <BookOpen className="w-10 h-10 text-muted-foreground/50" />
                          </div>
                        )}
                        <Badge className="absolute top-2 right-2 bg-background/90 text-foreground hover:bg-background backdrop-blur shadow-sm border-border text-[10px] font-bold px-2 py-0.5">
                          {course.level}
                        </Badge>
                      </div>
                      <div className="flex flex-col flex-1 px-1">
                        <h3 className="font-semibold text-base line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                          {course.title}
                        </h3>
                        <div className="mt-auto flex items-center justify-between pt-3 border-t border-dashed border-border">
                          <span className="text-xs text-muted-foreground">
                            {course.status}
                          </span>
                          <span className="text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                            Select <ChevronRight className="w-3 h-3 ml-0.5" />
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- STEP 2: CONFIGURE --- */}
        {step === "configure" && selectedCourse && (
          <div className="h-full flex flex-col md:flex-row overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500">
            {/* Left: Config Form (Sidebar) */}
            <div className="w-full md:w-[450px] bg-card/80 backdrop-blur-sm border-r border-border h-full flex flex-col z-20 shadow-2xl shadow-black/5">
              <div className="p-6 border-b border-border flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setStep("select");
                    setSelectedCourse(null);
                  }}
                  className="rounded-full hover:bg-accent"
                >
                  <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                </Button>
                <div>
                  <h2 className="font-bold text-lg">Configuration</h2>
                  <p className="text-xs text-muted-foreground">
                    Define generation parameters
                  </p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                {/* Scope */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-semibold flex items-center gap-2">
                      <Layers className="w-4 h-4 text-primary" /> Chapters Scope
                    </Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setSelectedChapterIds(
                          selectedChapterIds.length === courseChapters.length
                            ? []
                            : courseChapters.map((c) => c.id)
                        )
                      }
                      className="h-6 text-xs text-primary hover:text-primary/80 hover:bg-primary/10"
                    >
                      {selectedChapterIds.length === courseChapters.length
                        ? "Clear"
                        : "Select All"}
                    </Button>
                  </div>
                  <div className="bg-background rounded-lg border border-border overflow-hidden">
                    <div className="max-h-48 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                      {courseChapters.map((ch) => (
                        <div
                          key={ch.id}
                          onClick={() => toggleChapter(ch.id)}
                          className={cn(
                            "flex items-center gap-3 p-2 rounded-md cursor-pointer text-sm transition-colors select-none",
                            selectedChapterIds.includes(ch.id)
                              ? "bg-accent"
                              : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                          )}
                        >
                          <Checkbox
                            checked={selectedChapterIds.includes(ch.id)}
                            className="border-muted-foreground data-[state=checked]:bg-primary data-[state=checked]:border-primary w-4 h-4"
                          />
                          <span className="line-clamp-1 text-xs font-medium">
                            {ch.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* FIX: Difficulty & Count (Same Row) */}
                <div className="space-y-4">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <Zap className="w-4 h-4 text-primary" /> Parameters
                  </Label>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">
                        Difficulty Level
                      </Label>
                      <Select
                        value={difficulty}
                        onValueChange={(v: any) => setDifficulty(v)}
                      >
                        <SelectTrigger className="bg-background border-border">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BEGINNER">Beginner</SelectItem>
                          <SelectItem value="INTERMEDIATE">
                            Intermediate
                          </SelectItem>
                          <SelectItem value="ADVANCED">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">
                        Questions
                      </Label>
                      <div className="relative">
                        <Input
                          type="number"
                          min={1}
                          max={50}
                          value={numberOfQuestions}
                          onChange={(e) =>
                            setNumberOfQuestions(Number(e.target.value))
                          }
                          className="bg-background border-border font-medium pr-8"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground select-none">
                          Qty
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator className="bg-border" />

                {/* FIX: Scheduling (Full Width for Dates) */}
                <div className="space-y-4">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" /> Scheduling
                  </Label>

                  {/* Changed from grid-cols-2 to stack (cols-1) for better width */}
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground">
                        Open Date
                      </span>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        {/* w-full ensures it takes full sidebar width */}
                        <Input
                          type="datetime-local"
                          className="pl-10 h-10 text-xs bg-background border-border w-full"
                          value={availableFrom}
                          onChange={(e) => setAvailableFrom(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground">
                        Close Date
                      </span>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="datetime-local"
                          className="pl-10 h-10 text-xs bg-background border-border w-full"
                          value={availableTo}
                          onChange={(e) => setAvailableTo(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-border bg-muted/20">
                <Button
                  onClick={handleGenerateQuiz}
                  disabled={generating}
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5"
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />{" "}
                      Processing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" /> Generate Quiz
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Right: Preview Hero */}
            <div className="flex-1 bg-muted/10 p-12 flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,theme(colors.primary.DEFAULT)_0%,transparent_50%)] opacity-[0.03] blur-3xl pointer-events-none" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-primary/5 rounded-full animate-[spin_60s_linear_infinite] pointer-events-none" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-primary/10 rounded-full animate-[spin_40s_linear_infinite_reverse] pointer-events-none" />

              <div className="relative z-10 w-full max-w-2xl animate-in fade-in zoom-in-95 duration-700">
                <div className="absolute -top-10 -left-10 p-3 bg-card rounded-xl border border-border shadow-lg animate-bounce duration-[3000ms]">
                  <Brain className="w-6 h-6 text-purple-500" />
                </div>
                <div className="absolute -bottom-5 -right-5 p-3 bg-card rounded-xl border border-border shadow-lg animate-bounce duration-[4000ms]">
                  <Code2 className="w-6 h-6 text-blue-500" />
                </div>
                <div className="absolute top-20 -right-12 p-2 bg-card rounded-lg border border-border shadow-sm animate-pulse">
                  <Database className="w-4 h-4 text-emerald-500" />
                </div>

                <div className="bg-card/80 backdrop-blur-xl border border-border rounded-2xl shadow-2xl overflow-hidden relative group">
                  {generating && (
                    <div
                      className="absolute inset-0 z-20 pointer-events-none bg-gradient-to-b from-transparent via-primary/10 to-transparent h-[10%] w-full animate-[scan_2s_linear_infinite]"
                      style={{ top: "50%" }}
                    />
                  )}

                  <div className="h-12 border-b border-border bg-muted/50 flex items-center px-4 justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-400/80" />
                      <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                      <div className="w-3 h-3 rounded-full bg-green-400/80" />
                    </div>
                    <div className="text-[10px] font-mono text-muted-foreground">
                      preview_mode.tsx
                    </div>
                  </div>

                  <div className="p-8 text-center space-y-6">
                    <div className="w-16 h-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-4">
                      <Cpu className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-foreground mb-2">
                        Ready to Build
                      </h3>
                      <p className="text-muted-foreground max-w-md mx-auto">
                        AI Agent is standing by to analyze{" "}
                        <span className="text-primary font-semibold">
                          {selectedCourse.title}
                        </span>
                        .
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-4">
                      <div className="p-3 rounded-lg bg-background border border-border">
                        <div className="text-2xl font-bold text-foreground">
                          {selectedChapterIds.length || courseChapters.length}
                        </div>
                        <div className="text-[10px] uppercase font-bold text-muted-foreground">
                          Chapters
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-background border border-border">
                        <div className="text-2xl font-bold text-foreground">
                          {numberOfQuestions}
                        </div>
                        <div className="text-[10px] uppercase font-bold text-muted-foreground">
                          Questions
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-background border border-border flex flex-col items-center justify-center">
                        <DifficultyBadge
                          level={difficulty}
                          className="mb-0.5"
                        />
                        <div className="text-[10px] uppercase font-bold text-muted-foreground">
                          Level
                        </div>
                      </div>
                    </div>

                    {/* FIX: Dark Terminal background for both modes */}
                    <div className="mt-6 p-4 bg-zinc-950 rounded-lg text-left border border-zinc-800 shadow-inner">
                      <ProcessingLog />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- STEP 3: PREVIEW (EDITOR) (Giữ nguyên) --- */}
        {step === "preview" && generatedQuiz && (
          <div className="h-full flex overflow-hidden animate-in fade-in zoom-in-95 duration-500">
            {/* Sidebar Controls */}
            <div className="w-80 bg-card border-r border-border flex flex-col h-full z-20 shadow-xl">
              <div className="p-5 border-b border-border">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep("configure")}
                  className="mb-4 text-muted-foreground -ml-2 hover:text-primary"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" /> Back
                </Button>
                <Label className="text-[10px] uppercase font-bold text-primary tracking-wider mb-1 block">
                  Quiz Title
                </Label>
                <Input
                  value={generatedQuiz.title}
                  onChange={(e) =>
                    setGeneratedQuiz({
                      ...generatedQuiz,
                      title: e.target.value,
                    })
                  }
                  className="font-bold text-xl px-0 border-0 shadow-none focus-visible:ring-0 h-auto bg-transparent p-0 text-foreground"
                />
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-8 custom-scrollbar">
                <div>
                  <h4 className="font-bold text-sm text-foreground mb-3 flex items-center gap-2">
                    <Settings className="w-4 h-4" /> General Settings
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-muted-foreground">
                        Time Limit (Min)
                      </Label>
                      <Input
                        type="number"
                        className="w-20 h-8 text-right bg-muted/50 border-border"
                        value={generatedQuiz.timeLimitMinutes ?? ""}
                        onChange={(e) =>
                          setGeneratedQuiz({
                            ...generatedQuiz,
                            timeLimitMinutes: e.target.value
                              ? Number(e.target.value)
                              : null,
                          })
                        }
                        placeholder="∞"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-muted-foreground">
                        Passing Score (%)
                      </Label>
                      <Input
                        type="number"
                        className="w-20 h-8 text-right bg-muted/50 border-border"
                        value={generatedQuiz.passingScore}
                        onChange={(e) =>
                          setGeneratedQuiz({
                            ...generatedQuiz,
                            passingScore: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-muted-foreground">
                        Max Attempts
                      </Label>
                      <Input
                        type="number"
                        className="w-20 h-8 text-right bg-muted/50 border-border"
                        value={maxAttempts ?? ""}
                        onChange={(e) =>
                          setMaxAttempts(
                            e.target.value ? Number(e.target.value) : null
                          )
                        }
                        placeholder="∞"
                      />
                    </div>
                  </div>
                </div>

                <Separator className="bg-border" />

                <div>
                  <h4 className="font-bold text-sm text-foreground mb-3 flex items-center gap-2">
                    <Layers className="w-4 h-4" /> Structure
                  </h4>
                  <Button
                    onClick={addNewQuestion}
                    variant="outline"
                    className="w-full justify-start text-muted-foreground border-dashed border-border hover:border-primary hover:text-primary hover:bg-primary/5"
                  >
                    <Plus className="w-4 h-4 mr-2" /> Add Question
                  </Button>
                </div>
              </div>

              <div className="p-5 border-t border-border bg-muted/20">
                <Button
                  onClick={handleSaveQuiz}
                  disabled={saving}
                  className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-md"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}{" "}
                  Save & Publish
                </Button>
              </div>
            </div>

            {/* Main Editor Canvas */}
            <div className="flex-1 bg-muted/10 overflow-y-auto custom-scrollbar p-8 pb-32 relative">
              <BackgroundPattern />

              <div className="max-w-3xl mx-auto space-y-6 relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-bold text-foreground">
                    Questions ({generatedQuiz.questions.length})
                  </h2>
                  <DifficultyBadge level={difficulty} />
                </div>

                {generatedQuiz.questions.map((question, index) => (
                  <div
                    key={question.id}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className={cn(
                      "group bg-card rounded-xl border transition-all duration-300 relative overflow-hidden",
                      draggedIndex === index
                        ? "opacity-30 border-dashed border-primary scale-95"
                        : "border-border hover:border-primary/50 hover:shadow-lg",
                      editingQuestionId === question.id
                        ? "ring-2 ring-primary shadow-xl z-10"
                        : ""
                    )}
                  >
                    {/* Drag Grip */}
                    <div
                      className="absolute top-0 bottom-0 left-0 w-8 flex items-center justify-center cursor-move opacity-0 group-hover:opacity-100 transition-opacity bg-muted/50 border-r border-border"
                      onMouseDown={(e) => e.stopPropagation()}
                    >
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                    </div>

                    <div className="pl-8 p-6">
                      <div className="flex items-start gap-4 mb-6">
                        <div className="w-7 h-7 rounded bg-muted text-muted-foreground font-bold text-xs flex items-center justify-center shrink-0 mt-1">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          {editingQuestionId === question.id ? (
                            <Input
                              value={question.text}
                              onChange={(e) =>
                                updateQuestion(question.id, {
                                  text: e.target.value,
                                })
                              }
                              className="font-semibold text-lg border-0 border-b border-primary/50 rounded-none px-0 focus-visible:ring-0 bg-transparent mb-2 text-foreground"
                              autoFocus
                            />
                          ) : (
                            <h3 className="font-semibold text-lg text-foreground leading-relaxed mb-2">
                              {question.text}
                            </h3>
                          )}

                          <div className="flex gap-2">
                            <Badge
                              variant="secondary"
                              className="bg-muted text-muted-foreground text-[10px] font-bold uppercase tracking-wider"
                            >
                              {question.topic}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-primary hover:bg-primary/10"
                            onClick={() =>
                              setEditingQuestionId(
                                editingQuestionId === question.id
                                  ? null
                                  : question.id
                              )
                            }
                          >
                            {editingQuestionId === question.id ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <Edit2 className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-rose-500 hover:bg-rose-500/10"
                            onClick={() => deleteQuestion(question.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                        {question.options.map((option, optIdx) => (
                          <div
                            key={optIdx}
                            className={cn(
                              "flex items-center gap-3 p-3 rounded-lg border transition-all",
                              question.correctAnswerIndex === optIdx
                                ? "bg-emerald-500/10 border-emerald-500/30"
                                : "bg-background border-border hover:bg-muted/50"
                            )}
                          >
                            <button
                              onClick={() =>
                                editingQuestionId === question.id &&
                                updateQuestion(question.id, {
                                  correctAnswerIndex: optIdx,
                                })
                              }
                              disabled={editingQuestionId !== question.id}
                              className={cn(
                                "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                                question.correctAnswerIndex === optIdx
                                  ? "bg-emerald-500 border-emerald-500 text-white"
                                  : "border-muted-foreground bg-background",
                                editingQuestionId === question.id &&
                                "cursor-pointer hover:border-emerald-500"
                              )}
                            >
                              {question.correctAnswerIndex === optIdx && (
                                <Check className="w-3 h-3" />
                              )}
                            </button>

                            {editingQuestionId === question.id ? (
                              <Input
                                value={option}
                                onChange={(e) => {
                                  const newOpts = [...question.options];
                                  newOpts[optIdx] = e.target.value;
                                  updateQuestion(question.id, {
                                    options: newOpts,
                                  });
                                }}
                                className="h-8 bg-transparent border-0 p-0 focus-visible:ring-0 text-sm"
                              />
                            ) : (
                              <span
                                className={cn(
                                  "text-sm",
                                  question.correctAnswerIndex === optIdx
                                    ? "font-medium text-emerald-600 dark:text-emerald-400"
                                    : "text-muted-foreground"
                                )}
                              >
                                {option}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="bg-muted/30 rounded-lg p-3 flex gap-3 border border-border">
                        <div className="mt-0.5 text-primary">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                            Explanation
                          </div>
                          {editingQuestionId === question.id ? (
                            <Input
                              value={question.explanation || ""}
                              onChange={(e) =>
                                updateQuestion(question.id, {
                                  explanation: e.target.value,
                                })
                              }
                              className="bg-background h-8 text-sm border-border"
                            />
                          ) : (
                            <p className="text-sm text-foreground leading-relaxed">
                              {question.explanation}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIQuizGenerator;
