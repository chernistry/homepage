export type RAGReq = { query: string; conversationId?: string };
export type RAGSource = { title: string; url?: string; id?: string };
export type RAGRes = { answer: string; sources?: RAGSource[] };

function redact(s: string) {
  return s.replace(/([A-Za-z0-9]{4})[A-Za-z0-9]+/g, '$1…');
}

export async function askVectara(
  { query, conversationId }: RAGReq,
  { signal }: { signal?: AbortSignal } = {},
): Promise<RAGRes> {
  const url = 'https://api.vectara.io/v1/query';
  const body = {
    query,
    corpus_id: process.env.VECTARA_CORPUS_ID,
    conversation_id: conversationId,
    max_results: 5,
  };
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': process.env.VECTARA_API_KEY!,
      'x-customer-id': process.env.VECTARA_CUSTOMER_ID!,
    },
    body: JSON.stringify(body),
    cache: 'no-store',
    signal,
  });
  if (!res.ok) {
    const msg = `vectara ${res.status}`;
    console.error(msg);
    throw new Error(msg);
  }
  const j = await res.json();
  return { answer: j.answer ?? '', sources: j.sources ?? [] };
}
