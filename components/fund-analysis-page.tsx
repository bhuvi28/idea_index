"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import type { IndexData } from "@/app/page"
import FundMappingTable from "@/components/fund-mapping-table"

interface FundAnalysisPageProps {
  indexData: IndexData
  onBack: () => void
}

export default function FundAnalysisPage({ indexData, onBack }: FundAnalysisPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={onBack}
            variant="ghost"
            className="mb-4 hover:bg-blue-100"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Results
          </Button>
          <div>
            <h1 className="text-3xl font-bold mb-2">Mutual Fund Exposure Analysis</h1>
            <p className="text-gray-600">
              Discover which mutual funds have holdings that overlap with your {indexData.index_name}
            </p>
          </div>
        </div>

        {/* Fund Mapping Table */}
        <FundMappingTable holdings={indexData.holdings} />
      </div>
    </div>
  )
}
