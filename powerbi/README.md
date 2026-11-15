# Power BI desktop workflow

This project ships processed CSVs so you can rebuild the classic Power BI layer from the same pipeline outputs.

## Data sources

Import these files from `data/processed/`:

| File | Use |
|------|-----|
| `cleaned_funds.csv` | Full fund universe for slicers and KPI visuals |
| `scored_funds.csv` | Same universe plus normalized metrics & composite score |
| `top_30_mutual_funds.csv` | Ranked shortlist table |

## Suggested model

1. Load `cleaned_funds` as the fact table.
2. Create dimension tables (or use columns) for `fund_type`, `risk_level`, `amc_name`, `category`, `fund_rating`.
3. Add slicers: Fund Type, Category, Sub-category, AMC, Risk Level, Fund Rating.
4. Build visuals:
   - Card: Total AUM, Avg SIP, Avg Lumpsum, Avg Expense
   - Donut: AUM by fund type
   - Bar: Avg 3Y return by fund type
   - Bar: Expense by investment strategy
   - Table: Top 30 from `top_30_mutual_funds.csv`
5. Optional: merge `scored_funds` on `scheme_id` to colour-code by `composite_score`.

## Tip

Re-run `python scripts/run_pipeline.py` whenever you refresh your source CSV, then refresh the Power BI dataset.
