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

export interface JudgeRubric {
  rubricId: string;
  name: string;
  criteria: string; // E.g., "Accuracy, conciseness, and code formatting"
  maxScore: number; // E.g., 10 or 100
}

export interface JudgeScore {
  score: number;
  maxScore: number;
  reasoning: string;
  rubricId: string;
}

export interface JudgeEvaluation {
  evalItemId: string;
  targetModel: string;
  judgeScore: JudgeScore;
}

export interface JudgeEvaluationRequest {
  evalItemId: string;
  prompt: string;
  modelOutputContent: string;
  rubric: JudgeRubric;
}

export interface JudgeEvaluationResponse {
  evalItemId: string;
  judgeModel: string;
  score: JudgeScore;
  status: 'success' | 'error';
  errorMessage?: string;
}

export interface EvalResult {
  output: ModelOutput;
  costUsd: number;
  judgeEvaluation?: JudgeEvaluation;
}

export type FanoutResults = Record<string, EvalResult>;
