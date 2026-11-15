"""Unit tests for cleaning and scoring."""

from __future__ import annotations

import sys
from pathlib import Path

import pandas as pd
import pytest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

from mf_analysis.clean import clean_funds
from mf_analysis.generate_sample import generate_sample_funds
from mf_analysis.score import rank_funds, score_funds


@pytest.fixture(scope="module")
def sample() -> pd.DataFrame:
    return generate_sample_funds(n=400, seed=7)


def test_generate_sample_shape(sample: pd.DataFrame) -> None:
    assert len(sample) == 400
    assert "scheme_id" in sample.columns
    assert sample["fund_type"].nunique() >= 3


def test_clean_drops_duplicates_and_coerces(sample: pd.DataFrame) -> None:
    dirty = pd.concat([sample, sample.iloc[:5]], ignore_index=True)
    dirty.loc[0, "return_1y_pct"] = None
    cleaned = clean_funds(dirty)
    assert cleaned["scheme_id"].is_unique
    assert cleaned["return_1y_pct"].isna().sum() == 0
    assert cleaned["expense_ratio_pct"].isna().sum() == 0


def test_score_between_zero_and_one(sample: pd.DataFrame) -> None:
    cleaned = clean_funds(sample)
    scored = score_funds(cleaned)
    assert scored["composite_score"].between(0, 1).all()
    assert "return_3y_norm" in scored.columns


def test_rank_top_n_positive_1y(sample: pd.DataFrame) -> None:
    cleaned = clean_funds(sample)
    scored = score_funds(cleaned)
    top = rank_funds(scored, top_n=30)
    assert len(top) == 30
    assert list(top["rank"]) == list(range(1, 31))
    assert (top["return_1y_pct"] > 0).all()
    assert top["composite_score"].is_monotonic_decreasing
