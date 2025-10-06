"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react'

// Comprehensive list of fundamental investing and trending themes (last 5 years)
const INVESTMENT_KEYWORDS = [
  // Fundamental Investing Core Terms
  "Value Investing", "Growth Stocks", "Dividend Yield", "Price Earnings", "Book Value", "Free Cash Flow",
  "Return on Equity", "Debt to Equity", "Market Cap", "Enterprise Value", "EBITDA", "Revenue Growth",
  "Profit Margins", "Asset Turnover", "Working Capital", "Current Ratio", "Quick Ratio", "Beta",
  "Alpha Generation", "Risk Premium", "Sharpe Ratio", "Volatility", "Correlation", "Diversification",
  
  // Healthcare & Biotech (Major Theme)
  "Healthcare Innovation", "Biotech Revolution", "Gene Therapy", "CRISPR Technology", "mRNA Vaccines",
  "Personalized Medicine", "Digital Health", "Telemedicine", "Medical Devices", "Pharmaceutical Patents",
  "Clinical Trials", "FDA Approvals", "Health Insurance", "Aging Population", "Chronic Disease",
  "Mental Health", "Heart Disease", "Cancer Treatment", "Diabetes Care", "Obesity Solutions",
  
  // Technology & Digital Transformation
  "Cloud Computing", "Data Centers", "Edge Computing", "Artificial Intelligence", "Machine Learning",
  "Cybersecurity", "Data Privacy", "Digital Payments", "Fintech Innovation", "Blockchain Technology",
  "Cryptocurrency", "NFTs", "Metaverse", "Virtual Reality", "Augmented Reality", "5G Networks",
  "Internet of Things", "Automation", "Robotics", "Software as Service", "Platform Economy",
  
  // Energy Transition & Climate
  "Renewable Energy", "Solar Power", "Wind Energy", "Hydrogen Fuel", "Battery Technology",
  "Electric Vehicles", "Energy Storage", "Grid Modernization", "Carbon Capture", "ESG Investing",
  "Sustainable Finance", "Green Bonds", "Climate Risk", "Clean Technology", "Energy Efficiency",
  
  // Consumer & Lifestyle Trends
  "E-commerce Growth", "Direct Consumer", "Subscription Models", "Creator Economy", "Social Commerce",
  "Wellness Industry", "Fitness Technology", "Plant Based", "Sustainable Products", "Luxury Goods",
  "Experience Economy", "Travel Recovery", "Hotels Tourism", "Remote Work", "Home Improvement",
  
  // Government & Infrastructure
  "Government Spending", "Infrastructure Bills", "Defense Spending", "Public Private", "Smart Cities",
  "Transportation", "Supply Chain", "Logistics Technology", "Warehouse Automation", "Last Mile",
  
  // Emerging Markets & Demographics
  "Demographic Shifts", "Millennial Spending", "Gen Z", "Emerging Markets", "Urbanization",
  "Middle Class", "Digital Natives", "Social Impact", "Financial Inclusion", "Mobile First",
  
  // Financial Services Evolution
  "Digital Banking", "Robo Advisors", "Insurance Technology", "Real Estate", "Alternative Lending",
  "Buy Now Pay", "Wealth Management", "Retirement Planning", "Tax Technology", "Compliance",
  
  // Industrial & Manufacturing
  "Industry 4.0", "Smart Manufacturing", "Supply Chain", "Semiconductor", "Advanced Materials",
  "3D Printing", "Aerospace Defense", "Agricultural Technology", "Food Security", "Water Resources"
]

interface DynamicHoverBackgroundProps {
  children: React.ReactNode
  className?: string
}

// Light grey color palette for wordcloud (no dark colors)
const WORDCLOUD_STYLES = [
  { size: 'text-5xl', weight: 'font-bold', color: 'text-gray-400/60' },
  { size: 'text-4xl', weight: 'font-semibold', color: 'text-gray-400/50' },
  { size: 'text-3xl', weight: 'font-medium', color: 'text-gray-400/45' },
  { size: 'text-2xl', weight: 'font-medium', color: 'text-gray-400/40' },
  { size: 'text-xl', weight: 'font-normal', color: 'text-gray-400/35' },
  { size: 'text-lg', weight: 'font-normal', color: 'text-gray-400/30' },
]

interface WordCloudItem {
  id: string
  x: number
  y: number
  word: string
  style: typeof WORDCLOUD_STYLES[0]
  rotation: number
  isRevealed: boolean
}

const CURSOR_REVEAL_RADIUS = 80 // Radius around cursor to reveal words

export default function DynamicHoverBackground({ children, className = "" }: DynamicHoverBackgroundProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [wordCloudItems, setWordCloudItems] = useState<WordCloudItem[]>([])
  const containerRef = useRef<HTMLDivElement>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize wordcloud with pre-placed words
  useEffect(() => {
    if (!containerRef.current || isInitialized) return
    
    const rect = containerRef.current.getBoundingClientRect()
    const newWords: WordCloudItem[] = []
    
    // Create a grid of words across the entire background
    for (let i = 0; i < 100; i++) {
      const randomKeyword = INVESTMENT_KEYWORDS[Math.floor(Math.random() * INVESTMENT_KEYWORDS.length)]
      const randomStyle = WORDCLOUD_STYLES[Math.floor(Math.random() * WORDCLOUD_STYLES.length)]
      
      // Avoid carousel area (center horizontal band)
      let x, y
      do {
        x = Math.random() * Math.max(1200, window.innerWidth)
        y = Math.random() * Math.max(800, window.innerHeight)
      } while (
        // Exclude carousel area (center horizontal band, roughly 200px high)
        y > window.innerHeight * 0.4 && y < window.innerHeight * 0.65 &&
        x > window.innerWidth * 0.1 && x < window.innerWidth * 0.9
      )
      
      newWords.push({
        id: `word-${i}`,
        x,
        y,
        word: randomKeyword,
        style: randomStyle,
        rotation: (Math.random() - 0.5) * 30,
        isRevealed: false,
      })
    }
    
    setWordCloudItems(newWords)
    setIsInitialized(true)
  }, [isInitialized])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    
    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    setMousePosition({ x, y })
    
    // Update word visibility based on cursor proximity
    setWordCloudItems(prev => 
      prev.map(word => {
        const distance = Math.sqrt(
          Math.pow(word.x - x, 2) + Math.pow(word.y - y, 2)
        )
        return {
          ...word,
          isRevealed: distance <= CURSOR_REVEAL_RADIUS
        }
      })
    )
  }, [])

  const handleMouseLeave = useCallback(() => {
    // Hide all words when mouse leaves
    setWordCloudItems(prev => 
      prev.map(item => ({ ...item, isRevealed: false }))
    )
  }, [])

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ minHeight: '100vh' }}
    >
      {/* Dynamic WordCloud with cursor radius reveal */}
      <div className="absolute inset-0 pointer-events-none">
        {wordCloudItems.map((wordItem) => (
          <div
            key={wordItem.id}
            className="absolute transition-all duration-300 ease-out transform select-none"
            style={{
              left: `${wordItem.x}px`,
              top: `${wordItem.y}px`,
              opacity: wordItem.isRevealed ? 1 : 0,
              transform: `translate(-50%, -50%) rotate(${wordItem.rotation}deg) scale(${wordItem.isRevealed ? 1 : 0.8})`,
            }}
          >
            <span 
              className={`${wordItem.style.size} ${wordItem.style.weight} ${wordItem.style.color} transition-all duration-300`}
              style={{
                fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
                letterSpacing: '-0.01em',
              }}
            >
              {wordItem.word}
            </span>
          </div>
        ))}
      </div>
      
      {/* Cursor reveal indicator */}
      <div 
        className="absolute pointer-events-none transition-all duration-100 ease-out rounded-full border border-gray-300/20"
        style={{
          left: `${mousePosition.x}px`,
          top: `${mousePosition.y}px`,
          width: `${CURSOR_REVEAL_RADIUS * 2}px`,
          height: `${CURSOR_REVEAL_RADIUS * 2}px`,
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'transparent',
        }}
      />

      {/* Subtle background elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-r from-gray-400/3 to-transparent rounded-full blur-xl animate-pulse" />
        <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-gradient-to-r from-gray-400/3 to-transparent rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-gradient-to-r from-gray-400/3 to-transparent rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* CSS for additional animations */}
      <style jsx global>{`
        /* Simplified animations for cleaner design */
      `}</style>
    </div>
  )
}
