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

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json()

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" }, 
        { status: 400, headers: corsHeaders }
      )
    }

    // Call the FastAPI backend
    const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8000'
    
    try {
      const response = await fetch(`${FASTAPI_URL}/generate-index`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      })

      if (!response.ok) {
        throw new Error(`FastAPI responded with status ${response.status}`)
      }

      const data = await response.json()
      return NextResponse.json(data, { headers: corsHeaders })
      
    } catch (fetchError) {
      console.error('Error calling FastAPI backend:', fetchError)
      return NextResponse.json(
        { error: "Failed to connect to backend service" }, 
        { status: 503, headers: corsHeaders }
      )
    }
  } catch (error) {
    console.error("Error generating index:", error)
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500, headers: corsHeaders }
    )
  }
}
