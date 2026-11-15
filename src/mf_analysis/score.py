"""Score and rank mutual funds for low-risk, high-return balance."""

from __future__ import annotations

import pandas as pd
from sklearn.preprocessing import MinMaxScaler

# Weights favour return quality while penalising cost; age gets a smaller boost.
DEFAULT_WEIGHTS = {
    "return_3y_norm": 0.45,
    "return_1y_norm": 0.20,
    "expense_inv_norm": 0.25,
    "age_norm": 0.10,
}


def score_funds(
    df: pd.DataFrame,
    weights: dict[str, float] | None = None,
) -> pd.DataFrame:
    """
    Normalize key metrics and compute a composite score.

    Higher 3Y/1Y returns and lower expense ratios raise the score.
    Moderate fund age is preferred via a soft peak around 8–12 years.
    """
    weights = weights or DEFAULT_WEIGHTS
    out = df.copy()

    # Require positive 1Y return for quality filter flag (used in ranking)
    out["positive_1y"] = out["return_1y_pct"] > 0

    # Soft age preference: peak near 10 years, taper beyond
    age = out["fund_age_years"].clip(lower=0)
    out["age_quality"] = 1 - ((age - 10).abs() / 20).clip(0, 1)

    feature_frame = pd.DataFrame(
        {
            "return_3y_norm": out["return_3y_pct"],
            "return_1y_norm": out["return_1y_pct"],
            "expense_inv_norm": -out["expense_ratio_pct"],  # invert so lower cost → higher
            "age_norm": out["age_quality"],
        }
    )

    scaler = MinMaxScaler()
    scaled = pd.DataFrame(
        scaler.fit_transform(feature_frame),
        columns=feature_frame.columns,
        index=out.index,
    )

    for col in scaled.columns:
        out[col] = scaled[col]

    out["composite_score"] = sum(out[col] * w for col, w in weights.items())
    return out


def rank_funds(
    df: pd.DataFrame,
    top_n: int = 30,
    require_positive_1y: bool = True,
    max_risk: list[str] | None = None,
) -> pd.DataFrame:
    """Return the top-N schemes by composite score with optional filters."""
    scored = df if "composite_score" in df.columns else score_funds(df)
    filtered = scored.copy()

    if require_positive_1y:
        filtered = filtered[filtered["positive_1y"]]

    if max_risk:
        filtered = filtered[filtered["risk_level"].isin(max_risk)]

    ranked = (
        filtered.sort_values("composite_score", ascending=False)
        .head(top_n)
        .reset_index(drop=True)
    )
    ranked.insert(0, "rank", range(1, len(ranked) + 1))
    return ranked
