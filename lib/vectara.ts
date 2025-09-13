import { TTLCache } from '@/lib/cache/ttl';
import { CircuitBreaker } from '@/lib/resilience/circuitBreaker';

export type RAGReq = { query: string; conversationId?: string };
export type RAGSource = { title: string; url?: string; id?: string };
export type RAGRes = { answer: string; sources?: RAGSource[] };

const cache = new TTLCache<RAGRes>(5_000); // 5s minimal cache to dedupe bursts
const breaker = new CircuitBreaker(
  { failureThreshold: 3, openMs: 15_000, halfSuccesses: 2 },
  'vectara',
);

export async function askVectara(
  { query, conversationId }: RAGReq,
  { signal }: { signal?: AbortSignal } = {},
): Promise<RAGRes> {
  const key = `${conversationId ?? 'solo'}::${query.trim()}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const isV2 = process.env.VECTARA_QUERY_PATH?.startsWith('/v2');
  const base = process.env.VECTARA_BASE_URL ?? 'https://api.vectara.io';
  const path = process.env.VECTARA_QUERY_PATH ?? '/v1/query';
  const url = `${base.replace(/\/$/, '')}${path}`;

  const bodyV1 = {
    query: [
      {
        query,
        corpusKey: [
          {
            customerId: process.env.VECTARA_CUSTOMER_ID,
            corpusId: process.env.VECTARA_CORPUS_ID,
          },
        ],
        numResults: 6,
        contextConfig: { sentencesBefore: 1, sentencesAfter: 1 },
        conversationId,
      },
    ],
  };

  const bodyV2 = {
    query,
    search: {
      corpora: [{ corpus_key: process.env.VECTARA_CORPUS_ID }],
      limit: 6,
      context_configuration: { sentences_before: 1, sentences_after: 1 },
    },
    conversation: conversationId,
  };

  const headers: Record<string, string> = {
    'content-type': 'application/json',
    'x-api-key': process.env.VECTARA_API_KEY!,
    ...(isV2 ? {} : { 'customer-id': process.env.VECTARA_CUSTOMER_ID! }),
  };

  const res = await breaker.execute(() =>
    fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(isV2 ? bodyV2 : bodyV1),
      cache: 'no-store',
      signal,
    }),
  );

  if (!res.ok) throw new Error(`vectara ${res.status}`);
  const j = await res.json();

  const out: RAGRes = isV2
    ? {
        answer: j?.summaryText ?? j?.summary?.[0]?.text ?? '',
        sources: (j?.search_results ?? j?.results ?? []).map((h: any) => ({
          title: h?.document_metadata?.title || h?.title || 'Document',
          url: h?.document_metadata?.url || h?.url,
          id: h?.document_id || h?.documentId,
        })),
      }
    : {
        answer: j?.summary?.[0]?.text ?? '',
        sources: (j?.results ?? []).map((h: any) => ({
          title: h?.title || 'Document',
          url: h?.url,
          id: h?.documentId,
        })),
      };

  cache.set(key, out);
  return out;
}
