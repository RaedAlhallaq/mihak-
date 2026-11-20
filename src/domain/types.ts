export interface UsageMetrics {
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
}

export interface ModelOutput {
  modelName: string;
  content: string;
  metrics: UsageMetrics;
  status: 'success' | 'error';
  errorMessage?: string;
}

export interface EvalItem {
  itemId: string;
  prompt: string;
  expectedOutput?: string;
}

export interface JudgeScore {
  score: number; // 0.0 to 1.0 or 1 to 10
  reasoning: string;
  rubricName: string;
}

export interface JudgeEvaluation {
  evalItemId: string;
  targetModel: string;
  judgeScore: JudgeScore;
}

export interface EvalResult {
  output: ModelOutput;
  costUsd: number;
  judgeEvaluation?: JudgeEvaluation;
}

export type FanoutResults = Record<string, EvalResult>;
