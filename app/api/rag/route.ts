import { NextRequest } from 'next/server';
import { z } from 'zod';
import { askVectara } from '@/lib/vectara';

const GenerationConfigSchema = z.object({
  temperature: z.number().min(0).max(2).optional(),
  maxResponseCharacters: z.number().min(1).max(10000).optional(),
  frequencyPenalty: z.number().min(-2).max(2).optional(),
  presencePenalty: z.number().min(-2).max(2).optional(),
  generationPresetName: z.string().optional(),
  promptName: z.string().optional(),
}).optional();

const Body = z.object({
  query: z.string().min(3).max(2000),
  conversationId: z.string().optional(),
  generation: GenerationConfigSchema,
});

export async function POST(req: NextRequest) {
  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) {
    const errors = parsed.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
    return new Response(
      JSON.stringify({ code: 'INVALID_PARAMS', message: errors }),
      {
        status: 400,
        headers: {
          'content-type': 'application/json',
          'cache-control': 'no-store',
        },
      },
    );
  }

  const ctrl = AbortSignal.timeout(30_000); // Increased from 10s to 30s for complex queries and chat continuations
  try {
    // One retry on 5xx
    try {
      const data = await askVectara(parsed.data, { signal: ctrl });
      return Response.json(
        {
          answer: data.answer,
          sources: data.sources ?? [],
          chatId: data.chatId,
          turnId: data.turnId,
        },
        {
          headers: { 'cache-control': 'no-store' },
        },
      );
    } catch (e: any) {
      // Handle circuit breaker errors
      if (e?.name === 'CircuitBreakerError') {
        return new Response(
          JSON.stringify({
            code: 'SERVICE_UNAVAILABLE',
            message: 'Service temporarily unavailable',
          }),
          {
            status: 503,
            headers: {
              'content-type': 'application/json',
              'cache-control': 'no-store',
            },
          },
        );
      }
      // Retry on 5xx
      if (/^vectara 5\d\d$/.test(String(e?.message))) {
        const data = await askVectara(parsed.data, { signal: ctrl });
        return Response.json(
          {
            answer: data.answer,
            sources: data.sources ?? [],
            chatId: data.chatId,
            turnId: data.turnId,
          },
          {
            headers: { 'cache-control': 'no-store' },
          },
        );
      }
      throw e;
    }
  } catch (e) {
    console.error('RAG Error:', e);
    return new Response(
      JSON.stringify({ code: 'RAG_ERROR', message: 'Try again later' }),
      {
        status: 502,
        headers: {
          'content-type': 'application/json',
          'cache-control': 'no-store',
        },
      },
    );
  }
}
