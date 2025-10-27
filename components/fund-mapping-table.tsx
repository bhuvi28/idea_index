"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { 
  ChevronDown, 
  ChevronUp, 
  TrendingUp, 
  Building2, 
  BarChart3,
  Info
} from "lucide-react"
import { fetchFundMapping, type FundMappingData } from "@/lib/api"

interface FundMappingTableProps {
  holdings: Array<{
    ticker: string
    security_name: string
    weight: number
    sector?: string
    country?: string
  }>
  onBack?: () => void
}

export default function FundMappingTable({ holdings, onBack }: FundMappingTableProps) {
  const [mappingData, setMappingData] = useState<FundMappingData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [minExposure, setMinExposure] = useState(5.0)
  const [appliedMinExposure, setAppliedMinExposure] = useState(5.0)
  const [sortBy, setSortBy] = useState<'exposure' | 'name' | 'holdings'>('exposure')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [expandedFunds, setExpandedFunds] = useState<Set<string>>(new Set())
  const [selectedAMCs, setSelectedAMCs] = useState<Set<string>>(new Set())

  // Fetch fund mapping data when holdings change or when filter is applied
  useEffect(() => {
    const loadFundMapping = async () => {
      if (!holdings || holdings.length === 0) return

      setIsLoading(true)
      setError(null)

      try {
        // Fetch data with the applied exposure filter from backend
        const data = await fetchFundMapping(holdings, appliedMinExposure)
        setMappingData(data)
      } catch (err) {
        console.error('Error fetching fund mapping:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch fund mapping data')
      } finally {
        setIsLoading(false)
      }
    }

    loadFundMapping()
  }, [holdings, appliedMinExposure])

  // Handle applying the exposure filter - triggers API call via useEffect
  const handleApplyFilter = () => {
    setAppliedMinExposure(minExposure)
  }

  const toggleFundExpansion = (fundName: string) => {
    const newExpanded = new Set(expandedFunds)
    if (newExpanded.has(fundName)) {
      newExpanded.delete(fundName)
    } else {
      newExpanded.add(fundName)
    }
    setExpandedFunds(newExpanded)
  }

  // Get unique AMCs from the data
  const availableAMCs = mappingData?.fund_mappings 
    ? Array.from(new Set(mappingData.fund_mappings.map(f => f.amc_name))).sort()
    : []

  // Toggle AMC selection
  const toggleAMC = (amc: string) => {
    const newSelected = new Set(selectedAMCs)
    if (newSelected.has(amc)) {
      newSelected.delete(amc)
    } else {
      newSelected.add(amc)
    }
    setSelectedAMCs(newSelected)
  }

  // Filter and sort funds - backend already filtered by total_exposure
  const sortedFunds = mappingData?.fund_mappings ? [...mappingData.fund_mappings]
    .filter(fund => selectedAMCs.size === 0 || selectedAMCs.has(fund.amc_name))
    .sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'exposure':
          comparison = a.total_exposure - b.total_exposure
          break
        case 'name':
          comparison = a.fund_name.localeCompare(b.fund_name)
          break
        case 'holdings':
          comparison = a.num_overlapping_holdings - b.num_overlapping_holdings
          break
      }
      
      return sortOrder === 'asc' ? comparison : -comparison
    }) : []

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Analyzing fund exposures...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <BarChart3 className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Error Loading Fund Data</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  if (!mappingData) {
    return null
  }

  if (mappingData.error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-yellow-500 mb-4">
            <Info className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Fund Mapping Error</h3>
          <p className="text-gray-600 mb-4">{mappingData.error}</p>
          {onBack && (
            <Button onClick={onBack} variant="outline">
              Go Back
            </Button>
          )}
        </div>
      </div>
    )
  }

  if (mappingData.fund_mappings.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-gray-400 mb-4">
            <Building2 className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No Matching Funds Found</h3>
          <p className="text-gray-600 mb-4">
            No mutual funds were found with holdings that match your selected tickers.
          </p>
          <div className="text-sm text-gray-500 mb-4">
            <p>Valid tickers analyzed: {mappingData.valid_tickers}</p>
            <p>Total funds analyzed: {mappingData.summary.total_funds_analyzed}</p>
          </div>
          {onBack && (
            <Button onClick={onBack} variant="outline">
              Go Back
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Fund Exposure Analysis</h2>
          <p className="text-gray-600">
            Mutual funds with holdings matching your selected stocks
          </p>
        </div>
        {onBack && (
          <Button onClick={onBack} variant="outline">
            ← Back to Results
          </Button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Funds Shown</p>
                <p className="text-2xl font-bold">{sortedFunds.length}</p>
                {sortedFunds.length !== mappingData.summary.funds_with_overlap && (
                  <p className="text-xs text-muted-foreground">of {mappingData.summary.funds_with_overlap} total</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building2 className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">AMCs Analyzed</p>
                <p className="text-2xl font-bold">{mappingData.summary.amcs_analyzed?.length || 0}</p>
                {mappingData.summary.amcs_analyzed && mappingData.summary.amcs_analyzed.length > 0 && (
                  <p className="text-xs text-muted-foreground">{mappingData.summary.amcs_analyzed.join(', ')}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Info className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Funds Analyzed</p>
                <p className="text-2xl font-bold">{mappingData.summary.total_funds_analyzed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Max Exposure</p>
                <p className="text-2xl font-bold">
                  {sortedFunds.length > 0 
                    ? Math.max(...sortedFunds.map(f => f.total_exposure)).toFixed(2)
                    : '0.00'}%
                </p>
                {sortedFunds.length > 0 && (
                  <p className="text-xs text-muted-foreground">in filtered results</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Info className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Valid Tickers</p>
                <p className="text-2xl font-bold">{mappingData.valid_tickers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AMC Filter Section */}
      {availableAMCs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Compare AMCs</CardTitle>
            <p className="text-sm text-muted-foreground">
              Select AMCs to compare. Leave all unchecked to view all funds.
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {availableAMCs.map((amc) => {
                const amcFunds = mappingData?.fund_mappings.filter(f => f.amc_name === amc) || []
                const amcCount = amcFunds.length
                const avgExposure = amcFunds.length > 0 
                  ? (amcFunds.reduce((sum, f) => sum + f.total_exposure, 0) / amcFunds.length).toFixed(2)
                  : '0.00'
                
                return (
                  <TooltipProvider key={amc}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={selectedAMCs.has(amc) ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleAMC(amc)}
                          className="flex items-center gap-2"
                        >
                          <Building2 className="h-3 w-3" />
                          {amc}
                          <Badge variant="secondary" className="ml-1">
                            {amcCount}
                          </Badge>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-xs">
                          <p className="font-semibold">{amc}</p>
                          <p>Funds: {amcCount}</p>
                          <p>Avg Exposure: {avgExposure}%</p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )
              })}
            </div>
            {selectedAMCs.size > 0 && (
              <div className="mt-4 flex items-center gap-2">
                <p className="text-sm text-muted-foreground">
                  Comparing {selectedAMCs.size} AMC{selectedAMCs.size > 1 ? 's' : ''} ({sortedFunds.length} funds)
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedAMCs(new Set())}
                >
                  Clear All
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Label htmlFor="min-exposure">Minimum Fund Exposure (%)</Label>
          <div className="flex gap-2 mt-1">
            <Input
              id="min-exposure"
              type="text"
              inputMode="decimal"
              value={minExposure}
              onChange={(e) => {
                const value = e.target.value
                // Allow empty string, numbers, and decimal point
                if (value === '' || /^\d*\.?\d*$/.test(value)) {
                  const numValue = parseFloat(value)
                  if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
                    setMinExposure(numValue)
                  } else if (value === '') {
                    setMinExposure(0.0)
                  }
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleApplyFilter()
                }
              }}
              onWheel={(e) => e.currentTarget.blur()}
              placeholder="5.0"
            />
            <Button 
              onClick={handleApplyFilter}
              variant="default"
              className="whitespace-nowrap"
              disabled={isLoading || appliedMinExposure === minExposure}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Loading...
                </>
              ) : (
                'Apply Filter'
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Filters funds by total exposure to your portfolio
            {appliedMinExposure !== minExposure && (
              <span className="text-blue-600 font-medium"> • Currently showing: ≥{appliedMinExposure}%</span>
            )}
          </p>
        </div>
        
        <div className="flex-1">
          <Label htmlFor="sort-by">Sort By</Label>
          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="exposure">Exposure %</SelectItem>
              <SelectItem value="name">Fund Name</SelectItem>
              <SelectItem value="holdings">Number of Holdings</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex-1">
          <Label htmlFor="sort-order">Order</Label>
          <Select value={sortOrder} onValueChange={(value: any) => setSortOrder(value)}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Descending</SelectItem>
              <SelectItem value="asc">Ascending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Fund Mappings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Fund Exposure Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fund Name</TableHead>
                  <TableHead>AMC</TableHead>
                  <TableHead>Total Exposure</TableHead>
                  <TableHead>Holdings</TableHead>
                  <TableHead>Overlapping Tickers</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedFunds.map((fund) => (
                  <>
                    <TableRow key={fund.fund_name}>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium">{fund.fund_name}</p>
                          {fund.fund_metadata.category && (
                            <Badge variant="secondary" className="text-xs">
                              {fund.fund_metadata.category}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{fund.amc_name}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-right">
                          <span className="font-bold text-lg">
                            {fund.total_exposure.toFixed(2)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {fund.num_overlapping_holdings}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {fund.overlapping_tickers.slice(0, 5).map((ticker) => (
                            <Badge key={ticker} variant="default" className="text-xs">
                              {ticker}
                            </Badge>
                          ))}
                          {fund.overlapping_tickers.length > 5 && (
                            <Badge variant="secondary" className="text-xs">
                              +{fund.overlapping_tickers.length - 5} more
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleFundExpansion(fund.fund_name)}
                        >
                          {expandedFunds.has(fund.fund_name) ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                    
                    {/* Expanded Fund Details - Inline */}
                    {expandedFunds.has(fund.fund_name) && (
                      <TableRow>
                        <TableCell colSpan={6} className="p-0">
                          <div className="border-l-4 border-l-blue-500 bg-blue-50/30 p-4">
                            <div className="space-y-4">
                              <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                                {fund.fund_metadata.aum && (
                                  <span>AUM: {fund.fund_metadata.aum}</span>
                                )}
                                {fund.fund_metadata.nav && (
                                  <span>NAV: {fund.fund_metadata.nav}</span>
                                )}
                                {fund.fund_metadata.benchmark && (
                                  <span>Benchmark: {fund.fund_metadata.benchmark}</span>
                                )}
                              </div>
                              
                              <div>
                                <h4 className="font-semibold mb-2">Overlapping Holdings</h4>
                                <div className="overflow-x-auto">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>Company</TableHead>
                                        <TableHead>Ticker</TableHead>
                                        <TableHead>Sector</TableHead>
                                        <TableHead>Exposure %</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {fund.overlapping_holdings.map((holding, index) => (
                                        <TableRow key={index}>
                                          <TableCell className="font-medium">
                                            {holding.company_name}
                                          </TableCell>
                                          <TableCell>
                                            <Badge variant="outline">{holding.ticker}</Badge>
                                          </TableCell>
                                          <TableCell>{holding.sector}</TableCell>
                                          <TableCell className="text-right font-medium">
                                            {holding.exposure_percentage.toFixed(2)}%
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
