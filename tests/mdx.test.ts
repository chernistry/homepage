import { describe, it, expect } from 'vitest';
import { Frontmatter } from '@/lib/mdx';

describe('MDX Frontmatter', () => {
  it('validates correct frontmatter', () => {
    const valid = {
      title: 'Test Post',
      description: 'Test description',
      date: '2024-09-13',
      tags: ['test'],
      draft: false,
    };
    
    const result = Frontmatter.parse(valid);
    expect(result.title).toBe('Test Post');
    expect(result.date).toBe('2024-09-13');
  });

  it('handles Date objects in frontmatter', () => {
    const withDate = {
      title: 'Test Post',
      description: 'Test description',
      date: new Date('2024-09-13'),
    };
    
    const result = Frontmatter.parse(withDate);
    expect(result.date).toBe('2024-09-13');
  });

  it('rejects invalid frontmatter', () => {
    const invalid = {
      title: 'A', // too short
      description: 'Test description',
      date: '2024-09-13',
    };
    
    expect(() => Frontmatter.parse(invalid)).toThrow();
  });

  it('handles optional fields', () => {
    const minimal = {
      title: 'Test Post',
      description: 'Test description',
      date: '2024-09-13',
    };
    
    const result = Frontmatter.parse(minimal);
    expect(result.tags).toBeUndefined();
    expect(result.draft).toBeUndefined();
    expect(result.hero).toBeUndefined();
  });
});
