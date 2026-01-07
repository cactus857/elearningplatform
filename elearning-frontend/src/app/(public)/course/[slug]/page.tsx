import { getCourseById, getCourseBySlug } from "@/services/course.service";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Clock,
  BarChart,
  Users,
  Check,
  PlayCircle,
  FileText,
  Globe,
  Calendar,
  Layers,
  Video,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/utils/get-initial";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { EnrollmentStatusButton } from "./_components/EnrollmentStatusButton ";

type Params = Promise<{ slug: string }>;

export default async function CourseDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);

  const totalLessons =
    course.chapters?.reduce((acc, ch) => acc + (ch.lessons?.length || 0), 0) ||
    0;

  return (
    <div className="min-h-screen bg-background font-sans">
      <div className="relative bg-slate-900 text-slate-50 border-b border-slate-800">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px]" />
        </div>

        <div className="container mx-auto px-4 py-12 lg:py-20 relative z-10">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Left Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Breadcrumb / Category */}
              <div className="flex items-center gap-3">
                <Badge
                  variant="secondary"
                  className="bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 border-0 rounded-md px-3 py-1 text-xs font-semibold tracking-wide uppercase"
                >
                  {course.category || "General"}
                </Badge>
                {course.status === "PUBLISHED" && (
                  <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full border border-emerald-400/20">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />{" "}
                    Published
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
                {course.title}
              </h1>

              {/* Short Description */}
              <p className="text-lg text-slate-300 leading-relaxed max-w-3xl">
                {course.smallDescription}
              </p>

              {/* Metadata */}
              <div className="flex flex-wrap items-center gap-y-3 gap-x-6 text-sm text-slate-400 pt-2">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6 border border-slate-600">
                    <AvatarImage src={course.instructor?.avatar} />
                    <AvatarFallback className="bg-slate-700 text-[10px]">
                      {getInitials(course.instructor?.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-slate-200 font-medium">
                    By {course.instructor?.fullName}
                  </span>
                </div>
                <div className="w-px h-4 bg-slate-700 hidden sm:block" />
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Last updated{" "}
                    {new Date(course.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Globe className="w-4 h-4" />
                  <span>English</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-10">
          {/* Left Column (Content) */}
          <div className="lg:col-span-2 space-y-10">
            {/* What you'll learn */}
            {course.whatYouWillLearn && course.whatYouWillLearn.length > 0 && (
              <div className="border border-border rounded-2xl p-6 md:p-8 bg-card shadow-sm">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  What you&apos;ll learn
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {course.whatYouWillLearn.map((item, index) => (
                    <div key={index} className="flex gap-3 items-start">
                      <div className="mt-1 bg-primary/10 p-1 rounded-full text-primary shrink-0">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </div>
                      <span className="text-sm text-muted-foreground leading-relaxed">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Course Content / Curriculum */}
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Course Content</h2>
                <div className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full font-medium">
                  {course.chapters?.length || 0} sections • {totalLessons}{" "}
                  lectures
                </div>
              </div>

              <div className="border rounded-xl overflow-hidden bg-card shadow-sm">
                <Accordion type="multiple" className="w-full">
                  {course.chapters
                    ?.sort((a, b) => a.position - b.position)
                    .map((chapter) => (
                      <AccordionItem
                        key={chapter.id}
                        value={chapter.id}
                        className="border-b last:border-0"
                      >
                        <AccordionTrigger className="px-6 py-4 hover:bg-muted/40 hover:no-underline data-[state=open]:bg-muted/20">
                          <div className="flex items-center gap-4 text-left w-full">
                            <div className="bg-primary/10 p-2 rounded-lg text-primary">
                              <Layers className="h-4 w-4" />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-semibold text-base">
                                {chapter.title}
                              </span>
                              <span className="text-xs text-muted-foreground font-normal mt-0.5">
                                {chapter.lessons?.length || 0} lessons
                              </span>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="bg-muted/5 border-t border-border/50">
                          <div className="flex flex-col py-1">
                            {chapter.lessons
                              ?.sort((a, b) => a.position - b.position)
                              .map((lesson) => (
                                <div
                                  key={lesson.id}
                                  className="flex items-center justify-between py-3 px-6 pl-[4.5rem] hover:bg-muted/50 transition-colors cursor-default group"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full border border-border flex items-center justify-center bg-background group-hover:border-primary/50 transition-colors">
                                      <PlayCircle className="h-3 w-3 text-muted-foreground group-hover:text-primary" />
                                    </div>
                                    <span className="text-sm font-medium text-foreground/80 group-hover:text-foreground">
                                      {lesson.title}
                                    </span>
                                  </div>
                                  <span className="text-xs text-muted-foreground font-mono">
                                    {/* 10:00 */}
                                  </span>
                                </div>
                              ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                </Accordion>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Description</h2>
              <div className="border-l-4 border-primary/20 pl-6 py-1">
                <div
                  className="prose prose-slate dark:prose-invert max-w-none text-muted-foreground text-sm leading-7"
                  dangerouslySetInnerHTML={{
                    __html:
                      course.description || "<p>No description available.</p>",
                  }}
                />
              </div>
            </div>

            {/* Requirements */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Requirements</h2>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-2">
                {course.requirements && course.requirements.length > 0 ? (
                  course.requirements.map((req, idx) => (
                    <li key={idx} className="pl-2 marker:text-primary">
                      {req}
                    </li>
                  ))
                ) : (
                  <li>No specific requirements.</li>
                )}
              </ul>
            </div>

            {/* Simplified Instructor Info */}
            <div className="pt-6 border-t">
              <div className="flex items-center gap-4 bg-muted/30 p-4 rounded-xl border border-border/50">
                <Avatar className="h-16 w-16 border-2 border-background shadow-sm">
                  <AvatarImage src={course.instructor?.avatar} />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                    {getInitials(course.instructor?.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">
                    Created By
                  </p>
                  <h3 className="text-lg font-bold text-foreground">
                    {course.instructor?.fullName}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {course.instructor?.email}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (Sticky Sidebar) */}
          <div className="lg:col-span-1 relative">
            <div className="sticky top-24 space-y-6">
              {/* Floating Course Card */}
              <Card className="overflow-hidden border-0 shadow-2xl ring-1 ring-slate-200 dark:ring-slate-800 -mt-0 lg:-mt-32 relative z-20 bg-background rounded-2xl p-0 gap-0">
                {/* Thumbnail */}
                <div className="relative aspect-video w-full bg-slate-100 dark:bg-slate-900 group overflow-hidden">
                  {course.thumbnail ? (
                    <Image
                      src={course.thumbnail}
                      alt={course.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-400">
                      <FileText className="w-12 h-12" />
                    </div>
                  )}
                </div>

                <CardContent className="p-6">
                  <div className="mb-6">
                    <EnrollmentStatusButton courseId={course.id} />
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
                      <Layers className="w-4 h-4 text-primary" />
                      Course Includes
                    </h4>
                    <ul className="space-y-3 text-sm text-muted-foreground">
                      <li className="flex items-center justify-between border-b border-dashed border-border/60 pb-2">
                        <div className="flex items-center gap-2">
                          <Video className="w-4 h-4 text-slate-400" /> Content
                        </div>
                        <span className="font-medium text-foreground">
                          {course.duration || "10"} hours
                        </span>
                      </li>
                      <li className="flex items-center justify-between border-b border-dashed border-border/60 pb-2">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-slate-400" />{" "}
                          Lessons
                        </div>
                        <span className="font-medium text-foreground">
                          {totalLessons}
                        </span>
                      </li>
                      <li className="flex items-center justify-between border-b border-dashed border-border/60 pb-2">
                        <div className="flex items-center gap-2">
                          <BarChart className="w-4 h-4 text-slate-400" /> Level
                        </div>
                        <span className="capitalize font-medium text-foreground">
                          {course.level?.toLowerCase()}
                        </span>
                      </li>
                      <li className="flex items-center justify-between border-b border-dashed border-border/60 pb-2">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-slate-400" /> Students
                        </div>
                        <span className="font-medium text-foreground">
                          {course._count?.enrollments || 0}
                        </span>
                      </li>
                      <li className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-slate-400" /> Access
                        </div>
                        <span className="font-medium text-foreground">
                          Lifetime
                        </span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
