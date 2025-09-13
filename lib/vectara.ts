import { TTLCache } from '@/lib/cache/ttl';
import { CircuitBreaker } from '@/lib/resilience/circuitBreaker';
import { loadPrompt, formatPrompt } from '@/lib/prompts';

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

  const url = 'https://api.vectara.io/v2/chats';

  const customPrompt = loadPrompt('vectara-rag');
  const promptTemplate = customPrompt || `You are Alex Chernysh's AI assistant. Answer questions about his professional background using the search results provided.

Search results: {search_results}
Question: {query}
Answer:`;

  const body = {
    query,
    search: {
      corpora: [{
        corpus_key: process.env.VECTARA_CORPUS_KEY || 'personal-cv',
        metadata_filter: '',
        lexical_interpolation: 0.005,
        custom_dimensions: {}
      }],
      offset: 0,
      limit: 25,
      context_configuration: {
        sentences_before: 2,
        sentences_after: 2,
        start_tag: '%START_SNIPPET%',
        end_tag: '%END_SNIPPET%'
      },
      reranker: {
        type: 'customer_reranker',
        reranker_id: 'rnk_272725719'
      }
    },
    stream_response: false,
    generation: {
      prompt_template: promptTemplate,
      max_used_search_results: 5,
      response_language: 'auto',
      enable_factual_consistency_score: true
    },
    chat: {
      store: true
    }
  };

  const headers: Record<string, string> = {
    'content-type': 'application/json',
    'customer-id': process.env.VECTARA_CUSTOMER_ID!,
    'x-api-key': process.env.VECTARA_API_KEY!,
  };

  const res = await breaker.execute(() =>
    fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      cache: 'no-store',
      signal,
    }),
  );

  if (!res.ok) throw new Error(`vectara ${res.status}`);
  const j = await res.json();

  const out: RAGRes = {
    answer: j?.answer || '',
    sources: (j?.search_results || []).map((h: any) => ({
      title: h?.document_metadata?.title || 'Document',
      url: h?.document_metadata?.url,
      id: h?.document_id,
    })),
  };

  cache.set(key, out);
  return out;
}
