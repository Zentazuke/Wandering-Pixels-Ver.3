import { useRef, memo } from 'react';
import useAppStore from '../../../store/appStore.js';
import SelectionHandles from './SelectionHandles.jsx';
import type { StickerElement as StickerEl } from '../../../types';
import type { ResizeHandle } from '../../../hooks/useBoardInteraction.js';
import styles from './StickerElement.module.css';

function colorizeSvg(svg: string, color: string): string {
  return svg
    .replace(/fill="(?!none)[^"]*"/g,   `fill="${color}"`)
    .replace(/stroke="(?!none)[^"]*"/g, `stroke="${color}"`);
}

interface Props {
  el:            StickerEl;
  onPointerDown: (e: React.PointerEvent<HTMLElement>, id: string) => void;
  onRotate:      (e: React.PointerEvent<HTMLElement>, id: string, nodeRef: React.RefObject<HTMLElement | null>) => void;
  onResize:      (e: React.PointerEvent<HTMLElement>, id: string, handle: ResizeHandle) => void;
}

/** SVG sticker element with optional colour tint. */
const StickerElement = memo(function StickerElement({ el, onPointerDown, onRotate, onResize }: Props) {
  const nodeRef    = useRef<HTMLDivElement>(null);
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
        zIndex:    isSelected ? 9999 : (el.zIndex ?? 1),
        transform: `rotate(${el.rotation ?? 0}deg)`,
        opacity:   (el.opacity ?? 100) / 100,
      }}
      onPointerDown={(e) => onPointerDown(e, el.id)}
    >
      <svg width={el.w} height={el.h} viewBox="0 0 24 24"
        dangerouslySetInnerHTML={{ __html: svgContent }} />

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

export default StickerElement;
