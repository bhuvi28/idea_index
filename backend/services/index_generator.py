"""
Index generation service

Contains business logic for generating investment indices from user prompts.
"""
import logging
import random
from typing import List, Dict, Any
from ..models.schemas import Holding
from ..services.llm import get_holdings_for_prompt, get_index_data_for_prompt

logger = logging.getLogger(__name__)

class IndexGeneratorService:
    """Service for generating investment indices"""
    
    def __init__(self):
        self.tech_holdings = [
            {
                "ticker": "AAPL", 
                "name": "Apple Inc.", 
                "sector": "Technology", 
                "rationale": f"{random.randint(1, 100)} Leading consumer electronics and services"
            },
            {
                "ticker": "MSFT", 
                "name": "Microsoft Corporation", 
                "sector": "Technology", 
                "rationale": "Dominant cloud computing platform"
            },
            {
                "ticker": "GOOGL", 
                "name": "Alphabet Inc.", 
                "sector": "Technology", 
                "rationale": "Search engine and AI innovation leader"
            },
            {
                "ticker": "NVDA", 
                "name": "NVIDIA Corporation", 
                "sector": "Technology", 
                "rationale": "AI chip manufacturing leader"
            },
            {
                "ticker": "TSLA", 
                "name": "Tesla Inc.", 
                "sector": "Consumer Discretionary", 
                "rationale": "Electric vehicle and clean energy pioneer"
            },
        ]
        
        self.green_holdings = [
            {
                "ticker": "NEE", 
                "name": "NextEra Energy", 
                "sector": "Utilities", 
                "rationale": "MMM! Renewable energy infrastructure leader"
            },
            {
                "ticker": "ENPH", 
                "name": "Enphase Energy", 
                "sector": "Technology", 
                "rationale": "Solar energy systems innovation"
            },
            {
                "ticker": "TSLA", 
                "name": "Tesla Inc.", 
                "sector": "Consumer Discretionary", 
                "rationale": "Electric vehicle pioneer"
            },
            {
                "ticker": "BEP", 
                "name": "Brookfield Renewable", 
                "sector": "Utilities", 
                "rationale": "Global renewable power portfolio"
            },
            {
                "ticker": "ICLN", 
                "name": "iShares Clean Energy ETF", 
                "sector": "Energy", 
                "rationale": "Diversified clean energy exposure"
            },
        ]
    
    def generate_index_data(self, prompt: str) -> Dict[str, Any]:
        """
        Generate complete index data (holdings + title) from prompt using single LLM call.
        This is the new preferred method that avoids duplicate LLM calls.
        
        Returns:
            Dict containing 'holdings' (List[Holding]) and 'title' (str)
        """
        logger.debug(f"Generating complete index data for prompt: {prompt}")
        
        try:
            # Get both portfolio and title from single LLM call
            index_data = get_index_data_for_prompt(prompt)
            portfolio_data = index_data["portfolio"]
            title = index_data["title"]
            
            logger.debug(f"LLM returned {len(portfolio_data)} holdings and title: {title}")
            
            # Convert to Holding objects
            final_holdings = []
            for holding in portfolio_data:
                final_holdings.append(Holding(
                    ticker=holding["ticker"],
                    security_name=holding["name"],
                    country=holding["country"],
                    sector=holding["sector"],
                    market_cap=holding["market_cap"],
                    selection_rationale=holding["rationale"],
                    weight=holding["weight"],
                    relevance=holding["relevance"]
                ))
            
            # Normalize weights to ensure they sum to 100.00
            final_holdings = self.normalize_weights(final_holdings)
            
            logger.debug(f"Successfully generated index data with {len(final_holdings)} holdings and title: {title}")
            return {
                "holdings": final_holdings,
                "title": title
            }
            
        except Exception as e:
            logger.error(f"Error generating index data: {e}")
            raise

    def generate_index_name(self, prompt: str) -> str:
        """
        Generate index name from prompt.
        Note: This method now uses the cached LLM response to get the AI-generated title.
        For new code, consider using generate_index_data() instead to get both holdings and title.
        """
        logger.debug(f"Generating index name for prompt: {prompt}")
        
        try:
            # Use the new cached LLM service to get the AI-generated title
            index_data = get_index_data_for_prompt(prompt)
            title = index_data["title"]
            logger.debug(f"Generated AI title: {title}")
            return title
        except Exception as e:
            logger.warning(f"Failed to get AI-generated title, falling back to simple title: {e}")
            # Fallback to simple title generation
            index_name = f"{prompt.title()} Index"
            if len(index_name) > 50:
                index_name = index_name[:47] + "..."
            logger.debug(f"Generated fallback title: {index_name}")
            return index_name
    
    def _select_holdings_by_theme(self, prompt: str) -> List[Dict[str, str]]:
        """Select holdings based on prompt theme"""
        prompt_lower = prompt.lower()
        
        # Simple keyword matching - TODO: Replace with real NLP/AI
        if any(word in prompt_lower for word in ["tech", "technology", "ai", "artificial intelligence"]):
            return self.tech_holdings
        elif any(word in prompt_lower for word in ["green", "clean", "renewable", "sustainable", "esg"]):
            return self.green_holdings
        else:
            return self.tech_holdings  # Default

    def normalize_weights(self, holdings: List[Holding]) -> List[Holding]:
        """
        Normalize holdings weights to ensure they sum to exactly 100.00
        
        Args:
            holdings: List of holdings with potentially incorrect weight sums
            
        Returns:
            List of holdings with normalized weights that sum to exactly 100.00
        """
        if not holdings:
            return holdings
            
        # Calculate current total weight
        total_weight = sum(holding.weight for holding in holdings)
        
        # If total is 0 or very close to 0, distribute equally
        if total_weight < 0.01:
            logger.warning("Total weight is 0 or very close to 0, distributing equally")
            equal_weight = 100.0 / len(holdings)
            for holding in holdings:
                holding.weight = equal_weight
            return holdings
        
        # STRICT CHECK: Only accept exactly 100.00% (no tolerance)
        if abs(total_weight - 100.0) < 0.001:  # Very small tolerance for floating point precision
            logger.debug(f"Weights already sum to {total_weight:.2f}%, no normalization needed")
            return holdings
        
        # Always normalize if not exactly 100% - no tolerance for 99.99% etc.
        logger.info(f"Normalizing weights from {total_weight:.2f}% to exactly 100.00%")
        scaling_factor = 100.0 / total_weight
        
        # Apply scaling and round to 2 decimal places
        for holding in holdings:
            holding.weight = round(holding.weight * scaling_factor, 2)
        
        # Verify the normalization worked with strict check
        new_total = sum(holding.weight for holding in holdings)
        if abs(new_total - 100.0) >= 0.01:  # Allow only 1 basis point tolerance for floating point precision
            logger.error(f"CRITICAL: Weight normalization failed! Weights sum to {new_total:.2f}% instead of 100.00%")
            # Force exact 100% by adjusting the largest holding
            self._force_exact_100_percent(holdings)
        
        final_total = sum(holding.weight for holding in holdings)
        logger.debug(f"After normalization, weights sum to {final_total:.2f}%")
        
        return holdings
    
    def _force_exact_100_percent(self, holdings: List[Holding]) -> None:
        """
        Force weights to sum to exactly 100.00% by adjusting the largest holding.
        This is a fallback method when normal scaling fails due to floating point precision.
        """
        if not holdings:
            return
            
        # Find the holding with the largest weight
        largest_holding = max(holdings, key=lambda h: h.weight)
        current_total = sum(holding.weight for holding in holdings)
        adjustment = 100.0 - current_total
        
        # Adjust the largest holding to make total exactly 100%
        largest_holding.weight = round(largest_holding.weight + adjustment, 2)
        
        # Verify the fix worked
        final_total = sum(holding.weight for holding in holdings)
        logger.info(f"Forced exact 100%: Final total is {final_total:.2f}%")

    def generate_holdings(self, prompt: str) -> List[Holding]:
        """Generate mock holdings based on prompt"""
        logger.debug(f"Generating holdings for prompt: {prompt}")
        try:
            holdings = get_holdings_for_prompt(prompt)
            logger.debug(f"LLM returned {len(holdings)} holdings")
        except Exception as e:
            logger.error(f"Error getting holdings from LLM: {e}")
            raise
        
        final_holdings = []
        for holding in holdings:
            final_holdings.append(Holding(
                ticker=holding["ticker"],
                security_name=holding["name"],
                country=holding["country"],
                sector=holding["sector"],
                market_cap=holding["market_cap"],
                selection_rationale=holding["rationale"],
                weight=holding["weight"],
                relevance=holding["relevance"]
            ))
        
        # Normalize weights to ensure they sum to 100.00
        final_holdings = self.normalize_weights(final_holdings)
        
        return final_holdings
