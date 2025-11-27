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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { getAllCoursesBaseRole, ICourseRes } from "@/services/course.service";
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
  const [numberOfQuestions, setNumberOfQuestions] = useState(10);
  const [difficulty, setDifficulty] = useState<QuizDifficulty>("INTERMEDIATE");

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

  const handleGenerateQuiz = async () => {
    if (!selectedCourse) return;

    setGenerating(true);
    try {
      const response = await aiGenerateQuizFromCourse({
        courseId: selectedCourse.id,
        numberOfQuestions,
        difficulty,
        // chapterIds: []
      });

      // Map dữ liệu API sang dữ liệu UI (Thêm ID giả để xử lý React Key/DragDrop)
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
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          selectedCourse?.id === course.id
                            ? "ring-2 ring-primary"
                            : ""
                        }`}
                        onClick={() => {
                          setSelectedCourse(course);
                          setStep("configure");
                        }}
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
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Số lượng câu hỏi
                  </label>
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
                  <label className="text-sm font-medium">Độ khó</label>
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
                      <span>{selectedCourse?._count.chapters || 0}</span>
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
            <h2 className="text-lg font-semibold mb-1">
              {generatedQuiz.title}
            </h2>
            <p className="text-sm text-muted-foreground">
              {generatedQuiz.description}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Số câu hỏi</span>
                <Badge>{generatedQuiz.questions.length}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Thời gian</span>
                <span className="font-medium">
                  {generatedQuiz.timeLimitMinutes} phút
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Điểm đạt</span>
                <span className="font-medium">
                  {generatedQuiz.passingScore}%
                </span>
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

        {/* Right Panel - Questions List */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-4">
            {generatedQuiz.questions.map((question, index) => (
              <Card
                key={question.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`${
                  draggedIndex === index ? "opacity-50" : ""
                } transition-opacity`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <div
                      className="cursor-move mt-1"
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
                            onClick={() =>
                              setEditingQuestionId(
                                editingQuestionId === question.id
                                  ? null
                                  : question.id
                              )
                            }
                          >
                            {editingQuestionId === question.id ? (
                              <Eye className="h-4 w-4" />
                            ) : (
                              <Edit2 className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteQuestion(question.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>

                      {editingQuestionId === question.id ? (
                        <Input
                          value={question.text}
                          onChange={(e) =>
                            updateQuestion(question.id, {
                              text: e.target.value,
                            })
                          }
                          className="font-medium"
                        />
                      ) : (
                        <p className="font-medium">{question.text}</p>
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

                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    {question.options.map((option, optionIndex) => (
                      <div
                        key={optionIndex}
                        className={`flex items-center gap-2 p-3 rounded-lg border ${
                          question.correctAnswerIndex === optionIndex
                            ? "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800"
                            : "bg-muted/30"
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

                  <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-2">
                      <div className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5">
                        💡
                      </div>
                      {editingQuestionId === question.id ? (
                        <Input
                          value={question.explanation || ""}
                          onChange={(e) =>
                            updateQuestion(question.id, {
                              explanation: e.target.value,
                            })
                          }
                          className="flex-1"
                        />
                      ) : (
                        <p className="text-sm text-blue-900 dark:text-blue-100">
                          <strong>Giải thích:</strong> {question.explanation}
                        </p>
                      )}
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
