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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

const AIQuizGenerator = () => {
  const [step, setStep] = useState<"select" | "configure" | "preview">(
    "select"
  );
  const [courses, setCourses] = useState<ICourseRes[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  // Configuration
  const [selectedCourse, setSelectedCourse] = useState<ICourseRes | null>(null);
  const [courseChapters, setCourseChapters] = useState<any[]>([]);
  const [selectedChapterIds, setSelectedChapterIds] = useState<string[]>([]);
  const [numberOfQuestions, setNumberOfQuestions] = useState(10);
  const [difficulty, setDifficulty] = useState<QuizDifficulty>("INTERMEDIATE");
  const [availableFrom, setAvailableFrom] = useState("");
  const [availableTo, setAvailableTo] = useState("");
  const [maxAttempts, setMaxAttempts] = useState<number | null>(3);

  // Generated Quiz
  const [generatedQuiz, setGeneratedQuiz] = useState<UIGeneratedQuiz | null>(
    null
  );
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(
    null
  );
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = await getAllCoursesBaseRole(1, 100);
      setCourses(response.data);
    } catch (error) {
      toast.error("Không thể tải danh sách khóa học");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseDetails = async (courseId: string) => {
    try {
      const courseDetail = await getCourseById(courseId);
      setCourseChapters(courseDetail.chapters || []);
      setSelectedChapterIds([]); // Reset selected chapters
    } catch (error) {
      toast.error("Không thể tải chi tiết khóa học");
      console.error(error);
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

  const selectAllChapters = () => {
    if (selectedChapterIds.length === courseChapters.length) {
      setSelectedChapterIds([]);
    } else {
      setSelectedChapterIds(courseChapters.map((ch) => ch.id));
    }
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
      toast.success("Quiz đã được tạo thành công!");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          "Không thể tạo quiz. Vui lòng thử lại."
      );
      console.error(error);
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

      toast.success("Quiz đã được lưu vào cơ sở dữ liệu!");

      // Reset flow
      setGeneratedQuiz(null);
      setSelectedCourse(null);
      setSelectedChapterIds([]);
      setAvailableFrom("");
      setAvailableTo("");
      setMaxAttempts(3);
      setStep("select");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Không thể lưu quiz");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const updateQuestion = (
    questionId: string,
    updates: Partial<UIQuizQuestion>
  ) => {
    if (!generatedQuiz) return;

    setGeneratedQuiz({
      ...generatedQuiz,
      questions: generatedQuiz.questions.map((q) =>
        q.id === questionId ? { ...q, ...updates } : q
      ),
    });
  };

  const deleteQuestion = (questionId: string) => {
    if (!generatedQuiz) return;

    setGeneratedQuiz({
      ...generatedQuiz,
      questions: generatedQuiz.questions.filter((q) => q.id !== questionId),
    });
    toast.success("Đã xóa câu hỏi");
  };

  const addNewQuestion = () => {
    if (!generatedQuiz) return;

    const newQuestion: UIQuizQuestion = {
      id: `q-${Date.now()}`,
      text: "Câu hỏi mới",
      options: ["Lựa chọn A", "Lựa chọn B", "Lựa chọn C", "Lựa chọn D"],
      correctAnswerIndex: 0,
      explanation: "Giải thích cho câu trả lời đúng...",
      difficulty: "MEDIUM",
      topic: "General",
    };

    setGeneratedQuiz({
      ...generatedQuiz,
      questions: [...generatedQuiz.questions, newQuestion],
    });
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index || !generatedQuiz)
      return;

    const newQuestions = [...generatedQuiz.questions];
    const draggedItem = newQuestions[draggedIndex];
    newQuestions.splice(draggedIndex, 1);
    newQuestions.splice(index, 0, draggedItem);

    setGeneratedQuiz({ ...generatedQuiz, questions: newQuestions });
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // STEP 1: SELECT COURSE
  if (step === "select") {
    return (
      <div className="flex flex-col h-[calc(100vh-4rem)] bg-background">
        <div className="border-b bg-card/50 backdrop-blur-sm p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">AI Quiz Generator</h1>
              <p className="text-sm text-muted-foreground">
                Tự động tạo quiz từ nội dung khóa học với AI
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Chọn khóa học để tạo quiz
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {courses.map((course) => (
                      <Card
                        key={course.id}
                        className="cursor-pointer transition-all hover:shadow-md"
                        onClick={() => handleSelectCourse(course)}
                      >
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                              {course.thumbnail ? (
                                <Image
                                  src={course.thumbnail}
                                  alt={course.title}
                                  width={150}
                                  height={200}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <BookOpen className="h-8 w-8 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            <div>
                              <h3 className="font-semibold line-clamp-2 mb-2">
                                {course.title}
                              </h3>
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary">
                                  {course.level}
                                </Badge>
                                <Badge variant="outline">{course.status}</Badge>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // STEP 2: CONFIGURE QUIZ
  if (step === "configure") {
    return (
      <div className="flex flex-col h-[calc(100vh-4rem)] bg-background">
        <div className="border-b bg-card/50 backdrop-blur-sm p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setStep("select");
                  setSelectedCourse(null);
                  setSelectedChapterIds([]);
                }}
              >
                <ChevronRight className="h-5 w-5 rotate-180" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Cấu hình Quiz</h1>
                <p className="text-sm text-muted-foreground">
                  {selectedCourse?.title}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Thiết lập tham số
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Chapter Selection */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">
                      Chọn chương (Tùy chọn)
                    </Label>
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      onClick={selectAllChapters}
                      className="h-auto p-0"
                    >
                      {selectedChapterIds.length === courseChapters.length
                        ? "Bỏ chọn tất cả"
                        : "Chọn tất cả"}
                    </Button>
                  </div>

                  {courseChapters.length > 0 ? (
                    <div className="border rounded-lg p-4 max-h-48 overflow-y-auto space-y-2">
                      {courseChapters.map((chapter) => (
                        <div
                          key={chapter.id}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`chapter-${chapter.id}`}
                            checked={selectedChapterIds.includes(chapter.id)}
                            onCheckedChange={() => toggleChapter(chapter.id)}
                          />
                          <label
                            htmlFor={`chapter-${chapter.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {chapter.title}
                          </label>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      Khóa học chưa có chương nào
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Nếu không chọn, AI sẽ tạo quiz từ toàn bộ khóa học
                  </p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Số lượng câu hỏi
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    max={50}
                    value={numberOfQuestions}
                    onChange={(e) =>
                      setNumberOfQuestions(Number(e.target.value))
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Từ 1 đến 50 câu hỏi
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Độ khó</Label>
                  <Select
                    value={difficulty}
                    onValueChange={(value: QuizDifficulty) =>
                      setDifficulty(value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BEGINNER">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          Beginner (Dễ)
                        </div>
                      </SelectItem>
                      <SelectItem value="INTERMEDIATE">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-yellow-500" />
                          Intermediate (Trung bình)
                        </div>
                      </SelectItem>
                      <SelectItem value="ADVANCED">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-red-500" />
                          Advanced (Khó)
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Availability Settings */}
                <div className="space-y-4">
                  <h4 className="font-medium text-sm">Cài đặt hiển thị</h4>

                  <div className="space-y-2">
                    <Label className="text-sm">Available From</Label>
                    <Input
                      type="datetime-local"
                      value={availableFrom}
                      onChange={(e) => setAvailableFrom(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Available To</Label>
                    <Input
                      type="datetime-local"
                      value={availableTo}
                      onChange={(e) => setAvailableTo(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Max Attempts</Label>
                    <Input
                      type="number"
                      min={0}
                      max={10}
                      value={maxAttempts ?? ""}
                      onChange={(e) =>
                        setMaxAttempts(
                          e.target.value ? Number(e.target.value) : null
                        )
                      }
                      placeholder="0 = Unlimited"
                    />
                    <p className="text-xs text-muted-foreground">
                      Để trống hoặc 0 = không giới hạn
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <h4 className="font-medium">Thông tin khóa học</h4>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Tên khóa học:
                      </span>
                      <span className="font-medium">
                        {selectedCourse?.title}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cấp độ:</span>
                      <Badge variant="secondary">{selectedCourse?.level}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Số chương:</span>
                      <span>{courseChapters.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Chương đã chọn:
                      </span>
                      <Badge variant="outline">
                        {selectedChapterIds.length > 0
                          ? `${selectedChapterIds.length} chương`
                          : "Tất cả"}
                      </Badge>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleGenerateQuiz}
                  disabled={generating || !selectedCourse}
                  className="w-full gap-2"
                  size="lg"
                >
                  {generating ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Đang tạo quiz...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5" />
                      Tạo Quiz với AI
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // STEP 3: PREVIEW & EDIT
  if (step === "preview" && generatedQuiz) {
    return (
      <div className="flex h-[calc(100vh-4rem)] bg-background">
        {/* Left Panel - Quiz Info */}
        <div className="w-80 border-r bg-card/50 backdrop-blur-sm flex flex-col">
          <div className="p-6 border-b">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStep("configure")}
              className="mb-4"
            >
              <ChevronRight className="h-4 w-4 rotate-180 mr-2" />
              Quay lại
            </Button>
            <div className="space-y-2">
              <Label className="text-sm">Tên Quiz</Label>
              <Input
                value={generatedQuiz.title}
                onChange={(e) =>
                  setGeneratedQuiz({ ...generatedQuiz, title: e.target.value })
                }
                className="font-semibold"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Số câu hỏi</span>
                <Badge>{generatedQuiz.questions.length}</Badge>
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">
                  Thời gian (phút)
                </Label>
                <Input
                  type="number"
                  min={0}
                  max={300}
                  value={generatedQuiz.timeLimitMinutes ?? ""}
                  onChange={(e) =>
                    setGeneratedQuiz({
                      ...generatedQuiz,
                      timeLimitMinutes: e.target.value
                        ? Number(e.target.value)
                        : null,
                    })
                  }
                  placeholder="0 = No limit"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">
                  Điểm đạt (%)
                </Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={generatedQuiz.passingScore}
                  onChange={(e) =>
                    setGeneratedQuiz({
                      ...generatedQuiz,
                      passingScore: Number(e.target.value),
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">
                  Max Attempts
                </Label>
                <Input
                  type="number"
                  min={0}
                  max={10}
                  value={maxAttempts ?? ""}
                  onChange={(e) =>
                    setMaxAttempts(
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                  placeholder="0 = Unlimited"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">
                  Available From
                </Label>
                <Input
                  type="datetime-local"
                  value={availableFrom}
                  onChange={(e) => setAvailableFrom(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">
                  Available To
                </Label>
                <Input
                  type="datetime-local"
                  value={availableTo}
                  onChange={(e) => setAvailableTo(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Độ khó</span>
                <Badge variant="secondary">{difficulty}</Badge>
              </div>
            </div>

            <Separator />

            <Button
              onClick={addNewQuestion}
              variant="outline"
              className="w-full gap-2"
            >
              <Plus className="h-4 w-4" />
              Thêm câu hỏi
            </Button>
          </div>

          <div className="p-6 border-t space-y-2">
            <Button
              onClick={handleSaveQuiz}
              disabled={saving}
              className="w-full gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Lưu Quiz
                </>
              )}
            </Button>
            <Button
              onClick={() => {
                setGeneratedQuiz(null);
                setStep("select");
              }}
              variant="outline"
              className="w-full"
            >
              Hủy
            </Button>
          </div>
        </div>

        {/* Right Panel - Questions List (Editable & Draggable) */}
        <div className="flex-1 overflow-y-auto p-6 bg-muted/10">
          <div className="max-w-4xl mx-auto space-y-4">
            {generatedQuiz.questions.map((question, index) => (
              <Card
                key={question.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`${
                  draggedIndex === index ? "opacity-50 border-dashed" : ""
                } transition-all hover:shadow-sm`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    {/* Drag Handle */}
                    <div
                      className="cursor-move mt-2 p-1 hover:bg-muted rounded"
                      onMouseDown={(e) => e.stopPropagation()}
                    >
                      <GripVertical className="h-5 w-5 text-muted-foreground" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <Badge variant="outline" className="shrink-0">
                          Câu {index + 1}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Chỉnh sửa"
                            onClick={() =>
                              setEditingQuestionId(
                                editingQuestionId === question.id
                                  ? null
                                  : question.id
                              )
                            }
                          >
                            {editingQuestionId === question.id ? (
                              <Eye className="h-4 w-4 text-primary" />
                            ) : (
                              <Edit2 className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Xóa câu hỏi"
                            onClick={() => deleteQuestion(question.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>

                      {/* Question Text */}
                      {editingQuestionId === question.id ? (
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">
                            Nội dung câu hỏi
                          </Label>
                          <Input
                            value={question.text}
                            onChange={(e) =>
                              updateQuestion(question.id, {
                                text: e.target.value,
                              })
                            }
                            className="font-medium"
                          />
                        </div>
                      ) : (
                        <p className="font-medium text-lg">{question.text}</p>
                      )}

                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {question.topic}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {question.difficulty}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Options List */}
                  <div className="space-y-2">
                    {question.options.map((option, optionIndex) => (
                      <div
                        key={optionIndex}
                        className={`flex items-center gap-2 p-3 rounded-lg border transition-colors ${
                          question.correctAnswerIndex === optionIndex
                            ? "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800"
                            : "bg-card hover:bg-muted/50"
                        }`}
                      >
                        {editingQuestionId === question.id ? (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 shrink-0"
                              onClick={() =>
                                updateQuestion(question.id, {
                                  correctAnswerIndex: optionIndex,
                                })
                              }
                              title="Đặt làm đáp án đúng"
                            >
                              {question.correctAnswerIndex === optionIndex ? (
                                <Check className="h-4 w-4 text-green-600" />
                              ) : (
                                <div className="h-4 w-4 rounded-full border-2" />
                              )}
                            </Button>
                            <Input
                              value={option}
                              onChange={(e) => {
                                const newOptions = [...question.options];
                                newOptions[optionIndex] = e.target.value;
                                updateQuestion(question.id, {
                                  options: newOptions,
                                });
                              }}
                              className="flex-1 h-8"
                            />
                          </>
                        ) : (
                          <>
                            <div className="w-6 h-6 rounded-full bg-background border flex items-center justify-center shrink-0">
                              {question.correctAnswerIndex === optionIndex && (
                                <Check className="h-4 w-4 text-green-600" />
                              )}
                            </div>
                            <span className="flex-1 text-sm">{option}</span>
                          </>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Explanation Section */}
                  <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-2">
                      <div className="text-blue-600 dark:text-blue-400 shrink-0 mt-2">
                        💡
                      </div>
                      <div className="flex-1">
                        {editingQuestionId === question.id ? (
                          <div className="space-y-1">
                            <Label className="text-xs text-blue-800">
                              Giải thích đáp án
                            </Label>
                            <Input
                              value={question.explanation || ""}
                              onChange={(e) =>
                                updateQuestion(question.id, {
                                  explanation: e.target.value,
                                })
                              }
                              placeholder="Nhập giải thích cho đáp án đúng..."
                              className="bg-white/50"
                            />
                          </div>
                        ) : (
                          <p className="text-sm text-blue-900 dark:text-blue-100 mt-1">
                            <strong>Giải thích:</strong> {question.explanation}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default AIQuizGenerator;
