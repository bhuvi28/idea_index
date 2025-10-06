"""
Portfolio management API routes
"""
from fastapi import APIRouter, HTTPException
from typing import List
from ..models.schemas import Holding, UpdateHoldingsResponse
from ..services.validation_service import ValidationService

router = APIRouter(tags=["portfolio"])

# Initialize services
validation_service = ValidationService()


@router.put("/update-holdings", response_model=UpdateHoldingsResponse)
async def update_holdings(holdings: List[Holding]):
    """Update portfolio holdings with weight validation"""
    try:
        # Validate each holding
        for holding in holdings:
            validation_service.validate_holding_data(holding)
        
        # Validate weights sum to 100%
        validation_service.validate_holdings_weights(holdings)
        
        # In real implementation, save to database here
        return UpdateHoldingsResponse(
            message="Holdings updated successfully", 
            holdings=holdings
        )
    
    except HTTPException:
        # Re-raise HTTP exceptions (validation errors)
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
