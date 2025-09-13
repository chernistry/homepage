'use client';
import React, { useState } from 'react';

type Src = { title: string; url?: string; id?: string };

export default function ChatWidget() {
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ans, setAns] = useState<string>('');
  const [src, setSrc] = useState<Src[]>([]);

  async function ask() {
    const query = q.trim();
    if (query.length < 3 || query.length > 2000) return;
    setLoading(true);
    setErr(null);
    setAns('');
    setSrc([]);
    try {
      const ctrl = AbortSignal.timeout(10_000);
      const r = await fetch('/api/rag', {
        method: 'POST',
        body: JSON.stringify({ query }),
        headers: { 'content-type': 'application/json' },
        signal: ctrl,
        cache: 'no-store',
      });
      if (!r.ok) throw new Error(String(r.status));
      const j = await r.json();
      setAns(j.answer ?? '');
      setSrc(j.sources ?? []);
    } catch (e) {
      setErr('Network error — try again');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-4 right-4 w-[min(420px,calc(100vw-2rem))] rounded border bg-white/80 dark:bg-black/60 backdrop-blur p-3 shadow">
      <label className="text-sm font-medium" htmlFor="rag-q">
        Ask about my resume
      </label>
      <textarea
        id="rag-q"
        className="mt-1 w-full rounded border p-2 text-sm"
        rows={3}
        placeholder="Type your question…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            void ask();
          }
        }}
        aria-label="Ask about my resume"
      />
      <div className="mt-2 flex items-center gap-2">
        <button
          disabled={loading || q.trim().length < 3}
          onClick={ask}
          className="px-3 py-1 rounded bg-blue-600 text-white disabled:opacity-50"
        >
          Send
        </button>
        {loading && (
          <span aria-live="polite" className="text-xs">
            Loading…
          </span>
        )}
        {err && (
          <span role="alert" className="text-xs text-red-600">
            {err}
          </span>
        )}
      </div>
      {ans && (
        <div className="mt-3 text-sm">
          <div className="font-medium mb-1">Answer</div>
          <p>{ans}</p>
          {!!src?.length && (
            <ul className="mt-2 list-disc pl-5">
              {src.map((s, i) => (
                <li key={i}>
                  <a
                    className="underline"
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
