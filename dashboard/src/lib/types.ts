export type FundTypeRow = {
  fund_type: string;
  schemes: number;
  aum_cr: number;
  avg_return_3y: number;
  avg_expense: number;
  avg_sip: number;
  avg_lumpsum: number;
};

export type AmcRow = {
  amc_name: string;
  schemes: number;
  aum_cr: number;
  avg_return_3y: number;
  avg_expense: number;
};

export type ManagerRow = {
  fund_manager: string;
  aum_cr: number;
  schemes: number;
};

export type StrategyRow = {
  investment_strategy: string;
  avg_expense: number;
  avg_return_3y: number;
  schemes: number;
};

export type RiskRow = {
  risk_level: string;
  schemes: number;
  aum_cr: number;
};

export type Insight = {
  category: string;
  summary: string;
};

export type TopFund = {
  rank: number;
  scheme_id: string;
  scheme_name: string;
  amc_name: string;
  fund_type: string;
  category: string;
  sub_category: string;
  investment_strategy: string;
  risk_level: string;
  fund_rating: number;
  fund_manager: string;
  fund_age_years: number;
  aum_cr: number;
  return_1y_pct: number;
  return_3y_pct: number;
  expense_ratio_pct: number;
  min_sip_inr: number;
  min_lumpsum_inr: number;
  composite_score: number;
};

export type DashboardSummary = {
  total_schemes: number;
  total_aum_cr: number;
  avg_return_1y: number;
  avg_return_3y: number;
  avg_expense: number;
  avg_sip: number;
  avg_lumpsum: number;
  by_type: FundTypeRow[];
  by_amc: AmcRow[];
  by_manager: ManagerRow[];
  by_strategy: StrategyRow[];
  by_risk: RiskRow[];
  insights: Insight[];
  top30: TopFund[];
};

export type FundRow = {
  scheme_id: string;
  scheme_name: string;
  amc_name: string;
  fund_type: string;
  category: string;
  sub_category: string;
  investment_strategy: string;
  risk_level: string;
  fund_rating: number;
  fund_manager: string;
  fund_age_years: number;
  aum_cr: number;
  return_1y_pct: number;
  return_3y_pct: number;
  expense_ratio_pct: number;
  min_sip_inr: number;
  min_lumpsum_inr: number;
};
