// Benchmark mapping for different countries
const BENCHMARK_MAP: Record<string, { name: string; ticker: string }> = {
  // Americas
  "AR": { name: "S&P MERVAL", ticker: "^MERV" },             // Argentina
  "BR": { name: "IBOVESPA", ticker: "^BVSP" },               // Brazil
  "CA": { name: "S&P/TSX Composite", ticker: "^GSPTSE" },    // Canada
  "CL": { name: "S&P/CLX IPSA", ticker: "^IPSA" },           // Chile
  "MX": { name: "IPC MEXICO", ticker: "^MXX" },              // Mexico
  "US": { name: "S&P 500", ticker: "^GSPC" },                // United States

  // Europe
  "AT": { name: "ATX", ticker: "^ATX" },                     // Austria
  "BE": { name: "BEL 20", ticker: "^BFX" },                  // Belgium
  "CZ": { name: "PX Index", ticker: "PX.PR" },               // Czech Republic
  "DK": { name: "OMX Copenhagen 25", ticker: "^OMXC25" },    // Denmark
  "FI": { name: "OMX Helsinki 25", ticker: "^OMXH25" },      // Finland
  "FR": { name: "CAC 40", ticker: "^FCHI" },                 // France
  "DE": { name: "DAX", ticker: "^GDAXI" },                   // Germany
  "GR": { name: "Athex Composite", ticker: "^ATG" },         // Greece
  "HU": { name: "BUX", ticker: "^BUX" },                     // Hungary
  "IE": { name: "ISEQ 20", ticker: "^ISEQ" },                // Ireland
  "IT": { name: "FTSE MIB", ticker: "FTSEMIB.MI" },          // Italy
  "NL": { name: "AEX", ticker: "^AEX" },                     // Netherlands
  "NO": { name: "OBX Index", ticker: "^OBX" },               // Norway
  "PL": { name: "WIG20", ticker: "^WIG20" },                 // Poland
  "PT": { name: "PSI 20", ticker: "PSI20.LS" },              // Portugal
  "RU": { name: "MOEX Russia Index", ticker: "IMOEX.ME" },   // Russia
  "ES": { name: "IBEX 35", ticker: "^IBEX" },                // Spain
  "SE": { name: "OMX Stockholm 30", ticker: "^OMX" },        // Sweden
  "CH": { name: "Swiss Market Index", ticker: "^SSMI" },    // Switzerland
  "TR": { name: "BIST 100", ticker: "XU100.IS" },            // Turkey
  "GB": { name: "FTSE 100", ticker: "^FTSE" },               // United Kingdom

  // Asia-Pacific
  "AU": { name: "S&P/ASX 200", ticker: "^AXJO" },            // Australia
  "CN": { name: "Shanghai Composite", ticker: "000001.SS" }, // China
  "HK": { name: "Hang Seng Index", ticker: "^HSI" },         // Hong Kong
  "IN": { name: "NIFTY 50", ticker: "^NSEI" },               // India
  "ID": { name: "Jakarta Composite", ticker: "^JKSE" },      // Indonesia
  "JP": { name: "Nikkei 225", ticker: "^N225" },             // Japan
  "MY": { name: "FTSE Bursa Malaysia KLCI", ticker: "^KLSE" }, // Malaysia
  "NZ": { name: "S&P/NZX 50", ticker: "^NZ50" },             // New Zealand
  "PK": { name: "KSE 100", ticker: "^KSE" },                 // Pakistan
  "PH": { name: "PSEi Composite", ticker: "PSEI.PS" },       // Philippines
  "SG": { name: "Straits Times Index", ticker: "^STI" },     // Singapore
  "KR": { name: "KOSPI Composite", ticker: "^KS11" },        // South Korea
  "LK": { name: "CSE All-Share", ticker: "^CSE" },           // Sri Lanka
  "TW": { name: "TSEC Weighted Index", ticker: "^TWII" },    // Taiwan
  "TH": { name: "SET Index", ticker: "^SET.BK" },            // Thailand
  "VN": { name: "VN-Index", ticker: "^VNINDEX" },           // Vietnam

  // Middle East & Africa
  "EG": { name: "EGX 30", ticker: "^CASE30" },               // Egypt
  "IL": { name: "TA-35", ticker: "^TA35" },                  // Israel
  "QA": { name: "QE Index", ticker: "QSI.QA" },              // Qatar
  "SA": { name: "Tadawul All Share", ticker: "^TASI.SR" },   // Saudi Arabia
  "ZA": { name: "FTSE/JSE Top 40", ticker: "^J200.JO" },     // South Africa
  "AE": { name: "DFM General", ticker: "DFMGI.AE" }          // UAE (Dubai)
}

function getBenchmarkForPortfolio(holdings: any[]): { name: string; ticker: string } {
  if (!holdings || holdings.length === 0) {
    // Default to S&P 500 if no holdings
    return BENCHMARK_MAP["US"] || { name: "S&P 500", ticker: "^GSPC" }
  }

  // Extract unique countries from holdings
  const countries = new Set<string>()
  for (const holding of holdings) {
    if (holding.country) {
      // Convert to uppercase 2-letter country code if needed
      let country = holding.country
      if (country.length > 2) {
        // Handle full country names - for now, default to US
        country = "US"
      } else {
        country = country.toUpperCase()
      }
      countries.add(country)
    }
  }

  // If all stocks are from the same country, use that country's benchmark
  if (countries.size === 1) {
    const country = Array.from(countries)[0]
    const benchmark = BENCHMARK_MAP[country]
    if (benchmark) {
      return benchmark
    }
  }

  // If stocks are from multiple countries, use a weighted approach
  // For now, default to S&P 500 for multi-country portfolios
  return BENCHMARK_MAP["US"] || { name: "S&P 500", ticker: "^GSPC" }
}

export function generateMockPerformanceData(months = 12, holdings?: any[]) {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setMonth(endDate.getMonth() - months)

  // Determine the appropriate benchmark based on portfolio countries
  const benchmarkInfo = getBenchmarkForPortfolio(holdings || [])
  const benchmarkName = benchmarkInfo.name
  const benchmarkTicker = benchmarkInfo.ticker

  const dates: string[] = []
  const indexValues: number[] = []
  const benchmarkValues: number[] = []

  // Generate business days only
  const currentDate = new Date(startDate)
  let indexValue = 100
  let benchmarkValue = 100

  while (currentDate <= endDate) {
    // Skip weekends
    if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
      dates.push(currentDate.toISOString().split("T")[0])

      // Generate more realistic performance data with some correlation
      const indexReturn = (Math.random() - 0.48) * 0.02 // Slightly positive bias
      const benchmarkReturn = (Math.random() - 0.49) * 0.015 // Slightly less volatile

      indexValue *= 1 + indexReturn
      benchmarkValue *= 1 + benchmarkReturn

      indexValues.push(Number(indexValue.toFixed(2)))
      benchmarkValues.push(Number(benchmarkValue.toFixed(2)))
    }

    currentDate.setDate(currentDate.getDate() + 1)
  }

  return {
    dates,
    index_values: indexValues,
    benchmark_values: benchmarkValues,
    benchmark_name: benchmarkName,
    benchmark_ticker: benchmarkTicker,
  }
}

export function generateMockStats(performanceData: { index_values: number[]; benchmark_values: number[] }) {
  const indexReturns = performanceData.index_values.map((value, i) =>
    i === 0 ? 0 : (value - performanceData.index_values[i - 1]) / performanceData.index_values[i - 1],
  )

  const totalReturn = ((performanceData.index_values[performanceData.index_values.length - 1] - 100) / 100) * 100

  // Calculate max drawdown
  let maxDrawdown = 0
  let peak = performanceData.index_values[0]

  for (const value of performanceData.index_values) {
    if (value > peak) peak = value
    const drawdown = ((value - peak) / peak) * 100
    if (drawdown < maxDrawdown) maxDrawdown = drawdown
  }

  // Simple Sharpe ratio approximation
  const avgReturn = indexReturns.reduce((sum, ret) => sum + ret, 0) / indexReturns.length
  const volatility = Math.sqrt(
    indexReturns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / indexReturns.length,
  )
  const sharpeRatio = (avgReturn / volatility) * Math.sqrt(252) // Annualized

  return {
    total_return: Number(totalReturn.toFixed(1)),
    max_drawdown: Number(maxDrawdown.toFixed(1)),
    sharpe_ratio: Number(sharpeRatio.toFixed(2)),
  }
}

export function generateBenchmarkStats(performanceData: { benchmark_values: number[] }) {
  const benchmarkReturns = performanceData.benchmark_values.map((value, i) =>
    i === 0 ? 0 : (value - performanceData.benchmark_values[i - 1]) / performanceData.benchmark_values[i - 1],
  )

  const totalReturn =
    ((performanceData.benchmark_values[performanceData.benchmark_values.length - 1] - 100) / 100) * 100

  // Calculate max drawdown for benchmark
  let maxDrawdown = 0
  let peak = performanceData.benchmark_values[0]

  for (const value of performanceData.benchmark_values) {
    if (value > peak) peak = value
    const drawdown = ((value - peak) / peak) * 100
    if (drawdown < maxDrawdown) maxDrawdown = drawdown
  }

  // Simple Sharpe ratio approximation for benchmark
  const avgReturn = benchmarkReturns.reduce((sum, ret) => sum + ret, 0) / benchmarkReturns.length
  const volatility = Math.sqrt(
    benchmarkReturns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / benchmarkReturns.length,
  )
  const sharpeRatio = (avgReturn / volatility) * Math.sqrt(252) // Annualized

  return {
    total_return: Number(totalReturn.toFixed(1)),
    max_drawdown: Number(maxDrawdown.toFixed(1)),
    sharpe_ratio: Number(sharpeRatio.toFixed(2)),
  }
}
