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
  Edit3,
  RefreshCw,
  MessageSquare,
  PenLine,
  Plus,
  History,
  Trash2,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { aiGenerateCourse, aiRefineCourse, aiSaveCourse } from "@/services/ai.service";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CourseLevel, CourseStatus } from "@/services/course.service";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";
import { formatDistanceToNow } from "date-fns";

// --- TYPES ---
type MessageType = "user" | "assistant" | "system";

interface Message {
  id: string;
  type: MessageType;
  content: string;
  timestamp: Date;
  isRefinement?: boolean;
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

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  generatedCourse: CourseData | null;
  createdAt: Date;
  updatedAt: Date;
}

// --- HELPER FUNCTIONS ---
const generateSessionId = () => `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

const getSessionTitle = (messages: Message[], course: CourseData | null): string => {
  if (course?.title) return course.title;
  const userMessage = messages.find(m => m.type === "user");
  if (userMessage) {
    return userMessage.content.slice(0, 40) + (userMessage.content.length > 40 ? "..." : "");
  }
  return "New Chat";
};

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

const UserAvatar = ({ avatar }: { avatar?: string | null }) => (
  <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 shadow-sm ring-2 ring-purple-100 z-10 overflow-hidden">
    {avatar ? (
      <img src={avatar} alt="User" className="w-full h-full object-cover" />
    ) : (
      <User className="w-4 h-4 text-zinc-400" />
    )}
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

// Editable Field Component
const EditableField = ({
  value,
  onChange,
  label,
  multiline = false,
  className = "",
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  multiline?: boolean;
  className?: string;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleSave = () => {
    onChange(editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className={cn("relative", className)}>
        {multiline ? (
          <Textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="min-h-[100px] resize-none"
            autoFocus
          />
        ) : (
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            autoFocus
          />
        )}
        <div className="flex gap-2 mt-2">
          <Button size="sm" onClick={handleSave}>Save</Button>
          <Button size="sm" variant="ghost" onClick={handleCancel}>Cancel</Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group cursor-pointer hover:bg-muted/50 p-2 -m-2 rounded-lg transition-colors relative",
        className
      )}
      onClick={() => setIsEditing(true)}
    >
      <span>{value}</span>
      <PenLine className="w-3 h-3 absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-muted-foreground transition-opacity" />
    </div>
  );
};

// Chat History Sidebar Item
const ChatHistoryItem = ({
  session,
  isActive,
  onSelect,
  onDelete,
}: {
  session: ChatSession;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) => {
  return (
    <div
      className={cn(
        "group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all",
        isActive
          ? "bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800"
          : "hover:bg-muted/50 border border-transparent"
      )}
      onClick={onSelect}
    >
      <div className="flex-1 min-w-0">
        <p className={cn(
          "text-sm font-medium truncate max-w-[280px]",
          isActive ? "text-indigo-700 dark:text-indigo-300" : "text-foreground"
        )} title={session.title}>
          {session.title}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {formatDistanceToNow(new Date(session.updatedAt), { addSuffix: true })}
        </p>
        {session.generatedCourse && (
          <Badge variant="outline" className="mt-1 text-[10px] h-5">
            {session.generatedCourse.chapters.length} chapters
          </Badge>
        )}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

const AICourseGenerator = () => {
  const router = useRouter();
  const { user } = useAuth();

  // --- STATE ---
  const getStorageKey = (suffix: string) => {
    const userId = user?.id || "guest";
    return `ai_course_${userId}_${suffix}`;
  };

  // Load all sessions from localStorage
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(getStorageKey("sessions"));
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // Properly convert date strings back to Date objects
          return parsed.map((session: any) => ({
            ...session,
            createdAt: new Date(session.createdAt),
            updatedAt: new Date(session.updatedAt),
            messages: session.messages.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp),
            })),
          }));
        } catch (e) {
          console.error("Error loading sessions:", e);
        }
      }
    }
    return [];
  });

  const [activeSessionId, setActiveSessionId] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(getStorageKey("activeSession"));
      return saved || null;
    }
    return null;
  });

  const [inputValue, setInputValue] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [editingChapter, setEditingChapter] = useState<number | null>(null);
  const [editingLesson, setEditingLesson] = useState<{ chapter: number; lesson: number } | null>(null);
  const [expandedChapters, setExpandedChapters] = useState<Set<number>>(new Set());

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get active session
  const activeSession = sessions.find(s => s.id === activeSessionId);
  const messages = activeSession?.messages || [
    {
      id: "1",
      type: "assistant" as MessageType,
      content: "Hello! I'm your AI Course Architect. What topic would you like to create a course about today?",
      timestamp: new Date(),
    },
  ];
  const generatedCourse = activeSession?.generatedCourse || null;

  // --- EFFECTS ---
  useEffect(() => {
    localStorage.setItem(getStorageKey("sessions"), JSON.stringify(sessions));
  }, [sessions, user?.id]);

  useEffect(() => {
    if (activeSessionId) {
      localStorage.setItem(getStorageKey("activeSession"), activeSessionId);
    } else {
      localStorage.removeItem(getStorageKey("activeSession"));
    }
  }, [activeSessionId, user?.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isGenerating, isRefining]);

  // --- FUNCTIONS ---
  const createNewSession = () => {
    const newSession: ChatSession = {
      id: generateSessionId(),
      title: "New Chat",
      messages: [
        {
          id: "1",
          type: "assistant",
          content: "Hello! I'm your AI Course Architect. What topic would you like to create a course about today?",
          timestamp: new Date(),
        },
      ],
      generatedCourse: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setShowPreview(false);
    setShowHistory(false);
    setExpandedChapters(new Set());
    toast.success("New chat created");
  };

  const deleteSession = (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    if (activeSessionId === sessionId) {
      const remaining = sessions.filter(s => s.id !== sessionId);
      setActiveSessionId(remaining.length > 0 ? remaining[0].id : null);
      setShowPreview(false);
    }
    toast.success("Chat deleted");
  };

  const updateActiveSession = (updates: Partial<ChatSession>) => {
    if (!activeSessionId) return;
    setSessions(prev => prev.map(s => {
      if (s.id === activeSessionId) {
        const updated = { ...s, ...updates, updatedAt: new Date() };
        // Update title based on content
        if (updates.messages || updates.generatedCourse) {
          updated.title = getSessionTitle(
            updates.messages || s.messages,
            updates.generatedCourse !== undefined ? updates.generatedCourse : s.generatedCourse
          );
        }
        return updated;
      }
      return s;
    }));
  };

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

  const addMessage = (content: string, type: MessageType, isRefinement = false) => {
    const newMessage: Message = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      type,
      content,
      timestamp: new Date(),
      isRefinement,
    };

    // If no active session, create one
    if (!activeSessionId) {
      const newSession: ChatSession = {
        id: generateSessionId(),
        title: "New Chat",
        messages: [
          {
            id: "1",
            type: "assistant",
            content: "Hello! I'm your AI Course Architect. What topic would you like to create a course about today?",
            timestamp: new Date(),
          },
          newMessage,
        ],
        generatedCourse: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setSessions(prev => [newSession, ...prev]);
      setActiveSessionId(newSession.id);
    } else {
      updateActiveSession({ messages: [...messages, newMessage] });
    }
  };

  const handleSubmit = async () => {
    if (!inputValue.trim()) return;
    const userInput = inputValue;
    setInputValue("");

    // Determine session and messages to use
    let sessionId = activeSessionId;
    let currentMessages: Message[] = [];
    let currentCourse: CourseData | null = null;

    // If no active session, create one first
    if (!sessionId) {
      const newSession: ChatSession = {
        id: generateSessionId(),
        title: userInput.slice(0, 40) + (userInput.length > 40 ? "..." : ""),
        messages: [
          {
            id: "1",
            type: "assistant",
            content: "Hello! I'm your AI Course Architect. What topic would you like to create a course about today?",
            timestamp: new Date(),
          },
        ],
        generatedCourse: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      sessionId = newSession.id;
      currentMessages = newSession.messages;
      currentCourse = null;

      setSessions(prev => [newSession, ...prev]);
      setActiveSessionId(newSession.id);
    } else {
      // Use existing session data
      const existingSession = sessions.find(s => s.id === sessionId);
      currentMessages = existingSession?.messages || messages;
      currentCourse = existingSession?.generatedCourse || null;
    }

    // Create user message
    const userMessage: Message = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      type: "user",
      content: userInput,
      timestamp: new Date(),
      isRefinement: !!currentCourse,
    };

    const updatedMessages = [...currentMessages, userMessage];

    // Update session with user message immediately
    setSessions(prev => prev.map(s => {
      if (s.id === sessionId) {
        return {
          ...s,
          messages: updatedMessages,
          updatedAt: new Date(),
          title: getSessionTitle(updatedMessages, s.generatedCourse),
        };
      }
      return s;
    }));

    // If we have a generated course, treat this as a refinement request
    if (currentCourse) {
      setIsRefining(true);

      try {
        const response = await aiRefineCourse(currentCourse, userInput);
        if (response && response.success && response.data) {
          const refinedCourse = response.data as CourseData;
          const assistantMessage: Message = {
            id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            type: "assistant",
            content: `✅ Course updated based on your feedback!\n\nChanges applied to "${refinedCourse.title}".\n\nFeel free to ask for more changes or click "Save & Publish" when you're satisfied.`,
            timestamp: new Date(),
            isRefinement: true,
          };

          setSessions(prev => prev.map(s => {
            if (s.id === sessionId) {
              return {
                ...s,
                messages: [...updatedMessages, assistantMessage],
                generatedCourse: refinedCourse,
                updatedAt: new Date(),
                title: refinedCourse.title,
              };
            }
            return s;
          }));
          toast.success("Course refined successfully");
        } else {
          throw new Error("Failed to refine course");
        }
      } catch (error: any) {
        const errorMessage =
          error?.response?.data?.message || error?.message || "Connection Error";
        const errorMsg: Message = {
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          type: "assistant",
          content: `❌ ${errorMessage}. Please try again.`,
          timestamp: new Date(),
        };

        setSessions(prev => prev.map(s => {
          if (s.id === sessionId) {
            return {
              ...s,
              messages: [...updatedMessages, errorMsg],
              updatedAt: new Date(),
            };
          }
          return s;
        }));
        toast.error(errorMessage);
      } finally {
        setIsRefining(false);
      }
    } else {
      // No course yet, generate a new one
      setIsGenerating(true);

      try {
        const response = await aiGenerateCourse(userInput);
        if (response && response.success && response.data) {
          const courseData = response.data as CourseData;
          const assistantMessage: Message = {
            id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            type: "assistant",
            content: `✅ Course Generated: "${courseData.title}".\nIt includes ${courseData.chapters.length} chapters and ${courseData.chapters.reduce((acc, ch) => acc + ch.lessons.length, 0)} lessons.\n\n💡 You can now:\n• Click "Preview" to see the details\n• Type feedback to refine the course (e.g. "Add more advanced topics" or "Make it shorter")\n• Edit directly in the preview panel`,
            timestamp: new Date(),
          };

          setSessions(prev => prev.map(s => {
            if (s.id === sessionId) {
              return {
                ...s,
                messages: [...updatedMessages, assistantMessage],
                generatedCourse: courseData,
                updatedAt: new Date(),
                title: courseData.title,
              };
            }
            return s;
          }));
          toast.success("Course generated successfully");
        } else {
          throw new Error("Failed to generate course");
        }
      } catch (error: any) {
        const errorMessage =
          error?.response?.data?.message || error?.message || "Connection Error";
        const errorMsg: Message = {
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          type: "assistant",
          content: `❌ ${errorMessage}. Please try again.`,
          timestamp: new Date(),
        };

        setSessions(prev => prev.map(s => {
          if (s.id === sessionId) {
            return {
              ...s,
              messages: [...updatedMessages, errorMsg],
              updatedAt: new Date(),
            };
          }
          return s;
        }));
        toast.error(errorMessage);
      } finally {
        setIsGenerating(false);
      }
    }
  };

  const handleSaveCourse = async () => {
    if (!generatedCourse) return;

    const systemMsg: Message = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      type: "system",
      content: "Saving course to system...",
      timestamp: new Date(),
    };
    updateActiveSession({ messages: [...messages, systemMsg] });
    setIsSaving(true);

    try {
      const response = await aiSaveCourse(generatedCourse);

      setIsSuccess(true);
      triggerFireworks();

      const successMsg: Message = {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        type: "assistant",
        content: `🎉 Saved successfully! You can find it in your Dashboard.`,
        timestamp: new Date(),
      };
      updateActiveSession({ messages: [...messages, systemMsg, successMsg] });
      toast.success("Course saved successfully!");

      setTimeout(() => {
        // Remove the session after saving
        deleteSession(activeSessionId!);
        router.push("/dashboard/courses");
      }, 2500);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Error saving course";
      const errorMsg: Message = {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        type: "assistant",
        content: `❌ Error: ${errorMessage}`,
        timestamp: new Date(),
      };
      updateActiveSession({ messages: [...messages, systemMsg, errorMsg] });
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

  // Update course field directly
  const updateCourseField = (field: keyof CourseData, value: any) => {
    if (!generatedCourse) return;
    updateActiveSession({ generatedCourse: { ...generatedCourse, [field]: value } });
  };

  // Update chapter title
  const updateChapterTitle = (chapterIndex: number, title: string) => {
    if (!generatedCourse) return;
    const newChapters = [...generatedCourse.chapters];
    newChapters[chapterIndex] = { ...newChapters[chapterIndex], title };
    updateActiveSession({ generatedCourse: { ...generatedCourse, chapters: newChapters } });
    setEditingChapter(null);
  };

  // Update lesson
  const updateLesson = (chapterIndex: number, lessonIndex: number, updates: Partial<Lesson>) => {
    if (!generatedCourse) return;
    const newChapters = [...generatedCourse.chapters];
    const newLessons = [...newChapters[chapterIndex].lessons];
    newLessons[lessonIndex] = { ...newLessons[lessonIndex], ...updates };
    newChapters[chapterIndex] = { ...newChapters[chapterIndex], lessons: newLessons };
    updateActiveSession({ generatedCourse: { ...generatedCourse, chapters: newChapters } });
    setEditingLesson(null);
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

      {/* 1. PROFESSIONAL ANIMATED BACKGROUND - Full width */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute inset-0 z-0 bg-noise opacity-[0.4] mix-blend-soft-light"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob dark:mix-blend-normal dark:bg-purple-900/40"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000 dark:mix-blend-normal dark:bg-indigo-900/40"></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000 dark:mix-blend-normal dark:bg-blue-900/40"></div>
        <div className="absolute inset-0 bg-white/50 dark:bg-black/50 backdrop-blur-[100px]"></div>
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
                {generatedCourse ? "Refine your course with AI" : "Powered by Advanced LLM"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* New Chat Button */}
            <Button
              onClick={createNewSession}
              variant="outline"
              size="sm"
              className="h-9 text-xs gap-2 bg-white/50 border-white/40 hover:bg-white/80 dark:bg-black/20 dark:hover:bg-black/40"
            >
              <Plus className="w-3.5 h-3.5" /> New Chat
            </Button>

            {/* Chat History Sheet */}
            <Sheet open={showHistory} onOpenChange={setShowHistory}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 text-xs gap-2 bg-white/50 border-white/40 hover:bg-white/80 dark:bg-black/20 dark:hover:bg-black/40"
                >
                  <History className="w-3.5 h-3.5" />
                  History
                  {sessions.length > 0 && (
                    <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                      {sessions.length}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[350px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <History className="w-5 h-5" />
                    Chat History
                  </SheetTitle>
                  <SheetDescription>
                    Your previous course generation sessions
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6 px-1">
                  <Button
                    onClick={createNewSession}
                    className="w-full gap-2 mb-4"
                  >
                    <Plus className="w-4 h-4" />
                    Start New Chat
                  </Button>
                  <ScrollArea className="h-[calc(100vh-220px)]">
                    <div className="space-y-2 pr-4">
                      {sessions.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p className="text-sm">No previous chats</p>
                          <p className="text-xs mt-1">Start a new conversation above</p>
                        </div>
                      ) : (
                        sessions.map((session) => (
                          <ChatHistoryItem
                            key={session.id}
                            session={session}
                            isActive={session.id === activeSessionId}
                            onSelect={() => {
                              setActiveSessionId(session.id);
                              setShowHistory(false);
                              setShowPreview(false);
                              setExpandedChapters(new Set());
                            }}
                            onDelete={() => deleteSession(session.id)}
                          />
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </SheetContent>
            </Sheet>

            {generatedCourse && (
              <Badge variant="outline" className="gap-1 text-xs bg-indigo-50 border-indigo-200 text-indigo-700">
                <MessageSquare className="w-3 h-3" />
                Conversational Mode
              </Badge>
            )}
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
                    ? message.isRefinement
                      ? "bg-gradient-to-br from-violet-600 to-purple-600 text-white rounded-2xl rounded-tr-sm shadow-purple-500/20"
                      : "bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-2xl rounded-tr-sm shadow-indigo-500/20"
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

                {message.isRefinement && message.type === "user" && (
                  <div className="flex items-center gap-1 text-xs text-white/70 mb-1">
                    <RefreshCw className="w-3 h-3" />
                    Refinement request
                  </div>
                )}

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
              {message.type === "user" && <UserAvatar avatar={user?.avatar} />}
            </div>
          ))}

          {(isGenerating || isRefining) && (
            <div className="flex gap-4 w-full justify-start animate-in fade-in">
              <AIAvatar />
              <div className="bg-white/80 dark:bg-zinc-900/90 backdrop-blur-md border border-white/40 px-5 py-4 rounded-2xl rounded-tl-sm shadow-sm h-12 flex items-center gap-3">
                <AILoadingBubble />
                <span className="text-sm text-muted-foreground">
                  {isRefining ? "Refining course..." : "Generating course..."}
                </span>
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
              <div className={cn(
                "absolute -inset-1 rounded-full opacity-20 group-hover:opacity-60 transition duration-700 blur-md group-focus-within:opacity-100 group-focus-within:blur-lg",
                generatedCourse
                  ? "bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500"
                  : "bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500"
              )}></div>

              <div className="relative flex items-center bg-white/90 dark:bg-black/90 backdrop-blur-xl rounded-full p-2 ring-1 ring-white/50 dark:ring-white/10 shadow-xl">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    !isGenerating &&
                    !isRefining &&
                    !isSaving &&
                    handleSubmit()
                  }
                  placeholder={
                    generatedCourse
                      ? "Ask for changes (e.g. 'Add more practical examples' or 'Make chapter 2 shorter')..."
                      : "Describe your dream course (e.g. 'Advanced React Patterns in 2024')..."
                  }
                  disabled={isGenerating || isRefining || isSaving}
                  className="flex-1 border-0 focus-visible:ring-0 bg-transparent px-5 py-3 h-auto text-base shadow-none placeholder:text-muted-foreground/50"
                />
                <Button
                  onClick={handleSubmit}
                  disabled={isGenerating || isRefining || isSaving || !inputValue.trim()}
                  size="icon"
                  className={cn(
                    "rounded-full w-11 h-11 shrink-0 transition-all duration-300 ml-2",
                    inputValue.trim()
                      ? generatedCourse
                        ? "bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-500/30 scale-100"
                        : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30 scale-100"
                      : "bg-muted text-muted-foreground scale-90"
                  )}
                >
                  {isGenerating || isRefining ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : generatedCourse ? (
                    <RefreshCw className="h-5 w-5" />
                  ) : (
                    <Send className="h-5 w-5 ml-0.5" />
                  )}
                </Button>
              </div>
            </div>
            <p className="text-center text-[11px] text-muted-foreground/70 mt-4 flex items-center justify-center gap-1.5 font-medium tracking-wide">
              <Sparkles className="w-3 h-3 text-indigo-500" />
              {generatedCourse ? "Keep chatting to refine your course" : "AI Architect by LH Pro"}
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
                  <X className="h-5 w-5" />
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
                    <Badge
                      variant="outline"
                      className="text-white border-emerald-400/30 bg-emerald-500/20 backdrop-blur-md gap-1"
                    >
                      <Edit3 className="w-3 h-3" />
                      Editable
                    </Badge>
                  </div>
                  <EditableField
                    value={generatedCourse.title}
                    onChange={(value) => updateCourseField("title", value)}
                    label="Title"
                    className="text-3xl font-bold text-white leading-tight drop-shadow-md"
                  />
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

                {/* Description - Editable */}
                <div className="space-y-2">
                  <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider">Description</h3>
                  <EditableField
                    value={generatedCourse.description}
                    onChange={(value) => updateCourseField("description", value)}
                    label="Description"
                    multiline
                    className="text-sm text-foreground/80"
                  />
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
                    <span className="text-xs text-muted-foreground font-normal ml-2">(Click to edit)</span>
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
                            {editingChapter === idx ? (
                              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                <Input
                                  defaultValue={chapter.title}
                                  className="h-8 text-sm"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      updateChapterTitle(idx, (e.target as HTMLInputElement).value);
                                    }
                                    if (e.key === "Escape") {
                                      setEditingChapter(null);
                                    }
                                  }}
                                  onBlur={(e) => updateChapterTitle(idx, e.target.value)}
                                />
                              </div>
                            ) : (
                              <span
                                className="font-semibold text-base hover:text-indigo-600 transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingChapter(idx);
                                }}
                              >
                                {chapter.title}
                              </span>
                            )}
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
                                onClick={() => setEditingLesson({ chapter: idx, lesson: lIdx })}
                              >
                                <div className="flex items-center gap-3 text-sm text-foreground/80 flex-1">
                                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-300 group-hover/lesson:bg-indigo-500 transition-colors"></div>
                                  {editingLesson?.chapter === idx && editingLesson?.lesson === lIdx ? (
                                    <Input
                                      defaultValue={lesson.title}
                                      className="h-7 text-sm flex-1"
                                      autoFocus
                                      onClick={(e) => e.stopPropagation()}
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                          updateLesson(idx, lIdx, { title: (e.target as HTMLInputElement).value });
                                        }
                                        if (e.key === "Escape") {
                                          setEditingLesson(null);
                                        }
                                      }}
                                      onBlur={(e) => updateLesson(idx, lIdx, { title: e.target.value })}
                                    />
                                  ) : (
                                    <span className="group-hover/lesson:text-indigo-600 transition-colors">{lesson.title}</span>
                                  )}
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
                  updateActiveSession({ generatedCourse: null });
                  setShowPreview(false);
                }}
                disabled={isSaving || isSuccess}
              >
                Discard Draft
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
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Publishing...
                  </>
                ) : isSuccess ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 mr-2 animate-bounce" />
                    Published Successfully!
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" /> Save & Publish Course
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
