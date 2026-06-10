import { useRef, useCallback, memo } from 'react';
import useAppStore from '../../../store/appStore.js';
import useBoardStore from '../../../store/boardStore.js';
import { NOTE_FRAME_STYLES, NOTE_FRAME_BG_OVERRIDES } from '../../../constants/noteFrames.js';
import SelectionHandles from './SelectionHandles.jsx';
import type { TextElement as TextEl } from '../../../types';
import type { ResizeHandle } from '../../../hooks/useBoardInteraction.js';
import styles from './TextElement.module.css';

const FONT_MAP: Record<string, string> = {
  Playfair:  "'Playfair Display', serif",
  'DM Sans': "'DM Sans', sans-serif",
  Lora:      "'Lora', serif",
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
  const frameBgOver = NOTE_FRAME_BG_OVERRIDES[frameKey];
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
        zIndex: el.zIndex ?? 1,
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
