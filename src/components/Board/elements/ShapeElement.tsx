import { useRef, memo } from 'react';
import useAppStore from '../../../store/appStore.js';
import SelectionHandles from './SelectionHandles.jsx';
import type { ShapeElement as ShapeEl } from '../../../types';
import type { ResizeHandle } from '../../../hooks/useBoardInteraction.js';
import styles from './ShapeElement.module.css';

// ── Frame → SVG attribute helpers ──────────────────────────────────────────────

interface SvgShapeProps {
  fill:            string;
  fillOpacity:     number;
  stroke:          string;
  strokeWidth:     number;
  strokeDasharray?: string;
  strokeLinecap?:  'round' | 'butt' | 'square';
  rx?:             number;
  filter?:         string;
}

function buildSvgProps(el: ShapeEl): SvgShapeProps {
  const base: SvgShapeProps = {
    fill:        el.fill === 'transparent' ? 'none' : el.fill,
    fillOpacity: el.fillOpacity / 100,
    stroke:      el.stroke,
    strokeWidth: el.strokeWidth,
  };
  // ── hex → rgba helper for glow colours ────────────────────────────────────────
  function hexToRgba(hex: string, alpha: number) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }
  const s = el.stroke && el.stroke.startsWith('#') ? el.stroke : '#b5943a';

  switch (el.shapeFrame) {
    case 'rounded':  return { ...base, rx: 12 };
    case 'dashed':   return { ...base, strokeDasharray: '8 6' };
    case 'dotted':   return { ...base, strokeDasharray: '2 5', strokeLinecap: 'round' };
    case 'gold':     return { ...base, stroke: '#b5943a', strokeWidth: Math.max(el.strokeWidth, 2) };
    case 'neon':     return { ...base, filter: `drop-shadow(0 0 5px ${hexToRgba(s, 0.9)}) drop-shadow(0 0 14px ${hexToRgba(s, 0.5)})` };
    case 'shadow':   return { ...base, filter: 'drop-shadow(2px 4px 8px rgba(0,0,0,0.22))' };
    case 'thick':    return { ...base, strokeWidth: el.strokeWidth * 2.5 };
    case 'outline':  return { ...base, fill: 'none', fillOpacity: 0 };
    default:         return base;
  }
}

// ── Line / Arrow helpers ────────────────────────────────────────────────────────

const PAD = 14; // hit-area padding around lines

function getLineBBox(el: ShapeEl) {
  const x2 = el.x2 ?? el.x + 180;
  const y2 = el.y2 ?? el.y;
  const minX = Math.min(el.x, x2);
  const minY = Math.min(el.y, y2);
  return {
    divLeft:  minX - PAD,
    divTop:   minY - PAD,
    divW:     Math.abs(x2 - el.x) + PAD * 2,
    divH:     Math.abs(y2 - el.y) + PAD * 2,
    svgX1:    el.x - minX + PAD,
    svgY1:    el.y - minY + PAD,
    svgX2:    x2   - minX + PAD,
    svgY2:    y2   - minY + PAD,
  };
}

// ── Component ──────────────────────────────────────────────────────────────────

interface Props {
  el:            ShapeEl;
  onPointerDown: (e: React.PointerEvent<HTMLElement>, id: string) => void;
  onRotate:      (e: React.PointerEvent<HTMLElement>, id: string, nodeRef: React.RefObject<HTMLElement | null>) => void;
  onResize:      (e: React.PointerEvent<HTMLElement>, id: string, handle: ResizeHandle) => void;
}

const ShapeElement = memo(function ShapeElement({ el, onPointerDown, onRotate, onResize }: Props) {
  const nodeRef    = useRef<HTMLDivElement>(null);
  const selId      = useAppStore((s) => s.selId);
  const isSelected = selId === el.id;

  const isLine = el.shape === 'line' || el.shape === 'arrow';

  // ── Line / Arrow ────────────────────────────────────────────────────────────
  if (isLine) {
    const bb = getLineBBox(el);
    const sp = buildSvgProps(el);
    const markerId = `wp-arrow-${el.id}`;

    return (
      <div
        ref={nodeRef}
        className={`${styles.lineEl} ${isSelected ? styles.selected : ''}`}
        style={{
          left:    bb.divLeft,
          top:     bb.divTop,
          width:   bb.divW,
          height:  bb.divH,
          zIndex:  el.zIndex ?? 1,
        }}
        onPointerDown={(e) => onPointerDown(e, el.id)}
      >
        <svg
          width={bb.divW}
          height={bb.divH}
          style={{ display: 'block', overflow: 'visible' }}
        >
          {el.shape === 'arrow' && (
            <defs>
              <marker
                id={markerId}
                markerWidth="8" markerHeight="8"
                refX="6" refY="3"
                orient="auto"
              >
                <path d="M0,0 L0,6 L8,3 z" fill={sp.stroke} />
              </marker>
            </defs>
          )}

          {/* Invisible wide hit area */}
          <line
            x1={bb.svgX1} y1={bb.svgY1}
            x2={bb.svgX2} y2={bb.svgY2}
            stroke="transparent"
            strokeWidth={Math.max((sp.strokeWidth ?? 2), 12)}
          />
          {/* Visible line */}
          <line
            x1={bb.svgX1} y1={bb.svgY1}
            x2={bb.svgX2} y2={bb.svgY2}
            stroke={sp.stroke}
            strokeWidth={sp.strokeWidth}
            strokeDasharray={sp.strokeDasharray}
            strokeLinecap={sp.strokeLinecap ?? 'round'}
            filter={sp.filter}
            markerEnd={el.shape === 'arrow' ? `url(#${markerId})` : undefined}
          />
        </svg>

        {/* Endpoint drag handles */}
        {isSelected && (
          <>
            <div
              className={styles.endpoint}
              style={{ left: bb.svgX1 - 6, top: bb.svgY1 - 6 }}
              onPointerDown={(e) => { e.stopPropagation(); onResize(e, el.id, 'p1'); }}
            />
            <div
              className={styles.endpoint}
              style={{ left: bb.svgX2 - 6, top: bb.svgY2 - 6 }}
              onPointerDown={(e) => { e.stopPropagation(); onResize(e, el.id, 'p2'); }}
            />
          </>
        )}
      </div>
    );
  }

  // ── Rect / Circle ───────────────────────────────────────────────────────────
  const sp   = buildSvgProps(el);
  const sw2  = (sp.strokeWidth ?? 2) / 2;

  return (
    <div
      ref={nodeRef}
      className={`${styles.el} ${isSelected ? styles.selected : ''}`}
      style={{
        left:      el.x,
        top:       el.y,
        width:     el.w,
        height:    el.h,
        zIndex:    el.zIndex ?? 1,
        transform: `rotate(${el.rotation ?? 0}deg)`,
      }}
      onPointerDown={(e) => onPointerDown(e, el.id)}
    >
      <svg
        width={el.w}
        height={el.h}
        style={{ display: 'block', overflow: 'visible' }}
      >
        {el.shape === 'rect' && (
          <rect
            x={sw2} y={sw2}
            width={el.w  - sp.strokeWidth}
            height={el.h - sp.strokeWidth}
            fill={sp.fill}
            fillOpacity={sp.fillOpacity}
            stroke={sp.stroke}
            strokeWidth={sp.strokeWidth}
            strokeDasharray={sp.strokeDasharray}
            strokeLinecap={sp.strokeLinecap}
            rx={sp.rx ?? 0}
            filter={sp.filter}
          />
        )}
        {el.shape === 'circle' && (
          <ellipse
            cx={el.w / 2} cy={el.h / 2}
            rx={Math.max(1, el.w / 2 - sw2)}
            ry={Math.max(1, el.h / 2 - sw2)}
            fill={sp.fill}
            fillOpacity={sp.fillOpacity}
            stroke={sp.stroke}
            strokeWidth={sp.strokeWidth}
            strokeDasharray={sp.strokeDasharray}
            strokeLinecap={sp.strokeLinecap}
            filter={sp.filter}
          />
        )}
      </svg>

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

export default ShapeElement;
