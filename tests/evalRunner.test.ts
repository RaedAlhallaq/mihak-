import { describe, it, expect } from 'vitest';
import { EvalRunner } from '../src/services/evalRunner';
import { PricingCalculator } from '../src/services/pricingCalculator';

describe('Mahak AI Engine Tests', () => {
  it('should calculate accurate pricing for gpt-4o', () => {
    const cost = PricingCalculator.calculateCost('gpt-4o', {
      inputTokens: 1000,
      outputTokens: 1000,
      latencyMs: 100,
    });
    expect(cost).toBe(0.0125);
  });

  it('should execute fanout across multiple models successfully', async () => {
    const runner = new EvalRunner();
    const item = { itemId: '1', prompt: 'Test Mahak AI execution' };
    const results = await runner.runFanout(['gpt-4o', 'claude-3-5-sonnet'], item);

    expect(results['gpt-4o']).toBeDefined();
    expect(results['claude-3-5-sonnet']).toBeDefined();
    expect(results['gpt-4o'].output.status).toBe('success');
    expect(results['gpt-4o'].costUsd).toBeGreaterThan(0);
  });

  it('should remain resilient when a model fails', async () => {
    const mockFailingProvider = async (model: string) => {
      if (model === 'failing-model') {
        throw new Error('API Rate Limit Exceeded');
      }
      return {
        modelName: model,
        content: 'OK',
        metrics: { inputTokens: 100, outputTokens: 100, latencyMs: 50 },
        status: 'success' as const,
      };
    };

    const runner = new EvalRunner(mockFailingProvider);
    const results = await runner.runFanout(['gpt-4o', 'failing-model'], { itemId: '2', prompt: 'Resilience Test' });

    expect(results['gpt-4o'].output.status).toBe('success');
    expect(results['failing-model'].output.status).toBe('error');
    expect(results['failing-model'].output.errorMessage).toContain('API Rate Limit');
  });
});
