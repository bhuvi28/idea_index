"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface PerformanceChartProps {
  data: {
    dates: string[]
    index_values: number[]
    benchmark_values: number[]
    benchmark_name?: string
  }
  indexName: string
}

export default function PerformanceChart({ data, indexName }: PerformanceChartProps) {
  const chartData = data.dates.map((date, index) => ({
    date: new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    dateShort: new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    [indexName]: data.index_values[index],
    [data.benchmark_name || "S&P 500 Benchmark"]: data.benchmark_values[index],
  }))

  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 80, bottom: 80 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="dateShort"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            interval={Math.max(0, Math.floor(chartData.length / 6))}
            label={{
              value: "Date",
              position: "insideBottom",
              offset: -20,
              style: { textAnchor: "middle", fill: "hsl(var(--muted-foreground))" },
            }}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickFormatter={(value) => value.toFixed(0)}
            label={{
              value: "Index Value",
              angle: -90,
              position: "insideLeft",
              style: { textAnchor: "middle", fill: "hsl(var(--muted-foreground))" },
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--popover))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "6px",
              color: "hsl(var(--popover-foreground))",
            }}
            formatter={(value: number) => [value.toFixed(2), ""]}
          />
          <Legend
            verticalAlign="top"
            height={36}
            wrapperStyle={{
              paddingBottom: "20px",
              fontSize: "12px",
            }}
          />
          <Line type="monotone" dataKey={indexName} stroke="#000000" strokeWidth={2} dot={false} />
          <Line
            type="monotone"
            dataKey={data.benchmark_name || "S&P 500 Benchmark"}
            stroke="#666666"
            strokeWidth={2}
            dot={false}
            strokeDasharray="5 5"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
