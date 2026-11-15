import Dashboard from "@/components/Dashboard";
import { parseFundsCsv } from "@/lib/parseCsv";
import type { DashboardSummary } from "@/lib/types";
import { readFile } from "fs/promises";
import path from "path";

async function loadData() {
  const dataDir = path.join(process.cwd(), "public", "data");
  const [summaryRaw, fundsRaw] = await Promise.all([
    readFile(path.join(dataDir, "dashboard_summary.json"), "utf8"),
    readFile(path.join(dataDir, "cleaned_funds.csv"), "utf8"),
  ]);
  const summary = JSON.parse(summaryRaw) as DashboardSummary;
  const funds = parseFundsCsv(fundsRaw);
  return { summary, funds };
}

export default async function Home() {
  try {
    const { summary, funds } = await loadData();
    return <Dashboard summary={summary} funds={funds} />;
  } catch {
    return (
      <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 text-center">
        <h1 className="display text-3xl">Dashboard data missing</h1>
        <p className="mt-3 text-[var(--muted)]">
          Run the Python pipeline, then sync artifacts into{" "}
          <code className="rounded bg-black/5 px-1">dashboard/public/data</code>
          .
        </p>
        <pre className="mt-4 rounded-xl border border-[var(--line)] bg-white p-4 text-left text-xs">
          {`python scripts/run_pipeline.py --regenerate-sample
./scripts/sync_dashboard_data.sh
cd dashboard && npm run dev`}
        </pre>
      </main>
    );
  }
}
