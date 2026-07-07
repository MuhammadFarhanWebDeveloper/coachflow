"use client"

import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"
import { ChartContainer } from "@/components/chart-container"

const tooltipStyle = {
  contentStyle: {
    backgroundColor: "var(--color-popover)",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius-lg)",
    color: "var(--color-popover-foreground)",
  },
}

export function CheckinRateChart({ data }: { data: { week: string; rate: number }[] }) {
  return (
    <ChartContainer height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
        <XAxis dataKey="week" stroke="var(--color-muted-foreground)" />
        <YAxis stroke="var(--color-muted-foreground)" domain={[0, 100]} />
        <Tooltip {...tooltipStyle} />
        <Line
          type="monotone"
          dataKey="rate"
          stroke="var(--color-chart-1)"
          strokeWidth={2}
          dot={{ fill: "var(--color-chart-1)", r: 4 }}
        />
      </LineChart>
    </ChartContainer>
  )
}

export function ProgressChart({ data }: { data: { name: string; progress: number }[] }) {
  return (
    <ChartContainer height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
        <XAxis dataKey="name" stroke="var(--color-muted-foreground)" />
        <YAxis stroke="var(--color-muted-foreground)" domain={[0, 100]} />
        <Tooltip {...tooltipStyle} />
        <Bar
          dataKey="progress"
          fill="var(--color-chart-2)"
          radius={[8, 8, 0, 0]}
        />
      </BarChart>
    </ChartContainer>
  )
}
