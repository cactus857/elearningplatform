"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Sparkles,
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { aiGenerateCourse } from "@/services/ai.service";

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
  level: string;
  smallDescription: string;
  category: string;
  duration: number;
  whatYouWillLearn: string[];
  requirements: string[];
  chapters: Chapter[];
  status: string;
}

interface Chapter {
  title: string;
  position: number;
  lessons: Lesson[];
}

interface Lesson {
  title: string;
  position: number;
  videoUrl: string;
  duration: number;
  content: string;
}

const STORAGE_KEY = "chat_history";

const AICourseGenerator = () => {
  // 1. Load messages from LocalStorage on initial render
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          // Parse date strings back to Date objects
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
  const [generatedCourse, setGeneratedCourse] = useState<CourseData | null>(
    null
  );
  const [expandedChapters, setExpandedChapters] = useState<Set<number>>(
    new Set()
  );
  const [showPreview, setShowPreview] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 2. Save messages to LocalStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const addMessage = (content: string, type: MessageType) => {
    const newMessage: Message = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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

    addMessage(
      "Đang kết nối với AI để tạo khóa học... Quá trình này có thể mất vài phút.",
      "system"
    );

    try {
      // 3. Call Real API
      const response: any = await aiGenerateCourse(userInput);

      // response = { success: true, data: { ... } }
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
      } else {
        throw new Error("Không thể tạo khóa học");
      }
    } catch (error) {
      console.error("Generate Course Error:", error);
      addMessage(
        "❌ Rất xin lỗi, đã có lỗi xảy ra trong quá trình tạo khóa học. Vui lòng kiểm tra lại kết nối hoặc thử lại với một chủ đề khác cụ thể hơn.",
        "assistant"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveCourse = async () => {
    if (!generatedCourse) return;

    addMessage("Đang lưu khóa học vào hệ thống...", "system");

    setTimeout(() => {
      addMessage(
        "✅ Đã lưu khóa học thành công! Bạn có thể tìm thấy nó trong danh sách khóa học của mình.",
        "assistant"
      );
      setGeneratedCourse(null);
      setShowPreview(false);
    }, 1500);
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
        acc + ch.lessons.reduce((sum, lesson) => sum + lesson.duration, 0),
      0
    );
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Main Chat Area */}
      <div
        className={`flex flex-col ${
          showPreview ? "w-1/2" : "w-full"
        } transition-all duration-300`}
      >
        {/* Header */}
        <div className="border-b bg-card/50 backdrop-blur-sm">
          <div className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
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
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="mx-2 max-w-3xl space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.type === "assistant" && (
                  <div className="mr-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                )}

                {message.type === "assistant" &&
                  message.content.startsWith("❌") && (
                    <div className="mr-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                      <AlertCircle className="h-4 w-4 text-destructive" />
                    </div>
                  )}

                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.type === "user"
                      ? "bg-primary text-primary-foreground"
                      : message.type === "system"
                      ? "bg-muted/50 text-muted-foreground italic"
                      : message.content.startsWith("❌")
                      ? "bg-destructive/10 text-destructive-foreground"
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
                  <div className="ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary">
                    <span className="text-sm font-semibold text-primary-foreground">
                      U
                    </span>
                  </div>
                )}
              </div>
            ))}

            {isGenerating && (
              <div className="flex items-start gap-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                </div>
                <div className="rounded-2xl bg-muted px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">
                      AI đang suy nghĩ và viết nội dung...
                    </span>
                  </div>
                </div>
              </div>
            )}

            {generatedCourse && !showPreview && (
              <div className="flex justify-center gap-3">
                <Button onClick={() => setShowPreview(true)} className="gap-2">
                  <Eye className="h-4 w-4" />
                  Xem trước khóa học
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t bg-card/50 backdrop-blur-sm p-4">
          <div className="mx-auto max-w-3xl">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && !isGenerating && handleGenerateCourse()
                }
                placeholder="Nhập chủ đề khóa học (VD: Preact for Beginners)..."
                disabled={isGenerating}
                className="flex-1"
              />
              <Button
                onClick={handleGenerateCourse}
                disabled={isGenerating || !inputValue.trim()}
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

      {showPreview && generatedCourse && (
        <div className="w-1/2 border-l bg-background">
          <div className="flex h-full flex-col">
            {/* Preview Header */}
            <div className="border-b bg-card/50 backdrop-blur-sm p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold">Preview Khóa học</h2>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPreview(false)}
                >
                  <XCircle className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Preview Content */}
            <ScrollArea className="flex-1">
              <div className="p-6 space-y-6">
                {/* Course Header */}
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
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
                    <CardTitle className="text-lg">
                      Bạn sẽ học được gì
                    </CardTitle>
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
                              <div className="font-semibold">
                                {chapter.title}
                              </div>
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
                                  <span className="text-sm">
                                    {lesson.title}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  <span>{lesson.duration} phút</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>

            {/* Preview Footer */}
            <div className="border-t bg-card/50 backdrop-blur-sm p-4">
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
                >
                  Hủy
                </Button>
                <Button onClick={handleSaveCourse} className="flex-1 gap-2">
                  <Save className="h-4 w-4" />
                  Lưu khóa học
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AICourseGenerator;
