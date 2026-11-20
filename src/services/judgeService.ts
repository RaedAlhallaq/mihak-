import { JudgeEvaluationRequest, JudgeEvaluationResponse } from '../domain/types';

export type MockJudgeFn = (request: JudgeEvaluationRequest) => Promise<JudgeEvaluationResponse>;

export class JudgeService {
  constructor(private mockJudgeFn?: MockJudgeFn) {}

  async evaluateOutput(request: JudgeEvaluationRequest): Promise<JudgeEvaluationResponse> {
    if (this.mockJudgeFn) {
      return this.mockJudgeFn(request);
    }

    // Default heuristics-based judging mock execution for Mahak AI Sandbox
    const { prompt, modelOutputContent, rubric, evalItemId } = request;

    if (!modelOutputContent || modelOutputContent.trim().length === 0) {
      return {
        evalItemId,
        judgeModel: 'mahak-judge-v1',
        score: {
          score: 0,
          maxScore: rubric.maxScore,
          reasoning: 'Model output is empty.',
          rubricId: rubric.rubricId,
        },
        status: 'success',
      };
    }

    // Basic heuristic evaluation for accuracy and clarity criteria
    const hasCodeBlock = modelOutputContent.includes('function') || modelOutputContent.includes('return');
    const assignedScore = hasCodeBlock ? Math.min(8.5, rubric.maxScore) : Math.min(6.0, rubric.maxScore);

    return {
      evalItemId,
      judgeModel: 'mahak-judge-v1',
      score: {
        score: assignedScore,
        maxScore: rubric.maxScore,
        reasoning: `Output evaluated against rubric "${rubric.name}". Code structures detected and validated.`,
        rubricId: rubric.rubricId,
      },
      status: 'success',
    };
  }
}
