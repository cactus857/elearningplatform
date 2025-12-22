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
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { FullAdminDashboardResponse } from "@/services/dashboard.service"

// Dùng màu chart-3 (thường là xanh đậm hoặc tím khác) để phân biệt
const chartConfig = {
  devices: {
    label: "Active Devices",
    color: "var(--chart-3)", 
  },
} satisfies ChartConfig

export function SystemDeviceChart({ data }: { data: FullAdminDashboardResponse }) {
  
  // Map data từ system.devices
  const chartData = React.useMemo(() => {
    return data.system.devices.deviceTypes.map(d => ({
        type: d.type,  // Desktop, Mobile...
        count: d.count // Số lượng
    }));
  }, [data]);

  return (
    <Card>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>System Devices</CardTitle>
          <CardDescription>
            Active sessions by device type
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
              {/* Gradient cho Devices - Map theo var(--color-devices) */}
              <linearGradient id="fillDevices" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-devices)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-devices)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>

            <CartesianGrid vertical={false} />
            
            <XAxis
              dataKey="type"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />

             {/* Trục Y ẩn, bắt đầu từ 0 */}
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
                  indicator="dot"
                />
              }
            />

            {/* Vẽ đường cong Area */}
            <Area
              dataKey="count"
              type="monotone" // Dùng monotone để mượt mà không bị âm
              fill="url(#fillDevices)"
              stroke="var(--color-devices)"
              fillOpacity={0.4}
            />
            
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}