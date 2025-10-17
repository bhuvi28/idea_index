import { NextRequest, NextResponse } from "next/server"

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8000'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { searchParams } = new URL(request.url)
    const months = searchParams.get('months') || '12'
    
    console.log("Frontend API: Proxying performance-data request", {
      months,
      holdingsCount: body?.length || 0
    })

    // Forward request to Python backend
    const response = await fetch(`${FASTAPI_URL}/performance-data?months=${months}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      console.error("Backend performance-data error:", response.status, response.statusText)
      throw new Error(`Backend returned ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    
    console.log("Frontend API: Received performance data", {
      hasStats: !!data.stats,
      hasBenchmarkStats: !!data.benchmark_stats,
      dataPoints: data.dates?.length || 0
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in performance-data API route:", error)
    
    // Return fallback mock data structure
    const fallbackData = {
      dates: [],
      index_values: [],
      benchmark_values: [],
      benchmark_name: "S&P 500",
      stats: {
        total_return: 0,
        max_drawdown: 0,
        sharpe_ratio: 0,
        volatility: 0
      },
      benchmark_stats: {
        total_return: 0,
        max_drawdown: 0,
        sharpe_ratio: 0,
        volatility: 0
      }
    }
    
    return NextResponse.json(fallbackData, { status: 500 })
  }
}
