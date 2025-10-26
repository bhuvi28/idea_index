"use client"

import { useState } from "react"
import LandingPage from "@/components/landing-page"
import ResultsPage from "@/components/results-page"
import FundAnalysisPage from "@/components/fund-analysis-page"
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
  const [currentView, setCurrentView] = useState<"landing" | "results" | "fund-analysis">("landing")
  const [indexData, setIndexData] = useState<IndexData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<{ message: string; type: string } | null>(null)

  const handleGenerateIndex = async (prompt: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://idea-index.onrender.com"
      const response = await fetch(`${API_URL}/generate-index`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || errorData.error || "Failed to generate index")
      }

      const data: IndexData = await response.json()
      setIndexData(data)
      setCurrentView("results")
      setError(null)
    } catch (error) {
      console.error("Error generating index:", error)
      setError({
        message: error instanceof Error ? error.message : "An unexpected error occurred",
        type: "error"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToLanding = () => {
    setCurrentView("landing")
    setIndexData(null)
  }

  const handleViewFundAnalysis = () => {
    setCurrentView("fund-analysis")
  }

  const handleBackToResults = () => {
    setCurrentView("results")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Persistent disclaimer banner */}
      <div className="bg-primary text-primary-foreground text-center py-2 text-sm font-medium">
        Disclaimer: For Research and Educational Purposes Only — Not Investment Advice
      </div>

      {currentView === "landing" ? (
        <LandingPage 
          onGenerateIndex={handleGenerateIndex} 
          isLoading={isLoading} 
          error={error}
        />
      ) : currentView === "results" ? (
        indexData && (
          <ResultsPage 
            indexData={indexData} 
            onBack={handleBackToLanding} 
            onUpdateHoldings={setIndexData}
            onViewFundAnalysis={handleViewFundAnalysis}
          />
        )
      ) : (
        indexData && (
          <FundAnalysisPage 
            indexData={indexData} 
            onBack={handleBackToResults}
          />
        )
      )}
    </div>
  )
}
