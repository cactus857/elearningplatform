"use client";

import { useId } from "react";
import { Area, AreaChart, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import { FullAdminDashboardResponse } from "@/services/dashboard.service"; 
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Users, 
  CreditCard, 
  BookOpen, 
  Activity,
  LucideIcon 
} from "lucide-react";

// COMPONENT CON: STAT CARD
interface StatCardProps {
  title: string;
  value: number | string;
  growthRate: number; 
  trendData: { date: string; count: number }[];
  icon: LucideIcon;
  subText?: string;
  delay?: number;
}

function StatCard({ title, value, growthRate, trendData, icon: Icon, subText, delay = 0 }: StatCardProps) {
  const id = useId(); 
  const isPositive = growthRate > 0;
  const isNeutral = growthRate === 0;

  const color = isPositive 
    ? "#10b981" 
    : isNeutral 
      ? "#94a3b8" 
      : "#f43f5e"; 

  const TrendIcon = isPositive ? TrendingUp : isNeutral ? Minus : TrendingDown;
  
  const textColorClass = isPositive 
    ? "text-emerald-500" 
    : isNeutral 
      ? "text-muted-foreground" 
      : "text-rose-500";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <Card className="overflow-hidden border-border/50 shadow-sm hover:shadow-md transition-all group">
        <CardContent className="p-6">
          
          {/* Hàng 1: Title + Icon Box */}
          <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground truncate">
                {title}
              </span>
              <div className="p-2 bg-muted/50 rounded-lg group-hover:bg-muted transition-colors">
                  <Icon className="w-4 h-4 text-foreground/70" />
              </div>
          </div>

          <div className="mt-3">
             <span className="text-3xl font-bold text-foreground tracking-tight">
                {value}
             </span>
          </div>

          <div className="flex items-end justify-between mt-4 gap-4">
              
              <div className="flex flex-col">
                 <div className={`flex items-center text-sm font-medium ${textColorClass} mb-1`}>
                    <TrendIcon className="w-4 h-4 mr-1" />
                    {Math.abs(growthRate)}%
                 </div>
                 <span className="text-xs text-muted-foreground opacity-80 whitespace-nowrap">
                   {subText || "last 30 days"}
                 </span>
              </div>

              <div className="h-10 w-24">
                <ChartContainer
                  className="w-full h-full"
                  config={{
                    value: { label: "Value", color: color },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={color} stopOpacity={0.4} />
                          <stop offset="100%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" hide />
                      <YAxis domain={['dataMin', 'dataMax']} hide />
                      <Area
                        dataKey="count"
                        type="monotone"
                        stroke={color}
                        fill={`url(#${id})`}
                        strokeWidth={2}
                        fillOpacity={1}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>

          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// MAIN COMPONENT
export function SectionCards({ data }: { data: FullAdminDashboardResponse }) {
  const { overview, users, enrollments, courses, quizzes } = data;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Users"
        value={overview.totalUsers}
        growthRate={overview.userGrowth.growthRate}
        trendData={users.userTrend}
        icon={Users}
        delay={0.1}
      />
      <StatCard
        title="Total Enrollments"
        value={overview.totalEnrollments}
        growthRate={overview.enrollmentGrowth.growthRate}
        trendData={enrollments.enrollmentTrend}
        icon={CreditCard}
        delay={0.2}
      />
      <StatCard
        title="Active Courses"
        value={overview.totalCourses}
        growthRate={overview.courseGrowth.growthRate}
        trendData={courses.courseTrend}
        icon={BookOpen}
        delay={0.3}
      />
      <StatCard
        title="Quiz Attempts"
        value={overview.totalQuizAttempts}
        growthRate={quizzes.performance.passRate} 
        trendData={quizzes.attemptTrend}
        subText="pass rate"
        icon={Activity}
        delay={0.4}
      />
    </div>
  );
}