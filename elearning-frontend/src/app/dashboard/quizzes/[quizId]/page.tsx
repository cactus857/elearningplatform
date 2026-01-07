"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    BookOpen,
    BrainCircuit,
    Calendar,
    CheckCircle2,
    Clock,
    Download,
    Edit,
    Eye,
    Hourglass,
    Layers,
    MessageSquareText,
    MoreHorizontal,
    RefreshCw,
    Shuffle,
    Target,
    Trash2,
    Trophy,
    Users,
    XCircle,
    BarChart2,
    ChevronDown,
    ChevronUp,
    Copy,
    Check,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
    getQuizById,
    deleteQuiz,
    duplicateQuizToCourses,
    type IQuizDetail,
} from "@/services/quiz.service";
import { getAllCoursesBaseRole, type ICourseRes } from "@/services/course.service";
import { useAuth } from "@/hooks/use-auth";
import { quizToCSV, downloadCSV, type QuizQuestion } from "@/utils/quiz-csv";

// Loading skeleton component
function QuizDetailSkeleton() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="space-y-2">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-48" />
                </div>
            </div>



            <div className="grid gap-6 md:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-32 rounded-2xl" />
                ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-4">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-48 rounded-2xl" />
                    ))}
                </div>
                <Skeleton className="h-96 rounded-2xl" />
            </div>
        </div>
    );
}

// Stats card component
function StatCard({
    icon: Icon,
    label,
    value,
    subtext,
    colorTheme,
}: {
    icon: any;
    label: string;
    value: string | number;
    subtext?: string;
    colorTheme: "blue" | "violet" | "emerald" | "amber";
}) {
    const themes = {
        blue: {
            bg: "bg-blue-50/50 dark:bg-blue-900/10",
            border: "border-blue-100 dark:border-blue-800",
            iconBg: "bg-blue-500",
            text: "text-blue-600 dark:text-blue-400",
        },
        violet: {
            bg: "bg-violet-50/50 dark:bg-violet-900/10",
            border: "border-violet-100 dark:border-violet-800",
            iconBg: "bg-violet-500",
            text: "text-violet-600 dark:text-violet-400",
        },
        emerald: {
            bg: "bg-emerald-50/50 dark:bg-emerald-900/10",
            border: "border-emerald-100 dark:border-emerald-800",
            iconBg: "bg-emerald-500",
            text: "text-emerald-600 dark:text-emerald-400",
        },
        amber: {
            bg: "bg-amber-50/50 dark:bg-amber-900/10",
            border: "border-amber-100 dark:border-amber-800",
            iconBg: "bg-amber-500",
            text: "text-amber-600 dark:text-amber-400",
        },
    };

    const theme = themes[colorTheme];

    return (
        <div
            className={cn(
                "relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 hover:shadow-lg",
                theme.bg,
                theme.border
            )}
        >
            <div
                className={cn(
                    "absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-20 blur-2xl",
                    theme.iconBg
                )}
            />
            <div className="relative z-10 flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">{label}</p>
                    <p className="text-2xl font-bold mt-1">{value}</p>
                    {subtext && (
                        <p className={cn("text-xs mt-1", theme.text)}>{subtext}</p>
                    )}
                </div>
                <div className={cn("p-2.5 rounded-xl text-white", theme.iconBg)}>
                    <Icon className="h-5 w-5" />
                </div>
            </div>
        </div>
    );
}

export default function QuizDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const quizId = params.quizId as string;

    // Check if user is admin or instructor (can see explanations)
    const canSeeExplanation = user?.role?.name === "ADMIN" || user?.role?.name === "INSTRUCTOR";

    const [quiz, setQuiz] = useState<IQuizDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(
        new Set([0])
    );

    // Repost state
    const [repostDialogOpen, setRepostDialogOpen] = useState(false);
    const [availableCourses, setAvailableCourses] = useState<ICourseRes[]>([]);
    const [selectedCourseIds, setSelectedCourseIds] = useState<Set<string>>(new Set());
    const [isReposting, setIsReposting] = useState(false);
    const [loadingCourses, setLoadingCourses] = useState(false);

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                setLoading(true);
                const data = await getQuizById(quizId);
                setQuiz(data);
            } catch (error) {
                console.error("Error fetching quiz:", error);
                toast.error("Failed to load quiz details");
                router.push("/dashboard/quizzes");
            } finally {
                setLoading(false);
            }
        };

        if (quizId) {
            fetchQuiz();
        }
    }, [quizId, router]);

    const handleDelete = async () => {
        try {
            await deleteQuiz(quizId);
            toast.success("Quiz deleted successfully");
            router.push("/dashboard/quizzes");
        } catch (error) {
            console.error("Error deleting quiz:", error);
            toast.error("Failed to delete quiz");
        }
    };

    const toggleQuestion = (index: number) => {
        setExpandedQuestions((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(index)) {
                newSet.delete(index);
            } else {
                newSet.add(index);
            }
            return newSet;
        });
    };

    // Repost handlers
    const openRepostDialog = async () => {
        if (!quiz) return;
        setSelectedCourseIds(new Set());
        setRepostDialogOpen(true);
        setLoadingCourses(true);

        try {
            const response = await getAllCoursesBaseRole(1, 100);
            const otherCourses = response.data.filter((c) => c.id !== quiz.courseId);
            setAvailableCourses(otherCourses);
        } catch (error) {
            console.error("Error loading courses:", error);
            toast.error("Failed to load courses");
        } finally {
            setLoadingCourses(false);
        }
    };

    const toggleCourseSelection = (courseId: string) => {
        setSelectedCourseIds((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(courseId)) {
                newSet.delete(courseId);
            } else {
                newSet.add(courseId);
            }
            return newSet;
        });
    };

    const handleRepostQuiz = async () => {
        if (!quiz || selectedCourseIds.size === 0) return;

        setIsReposting(true);
        try {
            const result = await duplicateQuizToCourses(
                quizId,
                Array.from(selectedCourseIds)
            );
            toast.success(result.message);
            setRepostDialogOpen(false);
            setSelectedCourseIds(new Set());
        } catch (error) {
            console.error("Error reposting quiz:", error);
            toast.error("Failed to repost quiz");
        } finally {
            setIsReposting(false);
        }
    };

    const expandAll = () => {
        if (quiz) {
            setExpandedQuestions(
                new Set(quiz.questions.map((_, index) => index))
            );
        }
    };

    const collapseAll = () => {
        setExpandedQuestions(new Set());
    };

    const getQuizStatus = () => {
        if (!quiz) return { label: "Unknown", color: "bg-gray-500/10 text-gray-600 dark:text-gray-400" };

        const now = new Date();
        const availableFrom = quiz.availableFrom ? new Date(quiz.availableFrom) : null;
        const availableTo = quiz.availableTo ? new Date(quiz.availableTo) : null;

        if (!availableFrom && !availableTo) {
            return {
                label: "Active",
                color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
            };
        }
        if (availableFrom && now < availableFrom) {
            return {
                label: "Scheduled",
                color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
            };
        }
        if (availableTo && now > availableTo) {
            return {
                label: "Closed",
                color: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
            };
        }
        return {
            label: "Active",
            color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
        };
    };

    if (loading) {
        return <QuizDetailSkeleton />;
    }

    if (!quiz) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <p className="text-muted-foreground">Quiz not found</p>
                <Link href="/dashboard/quizzes" className={buttonVariants({ variant: "outline", className: "mt-4" })}>
                    Back to Quizzes
                </Link>
            </div>
        );
    }

    const status = getQuizStatus();

    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-start gap-4">
                    <Link
                        href="/dashboard/quizzes"
                        className={buttonVariants({ variant: "outline", size: "icon" })}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className={cn("rounded-full", status.color)}>
                                {status.label}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                                {quiz.course.title}
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold">{quiz.title}</h1>
                        {quiz.chapter && (
                            <p className="text-muted-foreground mt-1">
                                Chapter: {quiz.chapter.title}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2 sm:self-start">
                    <Button
                        variant="outline"
                        onClick={() => router.push(`/dashboard/quizzes/${quizId}/results`)}
                    >
                        <BarChart2 className="h-4 w-4 mr-2" />
                        View Results
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                                onClick={() => router.push(`/dashboard/quizzes/${quizId}/edit`)}
                            >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Quiz
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => window.open(`/quiz/${quizId}`, "_blank")}
                            >
                                <Eye className="mr-2 h-4 w-4" />
                                Preview Quiz
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => {
                                    if (quiz.questions.length === 0) {
                                        toast.error("No questions to export");
                                        return;
                                    }
                                    const questions: QuizQuestion[] = quiz.questions.map((q) => ({
                                        text: q.text,
                                        options: q.options,
                                        correctAnswerIndex: q.correctAnswerIndex || 0,
                                        explanation: q.explanation || "",
                                        type: q.options.length === 2 &&
                                            q.options[0]?.toLowerCase() === "true" &&
                                            q.options[1]?.toLowerCase() === "false"
                                            ? "TRUE_FALSE"
                                            : "MULTIPLE_CHOICE",
                                    }));
                                    const csv = quizToCSV(questions);
                                    downloadCSV(csv, `${quiz.title.replace(/[^a-z0-9]/gi, "_")}_questions.csv`);
                                    toast.success("Questions exported successfully!");
                                }}
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Export CSV
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={openRepostDialog}>
                                <Copy className="mr-2 h-4 w-4" />
                                Repost to Courses
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => setDeleteDialogOpen(true)}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Quiz
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    icon={BrainCircuit}
                    label="Total Questions"
                    value={quiz.questions.length}
                    subtext="Multiple choice & True/False"
                    colorTheme="violet"
                />
                <StatCard
                    icon={Hourglass}
                    label="Time Limit"
                    value={quiz.timeLimitMinutes ? `${quiz.timeLimitMinutes} min` : "Unlimited"}
                    subtext={quiz.timeLimitMinutes ? "Per attempt" : "No time restriction"}
                    colorTheme="blue"
                />
                <StatCard
                    icon={Trophy}
                    label="Passing Score"
                    value={`${quiz.passingScore}%`}
                    subtext="Required to pass"
                    colorTheme="emerald"
                />
                <StatCard
                    icon={RefreshCw}
                    label="Max Attempts"
                    value={quiz.maxAttempts || "Unlimited"}
                    subtext="Per student"
                    colorTheme="amber"
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Questions List */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold">Questions</h2>
                        <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={expandAll}>
                                Expand All
                            </Button>
                            <Button variant="ghost" size="sm" onClick={collapseAll}>
                                Collapse All
                            </Button>
                        </div>
                    </div>

                    {quiz.questions.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <BrainCircuit className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                                <p className="text-muted-foreground">No questions added yet</p>
                                <Button
                                    variant="outline"
                                    className="mt-4"
                                    onClick={() => router.push(`/dashboard/quizzes/${quizId}/edit`)}
                                >
                                    Add Questions
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-3">
                            {quiz.questions.map((question, index) => (
                                <Collapsible
                                    key={question.id}
                                    open={expandedQuestions.has(index)}
                                    onOpenChange={() => toggleQuestion(index)}
                                >
                                    <Card className="overflow-hidden">
                                        <CollapsibleTrigger asChild>
                                            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                                                            {index + 1}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div
                                                                className="font-medium line-clamp-1 prose prose-sm max-w-none"
                                                                dangerouslySetInnerHTML={{ __html: question.text }}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="secondary" className="text-xs">
                                                            {question.options.length} options
                                                        </Badge>
                                                        {expandedQuestions.has(index) ? (
                                                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                                        ) : (
                                                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                                        )}
                                                    </div>
                                                </div>
                                            </CardHeader>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            <CardContent className="pt-0 pb-4">
                                                <Separator className="mb-4" />
                                                <div className="space-y-2">
                                                    {question.options.map((option, optIndex) => {
                                                        const isCorrect = optIndex === question.correctAnswerIndex;
                                                        return (
                                                            <div
                                                                key={optIndex}
                                                                className={cn(
                                                                    "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                                                                    isCorrect
                                                                        ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800"
                                                                        : "bg-muted/30 border-transparent"
                                                                )}
                                                            >
                                                                <div
                                                                    className={cn(
                                                                        "flex items-center justify-center h-6 w-6 rounded-full text-xs font-medium",
                                                                        isCorrect
                                                                            ? "bg-emerald-500 text-white"
                                                                            : "bg-muted text-muted-foreground"
                                                                    )}
                                                                >
                                                                    {String.fromCharCode(65 + optIndex)}
                                                                </div>
                                                                <span className={cn("flex-1", isCorrect && "font-medium")}>
                                                                    {option}
                                                                </span>
                                                                {isCorrect && (
                                                                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                                {/* Explanation Section - Only visible to Admin/Instructor */}
                                                {canSeeExplanation && question.explanation && (
                                                    <div className="mt-4 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                                                        <div className="flex items-start gap-3">
                                                            <div className="p-1.5 rounded-lg bg-amber-500/20">
                                                                <MessageSquareText className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-1">
                                                                    Explanation
                                                                </p>
                                                                <p className="text-sm text-amber-700 dark:text-amber-400">
                                                                    {question.explanation}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </CollapsibleContent>
                                    </Card>
                                </Collapsible>
                            ))}
                        </div>
                    )}
                </div>

                {/* Settings Sidebar */}
                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Quiz Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between py-2">
                                <div className="flex items-center gap-2 text-sm">
                                    <Shuffle className="h-4 w-4 text-muted-foreground" />
                                    <span>Shuffle Questions</span>
                                </div>
                                {quiz.shuffleQuestions ? (
                                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                        Enabled
                                    </Badge>
                                ) : (
                                    <Badge variant="secondary">Disabled</Badge>
                                )}
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between py-2">
                                <div className="flex items-center gap-2 text-sm">
                                    <Shuffle className="h-4 w-4 text-muted-foreground" />
                                    <span>Shuffle Options</span>
                                </div>
                                {quiz.shuffleOptions ? (
                                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                        Enabled
                                    </Badge>
                                ) : (
                                    <Badge variant="secondary">Disabled</Badge>
                                )}
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between py-2">
                                <div className="flex items-center gap-2 text-sm">
                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                    <span>Show Correct Answers</span>
                                </div>
                                {quiz.showCorrectAnswers ? (
                                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                        Enabled
                                    </Badge>
                                ) : (
                                    <Badge variant="secondary">Disabled</Badge>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Availability</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    <span>Available From</span>
                                </div>
                                <p className="text-sm font-medium pl-6">
                                    {quiz.availableFrom
                                        ? new Date(quiz.availableFrom).toLocaleString()
                                        : "Always available"}
                                </p>
                            </div>
                            <Separator />
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    <span>Available Until</span>
                                </div>
                                <p className="text-sm font-medium pl-6">
                                    {quiz.availableTo
                                        ? new Date(quiz.availableTo).toLocaleString()
                                        : "No end date"}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Course Info</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-primary/10">
                                    <BookOpen className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">{quiz.course.title}</p>
                                    <p className="text-xs text-muted-foreground">
                                        Course
                                    </p>
                                </div>
                            </div>
                            {quiz.chapter && (
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900/30">
                                        <Layers className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">{quiz.chapter.title}</p>
                                        <p className="text-xs text-muted-foreground">
                                            Chapter
                                        </p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Metadata</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Created</span>
                                <span>{new Date(quiz.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Last Updated</span>
                                <span>{new Date(quiz.updatedAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Quiz ID</span>
                                <code className="text-xs bg-muted px-2 py-1 rounded">
                                    {quiz.id.slice(-8)}
                                </code>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Delete Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent className="rounded-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Quiz?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete{" "}
                            <span className="font-semibold text-foreground">{quiz.title}</span>{" "}
                            and all student attempts. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive hover:bg-destructive/90 rounded-xl"
                        >
                            Delete Forever
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Repost Dialog */}
            <Dialog open={repostDialogOpen} onOpenChange={setRepostDialogOpen}>
                <DialogContent className="sm:max-w-[500px] rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Copy className="h-5 w-5 text-primary" />
                            Repost Quiz to Courses
                        </DialogTitle>
                        <DialogDescription>
                            Duplicate &quot;{quiz?.title}&quot; to selected courses. The quiz
                            will be copied with all questions.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        <p className="text-sm font-medium mb-3">Select target courses:</p>

                        {loadingCourses ? (
                            <div className="space-y-2">
                                {[1, 2, 3].map((i) => (
                                    <Skeleton key={i} className="h-12 w-full rounded-lg" />
                                ))}
                            </div>
                        ) : availableCourses.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <p>No other courses available.</p>
                            </div>
                        ) : (
                            <ScrollArea className="h-[300px] pr-4">
                                <div className="space-y-2">
                                    {availableCourses.map((course) => (
                                        <div
                                            key={course.id}
                                            onClick={() => toggleCourseSelection(course.id)}
                                            className={cn(
                                                "flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all",
                                                selectedCourseIds.has(course.id)
                                                    ? "border-primary bg-primary/5"
                                                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                                            )}
                                        >
                                            <div className={cn(
                                                "h-5 w-5 rounded-md border-2 flex items-center justify-center mt-0.5 transition-colors",
                                                selectedCourseIds.has(course.id)
                                                    ? "bg-primary border-primary text-primary-foreground"
                                                    : "border-muted-foreground/30"
                                            )}>
                                                {selectedCourseIds.has(course.id) && (
                                                    <Check className="h-3 w-3" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm line-clamp-1">
                                                    {course.title}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    By {course.instructor?.fullName || "Unknown"}
                                                </p>
                                            </div>
                                            <Badge variant="outline" className="text-xs shrink-0">
                                                {course.level}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        )}

                        {selectedCourseIds.size > 0 && (
                            <p className="text-sm text-muted-foreground mt-3">
                                Selected: <span className="font-medium text-foreground">{selectedCourseIds.size}</span> course(s)
                            </p>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setRepostDialogOpen(false);
                                setSelectedCourseIds(new Set());
                            }}
                            className="rounded-xl"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleRepostQuiz}
                            disabled={selectedCourseIds.size === 0 || isReposting}
                            className="rounded-xl"
                        >
                            {isReposting ? (
                                <>
                                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                    Reposting...
                                </>
                            ) : (
                                <>
                                    <Copy className="mr-2 h-4 w-4" />
                                    Repost to {selectedCourseIds.size} Course(s)
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
