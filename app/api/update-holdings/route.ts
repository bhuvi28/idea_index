import { type NextRequest, NextResponse } from "next/server"

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function PUT(request: NextRequest) {
  try {
    const holdings = await request.json()

    // Validate weights sum to 100%
    const totalWeight = holdings.reduce((sum: number, holding: any) => sum + holding.weight, 0)

    if (Math.abs(totalWeight - 100.0) > 0.01) {
      return NextResponse.json(
        { error: `Holdings weights must sum to 100%. Current sum: ${totalWeight}%` },
        { status: 400, headers: corsHeaders },
      )
    }

    // In real implementation, save to database here
    return NextResponse.json({
      message: "Holdings updated successfully",
      holdings,
    }, { headers: corsHeaders })
  } catch (error) {
    console.error("Error updating holdings:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500, headers: corsHeaders })
  }
}
