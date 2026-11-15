"""Aggregate KPIs and narrative insights for the dashboard."""

from __future__ import annotations

from typing import Any

import pandas as pd


def summarize_universe(df: pd.DataFrame) -> dict[str, Any]:
    """High-level KPIs across the cleaned fund universe."""
    by_type = (
        df.groupby("fund_type", as_index=False)
        .agg(
            schemes=("scheme_id", "count"),
            aum_cr=("aum_cr", "sum"),
            avg_return_3y=("return_3y_pct", "mean"),
            avg_expense=("expense_ratio_pct", "mean"),
            avg_sip=("min_sip_inr", "mean"),
            avg_lumpsum=("min_lumpsum_inr", "mean"),
        )
        .sort_values("aum_cr", ascending=False)
    )

    by_amc = (
        df.groupby("amc_name", as_index=False)
        .agg(
            schemes=("scheme_id", "count"),
            aum_cr=("aum_cr", "sum"),
            avg_return_3y=("return_3y_pct", "mean"),
            avg_expense=("expense_ratio_pct", "mean"),
        )
        .sort_values("avg_return_3y", ascending=False)
    )

    by_manager = (
        df.groupby("fund_manager", as_index=False)
        .agg(aum_cr=("aum_cr", "sum"), schemes=("scheme_id", "count"))
        .sort_values("aum_cr", ascending=False)
    )

    by_strategy = (
        df.groupby("investment_strategy", as_index=False)
        .agg(
            avg_expense=("expense_ratio_pct", "mean"),
            avg_return_3y=("return_3y_pct", "mean"),
            schemes=("scheme_id", "count"),
        )
        .sort_values("avg_expense")
    )

    by_risk = (
        df.groupby("risk_level", as_index=False)
        .agg(schemes=("scheme_id", "count"), aum_cr=("aum_cr", "sum"))
        .sort_values("schemes", ascending=False)
    )

    return {
        "total_schemes": int(len(df)),
        "total_aum_cr": float(df["aum_cr"].sum()),
        "avg_return_1y": float(df["return_1y_pct"].mean()),
        "avg_return_3y": float(df["return_3y_pct"].mean()),
        "avg_expense": float(df["expense_ratio_pct"].mean()),
        "avg_sip": float(df["min_sip_inr"].mean()),
        "avg_lumpsum": float(df["min_lumpsum_inr"].mean()),
        "by_type": by_type.to_dict(orient="records"),
        "by_amc": by_amc.to_dict(orient="records"),
        "by_manager": by_manager.to_dict(orient="records"),
        "by_strategy": by_strategy.to_dict(orient="records"),
        "by_risk": by_risk.to_dict(orient="records"),
    }


def build_insights(df: pd.DataFrame, top30: pd.DataFrame) -> list[dict[str, str]]:
    """Auto-generate short insight cards for the dashboard."""
    summary = summarize_universe(df)
    top_type = max(summary["by_type"], key=lambda r: r["aum_cr"])
    top_manager = summary["by_manager"][0]
    cheapest = summary["by_strategy"][0]
    best_amc_1y = (
        df.groupby("amc_name")["return_1y_pct"].mean().sort_values(ascending=False).index[0]
    )
    best_amc_1y_val = float(
        df.groupby("amc_name")["return_1y_pct"].mean().sort_values(ascending=False).iloc[0]
    )
    equity_3y = next(
        (r["avg_return_3y"] for r in summary["by_type"] if r["fund_type"] == "Equity"),
        None,
    )
    hybrid_3y = next(
        (r["avg_return_3y"] for r in summary["by_type"] if r["fund_type"] == "Hybrid"),
        None,
    )

    cards = [
        {
            "category": "Investment Trends",
            "summary": (
                f"{top_type['fund_type']} funds lead with "
                f"₹{top_type['aum_cr']:,.0f} Cr total AUM across "
                f"{int(top_type['schemes'])} schemes."
            ),
        },
        {
            "category": "Fund Manager",
            "summary": (
                f"{top_manager['fund_manager']} manages the highest AUM at "
                f"₹{top_manager['aum_cr']:,.0f} Cr."
            ),
        },
        {
            "category": "Cost vs Return",
            "summary": (
                f"{cheapest['investment_strategy']} strategies show the lowest "
                f"average expense ratio at {cheapest['avg_expense']:.2f}%."
            ),
        },
        {
            "category": "Best Return (1Y)",
            "summary": (
                f"{best_amc_1y} posts the strongest average 1-year return "
                f"at {best_amc_1y_val:.1f}%."
            ),
        },
        {
            "category": "SIP vs Lumpsum",
            "summary": (
                f"Average min SIP is ₹{summary['avg_sip']:,.0f}/month; "
                f"average min lumpsum is ₹{summary['avg_lumpsum']:,.0f}."
            ),
        },
        {
            "category": "Top 30 Quality",
            "summary": (
                f"Top 30 composite score averages {top30['composite_score'].mean():.3f}; "
                f"mean 3Y return {top30['return_3y_pct'].mean():.1f}% with "
                f"expense {top30['expense_ratio_pct'].mean():.2f}%."
            ),
        },
    ]

    if equity_3y is not None and hybrid_3y is not None:
        cards.insert(
            5,
            {
                "category": "3-Year Returns",
                "summary": (
                    f"Equity funds average {equity_3y:.1f}% over 3 years vs "
                    f"Hybrid at {hybrid_3y:.1f}%."
                ),
            },
        )

    return cards
