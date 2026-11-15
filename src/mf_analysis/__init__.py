"""Mutual fund analysis: clean, score, and rank schemes."""

from .clean import clean_funds
from .insights import build_insights, summarize_universe
from .score import rank_funds, score_funds

__all__ = [
    "clean_funds",
    "score_funds",
    "rank_funds",
    "build_insights",
    "summarize_universe",
]

__version__ = "1.0.0"
