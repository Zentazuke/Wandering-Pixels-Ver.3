import { useRef, memo } from 'react';
import useAppStore from '../../../store/appStore.js';
import { buildFilter } from '../../../store/boardStore.js';
import { FRAMES } from '../../../constants/frames.js';
import { SHAPES } from '../../../constants/shapes.js';
import SelectionHandles from './SelectionHandles.jsx';
import styles from './PhotoElement.module.css';

// Old frame names that were replaced — remap them
const FRAME_REMAP = {
  dark: 'polaroid', navy: 'polaroid', sage: 'polaroid', rose: 'polaroid',
  kraft: 'vintage', black: 'thick',
  rounded: 'none', round14: 'none',
};

// memo prevents sibling elements from re-rendering when only one element changes
// (e.g. during drag, only the dragged element's data changes)
const PhotoElement = memo(function PhotoElement({ el, onPointerDown, onRotate, onResize }) {
  const nodeRef = useRef(null);
  const selId   = useAppStore((s) => s.selId);
  const isSelected = selId === el.id;

  const frameKey = FRAME_REMAP[el.frame] || el.frame || 'polaroid';
  const fr       = FRAMES[frameKey] || FRAMES.polaroid;
  const isFrameless = frameKey === 'none';

  const shapeKey = el.shape || 'square';
  const shape    = SHAPES[shapeKey] || SHAPES.square;
  const clipBr   = shape.br;
  const svgClipId = `sc-${el.id}`;

  const clipStyle = shape.svgPath
    ? { clipPath: `url(#${svgClipId})`, WebkitClipPath: `url(#${svgClipId})` }
    : shape.clipPath
      ? { clipPath: shape.clipPath, WebkitClipPath: shape.clipPath }
      : {};

  const clipOverflow = (shape.clipPath || shape.svgPath) ? 'visible' : 'hidden';

  const shadow = (el.shadow !== false && frameKey !== 'none')
    ? (fr.shadowOnly ? '0 8px 40px rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.25)' : '4px 5px 18px rgba(0,0,0,0.28)')
    : 'none';

  const zoom    = el.imgZoom ?? 1;
  const flipH   = el.flipH ? -1 : 1;
  const flipV   = el.flipV ? -1 : 1;
  const imgTx   = `scaleX(${flipH}) scaleY(${flipV}) scale(${zoom})`;
  const imgOrigin = `${el.imgX ?? 50}% ${el.imgY ?? 50}%`;

  const isDouble   = fr.double;
  const frameBg    = el.frameColor || fr.bg;
  const extraStyle = fr.wrapStyle
    ? Object.fromEntries(
        fr.wrapStyle.split(';').filter(Boolean).map((p) => {
          const i = p.indexOf(':');
          const k = p.slice(0, i).trim().replace(/-([a-z])/g, (_, c) => c.toUpperCase());
          return [k, p.slice(i + 1).trim()];
        })
      )
    : {};

  const hasCap = !isFrameless && fr.capColor && el.caption;

  // Outer wrapper accounts for frame padding so drag target matches visual size
  const padNum = isFrameless ? 0 : parseInt(fr.pt) || 8;
  const totalW = el.w + (isFrameless ? 0 : padNum * 2);

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
      {/* Frame wrapper */}
      <div
        className={styles.frameWrap}
        style={{
          background:   frameBg,
          padding:      fr.pt,
          boxShadow:    shadow,
          borderRadius: fr.br,
          outline:      isDouble ? '3px solid #f0e8d8' : undefined,
          outlineOffset: isDouble ? '3px' : undefined,
          ...extraStyle,
        }}
      >
        {/* SVG clip definition for heart / custom shapes */}
        {shape.svgPath && (
          <svg width="0" height="0" style={{ position: 'absolute', pointerEvents: 'none' }}>
            <defs>
              <clipPath id={svgClipId} clipPathUnits="objectBoundingBox">
                <path d={shape.svgPath} />
              </clipPath>
            </defs>
          </svg>
        )}

        {/* Clip container — keeps image inside shape regardless of transform:scale */}
        <div
          className={styles.clipContainer}
          style={{
            width:        el.w,
            height:       el.h,
            borderRadius: clipBr,
            overflow:     clipOverflow,
            ...clipStyle,
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
              filter:          buildFilter(el),
              transform:       imgTx,
              transformOrigin: imgOrigin,
            }}
          />
          {/* Frame overlay (filmstrip holes, burn edge, etc.) */}
          {fr.overlay && (
            <div dangerouslySetInnerHTML={{ __html: fr.overlay }} />
          )}
        </div>

        {/* Caption */}
        {hasCap && (
          <div className={styles.caption} style={{
            fontFamily: fr.capFont,
            fontSize:   el.captionSize  ?? 11,
            color:      el.captionColor ?? fr.capColor,
            fontStyle:  el.captionItalic !== false ? 'italic' : 'normal',
            fontWeight: el.captionBold   ? '600' : '400',
          }}>
            {el.caption}
          </div>
        )}
      </div>

      {/* Selection handles */}
      {isSelected && (
        <SelectionHandles
          id={el.id}
          nodeRef={nodeRef}
          onRotate={onRotate}
          onResize={onResize}
        />
      )}
    </div>
  );
});

export default PhotoElement;
