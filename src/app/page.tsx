'use client';

import React, { useState } from 'react';

export default function MahakDashboard() {
  const [prompt, setPrompt] = useState('Write a TypeScript function to check for prime numbers.');
  const [selectedModels, setSelectedModels] = useState<string[]>(['gpt-4o', 'claude-3-5-sonnet']);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleRunEval = async () => {
    setLoading(true);
    setResults(null);
    try {
      const res = await fetch('/api/eval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          models: selectedModels,
          item: { itemId: 'demo-1', prompt },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setResults(data.results);
      }
    } catch (err) {
      console.error('Eval run failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="border-b border-slate-800 pb-4">
          <h1 className="text-3xl font-bold text-emerald-400">منصة مَحَكّ | Mahak AI</h1>
          <p className="text-slate-400 text-sm mt-1">
            Sandbox قياس دقة، سرعة، وتكلفة النماذج اللغوية (LLM Benchmark & Cost Dashboard)
          </p>
        </header>

        <section className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 space-y-4">
          <label className="block text-sm font-medium text-slate-300">أدخل نص البرومبت للاختبار (Prompt Item):</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-200 focus:outline-none focus:border-emerald-500 text-sm"
            rows={3}
          />
          <button
            onClick={handleRunEval}
            disabled={loading}
            className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold px-6 py-2.5 rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'جاري التشغيل بالتوازي (Fan-Out)...' : 'بدء تشغيل مَحَكّ 🚀'}
          </button>
        </section>

        {results && (
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-200">نتائج التقييم والمفاضلة (Evaluation Results):</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(results).map(([model, data]: [string, any]) => (
                <div key={model} className="bg-slate-800/80 p-5 rounded-xl border border-slate-700 space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-700/60 pb-2">
                    <span className="font-bold text-emerald-300">{model}</span>
                    <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded">
                      ${data.costUsd} USD
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 bg-slate-900/60 p-3 rounded font-mono">
                    {data.output.content}
                  </p>
                  <div className="flex justify-between text-xs text-slate-400 pt-1">
                    <span>الزمن: {data.output.metrics.latencyMs}ms</span>
                    <span>Tokens: In ({data.output.metrics.inputTokens}) / Out ({data.output.metrics.outputTokens})</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
