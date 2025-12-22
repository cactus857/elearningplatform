"use client";

import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { IconTrophy, IconMedal, IconArrowRight } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { FullAdminDashboardResponse } from "@/services/dashboard.service";

// Helper để render Icon Huy chương cho Top 3
const RankBadge = ({ rank }: { rank: number }) => {
  if (rank === 0) return <div className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-500/10 text-yellow-500"><IconTrophy size={18} fill="currentColor" /></div>;
  if (rank === 1) return <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-400/10 text-slate-400"><IconMedal size={18} /></div>;
  if (rank === 2) return <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-700/10 text-amber-700"><IconMedal size={18} /></div>;
  return <span className="flex items-center justify-center w-8 h-8 font-bold text-muted-foreground">#{rank + 1}</span>;
};

// Helper màu sắc cho Level
const getLevelBadgeStyles = (level: string) => {
  switch (level) {
    case 'BEGINNER': return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800";
    case 'INTERMEDIATE': return "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800";
    case 'ADVANCED': return "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800";
    default: return "bg-secondary text-secondary-foreground";
  }
};

export function TopStatsTables({ data }: { data: FullAdminDashboardResponse }) {
  const maxEnrollment = Math.max(...data.courses.topCoursesByEnrollment.map(c => c.totalEnrollments), 1);
  const maxStudents = Math.max(...data.users.topInstructors.map(i => i.totalStudents), 1);

  return (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
    >
      <Card className="overflow-hidden border-border/50 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between p-6 bg-muted/30">
            <div className="space-y-1">
                <CardTitle className="text-xl">Top Performers</CardTitle>
                <CardDescription>Highest ranking courses & instructors this period.</CardDescription>
            </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <Tabs defaultValue="courses" className="w-full">
            <div className="px-6 pt-4">
                <TabsList className="grid w-full grid-cols-2 sm:w-[400px]">
                    <TabsTrigger value="courses">Popular Courses</TabsTrigger>
                    <TabsTrigger value="instructors">Top Instructors</TabsTrigger>
                </TabsList>
            </div>
            
            {/* --- TAB COURSES --- */}
            <TabsContent value="courses" className="mt-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead className="w-[80px] text-center">Rank</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead className="text-right">Performance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.courses.topCoursesByEnrollment.slice(0, 5).map((course, idx) => (
                    <TableRow key={course.id} className="group h-20 transition-colors hover:bg-muted/40">
                      <TableCell className="font-medium text-center">
                         <div className="flex justify-center">
                            <RankBadge rank={idx} />
                         </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-4">
                          {/* Thumbnail với hiệu ứng hover zoom nhẹ */}
                          <div className="relative h-12 w-20 overflow-hidden rounded-md shadow-sm border border-border/50 group-hover:border-primary/50 transition-colors">
                            <img 
                                src={course.thumbnail || "/placeholder.png"} 
                                alt={course.title} 
                                className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110" 
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors">
                                {course.title}
                            </span>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>by</span>
                                <span className="font-medium text-foreground/80">{course.instructorName}</span>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("text-[10px] px-2 py-0.5 border font-medium", getLevelBadgeStyles(course.level))}>
                            {course.level}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right min-w-[150px]">
                         <div className="flex flex-col items-end gap-1.5">
                            <div className="flex items-baseline gap-1">
                                <span className="text-lg font-bold text-foreground">{course.totalEnrollments}</span>
                                <span className="text-xs text-muted-foreground">enrolled</span>
                            </div>
                            {/* Thanh Progress với Gradient Tím */}
                            <Progress 
                                value={(course.totalEnrollments / maxEnrollment) * 100} 
                                className="h-2 w-32 bg-muted [&>*]:bg-gradient-to-r [&>*]:from-violet-500 [&>*]:to-fuchsia-500" 
                            />
                         </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            {/* --- TAB INSTRUCTORS --- */}
            <TabsContent value="instructors" className="mt-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead className="w-[80px] text-center">Rank</TableHead>
                    <TableHead>Instructor</TableHead>
                    <TableHead className="text-center">Courses</TableHead>
                    <TableHead className="text-right">Total Students</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.users.topInstructors.map((instructor, idx) => (
                    <TableRow key={instructor.id} className="group h-20 transition-colors hover:bg-muted/40">
                       <TableCell className="font-medium text-center">
                         <div className="flex justify-center">
                            <RankBadge rank={idx} />
                         </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-4">
                            <Avatar className="h-10 w-10 border-2 border-background ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
                                <AvatarImage src={instructor.avatar || ""} />
                                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                    {instructor.fullName.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col gap-0.5">
                                <span className="font-semibold text-sm group-hover:text-primary transition-colors">
                                    {instructor.fullName}
                                </span>
                                <span className="text-xs text-muted-foreground font-mono">
                                    {instructor.email}
                                </span>
                            </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                          <Badge variant="secondary" className="font-mono">
                              {instructor.totalCourses}
                          </Badge>
                      </TableCell>
                      <TableCell className="text-right min-w-[150px]">
                         <div className="flex flex-col items-end gap-1.5">
                            <div className="flex items-baseline gap-1">
                                <span className="text-lg font-bold text-foreground">{instructor.totalStudents}</span>
                                <span className="text-xs text-muted-foreground">students</span>
                            </div>
                            {/* Thanh Progress với Gradient Xanh */}
                            <Progress 
                                value={(instructor.totalStudents / maxStudents) * 100} 
                                className="h-2 w-32 bg-muted [&>*]:bg-gradient-to-r [&>*]:from-cyan-500 [&>*]:to-blue-500" 
                            />
                         </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
}