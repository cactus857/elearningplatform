"use client";

import { useEffect, useState } from "react";
import { IconLoader } from "@tabler/icons-react";
import { DateRange } from "react-day-picker"; 

import { 
  DashboardPeriod, 
  FullAdminDashboardResponse, 
  getAdminDashboardFull 
} from "@/services/dashboard.service";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SectionCards } from "@/components/dashboard/section-cards";
import { OverviewChart } from "@/components/dashboard/overview-chart";
import { TopStatsTables } from "@/components/dashboard/top-stats-tables";
import { DistributionCharts } from "@/components/dashboard/distribution-charts";
import { SystemDeviceChart } from "@/components/dashboard/system-device-chart";
import { CalendarDateRangePicker } from "@/components/shared/date-range-picker";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";

export default function AdminIndexPage() {
  const [data, setData] = useState<FullAdminDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [period, setPeriod] = useState<DashboardPeriod>("30days");
  
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await getAdminDashboardFull(period, dateRange);
        setData(response);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [period, dateRange]); 

  const handlePeriodChange = (val: DashboardPeriod) => {
    setPeriod(val);
    setDateRange(undefined); 
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    
  };

  if (loading && !data) {
    return <DashboardSkeleton />;
  }

  if (!data) return null;

  return (
    <div className="flex flex-col gap-4 p-4 lg:gap-6 lg:p-6 min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard Overview</h1>
          <p className="text-muted-foreground">
            System performance and growth analytics.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
            <CalendarDateRangePicker 
                date={dateRange} 
                setDate={handleDateRangeChange} 
                className="w-full sm:w-auto"
            />
            
            <Select 
                value={dateRange ? "" : period} 
                onValueChange={(val) => handlePeriodChange(val as DashboardPeriod)}
            >
                <SelectTrigger className="w-full sm:w-[160px]">
                    <SelectValue placeholder="Quick Filter" />
                </SelectTrigger>
                <SelectContent align="end">
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="7days">Last 7 Days</SelectItem>
                    <SelectItem value="30days">Last 30 Days</SelectItem>
                    <SelectItem value="90days">Last 3 Months</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                    <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
            </Select>
        </div>
      </div>

      <div className={`space-y-4 transition-opacity duration-300 ${loading ? 'opacity-60 pointer-events-none' : 'opacity-100'}`}>
        
        <SectionCards data={data} />
        
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2 flex flex-col gap-4">
                <OverviewChart data={data} />
                <SystemDeviceChart data={data} />
            </div>
            <div className="lg:col-span-1">
                <DistributionCharts data={data} />
            </div>
        </div>

        <div className="grid grid-cols-1">
            <TopStatsTables data={data} />
        </div>

      </div>
    </div>
  );
}