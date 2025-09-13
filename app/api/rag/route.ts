import { NextRequest } from 'next/server';
import { z } from 'zod';
import { askVectara } from '@/lib/vectara';

const Body = z.object({
  query: z.string().min(3).max(2000),
  conversationId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) {
    return new Response(
      JSON.stringify({ code: 'BAD_REQUEST', message: 'Invalid input' }),
      {
        status: 400,
        headers: {
          'content-type': 'application/json',
          'cache-control': 'no-store',
        },
      },
    );
  }

  const ctrl = AbortSignal.timeout(10_000);
  try {
    // One retry on 5xx
    try {
      const data = await askVectara(parsed.data, { signal: ctrl });
      return Response.json(
        {
          answer: data.answer,
          sources: data.sources ?? [],
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
          },
          {
            headers: { 'cache-control': 'no-store' },
          },
        );
      }
      throw e;
    }
  } catch (e) {
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
