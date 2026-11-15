"""Generate a realistic sample universe of Indian mutual fund schemes."""

from __future__ import annotations

from pathlib import Path

import numpy as np
import pandas as pd

AMCS = [
    "HDFC Mutual Fund",
    "ICICI Prudential Mutual Fund",
    "SBI Mutual Fund",
    "Nippon India Mutual Fund",
    "Kotak Mahindra Mutual Fund",
    "Axis Mutual Fund",
    "Aditya Birla Sun Life Mutual Fund",
    "UTI Mutual Fund",
    "DSP Mutual Fund",
    "Mirae Asset Mutual Fund",
    "Bank of India Mutual Fund",
    "Parag Parikh Mutual Fund",
    "Quant Mutual Fund",
    "Motilal Oswal Mutual Fund",
    "Tata Mutual Fund",
]

MANAGERS = [
    "Vivek Sharma",
    "Shreyash Deora",
    "Sankaran Naren",
    "Chirag Setalvad",
    "Jinesh Gopani",
    "Harsha Upadhyaya",
    "Neelesh Surana",
    "Rajeev Thakkar",
    "Ankit Agarwal",
    "R. Srinivasan",
    "Manish Gunwani",
    "Amit Ganatra",
    "Puneet Pal",
    "Saurabh Pant",
    "Lakshmi Iyer",
]

FUND_STRUCTURE = {
    "Equity": {
        "Large Cap": ["Growth", "Value", "Index"],
        "Mid Cap": ["Growth", "Value"],
        "Small Cap": ["Growth", "Aggressive Growth"],
        "Flexi Cap": ["Growth", "Value"],
        "ELSS": ["Tax Saver"],
        "Sectoral": ["Banking", "IT", "Pharma", "Infrastructure"],
    },
    "Debt": {
        "Liquid": ["Overnight", "Liquid"],
        "Short Duration": ["Conservative"],
        "Corporate Bond": ["Investment Grade"],
        "Gilt": ["Long Duration"],
        "Dynamic Bond": ["Active"],
    },
    "Hybrid": {
        "Aggressive Hybrid": ["Balanced"],
        "Conservative Hybrid": ["Balanced"],
        "Arbitrage": ["Market Neutral"],
        "Multi Asset": ["Allocation"],
    },
    "Index": {
        "Nifty 50": ["Passive"],
        "Nifty Next 50": ["Passive"],
        "Sensex": ["Passive"],
        "Nifty Midcap 150": ["Passive"],
    },
}

RISK_BY_TYPE = {
    "Equity": ["Moderately High", "High", "Very High"],
    "Debt": ["Low", "Low to Moderate", "Moderate"],
    "Hybrid": ["Moderate", "Moderately High"],
    "Index": ["Moderately High", "High"],
}


def _scheme_name(amc: str, category: str, strategy: str, idx: int) -> str:
    short = amc.replace(" Mutual Fund", "").replace(" Mahindra", "")
    plan = "Direct Plan - Growth" if idx % 3 else "Regular Plan - Growth"
    return f"{short} {category} {strategy} Fund - {plan}"


def generate_sample_funds(n: int = 2600, seed: int = 42) -> pd.DataFrame:
    """Create a synthetic but realistic mutual-fund universe."""
    rng = np.random.default_rng(seed)
    rows: list[dict] = []

    type_weights = {"Equity": 0.48, "Debt": 0.22, "Hybrid": 0.18, "Index": 0.12}

    for i in range(n):
        fund_type = rng.choice(list(type_weights), p=list(type_weights.values()))
        categories = list(FUND_STRUCTURE[fund_type])
        category = rng.choice(categories)
        strategy = rng.choice(FUND_STRUCTURE[fund_type][category])
        amc = rng.choice(AMCS)
        manager = rng.choice(MANAGERS)
        risk = rng.choice(RISK_BY_TYPE[fund_type])

        # Return / cost profiles by type
        if fund_type == "Equity":
            ret_1y = rng.normal(18, 12)
            ret_3y = rng.normal(38, 14)
            expense = abs(rng.normal(1.35, 0.45))
            aum = abs(rng.lognormal(7.4, 1.05))  # ~₹1,600 Cr median
            age = abs(rng.normal(9, 4))
            rating = int(np.clip(rng.integers(1, 6) + (1 if ret_3y > 40 else 0), 1, 5))
        elif fund_type == "Debt":
            ret_1y = rng.normal(6.5, 1.8)
            ret_3y = rng.normal(6.8, 1.5)
            expense = abs(rng.normal(0.55, 0.2))
            aum = abs(rng.lognormal(7.0, 1.0))
            age = abs(rng.normal(8, 3.5))
            rating = int(np.clip(rng.integers(2, 6), 1, 5))
        elif fund_type == "Hybrid":
            ret_1y = rng.normal(12, 6)
            ret_3y = rng.normal(16, 7)
            expense = abs(rng.normal(1.0, 0.3))
            aum = abs(rng.lognormal(7.1, 1.0))
            age = abs(rng.normal(8.5, 3.5))
            rating = int(np.clip(rng.integers(2, 6), 1, 5))
        else:  # Index — lower expense
            ret_1y = rng.normal(15, 8)
            ret_3y = rng.normal(32, 10)
            expense = abs(rng.normal(0.28, 0.08))
            aum = abs(rng.lognormal(7.2, 1.0))
            age = abs(rng.normal(7, 3))
            rating = int(np.clip(rng.integers(3, 6), 1, 5))

        # Inject a few missing values like real data
        if rng.random() < 0.03:
            ret_1y = np.nan
        if rng.random() < 0.02:
            expense = np.nan

        sip = float(rng.choice([100, 500, 1000, 2000, 5000]))
        lumpsum = float(rng.choice([500, 1000, 5000, 10000]))

        rows.append(
            {
                "scheme_id": f"MF{i+1:05d}",
                "scheme_name": _scheme_name(amc, category, strategy, i),
                "amc_name": amc,
                "fund_type": fund_type,
                "category": category,
                "sub_category": strategy,
                "investment_strategy": strategy,
                "risk_level": risk,
                "fund_rating": rating,
                "fund_manager": manager,
                "fund_age_years": round(float(age), 1),
                "aum_cr": round(float(aum), 2),
                "return_1y_pct": round(float(ret_1y), 2) if pd.notna(ret_1y) else np.nan,
                "return_3y_pct": round(float(ret_3y), 2),
                "expense_ratio_pct": round(float(expense), 2) if pd.notna(expense) else np.nan,
                "min_sip_inr": sip,
                "min_lumpsum_inr": lumpsum,
            }
        )

    return pd.DataFrame(rows)


def main() -> Path:
    root = Path(__file__).resolve().parents[2]
    out = root / "data" / "raw" / "mutual_funds_sample.csv"
    out.parent.mkdir(parents=True, exist_ok=True)
    df = generate_sample_funds()
    df.to_csv(out, index=False)
    print(f"Wrote {len(df):,} schemes → {out}")
    return out


if __name__ == "__main__":
    main()
