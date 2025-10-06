"""
Main FastAPI application entry point
"""
import logging
import traceback
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from .core.config import settings
from .core.exceptions import (
    ValidationError,
    IndexGenerationError,
    PerformanceCalculationError,
    validation_exception_handler,
    index_generation_exception_handler,
    performance_calculation_exception_handler
)
from .api.health_routes import router as health_router
from .api.index_routes import router as index_router
from .api.portfolio_routes import router as portfolio_router

logger = logging.getLogger(__name__)


async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """
    Global exception handler for unhandled exceptions (500 errors)
    Logs detailed error information when verbose logging is enabled
    """
    # Log the full traceback for debugging
    logger.error(f"Unhandled exception occurred: {type(exc).__name__}: {str(exc)}")
    logger.error(f"Request URL: {request.url}")
    logger.error(f"Request method: {request.method}")
    
    # Log full traceback in debug mode
    if logger.isEnabledFor(logging.DEBUG):
        logger.debug("Full traceback:", exc_info=exc)
        # Also print to console for immediate visibility in verbose mode
        print(f"\n{'='*60}")
        print(f"500 ERROR DETAILS:")
        print(f"Exception: {type(exc).__name__}: {str(exc)}")
        print(f"Request: {request.method} {request.url}")
        print(f"Traceback:")
        traceback.print_exc()
        print(f"{'='*60}\n")
    
    # Return a generic error response to the client
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error",
            "error_type": type(exc).__name__,
            "message": str(exc) if logger.isEnabledFor(logging.DEBUG) else "An internal error occurred"
        }
    )


def create_app() -> FastAPI:
    """Create and configure FastAPI application"""
    
    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        debug=settings.debug,
        description="A FastAPI-based backend for generating investment indices from user prompts"
    )
    
    # Add CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins,
        allow_credentials=settings.allow_credentials,
        allow_methods=settings.allowed_methods,
        allow_headers=settings.allowed_headers,
    )
    
    # Add custom exception handlers
    app.add_exception_handler(ValidationError, validation_exception_handler)
    app.add_exception_handler(IndexGenerationError, index_generation_exception_handler)
    app.add_exception_handler(PerformanceCalculationError, performance_calculation_exception_handler)
    
    # Add global exception handler for unhandled exceptions (500 errors)
    app.add_exception_handler(Exception, global_exception_handler)
    
    # Include routers
    app.include_router(health_router)
    app.include_router(index_router)
    app.include_router(portfolio_router)
    
    return app


# Create the app instance
app = create_app()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "backend.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug
    )
