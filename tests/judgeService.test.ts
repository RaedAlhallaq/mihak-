import { describe, it, expect } from 'vitest';
import { JudgeService } from '../src/services/judgeService';
import { JudgeEvaluationRequest, JudgeRubric } from '../src/domain/types';

describe('JudgeService (LLM-as-a-Judge)', () => {
  const sampleRubric: JudgeRubric = {
    rubricId: 'rubric-1',
    name: 'Code Accuracy & Clarity',
    criteria: 'Check if code is syntactically correct and clear.',
    maxScore: 10,
  };

  const sampleRequest: JudgeEvaluationRequest = {
    evalItemId: 'item-101',
    prompt: 'Write a TypeScript function to check for prime numbers.',
    modelOutputContent: 'function isPrime(n: number): boolean { if (n <= 1) return false; for (let i = 2; i * i <= n; i++) { if (n % i === 0) return false; } return true; }',
    rubric: sampleRubric,
  };

  it('AC-2.2: should evaluate model output against a rubric and return a valid JudgeScore', async () => {
    const judgeService = new JudgeService();
    const result = await judgeService.evaluateOutput(sampleRequest);

    expect(result.status).toBe('success');
    expect(result.score).toBeDefined();
    expect(result.score.score).toBeGreaterThanOrEqual(0);
    expect(result.score.score).toBeLessThanOrEqual(sampleRubric.maxScore);
    expect(result.score.reasoning).toBeDefined();
    expect(result.score.reasoning.length).toBeGreaterThan(0);
  });
});
