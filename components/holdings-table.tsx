"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowUpDown, ArrowUp, ArrowDown, Edit3, Save, X } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Holding } from "@/app/page"

interface HoldingsTableProps {
  holdings: Holding[]
  onWeightUpdate?: (updatedHoldings: Holding[]) => void
}

type SortField = keyof Holding
type SortDirection = "asc" | "desc" | null

export default function HoldingsTable({ holdings, onWeightUpdate }: HoldingsTableProps) {
  const [sortField, setSortField] = useState<SortField | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)
  const [isRebalancing, setIsRebalancing] = useState(false)
  const [tempWeights, setTempWeights] = useState<{ [key: string]: number }>({})
  const [error, setError] = useState<string>("")

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === "asc") {
        setSortDirection("desc")
      } else if (sortDirection === "desc") {
        setSortField(null)
        setSortDirection(null)
      } else {
        setSortDirection("asc")
      }
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const sortedHoldings = [...holdings].sort((a, b) => {
    if (!sortField || !sortDirection) return 0

    let aValue = a[sortField]
    let bValue = b[sortField]

    // Handle numeric sorting for weight
    if (sortField === "weight") {
      aValue = Number(aValue)
      bValue = Number(bValue)
    }

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
    return 0
  })

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />
    if (sortDirection === "asc") return <ArrowUp className="h-4 w-4" />
    if (sortDirection === "desc") return <ArrowDown className="h-4 w-4" />
    return <ArrowUpDown className="h-4 w-4" />
  }

  const startRebalancing = () => {
    setIsRebalancing(true)
    setError("")
    // Initialize temp weights with current weights
    const initialWeights: { [key: string]: number } = {}
    holdings.forEach((holding) => {
      initialWeights[holding.ticker] = holding.weight
    })
    setTempWeights(initialWeights)
  }

  const cancelRebalancing = () => {
    setIsRebalancing(false)
    setTempWeights({})
    setError("")
  }

  const updateTempWeight = (ticker: string, weight: number) => {
    setTempWeights((prev) => ({
      ...prev,
      [ticker]: weight,
    }))
    setError("") // Clear error when user makes changes
  }

  const saveWeights = () => {
    const totalWeight = Number.parseFloat(
      Object.values(tempWeights)
        .reduce((sum, weight) => sum + weight, 0)
        .toFixed(2),
    )

    if (totalWeight !== 100.0) {
      setError(`Holdings weights must sum to exactly 100.00%. Current sum: ${totalWeight.toFixed(2)}%`)
      return
    }

    // Update holdings with new weights
    const updatedHoldings = holdings.map((holding) => ({
      ...holding,
      weight: tempWeights[holding.ticker] || holding.weight,
    }))

    if (onWeightUpdate) {
      onWeightUpdate(updatedHoldings)
    }

    setIsRebalancing(false)
    setTempWeights({})
    setError("")
  }

  const getCurrentWeight = (ticker: string, originalWeight: number) => {
    return isRebalancing ? (tempWeights[ticker] ?? originalWeight) : originalWeight
  }

  const getTotalWeight = () => {
    if (isRebalancing) {
      return Number.parseFloat(
        Object.values(tempWeights)
          .reduce((sum, weight) => sum + weight, 0)
          .toFixed(2),
      )
    }
    return Number.parseFloat(holdings.reduce((sum, holding) => sum + holding.weight, 0).toFixed(2))
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{holdings.length} holdings</span>
          <span className="text-sm text-muted-foreground">•</span>
          <span className={`text-sm font-mono ${getTotalWeight() !== 100.0 ? "text-destructive" : "text-green-600"}`}>
            Total Weight: {getTotalWeight().toFixed(2)}%
          </span>
        </div>

        {onWeightUpdate && (
          <div className="flex items-center gap-2">
            {!isRebalancing ? (
              <Button variant="outline" size="sm" onClick={startRebalancing}>
                <Edit3 className="h-4 w-4 mr-2" />
                Rebalance
              </Button>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={cancelRebalancing}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button size="sm" onClick={saveWeights} disabled={getTotalWeight() !== 100.0}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Weights
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16 min-w-16">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort("ticker")}
                  className="h-8 p-0 font-semibold hover:bg-transparent"
                >
                  Ticker
                  {getSortIcon("ticker")}
                </Button>
              </TableHead>
              <TableHead className="min-w-32 max-w-48">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort("security_name")}
                  className="h-8 p-0 font-semibold hover:bg-transparent"
                >
                  Security Name
                  {getSortIcon("security_name")}
                </Button>
              </TableHead>
              <TableHead className="w-20 min-w-20">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort("country")}
                  className="h-8 p-0 font-semibold hover:bg-transparent"
                >
                  Country
                  {getSortIcon("country")}
                </Button>
              </TableHead>
              <TableHead className="w-24 min-w-24">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort("sector")}
                  className="h-8 p-0 font-semibold hover:bg-transparent"
                >
                  Sector
                  {getSortIcon("sector")}
                </Button>
              </TableHead>
              <TableHead className="w-20 min-w-20">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort("market_cap")}
                  className="h-8 p-0 font-semibold hover:bg-transparent"
                >
                  Market Cap
                  {getSortIcon("market_cap")}
                </Button>
              </TableHead>
              <TableHead className="min-w-48 max-w-96">
                <span className="font-semibold">Rationale</span>
              </TableHead>
              <TableHead className="w-20 min-w-20 text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort("weight")}
                  className="h-8 p-0 font-semibold hover:bg-transparent"
                >
                  Weight (%)
                  {getSortIcon("weight")}
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
            <TableBody>
              {sortedHoldings.map((holding, index) => (
                <TableRow key={`${holding.ticker}-${index}`} className="hover:bg-muted/50">
                  <TableCell className="font-mono font-semibold">{holding.ticker}</TableCell>
                  <TableCell className="font-medium">{holding.security_name}</TableCell>
                  <TableCell className="text-muted-foreground">{holding.country}</TableCell>
                  <TableCell className="text-muted-foreground">{holding.sector}</TableCell>
                  <TableCell className="text-muted-foreground">{holding.market_cap}</TableCell>
                  <TableCell className="text-sm text-muted-foreground whitespace-normal break-words leading-relaxed py-3">
                    {holding.selection_rationale}
                  </TableCell>
                  <TableCell className="text-right">
                    {isRebalancing ? (
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={getCurrentWeight(holding.ticker, holding.weight)}
                        onChange={(e) =>
                          updateTempWeight(
                            holding.ticker,
                            Number.parseFloat((Number.parseFloat(e.target.value) || 0).toFixed(2)),
                          )
                        }
                        className="w-20 text-right font-mono font-semibold text-sm"
                      />
                    ) : (
                      <span className="font-mono font-semibold">{holding.weight.toFixed(2)}%</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
    </div>
  )
}
