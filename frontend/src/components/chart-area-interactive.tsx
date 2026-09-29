"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, LabelList } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { useThemeSettings } from "@/context/ThemeContext"

const attendanceData = [
  { class: "1",  attendance: 99 },
  { class: "2",  attendance: 90 },
  { class: "3",  attendance: 95 },
  { class: "4",  attendance: 80 },
  { class: "5",  attendance: 85 },
  { class: "6",  attendance: 89 },
  { class: "7",  attendance: 92 },
  { class: "8",  attendance: 91 },
  { class: "9",  attendance: 90 },
  { class: "10", attendance: 95 },
  { class: "11", attendance: 90 },
  { class: "12", attendance: 80 },
]

const chartConfig = {
  attendance: { label: "Attendance %", color: "var(--primary)" },
} satisfies ChartConfig

export function ChartAreaInteractive() {
  const { gradient } = useThemeSettings()

  // When gradient is active, build an SVG linearGradient for the bars
  const barFill = gradient ? "url(#barGradient)" : "var(--primary)"

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between px-4 pb-2 pt-4">
        <CardTitle className="text-sm font-semibold">Attendance By Class (Today)</CardTitle>
        <Button variant="link" size="sm" className="h-auto p-0 text-xs text-primary">
          View Details
        </Button>
      </CardHeader>
      <CardContent className="px-2 pb-4">
        <ChartContainer config={chartConfig} className="h-[220px] w-full">
          <BarChart data={attendanceData} margin={{ top: 18, right: 4, left: -28, bottom: 0 }}>
            <defs>
              {gradient && (
                <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%"   stopColor={gradient.from} stopOpacity={1} />
                  <stop offset="100%" stopColor={gradient.to}   stopOpacity={1} />
                </linearGradient>
              )}
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="class"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10 }}
              tickFormatter={(v) => `Class ${v}`}
            />
            <YAxis domain={[60, 100]} tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
            <ChartTooltip
              content={<ChartTooltipContent />}
              formatter={(value) => [`${value}%`, "Attendance"]}
            />
            <Bar dataKey="attendance" fill={barFill} radius={[3, 3, 0, 0]} opacity={0.9}>
              <LabelList
                dataKey="attendance"
                position="top"
                formatter={(v: number) => `${v}%`}
                style={{ fontSize: 9, fill: "var(--muted-foreground)" }}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
