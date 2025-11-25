"use client";

import React from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  GraduationCap,
  HelpCircle,
  Sparkles,
  CheckCircle2,
  Zap,
  ArrowRight,
  BrainCircuit,
} from "lucide-react";

function Page() {
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">AI Assistant</h1>
        <p className="text-muted-foreground">
          Chọn AI Assistant phù hợp để giúp bạn tạo nội dung học tập chuyên
          nghiệp
        </p>
      </div>

      {/* Assistant Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Course Generator Assistant */}
        <Link href="/dashboard/ai-assistant/course-generator">
          <Card className="group relative overflow-hidden border-2 hover:border-primary transition-all duration-300 hover:shadow-lg cursor-pointer h-full">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
            <CardHeader>
              <div className="flex items-start justify-between mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <GraduationCap className="h-6 w-6 text-primary" />
                </div>
                <Badge variant="secondary" className="gap-1">
                  <Sparkles className="h-3 w-3" />
                  AI Powered
                </Badge>
              </div>
              <CardTitle className="text-2xl">Course Generator</CardTitle>
              <CardDescription className="text-base">
                Tạo khóa học hoàn chỉnh với nội dung chi tiết, bài giảng và bài
                tập
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Separator />
              <div className="space-y-3">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  Tính năng nổi bật:
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>Tự động tạo cấu trúc khóa học đầy đủ</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>
                      Sinh nội dung bài giảng chi tiết theo từng chương
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>Đề xuất bài tập và mục tiêu học tập</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>Preview trước khi lưu khóa học</span>
                  </li>
                </ul>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors gap-2"
                asChild
              >
                <div className="flex items-center justify-center gap-2">
                  Bắt đầu tạo khóa học
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Button>
            </CardFooter>
          </Card>
        </Link>

        {/* Quiz Generator Assistant */}
        <Link href="/dashboard/ai-assistant/quiz-generator">
          <Card className="group relative overflow-hidden border-2 hover:border-primary transition-all duration-300 hover:shadow-lg cursor-pointer h-full">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
            <CardHeader>
              <div className="flex items-start justify-between mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <HelpCircle className="h-6 w-6 text-primary" />
                </div>
                <Badge variant="secondary" className="gap-1">
                  <Sparkles className="h-3 w-3" />
                  AI Powered
                </Badge>
              </div>
              <CardTitle className="text-2xl">Quiz Generator</CardTitle>
              <CardDescription className="text-base">
                Tạo bài kiểm tra và câu hỏi đánh giá kiến thức tự động
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Separator />
              <div className="space-y-3">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  Tính năng nổi bật:
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>Tạo câu hỏi trắc nghiệm thông minh</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>
                      Hỗ trợ nhiều loại câu hỏi (Multiple choice, True/False)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>Tự động tạo đáp án và giải thích</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>Phân loại độ khó và thời gian làm bài</span>
                  </li>
                </ul>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors gap-2"
                asChild
              >
                <div className="flex items-center justify-center gap-2">
                  Bắt đầu tạo quiz
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Button>
            </CardFooter>
          </Card>
        </Link>
      </div>

      {/* Info Section */}
      <Card className="mt-8 border-primary/20 bg-primary/5">
        <CardHeader>
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <BrainCircuit className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Về AI Assistant</CardTitle>
              <CardDescription className="mt-1">
                Công nghệ AI tiên tiến giúp bạn tạo nội dung giáo dục chất lượng
                cao trong vài phút
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div>
                <div className="font-medium">Tiết kiệm thời gian</div>
                <div className="text-muted-foreground">
                  Tạo nội dung trong vài phút thay vì hàng giờ
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div>
                <div className="font-medium">Chất lượng cao</div>
                <div className="text-muted-foreground">
                  Nội dung được tối ưu hóa bởi AI
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div>
                <div className="font-medium">Dễ dàng tùy chỉnh</div>
                <div className="text-muted-foreground">
                  Chỉnh sửa và cá nhân hóa theo ý muốn
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Page;
