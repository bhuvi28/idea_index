import type { IndexData, Holding } from "@/app/page"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://idea-index.onrender.com"

export async function generateIndex(prompt: string): Promise<IndexData> {
  const response = await fetch(`${API_BASE_URL}/generate-index`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt }),
  })

  if (!response.ok) {
    throw new Error("Failed to generate index")
  }

  return response.json()
}

export async function updateHoldings(holdings: Holding[]): Promise<{ message: string; holdings: Holding[] }> {
  const response = await fetch(`${API_BASE_URL}/update-holdings`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(holdings),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to update holdings")
  }

  return response.json()
}

export async function refineIndex(action: "broaden" | "narrow", indexData: IndexData): Promise<IndexData> {
  // Placeholder for future AI refinement API
  const response = await fetch(`${API_BASE_URL}/api/refine-index`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ action, indexData }),
  })

  if (!response.ok) {
    throw new Error("Failed to refine index")
  }

  return response.json()
}

export interface PerformanceData {
  dates: string[]
  index_values: number[]
  benchmark_values: number[]
  benchmark_name: string
  benchmark_ticker?: string
  stats?: {
    total_return: number
    max_drawdown: number
    sharpe_ratio: number
    volatility?: number
    beta?: number
    alpha?: number
    correlation?: number
  }
  benchmark_stats?: {
    total_return: number
    max_drawdown: number
    sharpe_ratio: number
    volatility?: number
    pe_ratio?: number
    dividend_yield?: number
    beta?: number
    market_cap?: number
    price_to_book?: number
  }
}

export async function fetchPerformanceData(holdings: Holding[], months: number): Promise<PerformanceData> {
  const response = await fetch(`${API_BASE_URL}/performance-data?months=${months}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(holdings),
  })

  if (!response.ok) {
    throw new Error("Failed to fetch performance data")
  }

  return response.json()
}

export interface FundMapping {
  fund_name: string
  amc_name: string
  fund_metadata: {
    category?: string
    aum?: string
    nav?: string
    benchmark?: string
  }
  overlapping_holdings: Array<{
    ticker: string
    company_name: string
    exposure_percentage: number
    sector: string
    type: string
  }>
  total_exposure: number
  overlapping_tickers: string[]
  num_overlapping_holdings: number
}

export interface FundMappingData {
  total_tickers: number
  valid_tickers: number
  valid_ticker_list: string[]
  fund_mappings: FundMapping[]
  summary: {
    total_funds_analyzed: number
    funds_with_overlap: number
    max_exposure: number
    amcs_analyzed: string[]
  }
  error?: string
}

export async function fetchFundMapping(holdings: any[], minExposure: number = 0.1): Promise<FundMappingData> {
  const response = await fetch(`${API_BASE_URL}/fund-mapping?min_exposure=${minExposure}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(holdings),
  })

  if (!response.ok) {
    throw new Error("Failed to fetch fund mapping data")
  }

  return response.json()
}
