export class TTLCache<V> {
  private store = new Map<string, { v: V; exp: number }>();

  constructor(private ttlMs: number) {}

  get(k: string): V | undefined {
    const e = this.store.get(k);
    if (!e) return;
    if (Date.now() > e.exp) {
      this.store.delete(k);
      return;
    }
    return e.v;
  }

  set(k: string, v: V): void {
    this.store.set(k, { v, exp: Date.now() + this.ttlMs });
  }

  clear(): void {
    this.store.clear();
  }
}
