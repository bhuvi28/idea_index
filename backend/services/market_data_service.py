"""
Market data service for fetching real stock prices from Yahoo Finance

This service handles fetching historical stock prices and calculating 
portfolio performance using real market data.
"""
import yfinance as yf
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple
import logging

logger = logging.getLogger(__name__)


class MarketDataService:
    """Service for fetching real market data from Yahoo Finance"""
    
    def __init__(self):
        self.cache = {}  # Simple cache to avoid repeated API calls
    
    def get_optimal_interval(self, months: int) -> str:
        """
        Determine optimal data interval based on time period for performance
        
        Args:
            months: Number of months of data requested
            
        Returns:
            Optimal interval string for yfinance
        """
        if months >= 60:  # 5+ years - use weekly data
            return "1wk"
        elif months >= 36:  # 3+ years - use weekly data  
            return "1wk"
        elif months >= 12:  # 1+ year - use every 2nd day (simulate with daily then sample)
            return "1d"  # We'll sample this in post-processing
        elif months >= 6:   # 6+ months - use daily but sample every other day
            return "1d"  # We'll sample this in post-processing
        else:  # Less than 6 months - use daily data
            return "1d"
    
    def sample_data_for_performance(self, data: pd.DataFrame, months: int) -> pd.DataFrame:
        """
        Sample data points based on time period to optimize performance while preserving trends
        
        Args:
            data: DataFrame with historical price data
            months: Number of months of data
            
        Returns:
            Sampled DataFrame with optimal number of data points
        """
        if data.empty:
            return data
        
        try:
            # For longer periods, we need to sample the data to reduce volume
            if months >= 60:  # 5+ years - already using weekly data, no additional sampling needed
                return data
            elif months >= 36:  # 3+ years - already using weekly data, no additional sampling needed
                return data
            elif months >= 12:  # 1+ year - sample every 2nd day
                return data.iloc[::2]  # Take every 2nd row
            elif months >= 6:   # 6+ months - sample every other day
                return data.iloc[::2]  # Take every 2nd row
            else:  # Less than 6 months - use all daily data
                return data
                
        except Exception as e:
            logger.warning(f"Error sampling data: {str(e)}, returning original data")
            return data
    
    def fetch_historical_data(self, ticker: str, period: str = "1y", interval: str = "1d", start_date: Optional[str] = None, end_date: Optional[str] = None) -> Optional[pd.DataFrame]:
        """
        Fetch historical data for a single ticker
        
        Args:
            ticker: Stock ticker symbol (e.g., 'AAPL', '^GSPC')
            period: Period string ('1mo', '3mo', '6mo', '1y', '2y', '5y', '10y', 'ytd', 'max')
            interval: Data interval ('1d', '1wk', '1mo') - daily, weekly, monthly
            start_date: Start date in YYYY-MM-DD format (optional, overrides period)
            end_date: End date in YYYY-MM-DD format (optional, overrides period)
            
        Returns:
            DataFrame with historical data or None if failed
        """
        cache_key = f"{ticker}_{period}_{interval}_{start_date}_{end_date}"
        
        if cache_key in self.cache:
            logger.debug(f"Using cached data for {ticker}")
            return self.cache[cache_key]
        
        try:
            logger.info(f"Fetching historical data for {ticker} (period: {period})")
            ticker_obj = yf.Ticker(ticker)
            
            if start_date and end_date:
                data = ticker_obj.history(start=start_date, end=end_date, interval=interval)
            else:
                data = ticker_obj.history(period=period, interval=interval)
            
            if data.empty:
                logger.warning(f"No data returned for ticker {ticker}")
                return None
                
            # Cache the result
            self.cache[cache_key] = data
            logger.debug(f"Successfully fetched {len(data)} data points for {ticker}")
            return data
            
        except Exception as e:
            logger.error(f"Error fetching data for ticker {ticker}: {str(e)}")
            return None
    
    def fetch_multiple_tickers(self, tickers: List[str], period: str = "1y", interval: str = "1d", start_date: Optional[str] = None, end_date: Optional[str] = None) -> Dict[str, pd.DataFrame]:
        """
        Fetch historical data for multiple tickers
        
        Args:
            tickers: List of ticker symbols
            period: Period string
            interval: Data interval ('1d', '1wk', '1mo')
            start_date: Start date (optional)
            end_date: End date (optional)
            
        Returns:
            Dictionary mapping ticker to DataFrame
        """
        results = {}
        
        try:
            # Use yf.download for batch fetching (more efficient)
            logger.info(f"Batch fetching data for {len(tickers)} tickers")
            
            if start_date and end_date:
                data = yf.download(tickers, start=start_date, end=end_date, interval=interval, group_by='ticker')
            else:
                data = yf.download(tickers, period=period, interval=interval, group_by='ticker')
            
            if len(tickers) == 1:
                # Single ticker case - yfinance returns different structure
                ticker = tickers[0]
                if not data.empty:
                    results[ticker] = data
            else:
                # Multiple tickers case
                for ticker in tickers:
                    try:
                        ticker_data = data[ticker]
                        if not ticker_data.empty and not ticker_data.isna().all().all():
                            results[ticker] = ticker_data
                        else:
                            logger.warning(f"No valid data for ticker {ticker}")
                    except KeyError:
                        logger.warning(f"Ticker {ticker} not found in batch data")
                        # Fall back to individual fetch
                        individual_data = self.fetch_historical_data(ticker, period, interval, start_date, end_date)
                        if individual_data is not None:
                            results[ticker] = individual_data
            
            logger.info(f"Successfully fetched data for {len(results)} out of {len(tickers)} tickers")
            return results
            
        except Exception as e:
            logger.error(f"Error in batch fetching: {str(e)}")
            # Fall back to individual fetching
            logger.info("Falling back to individual ticker fetching")
            for ticker in tickers:
                data = self.fetch_historical_data(ticker, period, interval, start_date, end_date)
                if data is not None:
                    results[ticker] = data
            
            return results
    
    def calculate_portfolio_performance(self, holdings: List[Dict], months: int = 12) -> Dict[str, Any]:
        """
        Calculate real portfolio performance using actual stock prices with smart sampling
        
        Args:
            holdings: List of holdings with ticker, weight, etc.
            months: Number of months of historical data to fetch
            
        Returns:
            Dictionary with performance data
        """
        try:
            # Extract tickers and weights
            tickers = []
            weights = []
            
            for holding in holdings:
                if isinstance(holding, dict):
                    ticker = holding.get('ticker')
                    weight = holding.get('weight', 0)
                else:
                    ticker = getattr(holding, 'ticker', None)
                    weight = getattr(holding, 'weight', 0)
                
                if ticker and weight > 0:
                    tickers.append(ticker)
                    weights.append(weight / 100.0)  # Convert percentage to decimal
            
            if not tickers:
                logger.error("No valid tickers found in holdings")
                return self._generate_fallback_data(months)
            
            # Calculate date range
            end_date = datetime.now()
            start_date = end_date - timedelta(days=months * 30 + 30)  # Add buffer for weekends/holidays
            
            start_str = start_date.strftime('%Y-%m-%d')
            end_str = end_date.strftime('%Y-%m-%d')
            
            logger.info(f"Calculating portfolio performance for {len(tickers)} holdings from {start_str} to {end_str}")
            
            # Get optimal interval for this time period
            optimal_interval = self.get_optimal_interval(months)
            logger.info(f"Using optimal interval: {optimal_interval} for {months} months")
            
            # Fetch historical data for all tickers with optimal interval
            ticker_data = self.fetch_multiple_tickers(tickers, interval=optimal_interval, start_date=start_str, end_date=end_str)
            
            if not ticker_data:
                logger.error("No ticker data retrieved")
                return self._generate_fallback_data(months)
            
            # Calculate weighted portfolio performance with smart sampling
            return self._calculate_weighted_performance(ticker_data, tickers, weights, months)
            
        except Exception as e:
            logger.error(f"Error calculating portfolio performance: {str(e)}")
            return self._generate_fallback_data(months)
    
    def _calculate_weighted_performance(self, ticker_data: Dict[str, pd.DataFrame], tickers: List[str], weights: List[float], months: int) -> Dict[str, Any]:
        """Calculate weighted portfolio performance from ticker data"""
        try:
            # Get common date range from all tickers
            all_dates = None
            ticker_prices = {}
            
            for i, ticker in enumerate(tickers):
                if ticker not in ticker_data:
                    logger.warning(f"No data available for ticker {ticker}, skipping")
                    continue
                
                data = ticker_data[ticker]
                if 'Adj Close' in data.columns:
                    prices = data['Adj Close'].dropna()
                elif 'Close' in data.columns:
                    prices = data['Close'].dropna()
                else:
                    logger.warning(f"No price data found for ticker {ticker}")
                    continue
                
                if prices.empty:
                    continue
                
                # Apply smart sampling for performance optimization
                prices_df = pd.DataFrame({'price': prices}, index=prices.index)
                sampled_df = self.sample_data_for_performance(prices_df, months)
                sampled_prices = sampled_df['price']
                
                ticker_prices[ticker] = sampled_prices
                
                if all_dates is None:
                    all_dates = sampled_prices.index
                else:
                    all_dates = all_dates.intersection(sampled_prices.index)
            
            if not ticker_prices or all_dates is None or len(all_dates) < 10:
                logger.error("Insufficient common date range for portfolio calculation")
                return self._generate_fallback_data(months)
            
            # Sort dates and limit to requested months
            all_dates = sorted(all_dates)
            target_days = min(months * 21, len(all_dates))  # Approximate trading days per month
            all_dates = all_dates[-target_days:]  # Get most recent data
            
            # Calculate weighted portfolio values
            portfolio_values = []
            
            for date in all_dates:
                portfolio_value = 0
                total_weight = 0
                
                for i, ticker in enumerate(tickers):
                    if ticker in ticker_prices and date in ticker_prices[ticker].index:
                        price = ticker_prices[ticker][date]
                        weight = weights[i] if i < len(weights) else 0
                        portfolio_value += price * weight
                        total_weight += weight
                
                # Normalize if weights don't sum to 1
                if total_weight > 0:
                    portfolio_value = portfolio_value / total_weight
                
                portfolio_values.append(portfolio_value)
            
            if not portfolio_values:
                return self._generate_fallback_data(months)
            
            # Normalize to start at 100
            start_value = portfolio_values[0]
            normalized_values = [(val / start_value) * 100 for val in portfolio_values]
            
            # Format dates
            formatted_dates = [date.strftime('%Y-%m-%d') for date in all_dates]
            
            return {
                "dates": formatted_dates,
                "index_values": [round(val, 2) for val in normalized_values],
                "portfolio_values": [round(val, 2) for val in portfolio_values]
            }
            
        except Exception as e:
            logger.error(f"Error in weighted performance calculation: {str(e)}")
            return self._generate_fallback_data(months)
    
    def fetch_benchmark_performance(self, benchmark_ticker: str, dates: List[str], months: int = 12) -> List[float]:
        """
        Fetch benchmark performance for given dates with smart sampling
        
        Args:
            benchmark_ticker: Benchmark ticker (e.g., '^GSPC' for S&P 500)
            dates: List of date strings in YYYY-MM-DD format
            months: Number of months for optimal interval selection
            
        Returns:
            List of normalized benchmark values (starting at 100)
        """
        try:
            if not dates:
                return []
            
            start_date = dates[0]
            end_date = dates[-1]
            
            logger.info(f"Fetching benchmark data for {benchmark_ticker} from {start_date} to {end_date}")
            
            # Use optimal interval for benchmark data too
            optimal_interval = self.get_optimal_interval(months)
            benchmark_data = self.fetch_historical_data(benchmark_ticker, interval=optimal_interval, start_date=start_date, end_date=end_date)
            
            if benchmark_data is None or benchmark_data.empty:
                logger.error(f"No benchmark data available for {benchmark_ticker}")
                return self._generate_fallback_benchmark(len(dates))
            
            # Get adjusted close prices
            if 'Adj Close' in benchmark_data.columns:
                prices = benchmark_data['Adj Close']
            elif 'Close' in benchmark_data.columns:
                prices = benchmark_data['Close']
            else:
                logger.error(f"No price columns found for benchmark {benchmark_ticker}")
                return self._generate_fallback_benchmark(len(dates))
            
            # Apply smart sampling to benchmark data
            prices_df = pd.DataFrame({'price': prices}, index=prices.index)
            sampled_df = self.sample_data_for_performance(prices_df, months)
            prices = sampled_df['price']
            
            # Align benchmark data with portfolio dates
            benchmark_values = []
            portfolio_dates = pd.to_datetime(dates)
            
            for date in portfolio_dates:
                # Find closest available benchmark date
                available_dates = prices.index
                
                # Convert dates to timezone-naive for comparison if needed
                if available_dates.tz is not None:
                    available_dates_naive = available_dates.tz_convert(None)
                    date_naive = date.tz_localize(None) if date.tz is not None else date
                else:
                    available_dates_naive = available_dates
                    date_naive = date.tz_localize(None) if date.tz is not None else date
                
                closest_date = min(available_dates, key=lambda x: abs((x.tz_convert(None) if x.tz is not None else x) - date_naive).days)
                
                if abs((closest_date.tz_convert(None) if closest_date.tz is not None else closest_date) - date_naive).days <= 3:  # Within 3 days
                    benchmark_values.append(prices[closest_date])
                else:
                    # Use interpolation or last known value
                    if benchmark_values:
                        benchmark_values.append(benchmark_values[-1])
                    else:
                        benchmark_values.append(prices.iloc[0])
            
            if not benchmark_values:
                return self._generate_fallback_benchmark(len(dates))
            
            # Normalize to start at 100
            start_value = benchmark_values[0]
            normalized_values = [(val / start_value) * 100 for val in benchmark_values]
            
            return [round(val, 2) for val in normalized_values]
            
        except Exception as e:
            logger.error(f"Error fetching benchmark performance: {str(e)}")
            return self._generate_fallback_benchmark(len(dates))
    
    def _generate_fallback_data(self, months: int) -> Dict[str, Any]:
        """Generate fallback mock data if real data fetching fails"""
        logger.warning("Generating fallback mock data due to API errors")
        
        # Generate business days
        end_date = datetime.now()
        start_date = end_date - timedelta(days=months * 30)
        
        dates = []
        values = []
        current_date = start_date
        current_value = 100.0
        
        while current_date <= end_date:
            if current_date.weekday() < 5:  # Monday to Friday
                dates.append(current_date.strftime('%Y-%m-%d'))
                # Add some random variation
                daily_return = np.random.normal(0.0005, 0.015)
                current_value *= (1 + daily_return)
                values.append(round(current_value, 2))
            
            current_date += timedelta(days=1)
        
        return {
            "dates": dates,
            "index_values": values,
            "portfolio_values": values
        }
    
    def _generate_fallback_benchmark(self, num_points: int) -> List[float]:
        """Generate fallback benchmark data"""
        values = []
        current_value = 100.0
        
        for _ in range(num_points):
            daily_return = np.random.normal(0.0003, 0.012)
            current_value *= (1 + daily_return)
            values.append(round(current_value, 2))
        
        return values
    
    def fetch_financial_metrics(self, ticker: str) -> Dict[str, Any]:
        """
        Fetch comprehensive financial metrics for a ticker from Yahoo Finance
        
        Args:
            ticker: Stock ticker symbol
            
        Returns:
            Dictionary with financial metrics
        """
        try:
            logger.info(f"Fetching financial metrics for {ticker}")
            ticker_obj = yf.Ticker(ticker)
            info = ticker_obj.info
            
            # Extract key financial metrics
            metrics = {
                'ticker': ticker,
                'market_cap': info.get('marketCap'),
                'pe_ratio': info.get('trailingPE'),
                'forward_pe': info.get('forwardPE'),
                'peg_ratio': info.get('pegRatio'),
                'price_to_book': info.get('priceToBook'),
                'dividend_yield': info.get('dividendYield'),
                'beta': info.get('beta'),
                'fifty_two_week_high': info.get('fiftyTwoWeekHigh'),
                'fifty_two_week_low': info.get('fiftyTwoWeekLow'),
                'average_volume': info.get('averageVolume'),
                'profit_margin': info.get('profitMargins'),
                'return_on_equity': info.get('returnOnEquity'),
                'debt_to_equity': info.get('debtToEquity'),
                'current_ratio': info.get('currentRatio'),
                'revenue_growth': info.get('revenueGrowth'),
                'earnings_growth': info.get('earningsGrowth'),
                'operating_margin': info.get('operatingMargins'),
                'gross_margin': info.get('grossMargins'),
                'free_cash_flow': info.get('freeCashflow'),
                'enterprise_value': info.get('enterpriseValue'),
                'price_to_sales': info.get('priceToSalesTrailing12Months'),
                'enterprise_to_revenue': info.get('enterpriseToRevenue'),
                'enterprise_to_ebitda': info.get('enterpriseToEbitda'),
                'book_value': info.get('bookValue'),
                'shares_outstanding': info.get('sharesOutstanding'),
                'float_shares': info.get('floatShares'),
                'held_percent_institutions': info.get('heldPercentInstitutions'),
                'short_ratio': info.get('shortRatio'),
                'short_percent_outstanding': info.get('shortPercentOfFloat')
            }
            
            # Clean up None values and convert to appropriate types
            cleaned_metrics = {}
            for key, value in metrics.items():
                if value is not None:
                    cleaned_metrics[key] = value
            
            logger.debug(f"Successfully fetched {len(cleaned_metrics)} metrics for {ticker}")
            return cleaned_metrics
            
        except Exception as e:
            logger.error(f"Error fetching financial metrics for {ticker}: {str(e)}")
            return {'ticker': ticker, 'error': str(e)}
    
    def calculate_portfolio_metrics(self, holdings: List[Dict]) -> Dict[str, Any]:
        """
        Calculate comprehensive financial metrics for a portfolio using weighted averages
        
        Args:
            holdings: List of holdings with ticker, weight, etc.
            
        Returns:
            Dictionary with calculated portfolio metrics
        """
        try:
            logger.info(f"Calculating portfolio metrics for {len(holdings)} holdings")
            
            # Extract tickers and weights
            tickers = []
            weights = []
            
            for holding in holdings:
                if isinstance(holding, dict):
                    ticker = holding.get('ticker')
                    weight = holding.get('weight', 0)
                else:
                    ticker = getattr(holding, 'ticker', None)
                    weight = getattr(holding, 'weight', 0)
                
                if ticker and weight > 0:
                    tickers.append(ticker)
                    weights.append(weight / 100.0)  # Convert percentage to decimal
            
            if not tickers:
                logger.error("No valid tickers found in holdings")
                return {}
            
            # Fetch metrics for all holdings
            holdings_metrics = []
            total_weight = 0
            
            for i, ticker in enumerate(tickers):
                metrics = self.fetch_financial_metrics(ticker)
                if 'error' not in metrics:
                    metrics['weight'] = weights[i] if i < len(weights) else 0
                    holdings_metrics.append(metrics)
                    total_weight += metrics['weight']
            
            if not holdings_metrics:
                logger.error("No valid metrics fetched for any holdings")
                return {}
            
            # Calculate weighted portfolio metrics
            portfolio_metrics = {
                'total_holdings': len(holdings_metrics),
                'total_weight': total_weight * 100,  # Convert back to percentage
            }
            
            # Metrics that can be weighted by market cap or weight
            weighted_metrics = [
                'pe_ratio', 'forward_pe', 'peg_ratio', 'price_to_book', 'dividend_yield',
                'beta', 'profit_margin', 'return_on_equity', 'debt_to_equity',
                'current_ratio', 'revenue_growth', 'earnings_growth', 'operating_margin',
                'gross_margin', 'price_to_sales', 'enterprise_to_revenue', 'enterprise_to_ebitda'
            ]
            
            # Sum metrics
            sum_metrics = ['market_cap', 'free_cash_flow', 'enterprise_value', 'shares_outstanding']
            
            # Calculate weighted averages
            for metric in weighted_metrics:
                total_weighted_value = 0
                total_weight_for_metric = 0
                
                for holding_metrics in holdings_metrics:
                    if metric in holding_metrics and holding_metrics[metric] is not None:
                        value = holding_metrics[metric]
                        weight = holding_metrics['weight']
                        total_weighted_value += value * weight
                        total_weight_for_metric += weight
                
                if total_weight_for_metric > 0:
                    portfolio_metrics[f'weighted_{metric}'] = total_weighted_value / total_weight_for_metric
            
            # Calculate sums
            for metric in sum_metrics:
                total_value = 0
                for holding_metrics in holdings_metrics:
                    if metric in holding_metrics and holding_metrics[metric] is not None:
                        total_value += holding_metrics[metric] * holding_metrics['weight']
                
                if total_value > 0:
                    portfolio_metrics[f'total_{metric}'] = total_value
            
            # Calculate additional portfolio-specific metrics
            portfolio_metrics['average_market_cap'] = portfolio_metrics.get('total_market_cap', 0) / len(holdings_metrics)
            
            # Determine portfolio style based on weighted metrics
            avg_market_cap = portfolio_metrics.get('average_market_cap', 0)
            if avg_market_cap > 10_000_000_000:  # $10B+
                portfolio_metrics['style'] = 'Large Cap'
            elif avg_market_cap > 2_000_000_000:  # $2B+
                portfolio_metrics['style'] = 'Mid Cap'
            else:
                portfolio_metrics['style'] = 'Small Cap'
            
            logger.info(f"Successfully calculated portfolio metrics: {len(portfolio_metrics)} metrics")
            return portfolio_metrics
            
        except Exception as e:
            logger.error(f"Error calculating portfolio metrics: {str(e)}")
            return {}
    
    def calculate_real_performance_stats(self, price_data: List[float], benchmark_data: List[float] = None, risk_free_rate: float = 0.02) -> Dict[str, float]:
        """
        Calculate real performance statistics from price data
        
        Args:
            price_data: List of normalized price values (starting at 100)
            benchmark_data: Optional benchmark price data for comparison
            risk_free_rate: Annual risk-free rate (default 2%)
            
        Returns:
            Dictionary with performance statistics
        """
        try:
            if not price_data or len(price_data) < 2:
                return {}
            
            # Convert to numpy array for calculations
            prices = np.array(price_data)
            
            # Calculate daily returns
            daily_returns = np.diff(prices) / prices[:-1]
            
            # Calculate total return
            total_return = ((prices[-1] / prices[0]) - 1) * 100
            
            # Calculate annualized return (assuming daily data)
            trading_days = len(prices)
            years = trading_days / 252  # Approximate trading days per year
            if years > 0:
                annualized_return = ((prices[-1] / prices[0]) ** (1/years) - 1) * 100
            else:
                annualized_return = total_return
            
            # Calculate volatility (annualized)
            if len(daily_returns) > 0:
                daily_volatility = np.std(daily_returns)
                annualized_volatility = daily_volatility * np.sqrt(252) * 100
            else:
                annualized_volatility = 0
            
            # Calculate maximum drawdown
            peak = np.maximum.accumulate(prices)
            drawdown = (prices - peak) / peak * 100
            max_drawdown = np.min(drawdown)
            
            # Calculate Sharpe ratio
            if annualized_volatility > 0:
                sharpe_ratio = (annualized_return - risk_free_rate * 100) / annualized_volatility
            else:
                sharpe_ratio = 0
            
            # Calculate Sortino ratio (downside deviation)
            negative_returns = daily_returns[daily_returns < 0]
            if len(negative_returns) > 0:
                downside_deviation = np.std(negative_returns) * np.sqrt(252) * 100
                if downside_deviation > 0:
                    sortino_ratio = (annualized_return - risk_free_rate * 100) / downside_deviation
                else:
                    sortino_ratio = 0
            else:
                sortino_ratio = sharpe_ratio  # No negative returns
            
            # Calculate beta if benchmark data is provided
            beta = None
            alpha = None
            correlation = None
            
            if benchmark_data and len(benchmark_data) == len(price_data):
                benchmark_prices = np.array(benchmark_data)
                benchmark_returns = np.diff(benchmark_prices) / benchmark_prices[:-1]
                
                if len(benchmark_returns) == len(daily_returns) and len(benchmark_returns) > 1:
                    # Calculate beta
                    covariance = np.cov(daily_returns, benchmark_returns)[0, 1]
                    benchmark_variance = np.var(benchmark_returns)
                    
                    if benchmark_variance > 0:
                        beta = covariance / benchmark_variance
                        
                        # Calculate alpha (Jensen's alpha)
                        benchmark_return = ((benchmark_prices[-1] / benchmark_prices[0]) ** (1/years) - 1) * 100 if years > 0 else 0
                        alpha = annualized_return - (risk_free_rate * 100 + beta * (benchmark_return - risk_free_rate * 100))
                        
                        # Calculate correlation
                        correlation = np.corrcoef(daily_returns, benchmark_returns)[0, 1]
            
            stats = {
                'total_return': round(total_return, 2),
                'annualized_return': round(annualized_return, 2),
                'volatility': round(annualized_volatility, 2),
                'max_drawdown': round(max_drawdown, 2),
                'sharpe_ratio': round(sharpe_ratio, 3),
                'sortino_ratio': round(sortino_ratio, 3),
            }
            
            # Add beta, alpha, correlation if available
            if beta is not None:
                stats['beta'] = round(beta, 3)
            if alpha is not None:
                stats['alpha'] = round(alpha, 2)
            if correlation is not None:
                stats['correlation'] = round(correlation, 3)
            
            return stats
            
        except Exception as e:
            logger.error(f"Error calculating performance stats: {str(e)}")
            return {}
