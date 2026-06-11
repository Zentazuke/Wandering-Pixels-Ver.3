import { useRef, memo } from 'react';
import useAppStore from '../../../store/appStore.js';
import { buildFilter } from '../../../store/boardStore.js';
import { resolveFrame } from '../../../constants/frames.js';
import { SHAPES } from '../../../constants/shapes.js';
import SelectionHandles from './SelectionHandles.jsx';
import type { PhotoElement as PhotoEl } from '../../../types';
import type { ResizeHandle } from '../../../hooks/useBoardInteraction.js';
import styles from './PhotoElement.module.css';

interface Props {
  el:            PhotoEl;
  onPointerDown: (e: React.PointerEvent<HTMLElement>, id: string) => void;
  onRotate:      (e: React.PointerEvent<HTMLElement>, id: string, nodeRef: React.RefObject<HTMLElement | null>) => void;
  onResize:      (e: React.PointerEvent<HTMLElement>, id: string, handle: ResizeHandle) => void;
}

/** Photo element with frame, shape clip, filters, and optional caption. */
const PhotoElement = memo(function PhotoElement({ el, onPointerDown, onRotate, onResize }: Props) {
  const nodeRef    = useRef<HTMLDivElement>(null);
  const selId      = useAppStore((s) => s.selId);
  const isSelected = selId === el.id;

  const rf          = resolveFrame(el);
  const isFrameless = rf.key === 'none';

  const shapeKey  = el.shape || 'square';
  const shape     = SHAPES[shapeKey] || SHAPES.square;
  const svgClipId = `sc-${el.id}`;

  const clipStyle = shape.svgPath
    ? { clipPath: `url(#${svgClipId})`, WebkitClipPath: `url(#${svgClipId})` }
    : shape.clipPath
      ? { clipPath: shape.clipPath, WebkitClipPath: shape.clipPath }
      : {};

  const clipOverflow = (shape.clipPath || shape.svgPath) ? 'visible' : 'hidden';

  const shadow = el.shadow === false ? 'none'
    : rf.shadowOnly ? '0 8px 40px rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.25)'
    : isFrameless   ? 'none'
    : '4px 5px 18px rgba(0,0,0,0.28)';

  const zoom      = el.imgZoom ?? 1;
  const flipH     = el.flipH ? -1 : 1;
  const flipV     = el.flipV ? -1 : 1;
  const imgOrigin = `${el.imgX ?? 50}% ${el.imgY ?? 50}%`;
  // Omit identity transform — avoids a GPU compositing layer that breaks PNG transparency
  const imgTx     = (flipH === 1 && flipV === 1 && zoom === 1)
    ? undefined
    : `scaleX(${flipH}) scaleY(${flipV}) scale(${zoom})`;
  // Omit default filter for the same reason
  const imgFilter = buildFilter(el) === 'none' ? undefined : buildFilter(el);

  const frameBg    = el.frameColor || rf.bg;
  const extraStyle = rf.fr.wrapStyle
    ? Object.fromEntries(
        rf.fr.wrapStyle.split(';').filter(Boolean).map((p) => {
          const i = p.indexOf(':');
          const k = p.slice(0, i).trim().replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
          return [k, p.slice(i + 1).trim()];
        })
      )
    : {};

  const hasCap   = !isFrameless && rf.capColor && el.caption;
  const totalW   = el.w + rf.pad.l + rf.pad.r;
  // Inner corner follows the outer one through the mat (classic frame math)
  const innerR   = rf.radius > 0 ? Math.max(0, rf.radius - rf.w) : 0;

  return (
    <div
      ref={nodeRef}
      className={`${styles.el} ${isSelected ? styles.selected : ''}`}
      style={{
        left:      el.x,
        top:       el.y,
        width:     totalW,
        zIndex:    el.zIndex ?? 1,
        transform: `rotate(${el.rotation ?? 0}deg)`,
      }}
      onPointerDown={(e) => onPointerDown(e, el.id)}
    >
      <div
        className={styles.frameWrap}
        style={{
          background:    isFrameless ? 'transparent' : frameBg,
          padding:       `${rf.pad.t}px ${rf.pad.r}px ${rf.pad.b}px ${rf.pad.l}px`,
          boxShadow:     shadow,
          borderRadius:  rf.radius ? `${rf.radius}px` : '0px',
          outline:       rf.double ? '3px solid #f0e8d8' : undefined,
          outlineOffset: rf.double ? '3px' : undefined,
          ...extraStyle,
        }}
      >
        {shape.svgPath && (
          <svg width="0" height="0" style={{ position: 'absolute', pointerEvents: 'none' }}>
            <defs>
              <clipPath id={svgClipId} clipPathUnits="objectBoundingBox">
                <path d={shape.svgPath} />
              </clipPath>
            </defs>
          </svg>
        )}

        <div
          className={styles.clipContainer}
          style={{
            width:        el.w,
            height:       el.h,
            borderRadius: isFrameless ? undefined : (shape.br !== '0px' ? shape.br : (innerR ? `${innerR}px` : undefined)),
            overflow:     isFrameless ? 'visible' : clipOverflow as React.CSSProperties['overflow'],
            ...(isFrameless ? {} : clipStyle),
          }}
        >
          <img
            src={el.src}
            alt={el.caption || ''}
            draggable={false}
            decoding="async"
            style={{
              width:           '100%',
              height:          '100%',
              objectFit:       'cover',
              objectPosition:  imgOrigin,
              display:         'block',
              filter:          imgFilter,
              transform:       imgTx,
              transformOrigin: imgTx ? imgOrigin : undefined,
            }}
          />
          {rf.fr.overlay && <div dangerouslySetInnerHTML={{ __html: rf.fr.overlay }} />}
        </div>

        {hasCap && (
          <div className={styles.caption} style={{
            fontFamily: rf.capFont,
            fontSize:   el.captionSize  ?? 11,
            color:      el.captionColor ?? rf.capColor,
            fontStyle:  el.captionItalic !== false ? 'italic' : 'normal',
            fontWeight: el.captionBold   ? '600' : '400',
          }}>
            {el.caption}
          </div>
        )}
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

export default PhotoElement;
