'use client';
import React, { useState, useRef, useEffect } from 'react';

type Src = { title: string; url?: string; id?: string };
type Msg = { role: 'user' | 'assistant'; text: string; src?: Src[] };

export default function ChatWidget() {
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (boxRef.current && typeof boxRef.current.scrollTo === 'function') {
      boxRef.current.scrollTo(0, boxRef.current.scrollHeight);
    }
  }, [msgs]);

  async function ask() {
    const query = q.trim();
    if (query.length < 3 || query.length > 2000) return;

    setErr(null);
    setLoading(true);
    setMsgs((m) => [...m, { role: 'user', text: query }]);

    try {
      const ctrl = AbortSignal.timeout(10_000);
      const r = await fetch('/api/rag', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ query }),
        signal: ctrl,
        cache: 'no-store',
      });

      if (!r.ok) throw new Error(String(r.status));
      const j = await r.json();
      setMsgs((m) => [
        ...m,
        {
          role: 'assistant',
          text: String(j.answer ?? ''),
          src: j.sources ?? [],
        },
      ]);
    } catch {
      setErr('Network error — try again');
    } finally {
      setLoading(false);
      setQ('');
    }
  }

  return (
    <div className="w-full max-w-md">
      <label className="block text-sm font-medium" htmlFor="rag-q">
        Ask about my resume
      </label>
      <div
        ref={boxRef}
        className="mt-2 h-48 overflow-auto rounded border p-2 bg-white/80 dark:bg-black/40"
      >
        {msgs.map((m, i) => (
          <div
            key={i}
            className={`mb-2 ${m.role === 'user' ? 'text-right' : 'text-left'}`}
          >
            <div
              className={`inline-block max-w-[80%] rounded px-2 py-1 text-sm ${
                m.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-100'
              }`}
            >
              {m.text}
            </div>
            {m.src && m.src.length > 0 && (
              <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                Sources:{' '}
                {m.src.map((s, j) => (
                  <span key={j}>
                    {s.url ? (
                      <a
                        href={s.url}
                        className="underline hover:no-underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {s.title}
                      </a>
                    ) : (
                      s.title
                    )}
                    {j < m.src!.length - 1 && ', '}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <textarea
        id="rag-q"
        aria-label="Ask about my resume"
        className="mt-2 w-full rounded border p-2 text-sm"
        rows={3}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            void ask();
          }
        }}
        placeholder="e.g., What's Alex's Python experience?"
      />
      <div className="mt-2 flex items-center gap-2">
        <button
          onClick={ask}
          disabled={loading || q.trim().length < 3}
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
    </div>
  );
}
