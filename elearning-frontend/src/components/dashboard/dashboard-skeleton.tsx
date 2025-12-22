import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-4 lg:gap-6 lg:p-6 min-h-screen">
      
      {/* 1. Header Section Skeleton */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" /> {/* Title */}
          <Skeleton className="h-4 w-64" /> {/* Subtitle */}
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-32" /> {/* Date Button */}
          <Skeleton className="h-9 w-40" /> {/* Select Dropdown */}
        </div>
      </div>

      {/* 2. KPI Cards Skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="overflow-hidden border-border/50 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" /> {/* Label */}
                <Skeleton className="h-8 w-8 rounded-lg" /> {/* Icon Box */}
              </div>
              <div className="mt-3">
                <Skeleton className="h-8 w-16" /> {/* Value */}
              </div>
              <div className="flex items-end justify-between mt-4 gap-4">
                <div className="flex flex-col gap-1">
                   <Skeleton className="h-4 w-12" /> {/* % Trend */}
                   <Skeleton className="h-3 w-20" /> {/* Subtext */}
                </div>
                <Skeleton className="h-10 w-24" /> {/* Mini Chart */}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 3. Main Charts Area Skeleton */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        
        {/* Left Column (Growth + System) */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Growth Chart Skeleton */}
          <Card className="border-border/50">
            <CardHeader className="border-b py-5">
               <div className="space-y-2">
                 <Skeleton className="h-6 w-32" />
                 <Skeleton className="h-4 w-48" />
               </div>
            </CardHeader>
            <CardContent className="p-6">
               <Skeleton className="h-[300px] w-full rounded-md" />
            </CardContent>
          </Card>

          {/* System Chart Skeleton */}
          <Card className="border-border/50">
            <CardHeader className="border-b py-5">
               <div className="space-y-2">
                 <Skeleton className="h-6 w-32" />
                 <Skeleton className="h-4 w-48" />
               </div>
            </CardHeader>
            <CardContent className="p-6">
               <Skeleton className="h-[300px] w-full rounded-md" />
            </CardContent>
          </Card>
        </div>

        {/* Right Column (Distribution Pie Charts) */}
        <div className="lg:col-span-1 flex flex-col gap-4">
           {Array.from({ length: 2 }).map((_, i) => (
             <Card key={i} className="border-border/50">
                <CardHeader>
                   <Skeleton className="h-6 w-24" />
                   <Skeleton className="h-4 w-32" />
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center p-6 pt-0">
                   <Skeleton className="h-[200px] w-[200px] rounded-full" /> {/* Donut */}
                   <div className="mt-4 flex gap-4">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-16" />
                   </div>
                </CardContent>
             </Card>
           ))}
        </div>
      </div>

      {/* 4. Top Stats Table Skeleton */}
      <Card className="border-border/50">
        <CardHeader className="flex flex-row items-center justify-between p-6 bg-muted/30">
           <div className="space-y-2">
             <Skeleton className="h-6 w-40" />
             <Skeleton className="h-4 w-64" />
           </div>
           <Skeleton className="h-9 w-24" />
        </CardHeader>
        <CardContent className="p-0">
           <div className="p-4 px-6">
              <Skeleton className="h-10 w-[400px] rounded-lg" /> {/* Tabs */}
           </div>
           <div className="space-y-4 p-6 pt-0">
              {Array.from({ length: 5 }).map((_, i) => (
                 <div key={i} className="flex items-center justify-between gap-4">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex items-center gap-4 flex-1">
                        <Skeleton className="h-10 w-16 rounded-md" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-48" />
                            <Skeleton className="h-3 w-24" />
                        </div>
                    </div>
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-4 w-32" />
                 </div>
              ))}
           </div>
        </CardContent>
      </Card>

    </div>
  );
}