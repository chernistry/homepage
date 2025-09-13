import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const Body = z.object({
  query: z.string().min(3).max(2000),
  conversationId: z.string().optional(),
});

describe('/api/rag validation', () => {
  it('accepts valid query', () => {
    const result = Body.safeParse({ query: 'What is your experience?' });
    expect(result.success).toBe(true);
  });

  it('accepts query with conversationId', () => {
    const result = Body.safeParse({
      query: 'Tell me more',
      conversationId: 'conv-123',
    });
    expect(result.success).toBe(true);
  });

  it('rejects short query', () => {
    const result = Body.safeParse({ query: 'Hi' });
    expect(result.success).toBe(false);
  });

  it('rejects long query', () => {
    const result = Body.safeParse({ query: 'x'.repeat(2001) });
    expect(result.success).toBe(false);
  });

  it('rejects missing query', () => {
    const result = Body.safeParse({});
    expect(result.success).toBe(false);
  });
});
