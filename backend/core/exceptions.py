"""
Custom exception classes
"""
from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse
from typing import Any, Dict


class IndexGenerationError(Exception):
    """Raised when index generation fails"""
    pass


class ValidationError(Exception):
    """Raised when data validation fails"""
    pass


class PerformanceCalculationError(Exception):
    """Raised when performance calculations fail"""
    pass


async def validation_exception_handler(request: Request, exc: ValidationError) -> JSONResponse:
    """Handle validation errors"""
    return JSONResponse(
        status_code=400,
        content={
            "error": "Validation Error",
            "message": str(exc),
            "type": "validation_error"
        }
    )


async def index_generation_exception_handler(request: Request, exc: IndexGenerationError) -> JSONResponse:
    """Handle index generation errors"""
    return JSONResponse(
        status_code=500,
        content={
            "error": "Index Generation Error",
            "message": str(exc),
            "type": "index_generation_error"
        }
    )


async def performance_calculation_exception_handler(request: Request, exc: PerformanceCalculationError) -> JSONResponse:
    """Handle performance calculation errors"""
    return JSONResponse(
        status_code=500,
        content={
            "error": "Performance Calculation Error",
            "message": str(exc),
            "type": "performance_calculation_error"
        }
    )
