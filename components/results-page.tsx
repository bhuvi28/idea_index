"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Download } from "lucide-react"
import type { IndexData } from "@/app/page"
import HoldingsTable from "@/components/holdings-table"
import PerformanceChart from "@/components/performance-chart"
import CompositionChart from "@/components/composition-chart"
import FundMappingTable from "@/components/fund-mapping-table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { generateMockPerformanceData, generateMockStats, generateBenchmarkStats } from "@/lib/mock-data"
import { fetchPerformanceData, type PerformanceData } from "@/lib/api"

interface ResultsPageProps {
  indexData: IndexData
  onBack: () => void
  onUpdateHoldings: (data: IndexData) => void
}

const TIME_PERIODS = [
  { label: "1M", value: 1, display: "1 Month" },
  { label: "3M", value: 3, display: "3 Months" },
  { label: "6M", value: 6, display: "6 Months" },
  { label: "1Y", value: 12, display: "1 Year" },
  { label: "3Y", value: 36, display: "3 Years" },
  { label: "5Y", value: 60, display: "5 Years" },
]

export default function ResultsPage({ indexData, onBack, onUpdateHoldings }: ResultsPageProps) {
  const [selectedTimePeriod, setSelectedTimePeriod] = useState(12) // Default to 1 year
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null)
  const [isLoadingPerformance, setIsLoadingPerformance] = useState(false)
  const [currentStats, setCurrentStats] = useState<any>(null)
  const [benchmarkStats, setBenchmarkStats] = useState<any>(null)

  // Update browser title when component mounts or indexData changes
  useEffect(() => {
    if (indexData?.index_name) {
      document.title = `${indexData.index_name} - idea2index`
    }
    
    // Cleanup function to reset title when component unmounts
    return () => {
      document.title = 'idea2index'
    }
  }, [indexData?.index_name])

  // Fetch performance data when time period changes or component mounts
  useEffect(() => {
    const fetchData = async () => {
      if (!indexData?.holdings) return

      setIsLoadingPerformance(true)
      try {
        // Try to fetch real performance data with enhanced metrics
        const data = await fetchPerformanceData(indexData.holdings, selectedTimePeriod)
        setPerformanceData(data)
        
        // Use real stats if available, otherwise calculate from price data
        const stats = data.stats || generateMockStats(data)
        const benchStats = data.benchmark_stats || generateBenchmarkStats(data)
        setCurrentStats(stats)
        setBenchmarkStats(benchStats)
        
      } catch (error) {
        console.error("Error fetching real performance data, falling back to mock data:", error)
        
        // Fallback to mock data
        const mockData = generateMockPerformanceData(selectedTimePeriod, indexData.holdings)
        setPerformanceData(mockData)
        setCurrentStats(generateMockStats(mockData))
        setBenchmarkStats(generateBenchmarkStats(mockData))
      } finally {
        setIsLoadingPerformance(false)
      }
    }

    fetchData()
  }, [selectedTimePeriod, indexData?.holdings])

  // Use existing performance data from indexData as fallback
  const fallbackPerformanceData = indexData?.performance_data || generateMockPerformanceData(selectedTimePeriod, indexData?.holdings)
  const displayPerformanceData = performanceData || fallbackPerformanceData
  
  // Only use mock stats as absolute last resort - prioritize real data
  const displayStats = currentStats || (performanceData?.stats ? performanceData.stats : generateMockStats(displayPerformanceData))
  const displayBenchmarkStats = benchmarkStats || (performanceData?.benchmark_stats ? performanceData.benchmark_stats : generateBenchmarkStats(displayPerformanceData))

  const getTimePeriodDisplay = () => {
    const period = TIME_PERIODS.find((p) => p.value === selectedTimePeriod)
    return period ? period.display : "1 Year"
  }

  const timePeriod = getTimePeriodDisplay()

  const handleExportCSV = () => {
    const csvContent = [
      ["Ticker", "Security Name", "Country", "Sector", "Market Cap", "Selection Rationale", "Weight (%)"],
      ...indexData.holdings.map((holding) => [
        holding.ticker,
        holding.security_name,
        holding.country,
        holding.sector,
        holding.market_cap,
        holding.selection_rationale,
        holding.weight.toString(),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${indexData.index_name.replace(/\s+/g, "_")}_holdings.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleWeightUpdate = (updatedHoldings: typeof indexData.holdings) => {
    const updatedData: IndexData = {
      ...indexData,
      holdings: updatedHoldings,
    }
    onUpdateHoldings(updatedData)
  }

  return (
    <div className="min-h-[calc(100vh-48px)] bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">{indexData.index_name}</h1>
              {indexData.original_prompt && (
                <p className="text-sm text-muted-foreground mt-1 italic">"{indexData.original_prompt}"</p>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download className="h-4 w-4 mr-2" />
              Download Holdings
            </Button>
          </div>
        </div>

        {/* Performance Chart */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle>
                Performance Analysis ({timePeriod})
                {isLoadingPerformance && (
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    Loading real data...
                  </span>
                )}
              </CardTitle>
              <div className="flex flex-wrap gap-1">
                {TIME_PERIODS.map((period) => (
                  <Button
                    key={period.value}
                    variant={selectedTimePeriod === period.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedTimePeriod(period.value)}
                    className="text-xs px-3 py-1"
                    disabled={isLoadingPerformance}
                  >
                    {period.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <PerformanceChart data={displayPerformanceData} indexName={indexData.index_name} />
          </CardContent>
        </Card>

        {/* Stats and Composition Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Stats and Scores */}
          <div className="space-y-6">
            {/* Performance Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Key Metrics ({timePeriod})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {/* Total Return */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="text-center cursor-help">
                          <div className="text-xs text-muted-foreground mb-1">Total Return</div>
                          <div className="text-lg font-bold text-foreground">{displayStats.total_return}%</div>
                          <div className="text-xs text-muted-foreground">
                            vs {displayPerformanceData.benchmark_name || 'S&P 500'}: {displayBenchmarkStats.total_return}%
                          </div>
                          <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-foreground rounded-full transition-all duration-500"
                              style={{
                                width: `${Math.min(100, Math.max(0, (Number.parseFloat(displayStats.total_return) / Math.max(Math.abs(Number.parseFloat(displayStats.total_return)), Math.abs(Number.parseFloat(displayBenchmarkStats.total_return)))) * 50 + 50))}%`,
                              }}
                            />
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="max-w-xs">
                          <p className="font-semibold mb-1">Total Return</p>
                          <p>
                            The percentage gain or loss of your Generated Index over the selected time period, compared
                            to the {displayPerformanceData.benchmark_name || 'S&P 500'} benchmark. This includes both price appreciation and dividends.
                          </p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  {/* Max Drawdown */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="text-center cursor-help">
                          <div className="text-xs text-muted-foreground mb-1">Max Drawdown</div>
                          <div className="text-lg font-bold text-foreground">{displayStats.max_drawdown}%</div>
                          <div className="text-xs text-muted-foreground">
                            vs {displayPerformanceData.benchmark_name || 'S&P 500'}: {displayBenchmarkStats.max_drawdown}%
                          </div>
                          <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-foreground rounded-full transition-all duration-500"
                              style={{
                                width: `${Math.min(100, Math.max(0, 100 - (Math.abs(Number.parseFloat(displayStats.max_drawdown)) / Math.max(Math.abs(Number.parseFloat(displayStats.max_drawdown)), Math.abs(Number.parseFloat(displayBenchmarkStats.max_drawdown)))) * 50))}%`,
                              }}
                            />
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="max-w-xs">
                          <p className="font-semibold mb-1">Maximum Drawdown</p>
                          <p>
                            The largest peak-to-trough decline in your Generated Index value during the selected period,
                            compared to {displayPerformanceData.benchmark_name || 'S&P 500'}. Lower values indicate better downside protection.
                          </p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  {/* Sharpe Ratio */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="text-center cursor-help">
                          <div className="text-xs text-muted-foreground mb-1">Sharpe Ratio</div>
                          <div className="text-lg font-bold text-foreground">{displayStats.sharpe_ratio}</div>
                          <div className="text-xs text-muted-foreground">vs {displayPerformanceData.benchmark_name || 'S&P 500'}: {displayBenchmarkStats.sharpe_ratio}</div>
                          <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-foreground rounded-full transition-all duration-500"
                              style={{
                                width: `${Math.min(100, Math.max(0, (Number.parseFloat(displayStats.sharpe_ratio) / Math.max(Math.abs(Number.parseFloat(displayStats.sharpe_ratio)), Math.abs(Number.parseFloat(displayBenchmarkStats.sharpe_ratio)))) * 50 + 50))}%`,
                              }}
                            />
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="max-w-xs">
                          <p className="font-semibold mb-1">Sharpe Ratio</p>
                          <p>
                            A measure of risk-adjusted returns comparing your Generated Index to {displayPerformanceData.benchmark_name || 'S&P 500'}. Higher values
                            indicate better returns per unit of risk taken. Values above 1.0 are considered good.
                          </p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>


                  {/* Beta (if available) */}
                  {displayStats.beta && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="text-center cursor-help">
                            <div className="text-xs text-muted-foreground mb-1">Beta</div>
                            <div className="text-lg font-bold text-foreground">{displayStats.beta}</div>
                            <div className="text-xs text-muted-foreground">
                              vs Market: 1.0
                            </div>
                            <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-foreground rounded-full transition-all duration-500"
                                style={{
                                  width: `${Math.min(100, Math.max(0, (displayStats.beta / 2) * 100))}%`,
                                }}
                              />
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="max-w-xs">
                            <p className="font-semibold mb-1">Beta</p>
                            <p>
                              Measures portfolio's sensitivity to market movements. Beta = 1.0 moves with market,
                              &gt;1.0 is more volatile, &lt;1.0 is less volatile than the benchmark.
                            </p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Scorecards */}
            <Card>
              <CardHeader>
                <CardTitle>Index Scores</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(indexData.scores).map(([key, score]) => {
                    const getDetailedTooltip = (scoreKey: string) => {
                      switch (scoreKey) {
                        case "asset_score":
                          return (
                            <div className="max-w-sm space-y-2">
                              <p className="font-semibold">Asset Quality Score</p>
                              <p className="text-sm">
                                Evaluates the fundamental strength of underlying securities based on:
                              </p>
                              <ul className="text-sm space-y-1 ml-4">
                                <li>
                                  • <strong>Financial Health (30%):</strong> Revenue growth, profit margins,
                                  debt-to-equity ratios
                                </li>
                                <li>
                                  • <strong>Market Position (25%):</strong> Market share, competitive advantages, brand
                                  strength
                                </li>
                                <li>
                                  • <strong>Management Quality (20%):</strong> Leadership track record, corporate
                                  governance
                                </li>
                                <li>
                                  • <strong>Growth Prospects (25%):</strong> Future earnings potential, market expansion
                                  opportunities
                                </li>
                              </ul>
                              <p className="text-xs text-muted-foreground mt-2">
                                Score calculated as weighted average of individual asset ratings (0-10 scale)
                              </p>
                            </div>
                          )
                        case "returns_score":
                          return (
                            <div className="max-w-sm space-y-2">
                              <p className="font-semibold">Returns Performance Score</p>
                              <p className="text-sm">Measures historical and projected return performance through:</p>
                              <ul className="text-sm space-y-1 ml-4">
                                <li>
                                  • <strong>Historical Returns (40%):</strong> 1, 3, 5-year annualized returns vs
                                  benchmarks
                                </li>
                                <li>
                                  • <strong>Risk-Adjusted Returns (30%):</strong> Sharpe ratio, Sortino ratio, alpha
                                  generation
                                </li>
                                <li>
                                  • <strong>Consistency (20%):</strong> Return stability, earnings predictability
                                </li>
                                <li>
                                  • <strong>Forward Outlook (10%):</strong> Analyst projections, earnings growth
                                  estimates
                                </li>
                              </ul>
                              <p className="text-xs text-muted-foreground mt-2">
                                Formula: (Historical × 0.4) + (Risk-Adj × 0.3) + (Consistency × 0.2) + (Outlook × 0.1)
                              </p>
                            </div>
                          )
                        case "stability_score":
                          return (
                            <div className="max-w-sm space-y-2">
                              <p className="font-semibold">Portfolio Stability Score</p>
                              <p className="text-sm">Assesses volatility and downside risk protection via:</p>
                              <ul className="text-sm space-y-1 ml-4">
                                <li>
                                  • <strong>Volatility Analysis (35%):</strong> Standard deviation, beta coefficients
                                </li>
                                <li>
                                  • <strong>Drawdown Protection (30%):</strong> Maximum drawdown, recovery time analysis
                                </li>
                                <li>
                                  • <strong>Correlation Stability (20%):</strong> Inter-asset correlation consistency
                                </li>
                                <li>
                                  • <strong>Stress Testing (15%):</strong> Performance during market downturns
                                </li>
                              </ul>
                              <p className="text-xs text-muted-foreground mt-2">
                                Higher scores indicate lower volatility and better downside protection
                              </p>
                            </div>
                          )
                        case "diversification_score":
                          return (
                            <div className="max-w-sm space-y-2">
                              <p className="font-semibold">Diversification Effectiveness Score</p>
                              <p className="text-sm">Evaluates portfolio concentration and risk distribution across:</p>
                              <ul className="text-sm space-y-1 ml-4">
                                <li>
                                  • <strong>Sector Allocation (25%):</strong> Distribution across industry sectors
                                </li>
                                <li>
                                  • <strong>Geographic Spread (25%):</strong> Regional and country diversification
                                </li>
                                <li>
                                  • <strong>Market Cap Mix (20%):</strong> Large, mid, small-cap balance
                                </li>
                                <li>
                                  • <strong>Correlation Analysis (30%):</strong> Asset correlation matrix, concentration
                                  risk
                                </li>
                              </ul>
                              <p className="text-xs text-muted-foreground mt-2">
                                Calculated using Herfindahl-Hirschman Index and correlation coefficients
                              </p>
                            </div>
                          )
                        default:
                          return <p>{score.description}</p>
                      }
                    }

                    return (
                      <TooltipProvider key={key}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="p-4 border border-border rounded-lg cursor-help">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium capitalize">{key.replace("_", " ")}</span>
                                <div className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <div className="text-xl font-bold">
                                {score.score}/{score.max_score}
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-none">
                            {getDetailedTooltip(key)}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Composition Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Index Composition by Weight</CardTitle>
            </CardHeader>
            <CardContent>
              <CompositionChart holdings={indexData.holdings} />
            </CardContent>
          </Card>
        </div>

        {/* Holdings Table */}
        <Card>
          <CardHeader>
            <CardTitle>Index Holdings</CardTitle>
          </CardHeader>
          <CardContent>
            <HoldingsTable holdings={indexData.holdings} onWeightUpdate={handleWeightUpdate} />
          </CardContent>
        </Card>

        {/* Fund Mapping Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Mutual Fund Exposure Analysis</CardTitle>
            <p className="text-sm text-muted-foreground">
              Discover which mutual funds have holdings that overlap with your selected stocks
            </p>
          </CardHeader>
          <CardContent>
            <FundMappingTable holdings={indexData.holdings} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
