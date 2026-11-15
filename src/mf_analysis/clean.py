"""Clean and standardize mutual fund scheme data."""

from __future__ import annotations

import pandas as pd

REQUIRED_COLUMNS = [
    "scheme_id",
    "scheme_name",
    "amc_name",
    "fund_type",
    "category",
    "sub_category",
    "investment_strategy",
    "risk_level",
    "fund_rating",
    "fund_manager",
    "fund_age_years",
    "aum_cr",
    "return_1y_pct",
    "return_3y_pct",
    "expense_ratio_pct",
    "min_sip_inr",
    "min_lumpsum_inr",
]

NUMERIC_COLUMNS = [
    "fund_rating",
    "fund_age_years",
    "aum_cr",
    "return_1y_pct",
    "return_3y_pct",
    "expense_ratio_pct",
    "min_sip_inr",
    "min_lumpsum_inr",
]


def clean_funds(df: pd.DataFrame) -> pd.DataFrame:
    """Drop unused fields, coerce numerics, and impute light missingness."""
    missing = [c for c in REQUIRED_COLUMNS if c not in df.columns]
    if missing:
        raise ValueError(f"Missing required columns: {missing}")

    out = df[REQUIRED_COLUMNS].copy()
    out = out.drop_duplicates(subset=["scheme_id"])

    for col in NUMERIC_COLUMNS:
        out[col] = pd.to_numeric(out[col], errors="coerce")

    # Median impute within fund type for returns / expense
    for col in ["return_1y_pct", "expense_ratio_pct"]:
        out[col] = out.groupby("fund_type")[col].transform(
            lambda s: s.fillna(s.median())
        )

    out = out.dropna(
        subset=["return_3y_pct", "expense_ratio_pct", "fund_age_years", "aum_cr"]
    )

    for col in [
        "amc_name",
        "fund_type",
        "category",
        "sub_category",
        "investment_strategy",
        "risk_level",
        "fund_manager",
    ]:
        out[col] = out[col].astype(str).str.strip()

    out["fund_rating"] = out["fund_rating"].clip(1, 5).round().astype(int)
    out = out.reset_index(drop=True)
    return out
