/**
 * sanitizeHtml.test.ts
 * The sanitizer is the security gate for note content — these tests pin the
 * allowlist policy: formatting survives, attributes never do, scriptable
 * content is removed entirely.
 */
import { describe, it, expect } from 'vitest';
import { sanitizeHtml, escapeHtml } from './sanitizeHtml';

describe('sanitizeHtml — keeps legitimate note content', () => {
  it('preserves plain text', () => {
    expect(sanitizeHtml('hello world')).toBe('hello world');
  });

  it('preserves basic formatting tags', () => {
    expect(sanitizeHtml('<b>bold</b> and <i>italic</i>')).toBe('<b>bold</b> and <i>italic</i>');
  });

  it('preserves line structure (div/br)', () => {
    expect(sanitizeHtml('line one<br><div>line two</div>')).toBe('line one<br><div>line two</div>');
  });

  it('preserves bullet lists', () => {
    expect(sanitizeHtml('<ul><li>one</li><li>two</li></ul>')).toBe('<ul><li>one</li><li>two</li></ul>');
  });

  it('returns empty string for empty input', () => {
    expect(sanitizeHtml('')).toBe('');
  });
});

describe('sanitizeHtml — neutralizes hostile content', () => {
  it('removes script tags entirely (no code leaks as text)', () => {
    expect(sanitizeHtml('safe<script>alert(1)</script>')).toBe('safe');
  });

  it('strips event-handler attributes from img by removing the unknown tag', () => {
    const out = sanitizeHtml('<img src=x onerror="alert(1)">text');
    expect(out).not.toContain('onerror');
    expect(out).not.toContain('<img');
    expect(out).toContain('text');
  });

  it('strips event handlers and style from allowed tags', () => {
    expect(sanitizeHtml('<b onclick="alert(1)" style="color:red">hi</b>')).toBe('<b>hi</b>');
  });

  it('removes iframes and style blocks wholesale', () => {
    expect(sanitizeHtml('<iframe src="javascript:alert(1)"></iframe>a<style>*{}</style>b')).toBe('ab');
  });

  it('unwraps unknown tags but keeps their text', () => {
    expect(sanitizeHtml('<a href="javascript:alert(1)">click</a>')).toBe('click');
  });

  it('cleans nested hostile content inside allowed tags', () => {
    const out = sanitizeHtml('<div><script>bad()</script><b onmouseover="x">ok</b></div>');
    expect(out).toBe('<div><b>ok</b></div>');
  });
});

describe('escapeHtml', () => {
  it('escapes markup-significant characters', () => {
    expect(escapeHtml('<b>&"')).toBe('&lt;b&gt;&amp;&quot;');
  });
});
