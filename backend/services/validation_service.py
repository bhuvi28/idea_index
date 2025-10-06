"""
Validation service

Contains business logic for validating portfolio data and holdings.
"""
from typing import List
from fastapi import HTTPException
from ..models.schemas import Holding


class ValidationService:
    """Service for validating portfolio data"""
    
    @staticmethod
    def validate_holdings_weights(holdings: List[Holding]) -> None:
        """
        Validate that holdings weights sum to 100%
        
        Args:
            holdings: List of holdings to validate
            
        Raises:
            HTTPException: If weights don't sum to 100%
        """
        total_weight = sum(holding.weight for holding in holdings)
        if abs(total_weight - 100.0) > 0.01:  # Allow small floating point errors
            raise HTTPException(
                status_code=400, 
                detail=f"Holdings weights must sum to 100%. Current sum: {total_weight}%"
            )
    
    @staticmethod
    def validate_holding_data(holding: Holding) -> None:
        """
        Validate individual holding data
        
        Args:
            holding: Holding to validate
            
        Raises:
            HTTPException: If holding data is invalid
        """
        if holding.weight < 0 or holding.weight > 100:
            raise HTTPException(
                status_code=400,
                detail=f"Holding weight must be between 0 and 100%. Got: {holding.weight}%"
            )
        
        if not holding.ticker or not holding.ticker.strip():
            raise HTTPException(
                status_code=400,
                detail="Ticker symbol is required"
            )
        
        if not holding.security_name or not holding.security_name.strip():
            raise HTTPException(
                status_code=400,
                detail="Security name is required"
            )
