"""
Fund Mapping Service

Maps LLM-generated tickers to mutual fund holdings and calculates exposure percentages.
Supports multiple AMCs and provides detailed fund overlap analysis.
"""
import json
import csv
from typing import Dict, List, Any, Optional
import logging
from pathlib import Path

logger = logging.getLogger(__name__)


class FundMappingService:
    """Service for mapping tickers to mutual fund holdings and calculating exposure"""
    
    def __init__(self):
        self.ticker_mapping = {}
        self.amc_data = {}
        self._load_ticker_mapping()
        self._load_amc_data()
    
    def _load_ticker_mapping(self):
        """Load company ticker mapping from CSV file"""
        try:
            mapping_file = Path(__file__).parent.parent / "etc" / "company_ticker_mapping.csv"
            with open(mapping_file, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    input_name = row['input_name'].strip()
                    symbol = row['symbol'].strip()
                    yfinance_ticker = row['yfinance_ticker'].strip()
                    confidence = float(row.get('confidence', 0))
                    
                    # Only use high-confidence mappings (lowered threshold for important companies)
                    if confidence >= 85.0:
                        # Map both symbol and yfinance_ticker to company name
                        self.ticker_mapping[symbol] = input_name
                        self.ticker_mapping[yfinance_ticker] = input_name
            
            logger.info(f"Loaded {len(self.ticker_mapping)} ticker mappings")
        except Exception as e:
            logger.error(f"Error loading ticker mapping: {e}")
            self.ticker_mapping = {}
    
    def _load_amc_data(self):
        """Load AMC fund data from JSON files"""
        try:
            # Load HDFC funds
            hdfc_file = Path(__file__).parent.parent / "etc" / "hdfc_all_fund.json"
            if hdfc_file.exists():
                with open(hdfc_file, 'r', encoding='utf-8') as f:
                    hdfc_data = json.load(f)
                    self.amc_data["HDFC"] = hdfc_data
                    logger.info(f"Loaded HDFC funds: {len(hdfc_data.get('funds', []))}")
            
            # Load SBI funds
            sbi_file = Path(__file__).parent.parent / "etc" / "sbi_all_funds.json"
            if sbi_file.exists():
                with open(sbi_file, 'r', encoding='utf-8') as f:
                    sbi_data = json.load(f)
                    self.amc_data["SBI"] = sbi_data
                    logger.info(f"Loaded SBI funds: {len(sbi_data.get('funds', []))}")
            
            # Future: Add more AMCs here
            # self.amc_data["ICICI"] = load_icici_funds()
            
        except Exception as e:
            logger.error(f"Error loading AMC data: {e}")
            self.amc_data = {}
    
    def map_tickers_to_funds(self, llm_tickers: List[str], min_exposure: float = 0.1) -> Dict[str, Any]:
        """
        Map LLM-generated tickers to mutual fund holdings and calculate exposure
        
        Args:
            llm_tickers: List of ticker symbols from LLM (e.g., ["HDFCBANK.NS", "RELIANCE.NS"])
            min_exposure: Minimum exposure percentage to include in results
            
        Returns:
            Dictionary with mapping results
        """
        try:
            logger.info(f"Mapping {len(llm_tickers)} tickers to fund holdings")
            logger.debug(f"LLM tickers: {llm_tickers}")
            
            # Filter tickers that exist in our mapping
            valid_tickers = []
            ticker_to_company = {}
            
            for ticker in llm_tickers:
                # Find company name for this ticker using the CSV mapping
                company_name = self.ticker_mapping.get(ticker)
                
                if company_name:
                    valid_tickers.append(ticker)
                    ticker_to_company[ticker] = company_name
                    logger.debug(f"Mapped ticker {ticker} to company {company_name}")
                else:
                    logger.warning(f"No mapping found for ticker: {ticker}")
            
            logger.info(f"Found {len(valid_tickers)} valid tickers out of {len(llm_tickers)}")
            
            if not valid_tickers:
                return {
                    "total_tickers": len(llm_tickers),
                    "valid_tickers": 0,
                    "fund_mappings": [],
                    "summary": {
                        "total_funds_analyzed": 0,
                        "funds_with_overlap": 0,
                        "max_exposure": 0.0
                    }
                }
            
            # Analyze fund holdings for each AMC
            all_fund_mappings = []
            
            for amc_name, amc_data in self.amc_data.items():
                if 'funds' not in amc_data:
                    continue
                
                for fund in amc_data['funds']:
                    fund_mapping = self._analyze_fund_holdings(
                        fund, valid_tickers, ticker_to_company, amc_name, min_exposure
                    )
                    
                    # Filter by fund-level total exposure (not individual ticker exposure)
                    if fund_mapping['total_exposure'] >= min_exposure:
                        all_fund_mappings.append(fund_mapping)
            
            # Sort by exposure (descending)
            all_fund_mappings.sort(key=lambda x: x['total_exposure'], reverse=True)
            
            # Calculate summary statistics
            total_funds = sum(len(amc_data.get('funds', [])) for amc_data in self.amc_data.values())
            funds_with_overlap = len(all_fund_mappings)
            max_exposure = max((m['total_exposure'] for m in all_fund_mappings), default=0.0)
            
            logger.info(f"Found {funds_with_overlap} funds with overlap out of {total_funds} total funds")
            
            # Log details of top funds for debugging
            for i, fund in enumerate(all_fund_mappings[:3]):  # Top 3 funds
                logger.debug(f"Top fund {i+1}: {fund['fund_name']} - {fund['total_exposure']}% exposure, {len(fund['overlapping_holdings'])} holdings")
            
            return {
                "total_tickers": len(llm_tickers),
                "valid_tickers": len(valid_tickers),
                "valid_ticker_list": valid_tickers,
                "fund_mappings": all_fund_mappings,
                "summary": {
                    "total_funds_analyzed": total_funds,
                    "funds_with_overlap": funds_with_overlap,
                    "max_exposure": round(max_exposure, 2),
                    "amcs_analyzed": list(self.amc_data.keys())
                }
            }
            
        except Exception as e:
            logger.error(f"Error in fund mapping: {e}")
            return {
                "error": str(e),
                "total_tickers": len(llm_tickers),
                "valid_tickers": 0,
                "fund_mappings": [],
                "summary": {
                    "total_funds_analyzed": 0,
                    "funds_with_overlap": 0,
                    "max_exposure": 0.0
                }
            }
    
    def _analyze_fund_holdings(self, fund: Dict, valid_tickers: List[str], 
                              ticker_to_company: Dict[str, str], amc_name: str, 
                              min_exposure: float) -> Dict[str, Any]:
        """Analyze a single fund's holdings for ticker overlap"""
        
        fund_name = fund.get('fund_name', 'Unknown Fund')
        fund_metadata = fund.get('fund_metadata', {})
        holdings = fund.get('holdings', [])
        
        overlapping_holdings = []
        total_exposure = 0.0
        
        for holding in holdings:
            if holding.get('type', '').strip().lower() != 'equity' or holding.get('is_derivative', False):
                continue
            company_name = holding.get('company', '').strip()
            percentage = holding.get('percentage_to_nav', 0.0)
            
            # Check if this company matches any of our valid tickers
            for ticker in valid_tickers:
                mapped_company = ticker_to_company.get(ticker)
                if company_name == mapped_company:
                    overlapping_holdings.append({
                        'ticker': ticker,
                        'company_name': company_name,
                        'exposure_percentage': percentage,
                        'sector': holding.get('sector_or_rating', 'Unknown'),
                        'type': holding.get('type', 'Equity')
                    })
                    total_exposure += percentage
                    logger.debug(f"Found overlap: {company_name} ({ticker}) - {percentage}% in {fund_name}")
                    break
        
        # NOTE: Do NOT filter individual holdings by min_exposure here
        # The min_exposure parameter is used to filter FUNDS by total_exposure, not individual tickers
        # All overlapping holdings should be included regardless of their individual exposure
        
        return {
            'fund_name': fund_name,
            'amc_name': amc_name,
            'fund_metadata': fund_metadata,
            'overlapping_holdings': overlapping_holdings,
            'total_exposure': round(total_exposure, 2),
            'overlapping_tickers': [h['ticker'] for h in overlapping_holdings],
            'num_overlapping_holdings': len(overlapping_holdings)
        }
    
    def get_fund_details(self, fund_name: str, amc_name: str = None) -> Optional[Dict[str, Any]]:
        """Get detailed information about a specific fund"""
        try:
            for amc, amc_data in self.amc_data.items():
                if amc_name and amc != amc_name:
                    continue
                
                for fund in amc_data.get('funds', []):
                    if fund.get('fund_name') == fund_name:
                        return fund
            
            return None
        except Exception as e:
            logger.error(f"Error getting fund details: {e}")
            return None
    
    def get_amc_summary(self) -> Dict[str, Any]:
        """Get summary of all loaded AMCs"""
        summary = {}
        for amc_name, amc_data in self.amc_data.items():
            funds = amc_data.get('funds', [])
            summary[amc_name] = {
                'total_funds': len(funds),
                'amc_info': amc_data.get('amc', amc_name)
            }
        
        return summary
