/**
 * sanitizeHtml — allowlist sanitizer for text-note content.
 *
 * Note content is captured as raw innerHTML from contentEditable, persisted,
 * and re-rendered via dangerouslySetInnerHTML. Pasting rich content can smuggle
 * in arbitrary markup (<img onerror=…>, <script>, javascript: URLs). Today
 * boards are local-only, but the Archive is becoming a sharing hub — shared
 * boards with unsanitized HTML would be stored XSS. Sanitize at every point
 * content enters the store AND defensively at render.
 *
 * Policy: keep basic text structure/formatting tags, strip ALL attributes,
 * drop dangerous subtrees entirely, unwrap everything else (keep its text).
 */

/** Formatting / structure tags contentEditable legitimately produces. */
const ALLOWED_TAGS = new Set([
  'B', 'STRONG', 'I', 'EM', 'U', 'S',
  'P', 'DIV', 'BR', 'UL', 'OL', 'LI', 'SPAN',
]);

/** Subtrees removed wholesale — unwrapping these would leak code as text. */
const DROPPED_TAGS = new Set([
  'SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED', 'LINK', 'META', 'TEMPLATE',
]);

export function sanitizeHtml(html: string): string {
  if (!html) return '';
  const doc = new DOMParser().parseFromString(html, 'text/html');

  function clean(parent: Element): void {
    for (const child of Array.from(parent.children)) {
      if (DROPPED_TAGS.has(child.tagName)) {
        child.remove();
        continue;
      }
      clean(child);
      if (ALLOWED_TAGS.has(child.tagName)) {
        // Allowed tag — but no attributes survive (style/on*/class/href…)
        for (const attr of Array.from(child.attributes)) {
          child.removeAttribute(attr.name);
        }
      } else {
        // Unknown tag — unwrap: keep its (already cleaned) children
        child.replaceWith(...Array.from(child.childNodes));
      }
    }
  }

  clean(doc.body);
  return doc.body.innerHTML;
}

/** Escape plain text for safe embedding into note HTML content. */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
