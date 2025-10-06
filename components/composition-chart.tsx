"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import type { Holding } from "@/app/page"

interface CompositionChartProps {
  holdings: Holding[]
}

const COLORS = [
  "#3b82f6", // blue
  "#ef4444", // red
  "#10b981", // emerald
  "#f59e0b", // amber
  "#8b5cf6", // violet
  "#06b6d4", // cyan
  "#f97316", // orange
  "#84cc16", // lime
  "#ec4899", // pink
  "#6366f1", // indigo
]

export default function CompositionChart({ holdings }: CompositionChartProps) {
  const chartData = holdings.map((holding, index) => ({
    name: holding.ticker,
    security_name: holding.security_name,
    value: holding.weight,
    color: COLORS[index % COLORS.length],
  }))

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-popover border border-border rounded-md p-3 shadow-md">
          <p className="font-semibold text-popover-foreground">{data.security_name}</p>
          <p className="text-sm text-muted-foreground">Ticker: {data.name}</p>
          <p className="text-sm text-muted-foreground">Weight: {data.value.toFixed(1)}%</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }: any) => {
              const total = chartData.reduce((sum, item) => sum + item.value, 0)
              const percent = (value / total) * 100
              return `${name} ${percent.toFixed(1)}%`
            }}
            outerRadius={120}
            innerRadius={60}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
