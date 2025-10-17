"""
Performance data service

Contains business logic for generating performance data, statistics, and scores.
"""
import random
import numpy as np
from typing import Dict, Any, List
from .constants import get_benchmark_for_portfolio
from .market_data_service import MarketDataService
import logging

logger = logging.getLogger(__name__)


class PerformanceService:
    """Service for generating performance data and analytics"""
    
    def __init__(self):
        self.market_data_service = MarketDataService()
    
    def generate_performance_data(self, holdings: List = None, months: int = 12, use_real_data: bool = True) -> Dict[str, Any]:
        """
        Generate performance data using real market data from Yahoo Finance
        
        Args:
            holdings: List of holdings with ticker, weight, etc.
            months: Number of months of historical data
            use_real_data: Whether to use real data or fallback to mock data
            
        Returns:
            Dictionary with performance data including dates, index_values, benchmark_values
        """
        
        # Determine the appropriate benchmark based on portfolio countries
        benchmark_info = get_benchmark_for_portfolio(holdings or [])
        benchmark_name = benchmark_info.get("name", "S&P 500")
        benchmark_ticker = benchmark_info.get("ticker", "^GSPC")
        
        if use_real_data and holdings:
            try:
                logger.info(f"Generating real performance data for {len(holdings)} holdings over {months} months")
                
                # Get real portfolio performance
                portfolio_data = self.market_data_service.calculate_portfolio_performance(holdings, months)
                
                if portfolio_data and "dates" in portfolio_data and "index_values" in portfolio_data:
                    dates = portfolio_data["dates"]
                    index_values = portfolio_data["index_values"]
                    
                    # Get real benchmark performance with smart sampling
                    benchmark_values = self.market_data_service.fetch_benchmark_performance(benchmark_ticker, dates, months)
                    
                    if not benchmark_values:
                        # Generate fallback benchmark if real data fails
                        logger.error('No benchmark values found')
                        # benchmark_values = self._generate_fallback_benchmark_values(len(dates))
                    
                    logger.info(f"Successfully generated real performance data with {len(dates)} data points")
                    
                    return {
                        "dates": dates,
                        "index_values": index_values,
                        "benchmark_values": benchmark_values,
                        "benchmark_name": benchmark_name,
                        "benchmark_ticker": benchmark_ticker
                    }
                else:
                    logger.warning("Real data generation failed, falling back to mock data")
                    
            except Exception as e:
                logger.error(f"Error generating real performance data: {str(e)}, falling back to mock data")
        
        # Fallback to mock data
        logger.info(f"Generating mock performance data for {months} months")
        # return self._generate_mock_performance_data(months, benchmark_name, benchmark_ticker)
    
    def _generate_mock_performance_data(self, months: int, benchmark_name: str, benchmark_ticker: str) -> Dict[str, Any]:
        """Generate mock performance data as fallback"""
        
        # Generate realistic number of trading days
        trading_days = min(months * 21, 252)  # Approximate 21 trading days per month
        
        dates = []
        index_values = []
        benchmark_values = []
        
        index_value = 100.0
        benchmark_value = 100.0
        
        # Generate dates going backwards from today
        from datetime import datetime, timedelta
        end_date = datetime.now()
        
        for i in range(trading_days):
            current_date = end_date - timedelta(days=i * (30 * months / trading_days))
            
            # Mock daily returns with some correlation
            market_factor = random.normalvariate(0, 0.01)  # Common market movement
            index_return = random.normalvariate(0.0008, 0.015) + 0.7 * market_factor  # ~20% annual return, 15% volatility
            benchmark_return = random.normalvariate(0.0005, 0.012) + 0.8 * market_factor  # ~12% annual return, 12% volatility
            
            index_value *= (1 + index_return)
            benchmark_value *= (1 + benchmark_return)
            
            dates.append(current_date.strftime('%Y-%m-%d'))
            index_values.append(round(index_value, 2))
            benchmark_values.append(round(benchmark_value, 2))
        
        # Reverse to get chronological order
        dates.reverse()
        index_values.reverse()
        benchmark_values.reverse()
        
        return {
            "dates": dates,
            "index_values": index_values,
            "benchmark_values": benchmark_values,
            "benchmark_name": benchmark_name,
            "benchmark_ticker": benchmark_ticker
        }
    
    def _generate_fallback_benchmark_values(self, num_points: int) -> List[float]:
        """Generate fallback benchmark values"""
        values = []
        current_value = 100.0
        
        for _ in range(num_points):
            daily_return = random.normalvariate(0.0003, 0.012)  # Conservative benchmark returns
            current_value *= (1 + daily_return)
            values.append(round(current_value, 2))
        
        return values
    
    def generate_stats(self, performance_data: Dict[str, Any] = None, use_real_data: bool = True) -> Dict[str, float]:
        """
        Generate performance statistics using real market data calculations
        
        Args:
            performance_data: Performance data with index_values and benchmark_values
            use_real_data: Whether to calculate real stats or use mock data
            
        Returns:
            Dictionary with performance statistics
        """
        if use_real_data and performance_data and "index_values" in performance_data:
            try:
                logger.info("Calculating real performance statistics")
                
                index_values = performance_data["index_values"]
                benchmark_values = performance_data.get("benchmark_values")
                
                # Calculate real statistics using market data service
                real_stats = self.market_data_service.calculate_real_performance_stats(
                    price_data=index_values,
                    benchmark_data=benchmark_values,
                    risk_free_rate=0.02  # 2% risk-free rate
                )
                
                if real_stats:
                    logger.info("Successfully calculated real performance statistics")
                    return {
                        "total_return": real_stats.get("total_return", 0),
                        "max_drawdown": real_stats.get("max_drawdown", 0),
                        "sharpe_ratio": real_stats.get("sharpe_ratio", 0),
                        "volatility": real_stats.get("volatility", 0),
                        "beta": real_stats.get("beta"),
                        "alpha": real_stats.get("alpha"),
                        "correlation": real_stats.get("correlation")
                    }
            except Exception as e:
                logger.error(f"Error calculating real stats: {str(e)}, falling back to mock data")
        
        # Fallback to mock data
        logger.info("Generating mock performance statistics")
        return {
            "total_return": round(random.uniform(15.0, 25.0), 2),
            "max_drawdown": round(random.uniform(-8.0, -15.0), 2),
            "sharpe_ratio": round(random.uniform(1.2, 1.8), 2),
            "volatility": round(random.uniform(12.0, 20.0), 2)
        }
    
    def generate_benchmark_stats(self, performance_data: Dict[str, Any] = None, benchmark_ticker: str = None, use_real_data: bool = True) -> Dict[str, Any]:
        """
        Generate benchmark statistics using real Yahoo Finance data
        
        Args:
            performance_data: Performance data with benchmark_values
            benchmark_ticker: Benchmark ticker symbol (e.g., '^GSPC')
            use_real_data: Whether to fetch real benchmark metrics
            
        Returns:
            Dictionary with benchmark statistics and metrics
        """
        if use_real_data and benchmark_ticker:
            try:
                logger.info(f"Fetching real benchmark metrics for {benchmark_ticker}")
                
                # Get benchmark financial metrics
                benchmark_metrics = self.market_data_service.fetch_financial_metrics(benchmark_ticker)
                
                # Calculate performance stats from price data if available
                benchmark_perf_stats = {}
                if performance_data and "benchmark_values" in performance_data:
                    benchmark_values = performance_data["benchmark_values"]
                    benchmark_perf_stats = self.market_data_service.calculate_real_performance_stats(
                        price_data=benchmark_values,
                        risk_free_rate=0.02
                    )
                
                # Combine metrics and performance stats
                combined_stats = {
                    "total_return": benchmark_perf_stats.get("total_return", 0),
                    "max_drawdown": benchmark_perf_stats.get("max_drawdown", 0),
                    "sharpe_ratio": benchmark_perf_stats.get("sharpe_ratio", 0),
                    "volatility": benchmark_perf_stats.get("volatility", 0),
                    "pe_ratio": benchmark_metrics.get("pe_ratio"),
                    "dividend_yield": benchmark_metrics.get("dividend_yield"),
                    "beta": benchmark_metrics.get("beta", 1.0),  # Benchmark beta is typically 1.0
                    "market_cap": benchmark_metrics.get("market_cap"),
                    "price_to_book": benchmark_metrics.get("price_to_book")
                }
                
                # Clean up None values
                cleaned_stats = {k: v for k, v in combined_stats.items() if v is not None}
                
                if cleaned_stats:
                    logger.info("Successfully fetched real benchmark statistics")
                    return cleaned_stats
                    
            except Exception as e:
                logger.error(f"Error fetching real benchmark stats: {str(e)}, falling back to mock data")
        
        # Fallback to mock benchmark data
        logger.info("Generating mock benchmark statistics")
        benchmark_perf_stats = {}
        if performance_data and "benchmark_values" in performance_data:
            benchmark_values = performance_data["benchmark_values"]
            benchmark_perf_stats = self.market_data_service.calculate_real_performance_stats(
                price_data=benchmark_values,
                risk_free_rate=0.02
            )
        
        return {
            "total_return": benchmark_perf_stats.get("total_return", round(random.uniform(8.0, 15.0), 2)),
            "max_drawdown": benchmark_perf_stats.get("max_drawdown", round(random.uniform(-5.0, -12.0), 2)),
            "sharpe_ratio": benchmark_perf_stats.get("sharpe_ratio", round(random.uniform(0.8, 1.4), 2)),
            "volatility": benchmark_perf_stats.get("volatility", round(random.uniform(10.0, 16.0), 2))
        }
    
    def generate_scores(self) -> Dict[str, Dict[str, Any]]:
        """Generate mock scoring data - TODO: Plug real analysis here"""
        return {
            "asset_score": {
                "score": random.randint(7, 9),
                "max_score": 10,
                "description": "Quality and fundamentals of underlying assets"
            },
            "returns_score": {
                "score": random.randint(6, 8),
                "max_score": 10,
                "description": "Historical and expected return performance"
            },
            "stability_score": {
                "score": random.randint(7, 9),
                "max_score": 10,
                "description": "Volatility and downside risk management"
            },
            "diversification_score": {
                "score": random.randint(5, 7),
                "max_score": 10,
                "description": "Portfolio concentration and correlation analysis"
            }
        }
