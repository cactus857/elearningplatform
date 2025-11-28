"use client";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  BookOpen,
  Users,
  BarChart2,
  MessageCircle,
  Sparkles,
  BrainCircuit,
  Bot,
  Zap,
  CheckCircle2,
  PlayCircle,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const features = [
  {
    title: "Comprehensive Courses",
    description: "Structured learning paths designed for clarity and depth.",
    icon: <BookOpen className="h-6 w-6" />,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    hoverBg: "group-hover:bg-blue-500",
  },
  {
    title: "Expert Instructors",
    description:
      "Learn directly from industry professionals and thought leaders.",
    icon: <Users className="h-6 w-6" />,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    hoverBg: "group-hover:bg-purple-500",
  },
  {
    title: "Progress Tracking",
    description: "Visualize your growth with advanced analytics and insights.",
    icon: <BarChart2 className="h-6 w-6" />,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    hoverBg: "group-hover:bg-emerald-500",
  },
  {
    title: "Community Support",
    description:
      "Connect with peers and mentors in a collaborative environment.",
    icon: <MessageCircle className="h-6 w-6" />,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    hoverBg: "group-hover:bg-orange-500",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/20 blur-[120px] rounded-full -z-10 animate-pulse duration-[5000ms]"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-500/10 blur-[100px] rounded-full -z-10"></div>

        <div className="container mx-auto px-4 md:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-medium mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Sparkles className="h-4 w-4" />
            <span>AI-Powered Learning Platform</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
            Master Skills Faster with <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-pink-500 animate-gradient-x">
              Intelligent Learning
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed">
            Create, manage, and track your educational content with the power of
            AI. Automated quizzes, structured courses, and personalized paths
            await.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/courses"
              className={buttonVariants({
                size: "lg",
                className:
                  "h-12 px-8 text-base rounded-full shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all hover:-translate-y-1",
              })}
            >
              Start Learning Free
            </Link>
            <Link
              href="/"
              className={buttonVariants({
                size: "lg",
                variant: "outline",
                className:
                  "h-12 px-8 text-base rounded-full border-2 hover:bg-muted/50 gap-2",
              })}
            >
              <PlayCircle className="h-5 w-5" /> Watch Demo
            </Link>
          </div>
        </div>
      </section>

      {/* --- AI FEATURE SHOWCASE --- */}
      <section className="py-24 bg-muted/30 border-y border-border/50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Text Content */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Supercharge Content with <br />
                  <span className="text-primary">Generative AI</span>
                </h2>
                <p className="text-muted-foreground text-lg">
                  Stop spending hours on curriculum design. Our AI architects
                  build the foundation, so you can focus on teaching.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex gap-4 p-4 rounded-xl bg-background border border-border/50 shadow-sm hover:border-primary/30 transition-colors">
                  <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600 shrink-0">
                    <BrainCircuit className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Course Architect</h3>
                    <p className="text-muted-foreground text-sm mt-1">
                      Generate complete course structures, lesson plans, and
                      reading materials from a single prompt.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 rounded-xl bg-background border border-border/50 shadow-sm hover:border-primary/30 transition-colors">
                  <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-600 shrink-0">
                    <Bot className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Smart Quiz Generator</h3>
                    <p className="text-muted-foreground text-sm mt-1">
                      Instantly create diverse quizzes with automated grading
                      and explanations based on your content.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Abstract Art */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative rounded-2xl bg-card border border-border p-8 h-[400px] flex items-center justify-center overflow-hidden">
                {/* Decorative Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

                {/* Floating Elements */}
                <div className="absolute top-10 left-10 p-4 bg-background shadow-xl rounded-xl border border-border animate-bounce duration-[3000ms]">
                  <Zap className="h-6 w-6 text-yellow-500" />
                </div>
                <div className="absolute bottom-20 right-10 p-4 bg-background shadow-xl rounded-xl border border-border animate-bounce duration-[4000ms]">
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                </div>

                <div className="text-center relative z-10">
                  <div className="h-20 w-20 bg-gradient-to-tr from-primary to-purple-500 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-primary/30 mb-4">
                    <Sparkles className="h-10 w-10 text-white" />
                  </div>
                  <div className="font-bold text-xl">AI Processing</div>
                  <div className="text-sm text-muted-foreground mt-2">
                    Analyzing content structure...
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FEATURES GRID (The requested part) --- */}
      <section className="py-24 bg-background relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Powerful features designed to enhance the learning experience for
              students and instructors alike.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative bg-card rounded-2xl border border-border p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/20"
              >
                {/* Icon Box */}
                <div
                  className={cn(
                    "h-14 w-14 rounded-xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg",
                    feature.bg,
                    feature.color,
                    feature.hoverBg,
                    "group-hover:text-white"
                  )}
                >
                  {feature.icon}
                </div>

                <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>

                {/* Bottom decorative line */}
                <div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-primary to-purple-500 transition-all duration-300 group-hover:w-full rounded-b-2xl"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="py-24 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="bg-primary/5 border border-primary/10 rounded-3xl p-8 md:p-16 text-center max-w-4xl mx-auto backdrop-blur-sm">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Transform Your Learning?
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of learners and instructors on the most advanced
              AI-powered LMS platform today.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/sign-in"
                className={buttonVariants({
                  size: "lg",
                  className:
                    "h-14 px-8 text-lg rounded-xl shadow-xl shadow-primary/20",
                })}
              >
                Get Started Now
              </Link>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              No credit card required for free tier.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
