#!/usr/bin/env python3
"""End-to-end pipeline: sample (optional) → clean → score → export artifacts."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

from mf_analysis.clean import clean_funds  # noqa: E402
from mf_analysis.generate_sample import generate_sample_funds  # noqa: E402
from mf_analysis.insights import build_insights, summarize_universe  # noqa: E402
from mf_analysis.score import rank_funds, score_funds  # noqa: E402


def export_artifacts(cleaned: pd.DataFrame, top30: pd.DataFrame, out_dir: Path) -> None:
    out_dir.mkdir(parents=True, exist_ok=True)

    cleaned_path = out_dir / "cleaned_funds.csv"
    top30_path = out_dir / "top_30_mutual_funds.csv"
    xlsx_path = out_dir / "top_30_mutual_funds.xlsx"
    summary_path = out_dir / "dashboard_summary.json"

    cleaned.to_csv(cleaned_path, index=False)
    top30.to_csv(top30_path, index=False)
    top30.to_excel(xlsx_path, index=False)

    summary = summarize_universe(cleaned)
    summary["insights"] = build_insights(cleaned, top30)
    summary["top30"] = top30.to_dict(orient="records")

    # JSON-safe floats
    summary_path.write_text(json.dumps(summary, indent=2, default=_json_default))

    print(f"Cleaned universe : {cleaned_path} ({len(cleaned):,} rows)")
    print(f"Top 30 CSV       : {top30_path}")
    print(f"Top 30 Excel     : {xlsx_path}")
    print(f"Dashboard JSON   : {summary_path}")


def _json_default(obj):
    if hasattr(obj, "item"):
        return obj.item()
    raise TypeError(f"Object of type {type(obj)} is not JSON serializable")


def main() -> None:
    parser = argparse.ArgumentParser(description="Run mutual fund analysis pipeline")
    parser.add_argument(
        "--input",
        type=Path,
        default=ROOT / "data" / "raw" / "mutual_funds_sample.csv",
        help="Path to raw mutual fund CSV",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=ROOT / "data" / "processed",
        help="Directory for processed artifacts",
    )
    parser.add_argument("--top-n", type=int, default=30)
    parser.add_argument(
        "--regenerate-sample",
        action="store_true",
        help="Regenerate the synthetic sample before running",
    )
    parser.add_argument("--sample-size", type=int, default=2600)
    args = parser.parse_args()

    if args.regenerate_sample or not args.input.exists():
        args.input.parent.mkdir(parents=True, exist_ok=True)
        sample = generate_sample_funds(n=args.sample_size)
        sample.to_csv(args.input, index=False)
        print(f"Generated sample → {args.input} ({len(sample):,} schemes)")

    raw = pd.read_csv(args.input)
    cleaned = clean_funds(raw)
    scored = score_funds(cleaned)
    top30 = rank_funds(scored, top_n=args.top_n)

    # Persist scored universe for deeper analysis / Power BI
    scored_path = args.output_dir / "scored_funds.csv"
    args.output_dir.mkdir(parents=True, exist_ok=True)
    scored.to_csv(scored_path, index=False)

    export_artifacts(cleaned, top30, args.output_dir)
    print(f"Scored universe  : {scored_path}")
    print(
        f"Top scheme       : #{top30.iloc[0]['rank']} "
        f"{top30.iloc[0]['scheme_name']} "
        f"(score={top30.iloc[0]['composite_score']:.3f})"
    )


if __name__ == "__main__":
    main()
