import { useRef, memo } from 'react';
import useAppStore from '../../../store/appStore.js';
import SelectionHandles from './SelectionHandles.jsx';
import styles from './StickerElement.module.css';

/** Tint all fill/stroke colours in an SVG string */
function colorizeSvg(svg, color) {
  return svg
    .replace(/fill="(?!none)[^"]*"/g,   `fill="${color}"`)
    .replace(/stroke="(?!none)[^"]*"/g, `stroke="${color}"`);
}

const StickerElement = memo(function StickerElement({ el, onPointerDown, onRotate, onResize }) {
  const nodeRef    = useRef(null);
  const selId      = useAppStore((s) => s.selId);
  const isSelected = selId === el.id;

  const svgContent = el.customColor ? colorizeSvg(el.svg, el.customColor) : el.svg;

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
        opacity:   (el.opacity ?? 100) / 100,
      }}
      onPointerDown={(e) => onPointerDown(e, el.id)}
    >
      <svg
        width={el.w}
        height={el.h}
        viewBox="0 0 24 24"
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />

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

export default StickerElement;
