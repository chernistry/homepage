import { CircuitBreaker } from '@/lib/resilience/circuitBreaker';

describe('CircuitBreaker', () => {
  it('should start in closed state and allow calls', async () => {
    const cb = new CircuitBreaker({ failureThreshold: 2, openMs: 100, halfSuccesses: 1 });
    const fn = jest.fn().mockResolvedValue('success');
    
    const result = await cb.execute(fn);
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should trip to open state after threshold failures', async () => {
    const cb = new CircuitBreaker({ failureThreshold: 2, openMs: 100, halfSuccesses: 1 });
    const fn = jest.fn().mockRejectedValue(new Error('fail'));
    
    // First failure
    await expect(cb.execute(fn)).rejects.toThrow('fail');
    
    // Second failure - should trip
    await expect(cb.execute(fn)).rejects.toThrow('fail');
    
    // Third call should be blocked
    await expect(cb.execute(fn)).rejects.toThrow('CircuitBreakerError');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should transition from open to half-open after timeout', async () => {
    const cb = new CircuitBreaker({ failureThreshold: 1, openMs: 50, halfSuccesses: 1 });
    const fn = jest.fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValueOnce('success');
    
    // Trip the breaker
    await expect(cb.execute(fn)).rejects.toThrow('fail');
    
    // Should be blocked immediately
    await expect(cb.execute(fn)).rejects.toThrow('CircuitBreakerError');
    
    // Wait for timeout
    await new Promise(resolve => setTimeout(resolve, 60));
    
    // Should allow one call and reset to closed
    const result = await cb.execute(fn);
    expect(result).toBe('success');
  });
});
