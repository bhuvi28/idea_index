"use client"

import { useState } from "react"
import LandingPage from "@/components/landing-page"
import ResultsPage from "@/components/results-page"
import { generateMockPerformanceData, generateMockStats } from "@/lib/mock-data"

export interface Holding {
  ticker: string
  security_name: string
  country: string
  sector: string
  market_cap: string
  selection_rationale: string
  weight: number
}

export interface IndexData {
  index_name: string
  original_prompt: string
  holdings: Holding[]
  performance_data: {
    dates: string[]
    index_values: number[]
    benchmark_values: number[]
    benchmark_name?: string
    benchmark_ticker?: string
  }
  stats: {
    total_return: number
    max_drawdown: number
    sharpe_ratio: number
  }
  scores: {
    [key: string]: {
      score: number
      max_score: number
      description: string
    }
  }
}

export default function Home() {
  const [currentView, setCurrentView] = useState<"landing" | "results">("landing")
  const [indexData, setIndexData] = useState<IndexData | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleGenerateIndex = async (prompt: string) => {
    setIsLoading(true)

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://idea-index.onrender.com"
      const response = await fetch(`${API_URL}/generate-index`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate index")
      }

      const data: IndexData = await response.json()
      setIndexData(data)
      setCurrentView("results")
    } catch (error) {
      console.error("Error generating index:", error)
      // Fallback to mock data if API fails
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Generate performance data first
      const performanceData = generateMockPerformanceData(12, [
        { country: "US" },
        { country: "US" },
        { country: "US" },
        { country: "US" },
        { country: "US" }
      ]) // 12 months of data
      const stats = generateMockStats(performanceData)

      const mockData: IndexData = {
        index_name: `${prompt} Index`,
        original_prompt: prompt,
        holdings: [
          {
            ticker: "AAPL",
            security_name: "Apple Inc.",
            country: "United States",
            sector: "Technology",
            market_cap: "Large Cap",
            selection_rationale: "Leading consumer electronics and services company with strong AI integration",
            weight: 25.5,
          },
          {
            ticker: "MSFT",
            security_name: "Microsoft Corporation",
            country: "United States",
            sector: "Technology",
            market_cap: "Large Cap",
            selection_rationale: "Dominant cloud computing platform with extensive AI capabilities",
            weight: 22.3,
          },
          {
            ticker: "GOOGL",
            security_name: "Alphabet Inc.",
            country: "United States",
            sector: "Technology",
            market_cap: "Large Cap",
            selection_rationale: "Search engine leader with cutting-edge AI research and development",
            weight: 20.1,
          },
          {
            ticker: "NVDA",
            security_name: "NVIDIA Corporation",
            country: "United States",
            sector: "Technology",
            market_cap: "Large Cap",
            selection_rationale: "AI chip manufacturing leader enabling machine learning revolution",
            weight: 18.7,
          },
          {
            ticker: "TSLA",
            security_name: "Tesla Inc.",
            country: "United States",
            sector: "Consumer Discretionary",
            market_cap: "Large Cap",
            selection_rationale: "Electric vehicle pioneer with autonomous driving AI technology",
            weight: 13.4,
          },
        ],
        performance_data: performanceData,
        stats: stats,
        scores: {
          asset_score: { score: 8, max_score: 10, description: "Quality and fundamentals of underlying assets" },
          returns_score: { score: 7, max_score: 10, description: "Historical and expected return performance" },
          stability_score: { score: 8, max_score: 10, description: "Volatility and downside risk management" },
          diversification_score: {
            score: 6,
            max_score: 10,
            description: "Portfolio concentration and correlation analysis",
          },
        },
      }

      setIndexData(mockData)
      setCurrentView("results")
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToLanding = () => {
    setCurrentView("landing")
    setIndexData(null)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Persistent disclaimer banner */}
      <div className="bg-primary text-primary-foreground text-center py-2 text-sm font-medium">
        Disclaimer: For Research and Educational Purposes Only — Not Investment Advice
      </div>

      {currentView === "landing" ? (
        <LandingPage onGenerateIndex={handleGenerateIndex} isLoading={isLoading} />
      ) : (
        indexData && <ResultsPage indexData={indexData} onBack={handleBackToLanding} onUpdateHoldings={setIndexData} />
      )}
    </div>
  )
}
