"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import DynamicHoverBackground from "@/components/dynamic-hover-background"

interface LandingPageProps {
  onGenerateIndex: (prompt: string) => void
  isLoading: boolean
  error?: { message: string; type: string } | null
}

const PROMPT_CHIPS = [
  // Original strategic ones
  "Invest in travel to mars",
  "Invest in companies that run Superbowl ads",
  "Invest in GLP-1s",
  "Companies that benefit from Gen-Z consumer habits",
  "Companies with lots of users, but low ARPU",
  "B2B companies with less than 10% consulting revenues",
  "Business models with low exposure to AI",
  "Tariff-resistant companies",
  "Low churn consumer companies",
  "Companies with high R&D spending",
  "B2B companies with notably high revenue per employee",
  "Companies that Andreessen Horowitz invested in",
  "Invest in self-driving automation",
  "Invest in top 20 dividend-paying companies",
  "Companies that have 50M+ followers on social media",
  "Invest in fully-remote companies",
  "Invest in companies with a strong sustainability focus",
  
  // Witty and funny additions
  "Companies that make things people actually need",
  "Invest in businesses your grandmother would understand",
  "Companies that survive without buzzwords",
  "Invest in the 'boring' monopolies",
  "Companies that make money while you sleep",
  "Businesses that would exist even without the internet",
  "Invest in companies with CEOs who don't tweet",
  "Companies that sell things people buy when drunk",
  "Invest in whatever Warren Buffett's eating",
  "Companies that make parents spend money on kids",
  "Businesses that profit from human laziness",
  "Invest in companies that make Monday mornings bearable",
  "Companies that benefit from people's poor decisions",
  "Invest in businesses that thrive during recessions",
  "Companies that make money from people's insecurities",
  "Invest in whatever makes introverts comfortable",
  "Companies that profit from procrastination",
  "Businesses that benefit from aging millennials",
  "Invest in companies that make life less awkward",
  "Companies that monetize people's bad habits",
  "Invest in businesses that survive zombie apocalypses",
  "Companies that make money from people's FOMO",
  "Invest in whatever helps people avoid small talk",
  "Companies that benefit from climate change anxiety",
  "Businesses that profit from decision paralysis",
  "Invest in companies that make Mondays less terrible",
  "Companies that benefit from everyone working from home",
  "Invest in businesses that thrive on human impatience",
  "Companies that make money from people's pet obsessions",
  "Invest in whatever helps people avoid cooking",

  // International Market Focused
  "Old age care companies in Japan",
  "B2B companies in South Korea",
  "Retail boom in China",
  "Fintech startups in India",
  "Renewable energy companies in Germany",
  "E-commerce platforms in Southeast Asia",
  "Healthcare innovation in Israel",
  "Manufacturing automation in Taiwan",
  "Digital banking in Brazil",
  "Electric vehicle supply chain in Mexico",
  "AI and robotics companies in Singapore",
  "Pharmaceutical companies in Switzerland",
  "Infrastructure development in Australia",
  "Consumer goods companies in Indonesia",
  "Technology services in Canada"
]

// Witty status messages for the Generate Index button
const WITTY_STATUS_MESSAGES = [
  "🧠 Channeling Warren Buffett's wisdom...",
  "🎯 Finding the perfect stocks for you...",
  "📊 Crunching numbers like a Wall Street wizard...",
  "🚀 Launching your portfolio to the moon...",
  "💎 Mining for diamond hands...",
  "🎲 Rolling the dice on your future wealth...",
  "🔮 Predicting market trends with crystal ball...",
  "⚡ Charging up your investment strategy...",
  "🎪 Juggling stocks like a financial circus...",
  "🏆 Training your portfolio to be a champion...",
  "🎨 Painting a masterpiece of diversification...",
  "🍕 Slicing the market pie just right...",
  "🎭 Performing financial magic tricks...",
  "🎪 Teaching your money to do backflips...",
  "🎯 Aiming for the bullseye of profits...",
  "🎸 Strumming the strings of market success...",
  "🎨 Crafting your financial masterpiece...",
  "🎪 Orchestrating a symphony of stocks...",
  "🎯 Hitting the jackpot of investment opportunities...",
  "🎭 Directing the play of your financial future...",
  "🎪 Balancing your portfolio on a tightrope...",
  "🎨 Sketching out your wealth blueprint...",
  "🎯 Targeting the sweet spot of returns...",
  "🎪 Juggling risk and reward like a pro...",
  "🎨 Designing your path to financial freedom...",
  "🎯 Zeroing in on the perfect investment mix...",
  "🎪 Spinning the wheel of market fortune...",
  "🎨 Drawing the roadmap to your riches...",
  "🎯 Locking onto the trajectory of success...",
  "🎪 Taming the wild beast of market volatility...",
  "🎨 Sculpting your financial destiny...",
  "🎯 Calibrating your investment compass...",
  "🎪 Conducting the orchestra of your portfolio...",
  "🎨 Weaving the tapestry of your wealth...",
  "🎯 Fine-tuning your money-making machine...",
  "🎪 Choreographing the dance of diversification...",
  "🎨 Blueprinting your financial empire...",
  "🎯 Programming your path to prosperity...",
  "🎪 Composing the symphony of your success...",
  "🎨 Architecting your wealth-building strategy...",
  "🎯 Engineering your financial future...",
  "🎪 Conducting the market's greatest hits...",
  "🎨 Painting your portfolio with success...",
  "🎯 Navigating the maze of market opportunities...",
  "🎪 Performing the ultimate investment magic...",
  "🎨 Crafting your financial legacy...",
  "🎯 Optimizing your wealth accumulation...",
  "🎪 Orchestrating the perfect investment storm...",
  "🎨 Designing your financial masterpiece...",
  "🎯 Calibrating your success trajectory..."
]

// Pre-defined deterministic distribution to avoid hydration issues
const DETERMINISTIC_ROWS = [
  // Row 1 - Strategic & Professional (first 16 chips)
  [
    "Invest in travel to mars",
    "Invest in companies that run Superbowl ads", 
    "Invest in GLP-1s",
    "Companies that benefit from Gen-Z consumer habits",
    "Companies with lots of users, but low ARPU",
    "Investments of famous politicians",
    "B2B companies with less than 10% consulting revenues",
    "Business models with low exposure to AI",
    "Tariff-resistant companies",
    "Low churn consumer companies",
    "Companies with high R&D spending",
    "B2B companies with notably high revenue per employee",
    "Companies that Andreessen Horowitz invested in",
    "Invest in self-driving automation",
    "Invest in top 20 dividend-paying companies",
    "Companies that have 50M+ followers on social media",
    "Invest in fully-remote companies",
    "Invest in companies with a strong sustainability focus",
  ],
  // Row 2 - Witty & Creative (next 16 chips)
  [
    "Companies that make things people actually need",
    "Invest in businesses your grandmother would understand",
    "Companies that survive without buzzwords",
    "Invest in the 'boring' monopolies",
    "Companies that make money while you sleep",
    "Businesses that would exist even without the internet",
    "Invest in companies with CEOs who don't tweet",
    "Companies that sell things people buy when drunk",
    "Invest in whatever Warren Buffett's eating",
    "Companies that make parents spend money on kids",
    "Businesses that profit from human laziness",
    "Invest in companies that make Monday mornings bearable",
    "Companies that benefit from people's poor decisions",
    "Invest in businesses that thrive during recessions",
    "Companies that make money from people's insecurities",
    "Invest in whatever makes introverts comfortable",
  ],
  // Row 3 - Mixed remaining chips
  [
    "Companies that profit from procrastination",
    "Businesses that benefit from aging millennials",
    "Invest in companies that make life less awkward",
    "Companies that monetize people's bad habits",
    "Electric vehicle supply chain in Mexico",
    "AI and robotics companies in Singapore",
    "Invest in businesses that survive zombie apocalypses",
    "Companies that make money from people's FOMO",
    "Invest in whatever helps people avoid small talk",
    "Companies that benefit from climate change anxiety",
    "Businesses that profit from decision paralysis",
    "Invest in companies that make Mondays less terrible",
    "Companies that benefit from everyone working from home",
    "Infrastructure development in Australia",
    "Consumer goods companies in Indonesia",
    "Invest in businesses that thrive on human impatience",
    "Companies that make money from people's pet obsessions",
    "Invest in whatever helps people avoid cooking",
    "Old age care companies in Japan",
    "B2B companies in South Korea",
    "Retail boom in China",
    "Fintech startups in India",
    "Renewable energy companies in Germany",
    "E-commerce platforms in Southeast Asia",
    "Healthcare innovation in Israel",
    "Manufacturing automation in Taiwan",
    "Digital banking in Brazil",
    "Electric vehicle supply chain in Mexico",
    "AI and robotics companies in Singapore",
    "Pharmaceutical companies in Switzerland",
    "Infrastructure development in Australia",
    "Consumer goods companies in Indonesia",
    "Technology services in Canada",
  ]
]

export default function LandingPage({ onGenerateIndex, isLoading, error }: LandingPageProps) {
  const [prompt, setPrompt] = useState("")
  const [isPaused, setIsPaused] = useState(false)
  const [currentStatusMessage, setCurrentStatusMessage] = useState("")
  const containerRef = useRef<HTMLDivElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (prompt.trim() && !isLoading) {
      // Set a random witty status message
      const randomMessage = WITTY_STATUS_MESSAGES[Math.floor(Math.random() * WITTY_STATUS_MESSAGES.length)]
      setCurrentStatusMessage(randomMessage)
      onGenerateIndex(prompt.trim())
    }
  }

  const handleChipClick = (chipText: string) => {
    if (!isLoading) {
      setPrompt(chipText)
      // Set a random witty status message
      const randomMessage = WITTY_STATUS_MESSAGES[Math.floor(Math.random() * WITTY_STATUS_MESSAGES.length)]
      setCurrentStatusMessage(randomMessage)
      // Automatically trigger index generation
      onGenerateIndex(chipText)
    }
  }

  // Create infinite rows using deterministic distribution
  const createInfiniteRows = () => {
    return DETERMINISTIC_ROWS.map(row => {
      // Duplicate each row multiple times for smooth infinite scroll
      return [...row, ...row, ...row, ...row]
    })
  }

  const rows = createInfiniteRows()

  return (
    <DynamicHoverBackground className="flex flex-col items-center justify-center min-h-[calc(100vh-48px)] px-2">
      <div className="w-full max-w-none space-y-8 text-center relative overflow-x-hidden">
        {/* Main heading */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground">idea2index</h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-lg mx-auto">
            From shower thoughts to stock portfolios in seconds
          </p>
          <p className="text-sm text-muted-foreground/60 italic animate-pulse">
            ✨ Move your cursor around to reveal hidden investment themes beneath
          </p>
        </div>

        {/* Error message */}
        {error && (
          <Card className="p-4 bg-destructive/10 border-destructive max-w-2xl mx-auto">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <svg className="h-5 w-5 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-destructive">Failed to Generate Index</h3>
                  <p className="text-sm text-destructive/90 mt-1">{error.message}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    The system attempted to retry the request multiple times. Please try again.
                  </p>
                </div>
              </div>
              <Button
                onClick={() => prompt.trim() && onGenerateIndex(prompt.trim())}
                variant="outline"
                size="sm"
                className="w-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                disabled={!prompt.trim()}
              >
                Retry
              </Button>
            </div>
          </Card>
        )}

        {/* Main input form */}
        <Card className="p-6 bg-card border border-border max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="Describe your investment idea..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="text-lg py-6 px-4 bg-background border-border focus:ring-2 focus:ring-primary"
                disabled={isLoading}
              />
            </div>
            <Button
              type="submit"
              size="lg"
              className="w-full py-6 text-lg font-medium"
              disabled={!prompt.trim() || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {currentStatusMessage || "Generating Index..."}
                </>
              ) : (
                "Generate Index"
              )}
            </Button>
          </form>
        </Card>

        {/* Always-moving infinite carousel with unique chips per row - MUCH WIDER */}
        <div className="space-y-6 -mx-8 sm:-mx-16 md:-mx-24 lg:-mx-32 xl:-mx-40 px-2">
          <p className="text-sm text-muted-foreground text-center">Or explore these creative investment ideas:</p>
          
          <div 
            ref={containerRef}
            className="relative w-full overflow-hidden"
            style={{ height: '200px', minWidth: '100vw' }}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Gradient masks for smooth edges - minimal masks for maximum width */}
            <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-12 md:w-16 bg-gradient-to-r from-background via-background/80 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-12 md:w-16 bg-gradient-to-l from-background via-background/80 to-transparent z-10 pointer-events-none" />
            
            {/* Three rows of continuously moving chips - each with unique content */}
            <div className="absolute inset-0 flex flex-col justify-center gap-3 py-4">
              
              {/* Row 1 - Moving left (Strategic & Professional) */}
              <div className="flex gap-4 whitespace-nowrap">
                <div 
                  className="flex gap-4"
                  style={{
                    animation: 'scrollLeft 120s linear infinite',
                    animationPlayState: isPaused ? 'paused' : 'running',
                  }}
                >
                  {rows[0].map((chip, index) => (
                    <Button
                      key={`row1-${chip}-${index}`}
                      variant="outline"
                      size="sm"
                      onClick={() => handleChipClick(chip)}
                      disabled={isLoading}
                      className="flex-shrink-0 min-w-[180px] px-5 py-2 text-sm font-medium whitespace-nowrap
                        transition-all duration-300 hover:scale-110 hover:shadow-lg hover:border-primary/50 hover:bg-primary/5
                        border-blue-200 hover:border-blue-400 text-blue-700 hover:text-blue-800"
                    >
                      {chip}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Row 2 - Moving right (Witty & Creative) */}
              <div className="flex gap-4 whitespace-nowrap">
                <div 
                  className="flex gap-4"
                  style={{
                    animation: 'scrollRight 140s linear infinite',
                    animationPlayState: isPaused ? 'paused' : 'running',
                  }}
                >
                  {rows[1].map((chip, index) => (
                    <Button
                      key={`row2-${chip}-${index}`}
                      variant="outline"
                      size="sm"
                      onClick={() => handleChipClick(chip)}
                      disabled={isLoading}
                      className="flex-shrink-0 min-w-[180px] px-5 py-2 text-sm font-medium whitespace-nowrap
                        transition-all duration-300 hover:scale-110 hover:shadow-lg hover:border-primary/50 hover:bg-primary/5
                        border-green-200 hover:border-green-400 text-green-700 hover:text-green-800"
                    >
                      {chip}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Row 3 - Moving left faster (Mixed) */}
              <div className="flex gap-4 whitespace-nowrap">
                <div 
                  className="flex gap-4"
                  style={{
                    animation: 'scrollLeft 100s linear infinite',
                    animationPlayState: isPaused ? 'paused' : 'running',
                  }}
                >
                  {rows[2].map((chip, index) => (
                    <Button
                      key={`row3-${chip}-${index}`}
                      variant="outline"
                      size="sm"
                      onClick={() => handleChipClick(chip)}
                      disabled={isLoading}
                      className="flex-shrink-0 min-w-[180px] px-5 py-2 text-sm font-medium whitespace-nowrap
                        transition-all duration-300 hover:scale-110 hover:shadow-lg hover:border-primary/50 hover:bg-primary/5
                        border-purple-200 hover:border-purple-400 text-purple-700 hover:text-purple-800"
                    >
                      {chip}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Interactive subtitle */}
          <p className="text-xs text-muted-foreground/80 italic">
            {isPaused 
              ? "🎯 Paused - Click any idea to get started!" 
              : "✨ Hover to pause • Each row shows unique investment ideas"
            }
          </p>
        </div>
      </div>

      {/* CSS for infinite scroll animations */}
      <style jsx global>{`
        @keyframes scrollLeft {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-25%);
          }
        }
        
        @keyframes scrollRight {
          from {
            transform: translateX(-25%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
    </DynamicHoverBackground>
  )
}
