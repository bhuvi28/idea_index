"""
Index generation API routes
"""
import logging
from fastapi import APIRouter, Query
from typing import List, Dict, Any
from ..models.schemas import IndexRequest, IndexResponse
from ..services.index_generator import IndexGeneratorService
from ..services.performance_service import PerformanceService

router = APIRouter(tags=["index"])
logger = logging.getLogger(__name__)

@router.post("/generate-index", response_model=IndexResponse)
async def generate_index(request: IndexRequest):
    """Generate investment index from user prompt"""
    logger.info(f"Starting index generation for prompt: {request.prompt[:100]}...")
    
    # Initialize services
    index_service = IndexGeneratorService()
    performance_service = PerformanceService()

    # Generate both holdings and title with single LLM call (optimized)
    logger.debug("Generating index data (holdings + title)...")
    index_data = index_service.generate_index_data(request.prompt)
    holdings = index_data["holdings"]
    index_name = index_data["title"]
    logger.debug(f"Generated {len(holdings)} holdings and title: {index_name}")
    
    # Generate performance components
    logger.debug("Generating performance data...")
    performance_data = performance_service.generate_performance_data(holdings, months=12, use_real_data=True)
    
    logger.debug("Generating stats...")
    stats = performance_service.generate_stats(performance_data, use_real_data=True)
    
    logger.debug("Generating benchmark stats...")
    benchmark_ticker = performance_data.get("benchmark_ticker", "^GSPC")
    benchmark_stats = performance_service.generate_benchmark_stats(performance_data, benchmark_ticker, use_real_data=True)
    
    logger.debug("Generating scores...")
    scores = performance_service.generate_scores()
    
    logger.info("Index generation completed successfully")
    return IndexResponse(
        index_name=index_name,
        original_prompt=request.prompt,
        holdings=holdings,
        performance_data=performance_data,
        stats=stats,
        benchmark_stats=benchmark_stats,
        scores=scores
    )


@router.post("/performance-data")
async def get_performance_data(
    holdings: List[Dict[str, Any]],
    months: int = Query(default=12, ge=1, le=120, description="Number of months of historical data")
):
    """Get comprehensive performance data including metrics for specific time period"""
    logger.info(f"Fetching performance data for {len(holdings)} holdings over {months} months")
    
    try:
        performance_service = PerformanceService()
        
        # Get performance data
        performance_data = performance_service.generate_performance_data(
            holdings=holdings, 
            months=months, 
            use_real_data=True
        )
        
        # Generate enhanced stats
        stats = performance_service.generate_stats(performance_data, use_real_data=True)
        
        # Generate benchmark stats
        benchmark_ticker = performance_data.get("benchmark_ticker", "^GSPC")
        benchmark_stats = performance_service.generate_benchmark_stats(
            performance_data, benchmark_ticker, use_real_data=True
        )
        
        # Combine all data
        enhanced_data = {
            **performance_data,
            "stats": stats,
            "benchmark_stats": benchmark_stats
        }
        
        logger.info("Enhanced performance data fetched successfully")
        return enhanced_data
        
    except Exception as e:
        logger.error(f"Error fetching performance data: {str(e)}")
        # Return fallback data
        performance_service = PerformanceService()
        fallback_data = performance_service.generate_performance_data(
            holdings=holdings, 
            months=months, 
            use_real_data=False
        )
        fallback_stats = performance_service.generate_stats(fallback_data, use_real_data=False)
        fallback_benchmark_stats = performance_service.generate_benchmark_stats(
            fallback_data, use_real_data=False
        )
        
        return {
            **fallback_data,
            "stats": fallback_stats,
            "benchmark_stats": fallback_benchmark_stats
        }
