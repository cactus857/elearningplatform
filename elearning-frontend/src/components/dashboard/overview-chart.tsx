"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
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
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { FullAdminDashboardResponse } from "@/services/dashboard.service"

const chartConfig = {
  visitors: {
    label: "Total Activity",
  },
  users: {
    label: "New Users",
    color: "var(--chart-1)", 
  },
  enrollments: {
    label: "Enrollments",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig
export function OverviewChart({ data }: { data: FullAdminDashboardResponse }) {
  
  const chartData = React.useMemo(() => {
    const enrollmentMap = new Map(data.enrollments.enrollmentTrend.map(i => [i.date, i.count]));
    const userMap = new Map(data.users.userTrend.map(i => [i.date, i.count]));
    
    const allDates = Array.from(new Set([...enrollmentMap.keys(), ...userMap.keys()])).sort();

    return allDates.map(date => ({
        date, 
        enrollments: enrollmentMap.get(date) || 0,
        users: userMap.get(date) || 0
    }));
  }, [data]);

  return (
    <Card>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>Growth Analytics</CardTitle>
          <CardDescription>
            Showing users and enrollments trends over time
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[300px] w-full"
        >
          <AreaChart data={chartData} margin={{ left: 12, right: 12 }}>
            <defs>
              <linearGradient id="fillUsers" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-users)" 
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-users)"
                  stopOpacity={0.1}
                />
              </linearGradient>

              <linearGradient id="fillEnrollments" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-enrollments)" 
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-enrollments)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>

            <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.2} />
            
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />

            <YAxis 
                tickLine={false} 
                axisLine={false} 
                width={30} 
                domain={[0, 'auto']} 
                allowDataOverflow={true} 
            />

            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }}
                  indicator="dot"
                />
              }
            />

          
            <Area
              dataKey="users"
              type="monotone"
              fill="url(#fillUsers)"
              stroke="var(--color-users)"
              strokeWidth={2}
              stackId="a" 
            />

            <Area
              dataKey="enrollments"
              type="monotone"
              fill="url(#fillEnrollments)"
              stroke="var(--color-enrollments)"
              strokeWidth={2}
              stackId="a"
            />
            
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}