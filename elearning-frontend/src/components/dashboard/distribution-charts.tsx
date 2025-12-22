"use client"

import * as React from "react"
import { Pie, PieChart } from "recharts"
import { motion } from "framer-motion"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { FullAdminDashboardResponse } from "@/services/dashboard.service" 
const chartConfigRoles = {
  visitors: { label: "Users" },
  ADMIN: { label: "Admin", color: "var(--chart-1)" },        
  INSTRUCTOR: { label: "Instructor", color: "var(--chart-2)" }, 
  STUDENT: { label: "Student", color: "var(--chart-3)" },     
} satisfies ChartConfig

const chartConfigStatus = {
  visitors: { label: "Courses" },
  PUBLISHED: { label: "Published", color: "var(--chart-1)" }, 
  DRAFT: { label: "Draft", color: "var(--chart-2)" },         
  ARCHIVED: { label: "Archived", color: "var(--chart-3)" }, 
} satisfies ChartConfig

export function DistributionCharts({ data }: { data: FullAdminDashboardResponse }) {
  
  const roleData = React.useMemo(() => {
    return data.users.byRole.map((item) => ({
      role: item.role, 
      count: item.count,
      fill: `var(--chart-${item.role === 'ADMIN' ? '1' : item.role === 'INSTRUCTOR' ? '2' : '3'})`,
    }))
  }, [data])

  const statusData = React.useMemo(() => {
    return data.courses.byStatus.map((item) => ({
      status: item.status,
      count: item.count,
      fill: item.status === 'ARCHIVED' 
        ? "var(--chart-3)" 
        : `var(--chart-${item.status === 'PUBLISHED' ? '1' : '2'})`,
    }))
  }, [data])

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="grid gap-4 md:grid-cols-2 lg:grid-cols-1"
    >
      {/* --- CHART 1: USER ROLES --- */}
      <Card className="flex flex-col border-border/50 hover:shadow-md transition-all">
        <CardHeader className="items-center pb-0">
          <CardTitle>User Roles</CardTitle>
          <CardDescription>Distribution by account type</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <ChartContainer
            config={chartConfigRoles}
            className="mx-auto aspect-square max-h-[250px] pb-0 [&_.recharts-pie-label-text]:fill-foreground"
          >
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Pie 
                data={roleData} 
                dataKey="count" 
                label 
                nameKey="role" 
              />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* --- CHART 2: COURSE STATUS --- */}
      <Card className="flex flex-col border-border/50 hover:shadow-md transition-all">
        <CardHeader className="items-center pb-0">
          <CardTitle>Course Status</CardTitle>
          <CardDescription>Content pipeline status</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <ChartContainer
            config={chartConfigStatus}
            className="mx-auto aspect-square max-h-[250px] pb-0 [&_.recharts-pie-label-text]:fill-foreground"
          >
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Pie 
                data={statusData} 
                dataKey="count" 
                label 
                nameKey="status" 
              />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </motion.div>
  )
}