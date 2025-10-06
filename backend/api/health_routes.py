"""
Health check and system status API routes
"""
from fastapi import APIRouter

router = APIRouter(tags=["health"])


@router.get("/")
async def root():
    """Root endpoint - health check"""
    return {"message": "Idea2Index API is running! Lol!"}


@router.get("/health")
async def health_check():
    """Detailed health check endpoint"""
    return {
        "status": "healthy",
        "service": "Idea2Index API",
        "version": "1.0.0"
    }
