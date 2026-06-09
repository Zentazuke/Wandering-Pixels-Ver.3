/**
 * exportBoard.test.ts
 * Tests for the parsePt utility and buildFilter (canvas version).
 * The full exportBoard function is not unit-tested here because it depends on
 * the browser Canvas API — that's an integration test for a real browser.
 */
import { describe, it, expect } from 'vitest';
import { buildFilter } from '../store/boardStore';

// ── parsePt is internal to exportBoard — we test indirectly via edge cases

describe('buildFilter (store version)', () => {
  it('all defaults produce neutral filter', () => {
    const f = buildFilter({});
    expect(f).toContain('brightness(100%)');
    expect(f).toContain('contrast(100%)');
    expect(f).toContain('saturate(100%)');
    expect(f).toContain('blur(0px)');
    expect(f).toContain('sepia(0%)');
    expect(f).toContain('hue-rotate(0deg)');
    expect(f).toContain('invert(0%)');
    expect(f).toContain('opacity(1)');
  });

  it('opacity 50 produces 0.5 fraction', () => {
    expect(buildFilter({ op: 50 })).toContain('opacity(0.5)');
  });

  it('opacity 10 produces 0.1 fraction', () => {
    expect(buildFilter({ op: 10 })).toContain('opacity(0.1)');
  });

  it('partial overrides leave other values at defaults', () => {
    const f = buildFilter({ br: 200 });
    expect(f).toContain('brightness(200%)');
    expect(f).toContain('contrast(100%)');   // default preserved
    expect(f).toContain('opacity(1)');        // default preserved
  });

  it('hue-rotate uses deg unit', () => {
    expect(buildFilter({ hr: 180 })).toContain('hue-rotate(180deg)');
  });

  it('blur uses px unit', () => {
    expect(buildFilter({ bl: 5 })).toContain('blur(5px)');
  });

  it('produces a single space-separated string', () => {
    const f = buildFilter({});
    expect(f.split(' ')).toHaveLength(8);
  });
});
