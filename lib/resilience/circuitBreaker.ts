export type CircuitBreakerState = 'closed' | 'open' | 'half';

export interface CircuitBreakerConfig {
  failureThreshold: number;
  openMs: number;
  halfSuccesses: number;
}

export class CircuitBreaker {
  private state: CircuitBreakerState = 'closed';
  private failures = 0;
  private openedAt = 0;
  private halfSuccess = 0;

  constructor(
    private cfg: CircuitBreakerConfig,
    private name = 'cb',
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    const now = Date.now();
    if (this.state === 'open') {
      if (now - this.openedAt < this.cfg.openMs) {
        throw Object.assign(new Error('CircuitBreakerError'), {
          name: 'CircuitBreakerError',
        });
      }
      this.state = 'half';
      this.halfSuccess = 0;
    }

    try {
      const res = await fn();
      if (this.state === 'half') {
        if (++this.halfSuccess >= this.cfg.halfSuccesses) {
          this.state = 'closed';
          this.failures = 0;
        }
      } else {
        this.failures = 0;
      }
      return res;
    } catch (e) {
      if (this.state === 'half') {
        this.trip();
      } else if (++this.failures >= this.cfg.failureThreshold) {
        this.trip();
      }
      throw e;
    }
  }

  private trip() {
    this.state = 'open';
    this.openedAt = Date.now();
  }
}
