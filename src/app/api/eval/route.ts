import { NextResponse } from 'next/server';
import { RunEvalRequestSchema } from '@/domain/schemas';
import { EvalRunner } from '@/services/evalRunner';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = RunEvalRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input payload', details: validation.error.format() }, { status: 400 });
    }

    const { models, item } = validation.data;
    const runner = new EvalRunner();
    const results = await runner.runFanout(models, item);

    return NextResponse.json({ success: true, results });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: 'Internal Server Error', message }, { status: 500 });
  }
}
