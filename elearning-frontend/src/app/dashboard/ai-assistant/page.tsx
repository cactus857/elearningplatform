"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Sparkles,
  Layers,
  Cpu,
  Zap,
  Box,
  Network,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AISelectionPage() {
  return (
    <div className="min-h-screen w-full bg-background text-foreground relative overflow-hidden selection:bg-primary/20">
      {/* 1. Subtle Background Grid (Fixed for both themes) */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute h-full w-full bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      </div>

      <div className="container mx-auto px-6 py-24 max-w-7xl relative z-10">
        {/* 2. Modern Header */}
        <div className="text-center mb-24 max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-secondary/50 text-secondary-foreground text-xs font-medium backdrop-blur-md animate-in fade-in zoom-in duration-500">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Powered by Next-Gen LLMs</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground">
            Select Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400">
              Co-Pilot
            </span>
          </h1>

          <p className="text-xl text-muted-foreground leading-relaxed">
            Choose a specialized AI agent fine-tuned for your specific
            educational needs.
          </p>
        </div>

        {/* 3. Spacious Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16 items-stretch">
          {/* --- AGENT 1: ARCHITECT (Course) --- */}
          <Link
            href="/dashboard/ai-assistant/course-generator"
            className="group block h-full"
          >
            <div className="relative h-full flex flex-col rounded-[2.5rem] bg-card border border-border overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2 group-hover:border-blue-500/30">
              {/* Abstract Header Image (GPT/Gemini Style) */}
              <div className="relative h-72 w-full overflow-hidden bg-blue-950">
                <Image
                  // Abstract Blue/Purple Mesh
                  src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop"
                  alt="Course Architect AI"
                  fill
                  className="object-cover opacity-90 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />

                {/* Badge */}
                <div className="absolute top-6 right-6">
                  <div className="h-10 w-10 rounded-full bg-background/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                    <Network className="h-5 w-5 text-white" />
                  </div>
                </div>
              </div>

              {/* Content Body */}
              <div className="flex flex-col flex-grow p-10 pt-2">
                <div className="mb-6">
                  <div className="text-sm font-bold tracking-widest text-blue-600 dark:text-blue-400 uppercase mb-2">
                    Architect Model
                  </div>
                  <h3 className="text-3xl font-bold text-foreground mb-3">
                    Course Generator
                  </h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    Specialized in structural design. It builds comprehensive
                    curriculum frameworks, lectures, and learning paths.
                  </p>
                </div>

                {/* Features List */}
                <div className="mt-auto space-y-6">
                  <div className="h-px w-full bg-border" />
                  <ul className="grid gap-4">
                    {[
                      "Curriculum Structuring",
                      "Content Drafting",
                      "Resource Compilation",
                    ].map((item, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-3 text-sm font-medium text-foreground/80"
                      >
                        <div className="h-6 w-6 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                          <Zap className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                        </div>
                        {item}
                      </li>
                    ))}
                  </ul>

                  <Button className="w-full h-14 rounded-2xl text-base bg-foreground text-background hover:bg-blue-600 hover:text-white transition-all shadow-none">
                    Initialize Architect <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Link>

          {/* --- AGENT 2: EVALUATOR (Quiz) --- */}
          <Link
            href="/dashboard/ai-assistant/quiz-generator"
            className="group block h-full"
          >
            <div className="relative h-full flex flex-col rounded-[2.5rem] bg-card border border-border overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-orange-500/10 hover:-translate-y-2 group-hover:border-orange-500/30">
              {/* Abstract Header Image (Claude/Mistral Style) */}
              <div className="relative h-72 w-full overflow-hidden bg-orange-950">
                <Image
                  // Abstract Orange/Warm Mesh
                  src="https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=2574&auto=format&fit=crop"
                  alt="Quiz Evaluator AI"
                  fill
                  className="object-cover opacity-90 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />

                {/* Badge */}
                <div className="absolute top-6 right-6">
                  <div className="h-10 w-10 rounded-full bg-background/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                    <Cpu className="h-5 w-5 text-white" />
                  </div>
                </div>
              </div>

              {/* Content Body */}
              <div className="flex flex-col flex-grow p-10 pt-2">
                <div className="mb-6">
                  <div className="text-sm font-bold tracking-widest text-orange-600 dark:text-orange-400 uppercase mb-2">
                    Evaluator Model
                  </div>
                  <h3 className="text-3xl font-bold text-foreground mb-3">
                    Quiz Generator
                  </h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    Fine-tuned for assessment logic. Generates diverse question
                    sets, grading rubrics, and detailed explanations.
                  </p>
                </div>

                {/* Features List */}
                <div className="mt-auto space-y-6">
                  <div className="h-px w-full bg-border" />
                  <ul className="grid gap-4">
                    {[
                      "Adaptive Difficulty",
                      "Automated Grading Logic",
                      "Bulk Question Export",
                    ].map((item, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-3 text-sm font-medium text-foreground/80"
                      >
                        <div className="h-6 w-6 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0">
                          <Box className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400" />
                        </div>
                        {item}
                      </li>
                    ))}
                  </ul>

                  <Button className="w-full h-14 rounded-2xl text-base bg-foreground text-background hover:bg-orange-600 hover:text-white transition-all shadow-none">
                    Initialize Evaluator <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* 4. Separated Stats Section */}
        <div className="mt-32 border-t border-border pt-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <h4 className="text-2xl font-bold mb-2">Why AI Studio?</h4>
              <p className="text-muted-foreground">
                Leveraging state-of-the-art models to reduce your workload while
                maintaining pedagogical integrity.
              </p>
            </div>

            <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-secondary/30 border border-border/50">
                <div className="text-4xl font-bold text-foreground mb-1">
                  10x
                </div>
                <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Faster Workflow
                </div>
              </div>
              <div className="p-6 rounded-2xl bg-secondary/30 border border-border/50">
                <div className="text-4xl font-bold text-foreground mb-1">
                  99%
                </div>
                <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Consistency
                </div>
              </div>
              <div className="p-6 rounded-2xl bg-secondary/30 border border-border/50">
                <div className="text-4xl font-bold text-foreground mb-1">
                  24/7
                </div>
                <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Uptime
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
