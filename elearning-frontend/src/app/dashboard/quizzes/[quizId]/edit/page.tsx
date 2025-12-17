"use client";

import React, { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
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
import {
    Copy,
    Trash2,
    Plus,
    X,
    Save,
    ArrowLeft,
    Upload,
    Download,
    FileSpreadsheet,
    Loader2,
} from "lucide-react";
import {
    getQuizById,
    updateQuiz,
    type IQuizDetail,
} from "@/services/quiz.service";
import { toast } from "sonner";
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

export default function EditQuizPage() {
    const router = useRouter();
    const params = useParams();
    const quizId = params.quizId as string;

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [quiz, setQuiz] = useState<IQuizDetail | null>(null);

    // File input ref for CSV import
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const form = useForm<QuizFormValues>({
        resolver: zodResolver(quizSchema),
        defaultValues: {
            title: "",
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

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "questions",
    });

    // Fetch quiz data
    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                setIsLoading(true);
                const data = await getQuizById(quizId);
                setQuiz(data);

                // Format dates for datetime-local input
                const formatDate = (dateStr: string | null) => {
                    if (!dateStr) return "";
                    const date = new Date(dateStr);
                    return date.toISOString().slice(0, 16);
                };

                // Populate form with quiz data
                form.reset({
                    title: data.title,
                    timeLimitMinutes: data.timeLimitMinutes,
                    passingScore: data.passingScore,
                    shuffleQuestions: data.shuffleQuestions,
                    shuffleOptions: data.shuffleOptions,
                    showCorrectAnswers: data.showCorrectAnswers,
                    maxAttempts: data.maxAttempts,
                    availableFrom: formatDate(data.availableFrom),
                    availableTo: formatDate(data.availableTo),
                    questions: data.questions.map((q) => ({
                        text: q.text,
                        options: q.options,
                        correctAnswerIndex: q.correctAnswerIndex || 0,
                        explanation: q.explanation || "",
                        type:
                            q.options.length === 2 &&
                                q.options[0]?.toLowerCase() === "true" &&
                                q.options[1]?.toLowerCase() === "false"
                                ? "TRUE_FALSE"
                                : "MULTIPLE_CHOICE",
                    })),
                });
            } catch (error) {
                console.error("Error fetching quiz:", error);
                toast.error("Failed to load quiz");
                router.push("/dashboard/quizzes");
            } finally {
                setIsLoading(false);
            }
        };

        if (quizId) {
            fetchQuiz();
        }
    }, [quizId, form, router]);

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
                result.questions.forEach((q) => {
                    append(q);
                });
                toast.success(
                    `Successfully imported ${result.questions.length} questions!`
                );
            }
        };

        reader.onerror = () => {
            toast.error("Failed to read file");
        };

        reader.readAsText(file, "UTF-8");
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

            await updateQuiz(quizId, quizData);
            toast.success("Quiz updated successfully!");
            router.push(`/dashboard/quizzes/${quizId}`);
        } catch (error: any) {
            console.error("Error updating quiz:", error);
            toast.error(getErrorMessage(error) || "Failed to update quiz");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10" />
                    <Skeleton className="h-8 w-48" />
                </div>
                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-4">
                        <Skeleton className="h-64" />
                        <Skeleton className="h-48" />
                        <Skeleton className="h-48" />
                    </div>
                    <div className="space-y-4">
                        <Skeleton className="h-48" />
                        <Skeleton className="h-32" />
                    </div>
                </div>
            </div>
        );
    }

    if (!quiz) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <p className="text-muted-foreground">Quiz not found</p>
                <Link
                    href="/dashboard/quizzes"
                    className={buttonVariants({ variant: "outline", className: "mt-4" })}
                >
                    Back to Quizzes
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href={`/dashboard/quizzes/${quizId}`}
                    className={buttonVariants({ variant: "outline", size: "icon" })}
                >
                    <ArrowLeft className="h-4 w-4" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">Edit Quiz</h1>
                    <p className="text-sm text-muted-foreground">
                        {quiz.course.title}
                        {quiz.chapter && ` • ${quiz.chapter.title}`}
                    </p>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Left: Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Quiz Info */}
                            <Card>
                                <CardContent className="pt-6 space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="title"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Quiz Title</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Enter quiz title" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
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
                                                            checked={
                                                                form.watch(
                                                                    `questions.${qIdx}.correctAnswerIndex`
                                                                ) === optIdx
                                                            }
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

                                            {/* Explanation Field */}
                                            <FormField
                                                control={form.control}
                                                name={`questions.${qIdx}.explanation`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            Explanation for Correct Answer{" "}
                                                            <span className="text-muted-foreground">
                                                                (Optional)
                                                            </span>
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Textarea
                                                                {...field}
                                                                placeholder="Explain why this is the correct answer..."
                                                                className="min-h-[80px]"
                                                            />
                                                        </FormControl>
                                                        <FormDescription>
                                                            This explanation will be shown to students after
                                                            they submit their answer
                                                        </FormDescription>
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
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="mr-2 h-4 w-4" />
                                                Save Changes
                                            </>
                                        )}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => router.push(`/dashboard/quizzes/${quizId}`)}
                                    >
                                        Cancel
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
                                                        min={0}
                                                        max={300}
                                                        {...field}
                                                        value={field.value ?? ""}
                                                        onChange={(e) =>
                                                            field.onChange(
                                                                e.target.value
                                                                    ? parseInt(e.target.value)
                                                                    : null
                                                            )
                                                        }
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    Leave empty for no time limit
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
                                                        min={0}
                                                        max={100}
                                                        {...field}
                                                        onChange={(e) =>
                                                            field.onChange(parseInt(e.target.value) || 0)
                                                        }
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
                                                        min={0}
                                                        max={10}
                                                        {...field}
                                                        value={field.value ?? ""}
                                                        onChange={(e) =>
                                                            field.onChange(
                                                                e.target.value
                                                                    ? parseInt(e.target.value)
                                                                    : null
                                                            )
                                                        }
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    Leave empty for unlimited attempts
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="shuffleQuestions"
                                        render={({ field }) => (
                                            <FormItem className="flex items-center justify-between rounded-lg border p-3">
                                                <div className="space-y-0.5">
                                                    <FormLabel className="text-sm">
                                                        Shuffle Questions
                                                    </FormLabel>
                                                </div>
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
                                            <FormItem className="flex items-center justify-between rounded-lg border p-3">
                                                <div className="space-y-0.5">
                                                    <FormLabel className="text-sm">
                                                        Shuffle Options
                                                    </FormLabel>
                                                </div>
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
                                            <FormItem className="flex items-center justify-between rounded-lg border p-3">
                                                <div className="space-y-0.5">
                                                    <FormLabel className="text-sm">
                                                        Show Correct Answers
                                                    </FormLabel>
                                                </div>
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

                            {/* Availability */}
                            <Card>
                                <CardContent className="pt-6 space-y-4">
                                    <h3 className="font-semibold">Availability</h3>

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
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </form>
            </Form>
        </div>
    );
}
