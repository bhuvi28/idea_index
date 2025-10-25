"""
Index generation API routes
"""
import logging
from fastapi import APIRouter, Query
from typing import List, Dict, Any
from ..models.schemas import IndexRequest, IndexResponse
from ..services.index_generator import IndexGeneratorService
from ..services.performance_service import PerformanceService
from ..services.fund_mapping_service import FundMappingService

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


@router.post("/fund-mapping")
async def get_fund_mapping(
    holdings: List[Dict[str, Any]],
    min_exposure: float = Query(default=0.1, ge=0.0, le=100.0, description="Minimum exposure percentage to include")
):
    """Map LLM-generated tickers to mutual fund holdings and calculate exposure"""
    logger.info(f"Mapping {len(holdings)} holdings to fund exposures")
    
    try:
        fund_mapping_service = FundMappingService()
        
        # Extract tickers from holdings
        tickers = []
        for holding in holdings:
            if isinstance(holding, dict):
                ticker = holding.get('ticker')
            else:
                ticker = getattr(holding, 'ticker', None)
            
            if ticker:
                tickers.append(ticker)
        
        if not tickers:
            logger.warning("No tickers found in holdings")
            return {
                "error": "No tickers found in holdings",
                "total_tickers": 0,
                "valid_tickers": 0,
                "fund_mappings": [],
                "summary": {
                    "total_funds_analyzed": 0,
                    "funds_with_overlap": 0,
                    "max_exposure": 0.0
                }
            }
        
        # Get fund mapping results
        mapping_results = fund_mapping_service.map_tickers_to_funds(tickers, min_exposure)
        
        logger.info(f"Fund mapping completed: {mapping_results['summary']['funds_with_overlap']} funds with overlap")
        return mapping_results
        
    except Exception as e:
        logger.error(f"Error in fund mapping: {str(e)}")
        return {
            "error": str(e),
            "total_tickers": len(holdings),
            "valid_tickers": 0,
            "fund_mappings": [],
            "summary": {
                "total_funds_analyzed": 0,
                "funds_with_overlap": 0,
                "max_exposure": 0.0
            }
        }
