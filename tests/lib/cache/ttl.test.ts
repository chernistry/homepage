import { describe, it, expect } from 'vitest';
import { TTLCache } from '@/lib/cache/ttl';

describe('TTLCache', () => {
  it('should store and retrieve values', () => {
    const cache = new TTLCache<string>(1000);
    cache.set('key', 'value');
    expect(cache.get('key')).toBe('value');
  });

  it('should return undefined for non-existent keys', () => {
    const cache = new TTLCache<string>(1000);
    expect(cache.get('nonexistent')).toBeUndefined();
  });

  it('should expire values after TTL', async () => {
    const cache = new TTLCache<string>(50);
    cache.set('key', 'value');
    
    expect(cache.get('key')).toBe('value');
    
    await new Promise(resolve => setTimeout(resolve, 60));
    
    expect(cache.get('key')).toBeUndefined();
  });

  it('should clear all values', () => {
    const cache = new TTLCache<string>(1000);
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    
    cache.clear();
    
    expect(cache.get('key1')).toBeUndefined();
    expect(cache.get('key2')).toBeUndefined();
  });
});
