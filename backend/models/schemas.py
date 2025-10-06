"""
Pydantic models for API request/response schemas
"""
from pydantic import BaseModel
from typing import List, Dict, Any


class IndexRequest(BaseModel):
    """Request model for index generation"""
    prompt: str


class Holding(BaseModel):
    """Model representing a single portfolio holding"""
    ticker: str
    security_name: str
    country: str
    sector: str
    market_cap: str
    relevance: str
    selection_rationale: str
    weight: float


class IndexResponse(BaseModel):
    """Response model for generated index"""
    index_name: str
    original_prompt: str
    holdings: List[Holding]
    performance_data: Dict[str, Any]
    stats: Dict[str, Any]
    benchmark_stats: Dict[str, Any] = None
    scores: Dict[str, Dict[str, Any]]


class UpdateHoldingsRequest(BaseModel):
    """Request model for updating portfolio holdings"""
    holdings: List[Holding]


class UpdateHoldingsResponse(BaseModel):
    """Response model for holdings update"""
    message: str
    holdings: List[Holding]
