import type { FundRow } from "./types";

function parseLine(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (ch === "," && !inQuotes) {
      cells.push(current);
      current = "";
      continue;
    }
    current += ch;
  }
  cells.push(current);
  return cells;
}

export function parseFundsCsv(text: string): FundRow[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const headers = parseLine(lines[0]);
  return lines.slice(1).map((line) => {
    const cells = parseLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = cells[i] ?? "";
    });
    return {
      scheme_id: row.scheme_id,
      scheme_name: row.scheme_name,
      amc_name: row.amc_name,
      fund_type: row.fund_type,
      category: row.category,
      sub_category: row.sub_category,
      investment_strategy: row.investment_strategy,
      risk_level: row.risk_level,
      fund_rating: Number(row.fund_rating),
      fund_manager: row.fund_manager,
      fund_age_years: Number(row.fund_age_years),
      aum_cr: Number(row.aum_cr),
      return_1y_pct: Number(row.return_1y_pct),
      return_3y_pct: Number(row.return_3y_pct),
      expense_ratio_pct: Number(row.expense_ratio_pct),
      min_sip_inr: Number(row.min_sip_inr),
      min_lumpsum_inr: Number(row.min_lumpsum_inr),
    };
  });
}
