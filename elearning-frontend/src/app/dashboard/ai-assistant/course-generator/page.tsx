"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  BotMessageSquare,
  BookOpen,
  Eye,
  Save,
  Loader2,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronRight,
  Play,
  Clock,
  AlertCircle,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { aiGenerateCourse, aiSaveCourse } from "@/services/ai.service";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CourseLevel, CourseStatus } from "@/services/course.service";
import { useAuth } from "@/hooks/use-auth";

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

const getStorageKey = (userId: string | undefined, baseKey: string) => {
  return userId ? `${baseKey}_${userId}` : `${baseKey}_guest`;
};
const BASE_CHAT_KEY = "chat_history";
const BASE_COURSE_KEY = "generated_course";

// Loading dots animation component
const LoadingDots = () => {
  return (
    <div className="flex gap-1">
      <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
      <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
      <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
    </div>
  );
};

const AICourseGenerator = () => {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window !== "undefined") {
      const storageKey = getStorageKey(user?.id, BASE_CHAT_KEY);
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          return JSON.parse(saved, (key, value) =>
            key === "timestamp" ? new Date(value) : value
          );
        } catch (e) {
          console.error("Failed to parse chat history", e);
        }
      }
    }
    return [
      {
        id: "1",
        type: "assistant",
        content:
          "Xin chào! Tôi là AI Assistant, tôi có thể giúp bạn tạo khóa học chuyên nghiệp. Bạn muốn tạo khóa học về chủ đề gì?",
        timestamp: new Date(),
      },
    ];
  });

  const [inputValue, setInputValue] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [generatedCourse, setGeneratedCourse] = useState<CourseData | null>(
    () => {
      if (typeof window !== "undefined") {
        const storageKey = getStorageKey(user?.id, BASE_COURSE_KEY);
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          try {
            return JSON.parse(saved);
          } catch (e) {
            console.error("Failed to parse generated course", e);
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

  useEffect(() => {
    const storageKey = getStorageKey(user?.id, BASE_CHAT_KEY);
    localStorage.setItem(storageKey, JSON.stringify(messages));
  }, [messages, user?.id]);

  useEffect(() => {
    const storageKey = getStorageKey(user?.id, BASE_COURSE_KEY);
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

  const addMessage = (content: string, type: MessageType) => {
    const newMessage: Message = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      type,
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
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
          `✅ Đã tạo xong khóa học "${courseData.title}"!\n\nKhóa học bao gồm ${
            courseData.chapters.length
          } chương với tổng cộng ${courseData.chapters.reduce(
            (acc, ch) => acc + ch.lessons.length,
            0
          )} bài học.\n\nBạn có muốn xem trước (Preview) khóa học không?`,
          "assistant"
        );

        toast.success("Khóa học đã được tạo thành công");
      } else {
        throw new Error("Không thể tạo khóa học");
      }
    } catch (error: any) {
      console.error("Generate Course Error:", error);

      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Đã có lỗi xảy ra trong quá trình tạo khóa học";

      addMessage(
        `❌ Rất xin lỗi, ${errorMessage}. Vui lòng kiểm tra lại kết nối hoặc thử lại với một chủ đề khác cụ thể hơn.`,
        "assistant"
      );

      toast.error("Lỗi", {
        description: errorMessage,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveCourse = async () => {
    if (!generatedCourse) return;

    addMessage("Đang lưu khóa học vào hệ thống...", "system");
    setIsSaving(true);

    try {
      const response = await aiSaveCourse(generatedCourse);

      addMessage(
        `✅ Đã lưu khóa học thành công! Khóa học của bạn có ID: ${response.courseId}.\n\nBạn có thể tìm thấy nó trong danh sách khóa học của mình.`,
        "assistant"
      );

      toast.success("Thành công", {
        description: response.message || "Khóa học đã được lưu thành công",
      });

      // Clear generated course from state and localStorage
      setGeneratedCourse(null);
      setShowPreview(false);
      const courseStorageKey = getStorageKey(user?.id, BASE_COURSE_KEY);
      localStorage.removeItem(courseStorageKey);

      // Optional: Redirect to courses page after 2 seconds
      setTimeout(() => {
        router.push("/dashboard/courses");
      }, 2000);
    } catch (error: any) {
      console.error("Save Course Error:", error);

      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Không thể lưu khóa học";

      addMessage(`❌ Lỗi: ${errorMessage}. Vui lòng thử lại sau.`, "assistant");

      toast.error("Lỗi khi lưu khóa học", {
        description: errorMessage,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleChapter = (chapterIndex: number) => {
    const newExpanded = new Set(expandedChapters);
    if (newExpanded.has(chapterIndex)) {
      newExpanded.delete(chapterIndex);
    } else {
      newExpanded.add(chapterIndex);
    }
    setExpandedChapters(newExpanded);
  };

  const getTotalLessons = (course: CourseData) => {
    return course.chapters.reduce((acc, ch) => acc + ch.lessons.length, 0);
  };

  const getTotalDuration = (course: CourseData) => {
    return course.chapters.reduce(
      (acc, ch) =>
        acc +
        ch.lessons.reduce((sum, lesson) => sum + (lesson.duration || 0), 0),
      0
    );
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-background overflow-hidden">
      {/* Main Chat Area */}
      <div
        className={`flex flex-col ${
          showPreview ? "w-1/2" : "w-full"
        } transition-all duration-300`}
      >
        {/* Header */}
        <div className="border-b bg-card/50 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <BotMessageSquare className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">AI Course Generator</h1>
              <p className="text-sm text-muted-foreground">
                Tạo khóa học chuyên nghiệp với AI
              </p>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4" ref={scrollRef}>
          <div className="mx-auto max-w-3xl space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-2 ${
                  message.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.type === "assistant" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <BotMessageSquare className="h-4 w-4 text-primary" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    message.type === "user"
                      ? "bg-primary text-primary-foreground ml-auto"
                      : message.type === "system"
                      ? "bg-muted/50 text-muted-foreground italic"
                      : "bg-muted"
                  }`}
                >
                  <div className="whitespace-pre-wrap text-sm">
                    {message.content}
                  </div>
                  <div className="mt-1 text-xs opacity-60">
                    {new Date(message.timestamp).toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>

                {message.type === "user" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary">
                    <span className="text-sm font-semibold text-primary-foreground">
                      <User className="h-4 w-4" />
                    </span>
                  </div>
                )}
              </div>
            ))}

            {isGenerating && (
              <div className="flex items-start gap-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <BotMessageSquare className="h-4 w-4 text-primary" />
                </div>
                <div className="rounded-2xl bg-muted px-4 py-3">
                  <div className="flex flex-col gap-2">
                    <LoadingDots />
                    <span className="text-xs text-muted-foreground">
                      AI đang tạo khóa học, quá trình này có thể mất vài phút...
                    </span>
                  </div>
                </div>
              </div>
            )}

            {generatedCourse && (
              <div className="flex justify-center gap-3 pt-2">
                <Button
                  onClick={() => setShowPreview(true)}
                  className="gap-2"
                  disabled={isSaving}
                >
                  <Eye className="h-4 w-4" />
                  {showPreview ? "Đang xem preview" : "Xem trước khóa học"}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t bg-card/50 backdrop-blur-sm p-4 shrink-0">
          <div className="mx-auto max-w-3xl">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" &&
                  !isGenerating &&
                  !isSaving &&
                  handleGenerateCourse()
                }
                placeholder="Nhập chủ đề khóa học (VD: Preact for Beginners)..."
                disabled={isGenerating || isSaving}
                className="flex-1"
              />
              <Button
                onClick={handleGenerateCourse}
                disabled={isGenerating || isSaving || !inputValue.trim()}
                size="icon"
                className="shrink-0"
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Panel */}
      {showPreview && generatedCourse && (
        <div className="w-1/2 border-l bg-background flex flex-col">
          {/* Preview Header */}
          <div className="border-b bg-card/50 backdrop-blur-sm p-4 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Preview Khóa học</h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowPreview(false)}
                disabled={isSaving}
              >
                <XCircle className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Preview Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Course Header */}
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <CardTitle className="text-2xl mb-2">
                        {generatedCourse.title}
                      </CardTitle>
                      <CardDescription className="text-base">
                        {generatedCourse.smallDescription}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">{generatedCourse.level}</Badge>
                  </div>

                  {/* Thumbnail Image */}
                  {generatedCourse.thumbnail && (
                    <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-muted">
                      <Image
                        src={generatedCourse.thumbnail}
                        alt={generatedCourse.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                        quality={90}
                        priority={false}
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    </div>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      <span>{generatedCourse.chapters.length} chương</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Play className="h-4 w-4" />
                      <span>{getTotalLessons(generatedCourse)} bài học</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{getTotalDuration(generatedCourse)} phút</span>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="font-semibold mb-2">Mô tả</h4>
                    <p className="text-sm text-muted-foreground">
                      {generatedCourse.description}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* What You'll Learn */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Bạn sẽ học được gì</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {generatedCourse.whatYouWillLearn.map((item, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-sm"
                      >
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Requirements */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Yêu cầu</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {generatedCourse.requirements.map((item, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-sm"
                      >
                        <AlertCircle className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Chapters */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Nội dung khóa học</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {generatedCourse.chapters.map((chapter, chapterIndex) => (
                    <div key={chapterIndex} className="border rounded-lg">
                      <button
                        onClick={() => toggleChapter(chapterIndex)}
                        className="flex w-full items-center justify-between p-4 text-left hover:bg-accent transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {expandedChapters.has(chapterIndex) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                          <div>
                            <div className="font-semibold">{chapter.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {chapter.lessons.length} bài học
                            </div>
                          </div>
                        </div>
                      </button>

                      {expandedChapters.has(chapterIndex) && (
                        <div className="border-t bg-muted/30">
                          {chapter.lessons.map((lesson, lessonIndex) => (
                            <div
                              key={lessonIndex}
                              className="flex items-center justify-between p-4 pl-12 hover:bg-accent/50 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <Play className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{lesson.title}</span>
                              </div>
                              {lesson.duration && (
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  <span>{lesson.duration} phút</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Preview Footer */}
          <div className="border-t bg-card/50 backdrop-blur-sm p-4 shrink-0">
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowPreview(false);
                  setGeneratedCourse(null);
                  addMessage(
                    "Bạn có thể tạo khóa học mới bằng cách nhập chủ đề khác.",
                    "assistant"
                  );
                }}
                className="flex-1"
                disabled={isSaving}
              >
                Hủy
              </Button>
              <Button
                onClick={handleSaveCourse}
                className="flex-1 gap-2"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Lưu khóa học
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AICourseGenerator;
