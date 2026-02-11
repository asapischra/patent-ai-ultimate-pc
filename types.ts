export interface AnalysisResult {
  title: string;
  main_function: string;
  fast_analysis: Array<{ function: string; means: string }>;
  causal_chain: string[];
  triplet: {
    problem: string;
    solution: string;
    result: string;
  };
}

export interface StrategyResult {
  keywords_fr: string[];
  keywords_en: string[];
  classifications: string[];
  queries: string[];
  orbit_prompt: string;
}

export interface ComparisonResult {
  claim_chart: Array<{
    feature: string;
    d1_presence: string;
    d1_quote: string;
    verdict: string;
  }>;
  novelty_analysis: string;
  inventive_step_analysis: string;
}

export interface ReportResult {
  report_markdown: string;
}

export type StepData = {
  1: AnalysisResult | null;
  2: StrategyResult | null;
  3: ComparisonResult | null;
  4: ReportResult | null;
};

// UI & Utility Types (Preserved for App functionality)
export interface PriorDoc {
  name: string;
  text: string;
}

export enum AppStep {
  ANALYZE = 1,
  STRATEGY = 2,
  CONFRONTATION = 3,
  REPORT = 4,
}

export interface LogEntry {
  timestamp: string;
  message: string;
}