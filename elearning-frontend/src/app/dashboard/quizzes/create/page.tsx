"use client";

import React, { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Copy, Trash2, Plus, X, Send, ArrowLeft, Upload, Download, FileSpreadsheet } from "lucide-react";
import { createQuiz } from "@/services/quiz.service";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import {
  getAllCoursesBaseRole,
  getCourseById,
  ICourseDetailRes,
  ICourseRes,
} from "@/services/course.service";
import { RichTextEditor } from "@/components/rich-text-editor/Editor";
import { getErrorMessage } from "@/utils/error-message";
import {
  parseQuizCSV,
  quizToCSV,
  downloadCSV,
  getTemplateCSV,
  type QuizQuestion,
} from "@/utils/quiz-csv";

const quizSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  courseId: z.string().min(1, "Please select a course"),
  chapterId: z.string().optional(),
  timeLimitMinutes: z.number().min(0).max(300).nullable(),
  passingScore: z.number().min(0).max(100),
  shuffleQuestions: z.boolean(),
  shuffleOptions: z.boolean(),
  showCorrectAnswers: z.boolean(),
  maxAttempts: z.number().min(0).max(10).nullable(),
  availableFrom: z.string().optional(),
  availableTo: z.string().optional(),
  questions: z
    .array(
      z.object({
        text: z.string().min(1, "Question text is required"),
        options: z
          .array(z.string().min(1, "Option cannot be empty"))
          .min(2)
          .max(6),
        correctAnswerIndex: z.number().min(0),
        explanation: z.string().optional(),
        type: z.enum(["MULTIPLE_CHOICE", "TRUE_FALSE"]),
      })
    )
    .min(1, "At least one question is required"),
});

type QuizFormValues = z.infer<typeof quizSchema>;

export default function CreateQuizPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [courses, setCourses] = useState<ICourseRes[]>([]);
  const [courseDetail, setCourseDetail] = useState<ICourseDetailRes>();

  // File input ref for CSV import
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const form = useForm<QuizFormValues>({
    resolver: zodResolver(quizSchema),
    defaultValues: {
      title: "",
      courseId: "",
      chapterId: "",
      timeLimitMinutes: 30,
      passingScore: 70,
      shuffleQuestions: false,
      shuffleOptions: false,
      showCorrectAnswers: true,
      maxAttempts: 3,
      availableFrom: "",
      availableTo: "",
      questions: [],
    },
  });

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "questions",
  });

  const selectedCourseId = form.watch("courseId");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await getAllCoursesBaseRole(1, 100);
        setCourses(response.data);
      } catch (error) {
        console.error("Error fetching courses:", error);
        toast.error("Failed to load courses");
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    form.setValue("chapterId", "");
    setCourseDetail(undefined);

    if (selectedCourseId) {
      getCourseById(selectedCourseId)
        .then((course) => setCourseDetail(course))
        .catch((error) => {
          console.error("Error fetching course:", error);
          toast.error("Failed to load course details");
        });
    }
  }, [selectedCourseId, form]);

  const addMultipleChoiceQuestion = () => {
    append({
      text: "",
      options: ["", ""],
      correctAnswerIndex: 0,
      explanation: "",
      type: "MULTIPLE_CHOICE",
    });
  };

  const addTrueFalseQuestion = () => {
    append({
      text: "",
      options: ["True", "False"],
      correctAnswerIndex: 0,
      explanation: "",
      type: "TRUE_FALSE",
    });
  };

  const duplicateQuestion = (index: number) => {
    const question = fields[index];
    append({
      ...question,
      options: [...question.options],
    });
  };

  // --- CSV Import/Export Functions ---
  const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const result = parseQuizCSV(content);

      if (result.errors.length > 0) {
        toast.error(
          <div>
            <p className="font-semibold">Import Errors:</p>
            <ul className="text-sm mt-1">
              {result.errors.slice(0, 5).map((err, i) => (
                <li key={i}>• {err}</li>
              ))}
              {result.errors.length > 5 && (
                <li>...and {result.errors.length - 5} more</li>
              )}
            </ul>
          </div>,
          { duration: 8000 }
        );
      }

      if (result.questions.length > 0) {
        // Append imported questions to existing ones
        result.questions.forEach((q) => {
          append(q);
        });
        toast.success(`Successfully imported ${result.questions.length} questions!`);
      }
    };

    reader.onerror = () => {
      toast.error("Failed to read file");
    };

    reader.readAsText(file, "UTF-8");
    // Reset input to allow importing same file again
    event.target.value = "";
  };

  const handleExportCSV = () => {
    if (fields.length === 0) {
      toast.error("No questions to export");
      return;
    }

    const questions: QuizQuestion[] = fields.map((field) => ({
      text: field.text,
      options: field.options,
      correctAnswerIndex: field.correctAnswerIndex,
      explanation: field.explanation || "",
      type: field.type,
    }));

    const csv = quizToCSV(questions);
    const title = form.getValues("title") || "quiz";
    downloadCSV(csv, `${title.replace(/[^a-z0-9]/gi, "_")}_questions.csv`);
    toast.success("Questions exported successfully!");
  };

  const handleDownloadTemplate = () => {
    downloadCSV(getTemplateCSV(), "quiz_import_template.csv");
    toast.success("Template downloaded!");
  };

  const addOption = (questionIndex: number) => {
    const question = fields[questionIndex];
    if (question.options.length < 6) {
      const newOptions = [...question.options, ""];
      // FIX: Giữ nguyên các giá trị khác, chỉ cập nhật options
      form.setValue(`questions.${questionIndex}.options`, newOptions);
    }
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const question = fields[questionIndex];
    if (question.options.length > 2) {
      const newOptions = question.options.filter(
        (_, idx) => idx !== optionIndex
      );

      let newCorrectIndex = question.correctAnswerIndex;
      if (optionIndex === question.correctAnswerIndex) {
        newCorrectIndex = 0;
      } else if (optionIndex < question.correctAnswerIndex) {
        newCorrectIndex--;
      }

      // FIX: Cập nhật từng field riêng biệt thay vì dùng update
      form.setValue(`questions.${questionIndex}.options`, newOptions);
      form.setValue(
        `questions.${questionIndex}.correctAnswerIndex`,
        newCorrectIndex
      );
    }
  };

  const onSubmit = async (values: QuizFormValues) => {
    try {
      setIsSubmitting(true);

      const quizData = {
        title: values.title,
        courseId: values.courseId,
        chapterId: values.chapterId || null,
        timeLimitMinutes: values.timeLimitMinutes || null,
        passingScore: values.passingScore,
        shuffleQuestions: values.shuffleQuestions,
        shuffleOptions: values.shuffleOptions,
        showCorrectAnswers: values.showCorrectAnswers,
        maxAttempts: values.maxAttempts || null,
        availableFrom: values.availableFrom || null,
        availableTo: values.availableTo || null,
        questions: values.questions.map((q) => ({
          text: q.text,
          options: q.options,
          correctAnswerIndex: q.correctAnswerIndex,
          explanation: q.explanation || null,
        })),
      };

      await createQuiz(quizData);
      toast.success("Quiz created successfully!");
      router.push("/dashboard/quizzes");
    } catch (error: any) {
      const errorMessage = getErrorMessage(error);
      toast.error(`Failed to create quiz: ${errorMessage}`, {
        position: "top-center",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/dashboard/quizzes"
          className={buttonVariants({ variant: "outline", size: "icon" })}
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-3xl font-bold">Create New Quiz</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left: Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Info */}
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quiz Title</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your quiz title"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="courseId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Course *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full truncate">
                                <SelectValue placeholder="Select Course" className="truncate" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="max-w-[350px]">
                              {courses.map((course) => (
                                <SelectItem key={course.id} value={course.id}>
                                  <span className="truncate block max-w-[300px]" title={course.title}>{course.title}</span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="chapterId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Chapter (Optional)</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={!selectedCourseId || !courseDetail}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select Chapter" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">None</SelectItem>
                              {courseDetail?.chapters?.map((chapter) => (
                                <SelectItem key={chapter.id} value={chapter.id}>
                                  {chapter.title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="availableFrom"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Available From</FormLabel>
                          <FormControl>
                            <Input type="datetime-local" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="availableTo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Available To</FormLabel>
                          <FormControl>
                            <Input type="datetime-local" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Questions */}
              <div className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h2 className="text-2xl font-bold">Questions</h2>

                  {/* Import/Export Buttons */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept=".csv"
                      onChange={handleImportCSV}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleDownloadTemplate}
                    >
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Template
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Import CSV
                    </Button>
                    {fields.length > 0 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleExportCSV}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    )}
                  </div>
                </div>

                {fields.map((field, qIdx) => (
                  <Card key={field.id}>
                    <CardContent className="pt-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">
                          {qIdx + 1}.{" "}
                          {field.type === "TRUE_FALSE"
                            ? "True/False"
                            : "Multiple Choice"}
                        </h3>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => duplicateQuestion(qIdx)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => remove(qIdx)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <FormField
                        control={form.control}
                        name={`questions.${qIdx}.text`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Question</FormLabel>
                            <FormControl>
                              <RichTextEditor
                                field={field}
                                minHeight="auto"
                                placeholder="Enter your question"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="space-y-2">
                        <Label>Options</Label>
                        {field.options.map((option, optIdx) => (
                          <div key={optIdx} className="flex gap-2 items-start">
                            <input
                              type="radio"
                              name={`question-${qIdx}-correct`}
                              checked={form.watch(`questions.${qIdx}.correctAnswerIndex`) === optIdx}
                              onChange={() => {
                                form.setValue(
                                  `questions.${qIdx}.correctAnswerIndex`,
                                  optIdx,
                                  { shouldDirty: true, shouldTouch: false }
                                );
                              }}
                              className="mt-3 cursor-pointer"
                            />
                            <div className="flex-1">
                              <FormField
                                control={form.control}
                                name={`questions.${qIdx}.options.${optIdx}`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input
                                        {...field}
                                        placeholder="Enter option text"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            {field.options.length > 2 &&
                              field.type === "MULTIPLE_CHOICE" && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeOption(qIdx, optIdx)}
                                  className="mt-2"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                          </div>
                        ))}

                        {field.options.length < 6 &&
                          field.type === "MULTIPLE_CHOICE" && (
                            <Button
                              type="button"
                              variant="link"
                              size="sm"
                              onClick={() => addOption(qIdx)}
                              className="px-0"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Answer
                            </Button>
                          )}
                      </div>

                      {/* Explanation Field - Hiển thị khi có đáp án đúng được chọn */}
                      <FormField
                        control={form.control}
                        name={`questions.${qIdx}.explanation`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Explanation for Correct Answer{" "}
                              <span className="text-muted-foreground text-sm">
                                (Optional)
                              </span>
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                placeholder="Explain why this is the correct answer..."
                                rows={3}
                                className="resize-none"
                              />
                            </FormControl>
                            <FormDescription>
                              This explanation will be shown to students after
                              they submit their answer
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                ))}

                {/* Add Question Buttons */}
                <div className="text-center space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Add a new question to your quiz
                  </p>
                  <div className="flex gap-2 justify-center flex-wrap">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addMultipleChoiceQuestion}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Multiple Choice
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addTrueFalseQuestion}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      True/False
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Settings & Actions */}
            <div className="space-y-4">
              {/* Actions */}
              <Card>
                <CardContent className="pt-6 space-y-3">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <LoadingSpinner />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Publish Quiz
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Settings */}
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <h3 className="font-semibold">Quiz Settings</h3>

                  <FormField
                    control={form.control}
                    name="timeLimitMinutes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time Limit (minutes)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value ? Number(e.target.value) : null
                              )
                            }
                            min={0}
                            max={300}
                          />
                        </FormControl>
                        <FormDescription>
                          Leave 0 for no time limit
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="passingScore"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Passing Score (%)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                            min={0}
                            max={100}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="maxAttempts"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Attempts</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value ? Number(e.target.value) : null
                              )
                            }
                            min={0}
                            max={10}
                          />
                        </FormControl>
                        <FormDescription>Leave 0 for unlimited</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="shuffleQuestions"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <FormLabel>Shuffle Questions</FormLabel>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="shuffleOptions"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <FormLabel>Shuffle Options</FormLabel>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="showCorrectAnswers"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <FormLabel>Show Correct Answers</FormLabel>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
