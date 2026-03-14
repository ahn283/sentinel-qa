export interface TestCase {
  id: string;
  title: string;
  confidence: number;
  status: 'approved' | 'pending';
  platform: ('flutter' | 'web')[];
  code: string;
}

export class TestStore {
  private store = new Map<string, TestCase[]>();

  save(appId: string, tests: TestCase[]): void {
    const existing = this.store.get(appId) ?? [];
    const merged = [...existing];
    for (const test of tests) {
      const idx = merged.findIndex((t) => t.id === test.id);
      if (idx >= 0) {
        merged[idx] = test;
      } else {
        merged.push(test);
      }
    }
    this.store.set(appId, merged);
  }

  get(appId: string): TestCase[] | undefined {
    return this.store.get(appId);
  }

  list(): Map<string, TestCase[]> {
    return this.store;
  }
}
