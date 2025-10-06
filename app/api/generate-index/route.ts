import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    // Call the FastAPI backend
    const FASTAPI_URL = process.env.FASTAPI_URL || 'http://mohtam-rh8.toa.des.co:8000'
    
    try {
      const response = await fetch(`${FASTAPI_URL}/generate-index`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      })

      if (!response.ok) {
        throw new Error(`FastAPI responded with status ${response.status}`)
      }

      const data = await response.json()
      return NextResponse.json(data)
      
    } catch (fetchError) {
      console.error('Error calling FastAPI backend:', fetchError)
      
      // Fallback to mock data if FastAPI is unavailable
      console.log('Falling back to mock data generation')
      
      // Simplified mock data as fallback
      const mockResponse = {
        index_name: `${prompt.charAt(0).toUpperCase() + prompt.slice(1)} Index`,
        original_prompt: prompt,
        holdings: [
          {
            ticker: "AAPL",
            security_name: "Apple Inc.",
            country: "United States",
            sector: "Technology",
            market_cap: "Large Cap",
            relevance: "High",
            selection_rationale: "Leading consumer electronics and services",
            weight: 25.0,
          },
          {
            ticker: "MSFT",
            security_name: "Microsoft Corporation", 
            country: "United States",
            sector: "Technology",
            market_cap: "Large Cap",
            relevance: "High",
            selection_rationale: "Dominant cloud computing platform",
            weight: 25.0,
          },
          {
            ticker: "GOOGL",
            security_name: "Alphabet Inc.",
            country: "United States", 
            sector: "Technology",
            market_cap: "Large Cap",
            relevance: "High",
            selection_rationale: "Search engine and AI innovation leader",
            weight: 25.0,
          },
          {
            ticker: "NVDA",
            security_name: "NVIDIA Corporation",
            country: "United States",
            sector: "Technology", 
            market_cap: "Large Cap",
            relevance: "High",
            selection_rationale: "AI chip manufacturing leader",
            weight: 25.0,
          }
        ],
        performance_data: {
          dates: ["2024-01-01", "2024-01-02", "2024-01-03"],
          index_values: [100.0, 101.2, 102.1],
          benchmark_values: [100.0, 100.8, 101.5]
        },
        stats: {
          total_return: 18.5,
          max_drawdown: -12.3,
          sharpe_ratio: 1.4
        },
        scores: {
          asset_score: { score: 8, max_score: 10, description: "Quality and fundamentals of underlying assets" },
          returns_score: { score: 7, max_score: 10, description: "Historical and expected return performance" },
          stability_score: { score: 8, max_score: 10, description: "Volatility and downside risk management" },
          diversification_score: { score: 6, max_score: 10, description: "Portfolio concentration and correlation analysis" }
        }
      }
      
      return NextResponse.json(mockResponse)
    }
  } catch (error) {
    console.error("Error generating index:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
