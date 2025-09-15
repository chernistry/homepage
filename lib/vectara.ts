import { TTLCache } from '@/lib/cache/ttl';
import { CircuitBreaker } from '@/lib/resilience/circuitBreaker';
import { loadPrompt, formatPrompt } from '@/lib/prompts';
import type { GenerationConfig } from '@/lib/types';

export type RAGReq = { query: string; conversationId?: string; generation?: GenerationConfig };
export type RAGSource = { title: string; url?: string; id?: string };
export type RAGRes = { answer: string; sources?: RAGSource[]; chatId?: string; turnId?: string };

const cache = new TTLCache<RAGRes>(5_000); // 5s minimal cache to dedupe bursts
const breaker = new CircuitBreaker(
  { failureThreshold: 3, openMs: 15_000, halfSuccesses: 2 },
  'vectara',
);

export async function askVectara(
  { query, conversationId, generation: genConfig }: RAGReq,
  { signal }: { signal?: AbortSignal } = {},
): Promise<RAGRes> {
  const key = `${conversationId ?? 'solo'}::${query.trim()}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const baseUrl = 'https://api.vectara.io/v2';

  const customPrompt = loadPrompt(process.env.VECTARA_PROMPT_PATH?.replace('prompts/', '').replace('.md', '') || 'vectara-rag');
  const promptTemplate = customPrompt || `[
  {"role": "system", "content": "You write brief, relevant answers to the exact question. Use only facts explicitly present in the provided search results. Do not speculate."},
  {"role": "user", "content": "Search results for the query '${query}' are listed below:\\n#foreach ($qResult in $vectaraQueryResults)\\n[$esc.java($foreach.index + 1)] $esc.java($qResult.getText())\\n\\n#end\\nProvide the answer only."}
]`;

  const search = {
    corpora: [
      {
        corpus_key: process.env.VECTARA_CORPUS_KEY || 'personal-cv',
        metadata_filter: '',
        lexical_interpolation: 0.005,
        custom_dimensions: {},
      },
    ],
    offset: 0,
    limit: 25,
    context_configuration: {
      sentences_before: 2,
      sentences_after: 2,
      start_tag: '%START_SNIPPET%',
      end_tag: '%END_SNIPPET%',
    },
    reranker: {
      type: 'customer_reranker',
      reranker_name: 'Rerank_Multilingual_v1',
    },
  } as const;

  const generation = {
    generation_preset_name: genConfig?.generationPresetName || process.env.VECTARA_GENERATION_PRESET || "vectara-summary-ext-24-05-med-omni",
    prompt_template: promptTemplate,
    max_used_search_results: 7,
    max_response_characters: genConfig?.maxResponseCharacters || 1200,
    response_language: 'auto',
    enable_factual_consistency_score: true,
  } as const;

  const continueChat = !!conversationId && /^cht_/.test(conversationId);
  const url = continueChat
    ? `${baseUrl}/chats/${conversationId}/turns`
    : `${baseUrl}/chats`;

  const body = {
    query,
    search,
    generation,
    chat: { store: true },
    save_history: true,
    intelligent_query_rewriting: true,
    stream_response: false,
  };

  const headers: Record<string, string> = {
    'content-type': 'application/json',
    'x-api-key': process.env.VECTARA_API_KEY!,
  };

  console.log('Vectara request:', { url, body: JSON.stringify(body, null, 2) });

  const res = await breaker.execute(() =>
    fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      cache: 'no-store',
      signal,
    }),
  );

  if (!res.ok) {
    const errorText = await res.text();
    console.error(`Vectara ${res.status}:`, errorText);
    throw new Error(`vectara ${res.status}`);
  }
  const j = await res.json();

  const out: RAGRes = {
    answer: j?.answer || '',
    chatId: j?.chat_id || conversationId,
    turnId: j?.turn_id,
    sources: (j?.search_results || []).map((h: any) => ({
      title: h?.document_metadata?.title || 'Document',
      url: h?.document_metadata?.url,
      id: h?.document_id,
    })),
  };

  cache.set(key, out);
  return out;
}

