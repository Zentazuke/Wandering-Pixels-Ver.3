import { ChevronLeft, ChevronRight } from 'lucide-react';
import useAppStore from '../../store/appStore.js';
import useBoardStore from '../../store/boardStore.js';
import PhotoProps   from './PhotoProps.jsx';
import TextProps    from './TextProps.jsx';
import StickerProps from './StickerProps.jsx';
import ShapeProps   from './ShapeProps.jsx';
import styles from './PropsPanel.module.css';

interface Props {
  open:     boolean;
  onToggle: () => void;
}

/** Right-side panel that renders property controls for the selected element. */
export default function PropsPanel({ open, onToggle }: Props) {
  const selId    = useAppStore((s) => s.selId);
  const elements = useBoardStore((s) => s.elements);
  const el       = selId ? elements.find((e) => e.id === selId) : null;

  return (
    <>
      {/* Collapse / expand tab */}
      <button
        className={styles.toggleTab}
        onClick={onToggle}
        title={open ? 'Hide panel' : 'Show panel'}
      >
        {open ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      {/* Always mounted — collapse animates via margin slide */}
      <aside className={`${styles.panel} ${open ? '' : styles.panelClosed}`}>
          {!el && (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>✦</div>
              <p>Select an element<br />to edit its properties</p>
            </div>
          )}
          {el?.type === 'photo'   && <PhotoProps   el={el} />}
          {el?.type === 'text'    && <TextProps    el={el} />}
          {el?.type === 'sticker' && <StickerProps el={el} />}
          {el?.type === 'shape'   && <ShapeProps   el={el} />}
      </aside>
    </>
  );
}
