"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Filter,
  Landmark,
  LineChart,
  ShieldCheck,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { formatCr, formatInr, formatNumber, formatPct } from "@/lib/format";
import type { DashboardSummary, FundRow } from "@/lib/types";

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

type Props = {
  summary: DashboardSummary;
  funds: FundRow[];
};

function unique(values: string[]): string[] {
  return Array.from(new Set(values)).sort();
}

export default function Dashboard({ summary, funds }: Props) {
  const [fundType, setFundType] = useState("All");
  const [risk, setRisk] = useState("All");
  const [amc, setAmc] = useState("All");
  const [minRating, setMinRating] = useState(1);
  const [query, setQuery] = useState("");

  const fundTypes = useMemo(
    () => ["All", ...unique(funds.map((f) => f.fund_type))],
    [funds],
  );
  const risks = useMemo(
    () => ["All", ...unique(funds.map((f) => f.risk_level))],
    [funds],
  );
  const amcs = useMemo(
    () => ["All", ...unique(funds.map((f) => f.amc_name))],
    [funds],
  );

  const filtered = useMemo(() => {
    return funds.filter((f) => {
      if (fundType !== "All" && f.fund_type !== fundType) return false;
      if (risk !== "All" && f.risk_level !== risk) return false;
      if (amc !== "All" && f.amc_name !== amc) return false;
      if (f.fund_rating < minRating) return false;
      if (
        query &&
        !`${f.scheme_name} ${f.category} ${f.fund_manager}`
          .toLowerCase()
          .includes(query.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [funds, fundType, risk, amc, minRating, query]);

  const filteredKpis = useMemo(() => {
    if (!filtered.length) {
      return {
        schemes: 0,
        aum: 0,
        ret1: 0,
        ret3: 0,
        expense: 0,
        sip: 0,
        lumpsum: 0,
      };
    }
    const n = filtered.length;
    return {
      schemes: n,
      aum: filtered.reduce((s, f) => s + f.aum_cr, 0),
      ret1: filtered.reduce((s, f) => s + f.return_1y_pct, 0) / n,
      ret3: filtered.reduce((s, f) => s + f.return_3y_pct, 0) / n,
      expense: filtered.reduce((s, f) => s + f.expense_ratio_pct, 0) / n,
      sip: filtered.reduce((s, f) => s + f.min_sip_inr, 0) / n,
      lumpsum: filtered.reduce((s, f) => s + f.min_lumpsum_inr, 0) / n,
    };
  }, [filtered]);

  const aumByType = useMemo(() => {
    const map = new Map<string, number>();
    for (const f of filtered) {
      map.set(f.fund_type, (map.get(f.fund_type) ?? 0) + f.aum_cr);
    }
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [filtered]);

  const returnsByType = useMemo(() => {
    const map = new Map<string, { sum: number; n: number }>();
    for (const f of filtered) {
      const cur = map.get(f.fund_type) ?? { sum: 0, n: 0 };
      cur.sum += f.return_3y_pct;
      cur.n += 1;
      map.set(f.fund_type, cur);
    }
    return Array.from(map.entries()).map(([name, v]) => ({
      name,
      value: v.n ? v.sum / v.n : 0,
    }));
  }, [filtered]);

  const expenseByStrategy = useMemo(() => {
    const map = new Map<string, { sum: number; n: number }>();
    for (const f of filtered) {
      const cur = map.get(f.investment_strategy) ?? { sum: 0, n: 0 };
      cur.sum += f.expense_ratio_pct;
      cur.n += 1;
      map.set(f.investment_strategy, cur);
    }
    return Array.from(map.entries())
      .map(([name, v]) => ({ name, value: v.n ? v.sum / v.n : 0 }))
      .sort((a, b) => a.value - b.value)
      .slice(0, 8);
  }, [filtered]);

  const topAmcs = useMemo(() => {
    const map = new Map<string, { sum: number; n: number; aum: number }>();
    for (const f of filtered) {
      const cur = map.get(f.amc_name) ?? { sum: 0, n: 0, aum: 0 };
      cur.sum += f.return_3y_pct;
      cur.n += 1;
      cur.aum += f.aum_cr;
      map.set(f.amc_name, cur);
    }
    return Array.from(map.entries())
      .map(([name, v]) => ({
        name: name.replace(" Mutual Fund", ""),
        return3y: v.n ? v.sum / v.n : 0,
        aum: v.aum,
      }))
      .sort((a, b) => b.return3y - a.return3y)
      .slice(0, 8);
  }, [filtered]);

  const topManagers = useMemo(() => {
    const map = new Map<string, number>();
    for (const f of filtered) {
      map.set(f.fund_manager, (map.get(f.fund_manager) ?? 0) + f.aum_cr);
    }
    return Array.from(map.entries())
      .map(([name, aum]) => ({ name, aum }))
      .sort((a, b) => b.aum - a.aum)
      .slice(0, 8);
  }, [filtered]);

  const topFiltered = useMemo(() => {
    return [...filtered]
      .sort(
        (a, b) =>
          b.return_3y_pct / Math.max(b.expense_ratio_pct, 0.1) -
          a.return_3y_pct / Math.max(a.expense_ratio_pct, 0.1),
      )
      .slice(0, 15);
  }, [filtered]);

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
      <header className="animate-rise mb-8 flex flex-col gap-4 border-b border-[var(--line)] pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
            Portfolio Analytics
          </p>
          <h1 className="display text-3xl text-[var(--ink)] sm:text-4xl">
            Mutual Fund Performance Analysis
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--muted)] sm:text-base">
            Explore {formatNumber(summary.total_schemes)} schemes, score
            low-risk high-return quality, and surface the top 30 picks using a
            Python analysis pipeline with interactive visuals.
          </p>
        </div>
        <div className="panel rounded-xl px-4 py-3 text-sm text-[var(--muted)]">
          <div className="flex items-center gap-2 font-medium text-[var(--ink)]">
            <ShieldCheck className="h-4 w-4 text-[var(--accent)]" />
            Demo dataset
          </div>
          <p className="mt-1 max-w-xs text-xs leading-relaxed">
            Bundled sample of Indian mutual fund schemes for local demos. Replace
            with your CSV and re-run the pipeline to refresh this view.
          </p>
        </div>
      </header>

      <section className="animate-rise-delay-1 panel mb-6 rounded-2xl p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--ink)]">
          <Filter className="h-4 w-4 text-[var(--accent)]" />
          Filters
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Select
            label="Fund type"
            value={fundType}
            onChange={setFundType}
            options={fundTypes}
          />
          <Select
            label="Risk level"
            value={risk}
            onChange={setRisk}
            options={risks}
          />
          <Select label="AMC" value={amc} onChange={setAmc} options={amcs} />
          <label className="block text-xs font-medium text-[var(--muted)]">
            Min rating
            <select
              className="mt-1 w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--accent)]"
              value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value))}
            >
              {[1, 2, 3, 4, 5].map((r) => (
                <option key={r} value={r}>
                  {r}+ stars
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs font-medium text-[var(--muted)]">
            Search
            <input
              className="mt-1 w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--accent)]"
              placeholder="Scheme, category, manager"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
        </div>
      </section>

      <section className="animate-rise-delay-2 mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi
          icon={<Landmark className="h-4 w-4" />}
          label="Schemes in view"
          value={formatNumber(filteredKpis.schemes)}
        />
        <Kpi
          icon={<Wallet className="h-4 w-4" />}
          label="Total AUM"
          value={formatCr(filteredKpis.aum)}
        />
        <Kpi
          icon={<TrendingUp className="h-4 w-4" />}
          label="Avg 3Y return"
          value={formatPct(filteredKpis.ret3)}
        />
        <Kpi
          icon={<LineChart className="h-4 w-4" />}
          label="Avg expense ratio"
          value={formatPct(filteredKpis.expense, 2)}
        />
      </section>

      <section className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Kpi
          label="Avg 1Y return"
          value={formatPct(filteredKpis.ret1)}
          compact
        />
        <Kpi
          label="Avg min SIP"
          value={`${formatInr(filteredKpis.sip)}/mo`}
          compact
        />
        <Kpi
          label="Avg min lumpsum"
          value={formatInr(filteredKpis.lumpsum)}
          compact
        />
      </section>

      {filtered.length === 0 ? (
        <div className="panel rounded-2xl p-10 text-center">
          <h2 className="display text-2xl">No schemes match these filters</h2>
          <p className="mt-2 text-[var(--muted)]">
            Widen fund type, risk, rating, or clear the search to see results.
          </p>
          <button
            type="button"
            className="mt-4 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white"
            onClick={() => {
              setFundType("All");
              setRisk("All");
              setAmc("All");
              setMinRating(1);
              setQuery("");
            }}
          >
            Reset filters
          </button>
        </div>
      ) : (
        <>
          <section className="animate-rise-delay-3 mb-6 grid gap-4 lg:grid-cols-2">
            <ChartPanel title="AUM by fund type">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={aumByType}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={95}
                    paddingAngle={2}
                  >
                    {aumByType.map((_, i) => (
                      <Cell
                        key={i}
                        fill={CHART_COLORS[i % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v) => formatCr(Number(v ?? 0))}
                    contentStyle={tooltipStyle}
                  />
                </PieChart>
              </ResponsiveContainer>
              <LegendList
                items={aumByType.map((d, i) => ({
                  label: d.name,
                  value: formatCr(d.value),
                  color: CHART_COLORS[i % CHART_COLORS.length],
                }))}
              />
            </ChartPanel>

            <ChartPanel title="Average 3-year returns by type">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={returnsByType} margin={{ left: 8, right: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip
                    formatter={(v) => formatPct(Number(v ?? 0))}
                    contentStyle={tooltipStyle}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {returnsByType.map((_, i) => (
                      <Cell
                        key={i}
                        fill={CHART_COLORS[i % CHART_COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartPanel>

            <ChartPanel title="Expense ratio by strategy (lowest first)">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={expenseByStrategy}
                  layout="vertical"
                  margin={{ left: 16, right: 16 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={100}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip
                    formatter={(v) => formatPct(Number(v ?? 0), 2)}
                    contentStyle={tooltipStyle}
                  />
                  <Bar
                    dataKey="value"
                    fill="var(--chart-2)"
                    radius={[0, 6, 6, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartPanel>

            <ChartPanel title="Top AMCs by average 3Y return">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={topAmcs} margin={{ left: 8, right: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10 }}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip
                    formatter={(v) => formatPct(Number(v ?? 0))}
                    contentStyle={tooltipStyle}
                  />
                  <Bar
                    dataKey="return3y"
                    fill="var(--chart-1)"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartPanel>
          </section>

          <section className="mb-6 grid gap-4 lg:grid-cols-5">
            <ChartPanel
              title="Fund managers by AUM"
              className="lg:col-span-2"
            >
              <ul className="space-y-3">
                {topManagers.map((m, i) => {
                  const max = topManagers[0]?.aum || 1;
                  return (
                    <li key={m.name}>
                      <div className="mb-1 flex justify-between text-sm">
                        <span className="font-medium">{m.name}</span>
                        <span className="text-[var(--muted)]">
                          {formatCr(m.aum)}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-[var(--bg-deep)]">
                        <div
                          className="h-full origin-left rounded-full bg-[var(--accent)]"
                          style={{
                            width: `${(m.aum / max) * 100}%`,
                            animation: `bar-grow 0.6s ease-out ${i * 0.05}s both`,
                          }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </ChartPanel>

            <ChartPanel title="Key insights" className="lg:col-span-3">
              <div className="grid gap-3 sm:grid-cols-2">
                {summary.insights.map((insight) => (
                  <article
                    key={insight.category}
                    className="rounded-xl border border-[var(--line)] bg-[var(--bg)]/70 p-3"
                  >
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">
                      {insight.category}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-[var(--ink)]">
                      {insight.summary}
                    </p>
                  </article>
                ))}
              </div>
            </ChartPanel>
          </section>

          <section className="panel mb-6 overflow-hidden rounded-2xl">
            <div className="border-b border-[var(--line)] px-4 py-4 sm:px-5">
              <h2 className="display text-xl">
                Pipeline top 30 — low risk, high return score
              </h2>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Ranked by composite score (3Y return, 1Y return, low expense,
                fund age quality). Positive 1Y return required.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-[var(--bg-deep)] text-xs uppercase tracking-wide text-[var(--muted)]">
                  <tr>
                    <th className="px-4 py-3">Rank</th>
                    <th className="px-4 py-3">Scheme</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Risk</th>
                    <th className="px-4 py-3">3Y</th>
                    <th className="px-4 py-3">Expense</th>
                    <th className="px-4 py-3">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.top30.map((f) => (
                    <tr
                      key={f.scheme_id}
                      className="border-t border-[var(--line)] hover:bg-[var(--accent-soft)]/40"
                    >
                      <td className="kpi-value px-4 py-3 font-semibold">
                        {f.rank}
                      </td>
                      <td className="max-w-[280px] px-4 py-3">
                        <div className="font-medium leading-snug">
                          {f.scheme_name}
                        </div>
                        <div className="text-xs text-[var(--muted)]">
                          {f.amc_name}
                        </div>
                      </td>
                      <td className="px-4 py-3">{f.fund_type}</td>
                      <td className="px-4 py-3">{f.risk_level}</td>
                      <td className="kpi-value px-4 py-3">
                        {formatPct(f.return_3y_pct)}
                      </td>
                      <td className="kpi-value px-4 py-3">
                        {formatPct(f.expense_ratio_pct, 2)}
                      </td>
                      <td className="kpi-value px-4 py-3 font-semibold text-[var(--accent)]">
                        {f.composite_score.toFixed(3)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="panel mb-10 overflow-hidden rounded-2xl">
            <div className="border-b border-[var(--line)] px-4 py-4 sm:px-5">
              <h2 className="display text-xl">
                Filtered shortlist (return / expense)
              </h2>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Top 15 schemes in the current filter set by return-to-cost
                efficiency.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-[var(--bg-deep)] text-xs uppercase tracking-wide text-[var(--muted)]">
                  <tr>
                    <th className="px-4 py-3">Scheme</th>
                    <th className="px-4 py-3">Manager</th>
                    <th className="px-4 py-3">1Y</th>
                    <th className="px-4 py-3">3Y</th>
                    <th className="px-4 py-3">Expense</th>
                    <th className="px-4 py-3">AUM</th>
                  </tr>
                </thead>
                <tbody>
                  {topFiltered.map((f) => (
                    <tr
                      key={f.scheme_id}
                      className="border-t border-[var(--line)] hover:bg-[var(--accent-soft)]/40"
                    >
                      <td className="max-w-[280px] px-4 py-3">
                        <div className="font-medium leading-snug">
                          {f.scheme_name}
                        </div>
                        <div className="text-xs text-[var(--muted)]">
                          {f.category} · {f.fund_type}
                        </div>
                      </td>
                      <td className="px-4 py-3">{f.fund_manager}</td>
                      <td className="kpi-value px-4 py-3">
                        {formatPct(f.return_1y_pct)}
                      </td>
                      <td className="kpi-value px-4 py-3">
                        {formatPct(f.return_3y_pct)}
                      </td>
                      <td className="kpi-value px-4 py-3">
                        {formatPct(f.expense_ratio_pct, 2)}
                      </td>
                      <td className="kpi-value px-4 py-3">
                        {formatCr(f.aum_cr)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      <footer className="border-t border-[var(--line)] py-6 text-center text-xs text-[var(--muted)]">
        Python (Pandas + scikit-learn) for scoring · Next.js for interactive
        visuals · CSV exports ready for Power BI
      </footer>
    </div>
  );
}

const tooltipStyle = {
  background: "#fff",
  border: "1px solid #d5e0d8",
  borderRadius: 8,
  fontSize: 12,
};

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <label className="block text-xs font-medium text-[var(--muted)]">
      {label}
      <select
        className="mt-1 w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--accent)]"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

function Kpi({
  label,
  value,
  icon,
  compact,
}: {
  label: string;
  value: string;
  icon?: ReactNode;
  compact?: boolean;
}) {
  return (
    <div
      className={`panel rounded-2xl ${compact ? "px-4 py-3" : "px-4 py-4"}`}
    >
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
        {icon}
        {label}
      </div>
      <div
        className={`kpi-value mt-1 font-semibold text-[var(--ink)] ${compact ? "text-xl" : "text-2xl"}`}
      >
        {value}
      </div>
    </div>
  );
}

function ChartPanel({
  title,
  children,
  className = "",
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`panel rounded-2xl p-4 ${className}`}>
      <h2 className="display mb-3 text-lg">{title}</h2>
      {children}
    </div>
  );
}

function LegendList({
  items,
}: {
  items: { label: string; value: string; color: string }[];
}) {
  return (
    <ul className="mt-2 grid grid-cols-2 gap-2 text-xs">
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ background: item.color }}
          />
          <span className="text-[var(--muted)]">{item.label}</span>
          <span className="ml-auto font-medium">{item.value}</span>
        </li>
      ))}
    </ul>
  );
}
