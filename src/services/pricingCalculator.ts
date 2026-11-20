import { UsageMetrics } from '../domain/types';

export const PRICING_TABLE_PER_1K: Record<string, { input: number; output: number }> = {
  'gpt-4o': { input: 0.0025, output: 0.0100 },
  'claude-3-5-sonnet': { input: 0.0030, output: 0.0150 },
  'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
};

export class PricingCalculator {
  static calculateCost(modelName: string, metrics: UsageMetrics): number {
    const key = modelName.toLowerCase();
    const pricing = PRICING_TABLE_PER_1K[key];
    if (!pricing) {
      throw new Error(`Pricing for model '${modelName}' not found in pricing table.`);
    }

    const inputCost = (metrics.inputTokens / 1000.0) * pricing.input;
    const outputCost = (metrics.outputTokens / 1000.0) * pricing.output;
    return Number((inputCost + outputCost).toFixed(6));
  }
}
