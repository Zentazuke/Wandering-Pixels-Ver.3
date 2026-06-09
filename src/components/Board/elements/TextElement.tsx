import { useRef, useCallback, memo } from 'react';
import useAppStore from '../../../store/appStore.js';
import useBoardStore from '../../../store/boardStore.js';
import SelectionHandles from './SelectionHandles.jsx';
import type { TextElement as TextEl } from '../../../types';
import type { ResizeHandle } from '../../../hooks/useBoardInteraction.js';
import styles from './TextElement.module.css';

const FONT_MAP: Record<string, string> = {
  Playfair:  "'Playfair Display', serif",
  'DM Sans': "'DM Sans', sans-serif",
  Lora:      "'Lora', serif",
};

const NOTE_FRAME_STYLES: Record<string, string> = {
  none:        '',
  shadow:      'boxShadow:3px 4px 14px rgba(0,0,0,0.18);border:1px solid rgba(0,0,0,0.06)',
  border:      'border:2px solid rgba(0,0,0,0.18)',
  rounded:     'borderRadius:12px;boxShadow:2px 3px 10px rgba(0,0,0,0.14);border:1px solid rgba(0,0,0,0.06)',
  pill:        'borderRadius:99px;boxShadow:2px 3px 10px rgba(0,0,0,0.13);border:1px solid rgba(0,0,0,0.07);padding:10px 22px',
  dashed:      'border:2px dashed rgba(0,0,0,0.22);borderRadius:4px',
  'double-b':  'border:3px double rgba(0,0,0,0.25);borderRadius:2px',
  gold:        'border:2px solid rgba(181,148,58,0.7);boxShadow:2px 3px 10px rgba(181,148,58,0.15)',
  'gold-round':'border:2px solid rgba(181,148,58,0.7);borderRadius:10px;boxShadow:2px 3px 12px rgba(181,148,58,0.18)',
  polaroid:    'border:1px solid rgba(0,0,0,0.08);boxShadow:3px 5px 16px rgba(0,0,0,0.22);padding:12px 12px 32px',
  torn:        'border:1px solid rgba(0,0,0,0.1);boxShadow:2px 3px 8px rgba(0,0,0,0.12);borderRadius:1px 3px 2px 4px/3px 1px 4px 2px',
  stamp:       'border:4px solid white;outline:2px solid rgba(0,0,0,0.15);boxShadow:2px 3px 10px rgba(0,0,0,0.18)',
  tag:         'borderRadius:3px 3px 3px 12px;border:1px solid rgba(0,0,0,0.12);boxShadow:1px 2px 6px rgba(0,0,0,0.1)',
  speech:      'borderRadius:12px;border:2px solid rgba(0,0,0,0.14);boxShadow:2px 3px 10px rgba(0,0,0,0.12)',
  'tape-top':  'border:1px solid rgba(0,0,0,0.09);boxShadow:2px 4px 12px rgba(0,0,0,0.15);marginTop:10px',
  'neon-glow': 'border:1px solid rgba(181,148,58,0.5);boxShadow:0 0 12px rgba(181,148,58,0.35),0 0 24px rgba(181,148,58,0.15);borderRadius:4px',
  'dark-card': 'border:1px solid rgba(181,148,58,0.25);boxShadow:3px 5px 18px rgba(0,0,0,0.45);borderRadius:3px',
  crt:         'border:2px solid #3a7a3a;boxShadow:0 0 10px rgba(60,200,60,0.3),inset 0 0 20px rgba(0,0,0,0.5);borderRadius:2px',
  blueprint:   'border:1px solid #5a9fd4;boxShadow:0 0 8px rgba(90,159,212,0.25);borderRadius:1px',
  kraft:       'border:2px solid #8a5a1a;boxShadow:2px 3px 10px rgba(100,60,0,0.3);borderRadius:2px',
};

const FRAME_BG_OVERRIDES: Record<string, string> = {
  polaroid: '#fff', 'dark-card': '#1a1712', crt: '#0a1a0a', blueprint: '#0d2a4a', kraft: '#c8913a',
};

function parseFrameStyle(str: string): React.CSSProperties {
  const obj: Record<string, string> = {};
  str.split(';').forEach((part) => {
    const i = part.indexOf(':');
    if (i < 0) return;
    const k = part.slice(0, i).trim();
    const v = part.slice(i + 1).trim();
    if (k && v) obj[k] = v;
  });
  return obj as React.CSSProperties;
}

interface Props {
  el:            TextEl;
  onPointerDown: (e: React.PointerEvent<HTMLElement>, id: string) => void;
  onRotate:      (e: React.PointerEvent<HTMLElement>, id: string, nodeRef: React.RefObject<HTMLElement | null>) => void;
  onResize:      (e: React.PointerEvent<HTMLElement>, id: string, handle: ResizeHandle) => void;
}

/** Editable text note element — double-click to enter edit mode. */
const TextElement = memo(function TextElement({ el, onPointerDown, onRotate, onResize }: Props) {
  const nodeRef    = useRef<HTMLDivElement>(null);
  const textRef    = useRef<HTMLDivElement>(null);
  const selId      = useAppStore((s) => s.selId);
  const isSelected = selId === el.id;
  const updateEl   = useBoardStore((s) => s.updateElement);

  const frameKey   = el.noteFrame || 'shadow';
  const frameBgOver = FRAME_BG_OVERRIDES[frameKey];
  const wrapBg     = frameBgOver || (el.bg === 'transparent' ? 'transparent' : el.bg || '#fff9e6');
  const frameStyle = parseFrameStyle(NOTE_FRAME_STYLES[frameKey] || '');
  const ff         = FONT_MAP[el.fontFamily ?? ''] || FONT_MAP.Lora;

  const onDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const txt = textRef.current;
    if (!txt) return;
    txt.contentEditable = 'true';
    txt.style.pointerEvents = 'auto';
    txt.style.cursor = 'text';
    txt.focus();
    if (document.caretRangeFromPoint) {
      const r = document.caretRangeFromPoint(e.clientX, e.clientY);
      if (r) { const sel = window.getSelection(); sel?.removeAllRanges(); sel?.addRange(r); }
    }
  }, []);

  const onBlur = useCallback(() => {
    const txt = textRef.current;
    if (!txt) return;
    txt.contentEditable = 'false';
    txt.style.pointerEvents = 'none';
    txt.style.cursor = 'default';
    updateEl(el.id, { content: txt.innerHTML });
  }, [el.id, updateEl]);

  const onKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (e.key === 'Escape') { textRef.current?.blur(); return; }

    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
      e.preventDefault();
      const next = !el.bold;
      if (textRef.current) textRef.current.style.fontWeight = next ? '600' : '400';
      updateEl(el.id, { bold: next });
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'i') {
      e.preventDefault();
      const next = !el.italic;
      if (textRef.current) textRef.current.style.fontStyle = next ? 'italic' : 'normal';
      updateEl(el.id, { italic: next });
      return;
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      const sel = window.getSelection();
      if (!sel?.rangeCount) return;
      const node = sel.getRangeAt(0).startContainer;
      const li = (node.nodeType === Node.TEXT_NODE ? node.parentElement : node as HTMLElement)?.closest?.('li');
      if (li) {
        e.preventDefault();
        const newLi = document.createElement('li');
        newLi.innerHTML = '<br>';
        li.after(newLi);
        const r = document.createRange();
        r.setStart(newLi, 0); r.collapse(true);
        sel.removeAllRanges(); sel.addRange(r);
        updateEl(el.id, { content: textRef.current?.innerHTML });
      }
    }
  }, [el.id, el.bold, el.italic, updateEl]);

  return (
    <div
      ref={nodeRef}
      className={`${styles.el} ${isSelected ? styles.selected : ''}`}
      style={{
        left: el.x, top: el.y, width: el.w,
        zIndex: isSelected ? 9999 : (el.zIndex ?? 1),
        transform: `rotate(${el.rotation ?? 0}deg)`,
      }}
      onPointerDown={(e) => onPointerDown(e, el.id)}
      onDoubleClick={onDoubleClick}
    >
      {frameKey === 'tape-top' && <div className={styles.tape} />}

      <div className={styles.noteWrap} style={{ background: wrapBg, minHeight: el.h, ...frameStyle }}>
        {frameKey === 'speech' && (
          <div className={styles.speechTail} style={{ borderTopColor: wrapBg }} />
        )}
        <div
          ref={textRef}
          className={styles.noteText}
          contentEditable={false}
          suppressContentEditableWarning
          spellCheck={false}
          data-placeholder={el.placeholder || 'Type here…'}
          style={{
            fontFamily:   ff,
            fontSize:     el.fontSize  ?? 15,
            color:        el.color     ?? '#3b3328',
            fontWeight:   el.bold      ? '600' : '400',
            fontStyle:    el.italic    ? 'italic' : 'normal',
            textAlign:    el.align     ?? 'left',
            pointerEvents: 'none',
          }}
          dangerouslySetInnerHTML={{ __html: el.content || '' }}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
          onPointerDown={(e) => { if (e.currentTarget.contentEditable === 'true') e.stopPropagation(); }}
          onMouseDown={(e) => { if (e.currentTarget.contentEditable === 'true') e.stopPropagation(); }}
        />
      </div>

      {isSelected && (
        <SelectionHandles
          id={el.id}
          nodeRef={nodeRef as React.RefObject<HTMLElement | null>}
          onRotate={onRotate}
          onResize={onResize}
        />
      )}
    </div>
  );
});

export default TextElement;
