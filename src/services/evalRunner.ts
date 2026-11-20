import { EvalItem, ModelOutput, FanoutResults } from '../domain/types';
import { PricingCalculator } from './pricingCalculator';

export type MockProviderFn = (modelName: string, prompt: string) => Promise<ModelOutput>;

export class EvalRunner {
  constructor(private mockProvider?: MockProviderFn) {}

  private async executeSingleModel(modelName: string, item: EvalItem): Promise<ModelOutput> {
    if (this.mockProvider) {
      return this.mockProvider(modelName, item.prompt);
    }
    const startTime = Date.now();
    await new Promise((resolve) => setTimeout(resolve, 50));
    const latencyMs = Date.now() - startTime;

    return {
      modelName,
      content: `[Mahak AI Response] Model ${modelName} processed prompt: "${item.prompt.slice(0, 30)}..."`,
      metrics: {
        inputTokens: 150,
        outputTokens: 200,
        latencyMs,
      },
      status: 'success',
    };
  }

  async runFanout(models: string[], item: EvalItem): Promise<FanoutResults> {
    const promises = models.map(async (model) => {
      try {
        const output = await this.executeSingleModel(model, item);
        const costUsd = output.status === 'success' ? PricingCalculator.calculateCost(model, output.metrics) : 0;
        return { model, output, costUsd };
      } catch (err: unknown) {
        return {
          model,
          output: {
            modelName: model,
            content: '',
            metrics: { inputTokens: 0, outputTokens: 0, latencyMs: 0 },
            status: 'error' as const,
            errorMessage: err instanceof Error ? err.message : String(err),
          },
          costUsd: 0,
        };
      }
    });

    const settledResults = await Promise.allSettled(promises);
    const results: FanoutResults = {};

    settledResults.forEach((res, index) => {
      const model = models[index];
      if (res.status === 'fulfilled') {
        results[model] = { output: res.value.output, costUsd: res.value.costUsd };
      } else {
        results[model] = {
          output: {
            modelName: model,
            content: '',
            metrics: { inputTokens: 0, outputTokens: 0, latencyMs: 0 },
            status: 'error',
            errorMessage: res.reason?.message || 'Unhandled error',
          },
          costUsd: 0,
        };
      }
    });

    return results;
  }
}
