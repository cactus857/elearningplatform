/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  BookOpen,
  Eye,
  Save,
  Loader2,
  CheckCircle2,
  X,
  ChevronDown,
  ChevronRight,
  Clock,
  User,
  Cpu,
  GraduationCap,
  Layers,
  FileVideo,
  Terminal,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { aiGenerateCourse, aiSaveCourse } from "@/services/ai.service";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CourseLevel, CourseStatus } from "@/services/course.service";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";

// --- TYPES ---
type MessageType = "user" | "assistant" | "system";

interface Message {
  id: string;
  type: MessageType;
  content: string;
  timestamp: Date;
}

interface CourseData {
  title: string;
  description: string;
  thumbnail: string;
  smallDescription: string;
  category: string;
  duration: number;
  whatYouWillLearn: string[];
  requirements: string[];
  chapters: Chapter[];
  level: CourseLevel;
  status: CourseStatus;
}

interface Chapter {
  title: string;
  position: number;
  lessons: Lesson[];
}

interface Lesson {
  title: string;
  position: number;
  videoUrl: string | null;
  duration: number | null;
  content: string;
}

// --- COMPONENTS ---

// CSS Animation Styles
const BackgroundStyles = () => (
  <style jsx global>{`
    @keyframes blob {
      0% {
        transform: translate(0px, 0px) scale(1);
      }
      33% {
        transform: translate(30px, -50px) scale(1.1);
      }
      66% {
        transform: translate(-20px, 20px) scale(0.9);
      }
      100% {
        transform: translate(0px, 0px) scale(1);
      }
    }
    .animate-blob {
      animation: blob 7s infinite;
    }
    .animation-delay-2000 {
      animation-delay: 2s;
    }
    .animation-delay-4000 {
      animation-delay: 4s;
    }
    .bg-noise {
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E");
    }
  `}</style>
);

const AIAvatar = () => (
  <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/30 ring-2 ring-indigo-100 z-10">
    <Bot className="w-5 h-5 text-white" />
  </div>
);

const UserAvatar = () => (
  <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 shadow-sm z-10">
    <User className="w-4 h-4 text-zinc-300" />
  </div>
);

const SystemAvatar = () => (
  <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 z-10">
    <Terminal className="w-4 h-4 text-amber-600" />
  </div>
);

const AILoadingBubble = () => (
  <div className="flex items-center gap-1 h-full py-1">
    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></div>
  </div>
);

const AICourseGenerator = () => {
  const router = useRouter();
  const { user } = useAuth();

  // --- STATE ---
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window !== "undefined") {
      const storageKey = user
        ? `chat_history_${user.id}`
        : `chat_history_guest`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          return JSON.parse(saved, (key, value) =>
            key === "timestamp" ? new Date(value) : value
          );
        } catch (e) {
          console.error(e);
        }
      }
    }
    return [
      {
        id: "1",
        type: "assistant",
        content:
          "Hello! I'm your AI Course Architect. What topic would you like to create a course about today?",
        timestamp: new Date(),
      },
    ];
  });

  const [inputValue, setInputValue] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [generatedCourse, setGeneratedCourse] = useState<CourseData | null>(
    () => {
      if (typeof window !== "undefined") {
        const storageKey = user
          ? `generated_course_${user.id}`
          : `generated_course_guest`;
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          try {
            return JSON.parse(saved);
          } catch (e) {
            console.error(e);
          }
        }
      }
      return null;
    }
  );
  const [expandedChapters, setExpandedChapters] = useState<Set<number>>(
    new Set()
  );
  const [showPreview, setShowPreview] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // --- EFFECTS ---
  useEffect(() => {
    const storageKey = user ? `chat_history_${user.id}` : `chat_history_guest`;
    localStorage.setItem(storageKey, JSON.stringify(messages));
  }, [messages, user?.id]);

  useEffect(() => {
    const storageKey = user
      ? `generated_course_${user.id}`
      : `generated_course_guest`;
    if (generatedCourse) {
      localStorage.setItem(storageKey, JSON.stringify(generatedCourse));
    } else {
      localStorage.removeItem(storageKey);
    }
  }, [generatedCourse, user?.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isGenerating]);

  // --- FUNCTIONS ---
  const triggerFireworks = () => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 50 };
    const random = (min: number, max: number) =>
      Math.random() * (max - min) + min;

    const interval: any = setInterval(function () {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);
      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: random(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: random(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);
  };

  const addMessage = (content: string, type: MessageType) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        type,
        content,
        timestamp: new Date(),
      },
    ]);
  };

  const handleGenerateCourse = async () => {
    if (!inputValue.trim()) return;
    const userInput = inputValue;
    setInputValue("");
    addMessage(userInput, "user");
    setIsGenerating(true);

    try {
      const response = await aiGenerateCourse(userInput);
      if (response && response.success && response.data) {
        const courseData = response.data as CourseData;
        setGeneratedCourse(courseData);
        addMessage(
          `✅ Course Generated: "${courseData.title}".\nIt includes ${
            courseData.chapters.length
          } chapters and ${courseData.chapters.reduce(
            (acc, ch) => acc + ch.lessons.length,
            0
          )} lessons.\n\nClick "Preview" to see the details!`,
          "assistant"
        );
        toast.success("Course generated successfully");
      } else {
        throw new Error("Failed to generate course");
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || error?.message || "Connection Error";
      addMessage(`❌ ${errorMessage}. Please try again.`, "assistant");
      toast.error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveCourse = async () => {
    if (!generatedCourse) return;
    addMessage("Saving course to system...", "system");
    setIsSaving(true);

    try {
      const response = await aiSaveCourse(generatedCourse);

      setIsSuccess(true);
      triggerFireworks();
      addMessage(
        `🎉 Saved successfully! You can find it in your Dashboard.`,
        "assistant"
      );
      toast.success("Course saved successfully!");

      setTimeout(() => {
        setGeneratedCourse(null);
        setShowPreview(false);
        const storageKey = user
          ? `generated_course_${user.id}`
          : `generated_course_guest`;
        localStorage.removeItem(storageKey);
        router.push("/dashboard/courses");
      }, 2500);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Error saving course";
      addMessage(`❌ Error: ${errorMessage}`, "assistant");
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleChapter = (chapterIndex: number) => {
    const newExpanded = new Set(expandedChapters);
    if (newExpanded.has(chapterIndex)) newExpanded.delete(chapterIndex);
    else newExpanded.add(chapterIndex);
    setExpandedChapters(newExpanded);
  };

  const getTotalLessons = (course: CourseData) =>
    course.chapters.reduce((acc, ch) => acc + ch.lessons.length, 0);
  const getTotalDuration = (course: CourseData) =>
    course.chapters.reduce(
      (acc, ch) =>
        acc +
        ch.lessons.reduce((sum, lesson) => sum + (lesson.duration || 0), 0),
      0
    );

  // --- RENDER ---
  return (
    <div className="flex h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950 relative overflow-hidden font-sans text-sm">
      <BackgroundStyles />

      {/* 1. PROFESSIONAL ANIMATED BACKGROUND */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        {/* Lớp Noise Texture tạo cảm giác xịn sò */}
        <div className="absolute inset-0 z-0 bg-noise opacity-[0.4] mix-blend-soft-light"></div>

        {/* Animated Orbs */}
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob dark:mix-blend-normal dark:bg-purple-900/40"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000 dark:mix-blend-normal dark:bg-indigo-900/40"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000 dark:mix-blend-normal dark:bg-blue-900/40"></div>

        {/* Glass Overlay để làm dịu background */}
        <div className="absolute inset-0 bg-white/40 dark:bg-black/40 backdrop-blur-[80px]"></div>
      </div>

      {/* LEFT SIDE: CHAT */}
      <div
        className={cn(
          "flex flex-col relative z-10 transition-all duration-500 ease-in-out h-full",
          showPreview ? "w-1/2" : "w-full max-w-4xl mx-auto"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/20 dark:border-white/10 bg-white/30 dark:bg-black/20 backdrop-blur-md z-20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-indigo-500 to-purple-500 p-2 rounded-xl shadow-lg shadow-indigo-500/20">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-foreground text-base tracking-tight leading-none">
                AI Course Architect
              </h1>
              <p className="text-[10px] text-muted-foreground font-medium mt-1">
                Powered by Advanced LLM
              </p>
            </div>
          </div>
          {generatedCourse && !showPreview && (
            <Button
              onClick={() => setShowPreview(true)}
              variant="outline"
              size="sm"
              className="h-9 text-xs gap-2 bg-white/50 border-white/40 hover:bg-white/80 dark:bg-black/20 dark:hover:bg-black/40"
            >
              <Eye className="w-3.5 h-3.5" /> Open Draft
            </Button>
          )}
        </div>

        {/* Messages */}
        <div
          className="flex-1 overflow-y-auto p-4 space-y-8 custom-scrollbar"
          ref={scrollRef}
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-4 w-full animate-in fade-in slide-in-from-bottom-4 duration-500",
                message.type === "user" ? "justify-end" : "justify-start"
              )}
            >
              {message.type === "assistant" && <AIAvatar />}
              {message.type === "system" && <SystemAvatar />}

              <div
                className={cn(
                  "relative px-5 py-3.5 text-[15px] leading-relaxed shadow-sm max-w-[85%] w-fit break-words group",
                  message.type === "user"
                    ? "bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-2xl rounded-tr-sm shadow-indigo-500/20"
                    : message.type === "system"
                    ? "bg-amber-50/80 backdrop-blur-sm border border-amber-200/60 text-amber-900 rounded-xl rounded-tl-sm font-mono text-xs flex items-center gap-3 shadow-sm"
                    : "bg-white/80 dark:bg-zinc-900/90 backdrop-blur-md border border-white/40 dark:border-white/10 text-foreground rounded-2xl rounded-tl-sm shadow-sm"
                )}
              >
                {message.type === "system" &&
                  (isSaving ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0 text-amber-600" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                  ))}

                <div className="whitespace-pre-wrap">{message.content}</div>
                {message.type !== "system" && (
                  <div
                    className={cn(
                      "text-[10px] mt-1.5 select-none opacity-0 group-hover:opacity-100 transition-opacity",
                      message.type === "user"
                        ? "text-indigo-100/70 text-right"
                        : "text-muted-foreground/60"
                    )}
                  >
                    {new Date(message.timestamp).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                )}
              </div>
              {message.type === "user" && <UserAvatar />}
            </div>
          ))}

          {isGenerating && (
            <div className="flex gap-4 w-full justify-start animate-in fade-in">
              <AIAvatar />
              <div className="bg-white/80 dark:bg-zinc-900/90 backdrop-blur-md border border-white/40 px-5 py-4 rounded-2xl rounded-tl-sm shadow-sm h-12 flex items-center">
                <AILoadingBubble />
              </div>
            </div>
          )}
          <div className="h-4" />
        </div>

        {/* Input */}
        <div className="p-6 bg-transparent shrink-0 z-20">
          <div
            className={cn(
              "mx-auto relative transition-all duration-300",
              showPreview ? "max-w-full" : "max-w-3xl"
            )}
          >
            <div className="group relative">
              {/* Glow Effect Intense */}
              <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-full opacity-20 group-hover:opacity-60 transition duration-700 blur-md group-focus-within:opacity-100 group-focus-within:blur-lg"></div>

              <div className="relative flex items-center bg-white/90 dark:bg-black/90 backdrop-blur-xl rounded-full p-2 ring-1 ring-white/50 dark:ring-white/10 shadow-xl">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    !isGenerating &&
                    !isSaving &&
                    handleGenerateCourse()
                  }
                  placeholder="Describe your dream course (e.g. 'Advanced React Patterns in 2024')..."
                  disabled={isGenerating || isSaving}
                  className="flex-1 border-0 focus-visible:ring-0 bg-transparent px-5 py-3 h-auto text-base shadow-none placeholder:text-muted-foreground/50"
                />
                <Button
                  onClick={handleGenerateCourse}
                  disabled={isGenerating || isSaving || !inputValue.trim()}
                  size="icon"
                  className={cn(
                    "rounded-full w-11 h-11 shrink-0 transition-all duration-300 ml-2",
                    inputValue.trim()
                      ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30 scale-100"
                      : "bg-zinc-100 text-zinc-400 scale-90"
                  )}
                >
                  {isGenerating ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5 ml-0.5" />
                  )}
                </Button>
              </div>
            </div>
            <p className="text-center text-[11px] text-muted-foreground/70 mt-4 flex items-center justify-center gap-1.5 font-medium tracking-wide">
              <Sparkles className="w-3 h-3 text-indigo-500" /> AI Architect by
              LH Pro
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: PREVIEW */}
      <div
        className={cn(
          "bg-white/95 dark:bg-zinc-950/95 backdrop-blur-2xl border-l border-white/20 shadow-[0_0_50px_rgba(0,0,0,0.1)] transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) absolute right-0 top-0 h-full z-30 flex flex-col",
          showPreview
            ? "w-1/2 translate-x-0 opacity-100"
            : "w-1/2 translate-x-[20%] opacity-0 pointer-events-none"
        )}
      >
        {generatedCourse && (
          <>
            <div className="flex-1 overflow-y-auto custom-scrollbar relative">
              <div className="absolute top-4 right-4 z-50">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition-all hover:scale-110"
                  onClick={() => setShowPreview(false)}
                >
                  {" "}
                  <X className="h-5 w-5" />{" "}
                </Button>
              </div>

              <div className="relative w-full aspect-video bg-zinc-900 shrink-0 group">
                {generatedCourse.thumbnail ? (
                  <Image
                    src={generatedCourse.thumbnail}
                    alt={generatedCourse.title}
                    fill
                    className="object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-8 w-full transform transition-transform duration-500 group-hover:translate-y-[-5px]">
                  <div className="flex gap-2 mb-3">
                    <Badge className="bg-indigo-600 hover:bg-indigo-700 text-white border-0 shadow-lg shadow-indigo-900/20">
                      {generatedCourse.level}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="text-white border-white/20 bg-white/10 backdrop-blur-md"
                    >
                      AI Generated
                    </Badge>
                  </div>
                  <h2 className="text-3xl font-bold text-white leading-tight drop-shadow-md">
                    {generatedCourse.title}
                  </h2>
                </div>
              </div>

              <div className="p-8 space-y-8">
                <div className="flex items-center gap-6 pb-6 border-b border-dashed border-border/60">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 rounded-lg">
                      <Layers className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-lg">
                        {generatedCourse.chapters.length}
                      </span>
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                        Chapters
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <FileVideo className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-lg">
                        {getTotalLessons(generatedCourse)}
                      </span>
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                        Lessons
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-50 rounded-lg">
                      <Clock className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-lg">
                        {getTotalDuration(generatedCourse)}
                      </span>
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                        Minutes
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-2xl p-6 border border-emerald-100/50 dark:border-emerald-900/50 shadow-sm">
                  <h3 className="font-bold flex items-center gap-2 mb-4 text-emerald-800 dark:text-emerald-400 text-lg">
                    <GraduationCap className="w-6 h-6" /> What you will master
                  </h3>
                  <div className="grid gap-3">
                    {generatedCourse.whatYouWillLearn.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 group/item"
                      >
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-500 shrink-0 mt-0.5 group-hover/item:scale-110 transition-transform" />
                        <span className="text-sm text-emerald-900/90 dark:text-emerald-100/90 leading-relaxed font-medium">
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 pb-4">
                  <h3 className="font-bold flex items-center gap-2 text-lg">
                    <BookOpen className="w-6 h-6 text-indigo-600" /> Curriculum
                  </h3>
                  <div className="flex flex-col gap-3">
                    {generatedCourse.chapters.map((chapter, idx) => (
                      <div
                        key={idx}
                        className="border border-border/50 rounded-xl overflow-hidden bg-white dark:bg-zinc-900/50 shadow-sm hover:shadow-md transition-shadow duration-300"
                      >
                        <button
                          onClick={() => toggleChapter(idx)}
                          className="flex w-full items-center justify-between p-5 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors text-left group"
                        >
                          <div className="flex items-center gap-4">
                            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-sm font-bold text-zinc-500 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                              {String(idx + 1).padStart(2, "0")}
                            </span>
                            <span className="font-semibold text-base">
                              {chapter.title}
                            </span>
                          </div>
                          {expandedChapters.has(idx) ? (
                            <ChevronDown className="w-5 h-5 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-muted-foreground" />
                          )}
                        </button>
                        {expandedChapters.has(idx) && (
                          <div className="bg-zinc-50/50 dark:bg-zinc-900/30 border-t border-border/50">
                            {chapter.lessons.map((lesson, lIdx) => (
                              <div
                                key={lIdx}
                                className="py-3.5 px-6 pl-[4.5rem] flex items-center justify-between border-b last:border-0 border-border/40 hover:bg-white dark:hover:bg-zinc-900 transition-colors cursor-pointer group/lesson"
                              >
                                <div className="flex items-center gap-3 text-sm text-foreground/80">
                                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-300 group-hover/lesson:bg-indigo-500 transition-colors"></div>
                                  <span>{lesson.title}</span>
                                </div>
                                {lesson.duration && (
                                  <span className="text-xs text-muted-foreground font-medium bg-white dark:bg-zinc-800 px-2 py-1 rounded border border-border/50">
                                    {lesson.duration}m
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-border/40 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md shrink-0 flex gap-4 z-40">
              <Button
                variant="outline"
                className="flex-1 h-12 text-base font-medium border-zinc-300 hover:bg-zinc-100"
                onClick={() => {
                  setGeneratedCourse(null);
                  setShowPreview(false);
                }}
                disabled={isSaving || isSuccess}
              >
                {" "}
                Discard Draft{" "}
              </Button>

              <Button
                onClick={handleSaveCourse}
                className={cn(
                  "flex-[2] h-12 text-base font-medium shadow-xl shadow-indigo-500/20 transition-all duration-500",
                  isSuccess
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white ring-4 ring-emerald-100"
                    : "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white hover:scale-[1.02]"
                )}
                disabled={isSaving || isSuccess}
              >
                {isSaving ? (
                  <>
                    {" "}
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />{" "}
                    Publishing...{" "}
                  </>
                ) : isSuccess ? (
                  <>
                    {" "}
                    <CheckCircle2 className="w-5 h-5 mr-2 animate-bounce" />{" "}
                    Published Successfully!{" "}
                  </>
                ) : (
                  <>
                    {" "}
                    <Save className="w-5 h-5 mr-2" /> Save & Publish Course{" "}
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AICourseGenerator;
