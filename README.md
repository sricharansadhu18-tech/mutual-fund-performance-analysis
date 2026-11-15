# Mutual Fund Performance Analysis
Live link -  https://mutual-fund-performance-analysis.vercel.app

Mutual fund analytics project using Python and an interactive web dashboard — clean schemes, score low-risk / high-return quality, and rank a Top 30 shortlist. Processed CSVs are ready for Power BI as well.

**What you get**

- Clean and score **2,600+ sample Indian mutual fund schemes**
- Rank a **Top 30 low-risk / high-return shortlist** with a transparent composite score
- Explore KPIs, filters, and charts in a browser dashboard
- Export CSVs/Excel for Power BI desktop reporting

> The bundled dataset is a realistic sample for demos. Swap in your own CSV to analyse live schemes.

---

## Project structure

```text
├── data/
│   ├── raw/mutual_funds_sample.csv      # source universe
│   └── processed/                       # pipeline outputs
├── src/mf_analysis/                     # clean → score → insights
├── scripts/run_pipeline.py              # end-to-end CLI
├── notebooks/mutual_fund_analysis.ipynb
├── dashboard/                           # Next.js interactive dashboard
├── powerbi/README.md                    # desktop Power BI guide
└── tests/                               # unit tests
```

---

## Scoring method

Composite score (MinMax-normalised features):

| Signal | Weight | Direction |
|--------|--------|-----------|
| 3-year return | 45% | Higher is better |
| Expense ratio | 25% | Lower is better |
| 1-year return | 20% | Higher is better |
| Fund age quality | 10% | Prefers mature ~8–12y funds |

Schemes must have **positive 1Y return** to enter the Top 30.

---

## Quick start

### 1) Python analysis pipeline

```bash
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Generate sample (if needed), clean, score, export artifacts
python scripts/run_pipeline.py --regenerate-sample

# Run tests
pytest -q
```

Outputs land in `data/processed/`:

- `cleaned_funds.csv` / `scored_funds.csv`
- `top_30_mutual_funds.csv` + `.xlsx`
- `dashboard_summary.json`

### 2) Interactive dashboard

```bash
./scripts/sync_dashboard_data.sh
cd dashboard
npm install
npm run dev
```

Open [http://127.0.0.1:3847](http://127.0.0.1:3847).

### 3) Power BI (optional)

See [`powerbi/README.md`](powerbi/README.md) to wire the same CSVs into a desktop `.pbix`.

---

## Bring your own data

Provide a CSV with at least these columns:

`scheme_id`, `scheme_name`, `amc_name`, `fund_type`, `category`, `sub_category`, `investment_strategy`, `risk_level`, `fund_rating`, `fund_manager`, `fund_age_years`, `aum_cr`, `return_1y_pct`, `return_3y_pct`, `expense_ratio_pct`, `min_sip_inr`, `min_lumpsum_inr`

```bash
python scripts/run_pipeline.py --input path/to/your_funds.csv
./scripts/sync_dashboard_data.sh
```

---

## Dashboard features

- Filters: fund type, risk, AMC, rating, search
- KPIs: AUM, returns, expense, SIP vs lumpsum
- Charts: AUM mix, 3Y returns, expense by strategy, top AMCs, manager AUM
- Tables: pipeline Top 30 + filtered efficiency shortlist
- Insight cards for investment trends and cost vs return

---

## Tech stack

| Layer | Tools |
|-------|--------|
| Analysis | Python, Pandas, scikit-learn |
| Exploration | Jupyter |
| Web dashboard | Next.js, TypeScript, Tailwind, Recharts |
| Desktop BI | Power BI (CSV import) |

---

## License

MIT — use freely for portfolios, learning, and demos.

**Disclaimer:** This project is for educational / analytical demonstration only. It is not investment advice.
