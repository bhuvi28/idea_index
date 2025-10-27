import { NextRequest, NextResponse } from "next/server"

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8000'

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { searchParams } = new URL(request.url)
    const minExposure = searchParams.get('min_exposure') || '5.0'
    
    console.log("Frontend API: Proxying fund-mapping request", {
      minExposure,
      holdingsCount: body?.length || 0
    })

    // Forward request to Python backend
    const response = await fetch(`${FASTAPI_URL}/fund-mapping?min_exposure=${minExposure}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      console.error("Backend fund-mapping error:", response.status, response.statusText)
      throw new Error(`Backend returned ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    
    console.log("Frontend API: Received fund mapping data", {
      hasError: !!data.error,
      fundMappings: data.fund_mappings?.length || 0,
      summary: data.summary
    })

    return NextResponse.json(data, { headers: corsHeaders })
  } catch (error) {
    console.error("Error in fund-mapping API route:", error)
    
    // Return fallback data structure
    const fallbackData = {
      error: "Failed to fetch fund mapping data",
      total_tickers: 0,
      valid_tickers: 0,
      fund_mappings: [],
      summary: {
        total_funds_analyzed: 0,
        funds_with_overlap: 0,
        max_exposure: 0.0,
        amcs_analyzed: []
      }
    }
    
    return NextResponse.json(fallbackData, { status: 500, headers: corsHeaders })
  }
}
