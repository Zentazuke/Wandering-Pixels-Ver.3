import { useState } from 'react';
import useBoardStore from '../../store/boardStore.js';
import useAppStore from '../../store/appStore.js';
import { STICKER_CATS } from '../../constants/stickers.js';
import type { StickerCategoryName } from '../../constants/stickers.js';
import styles from './StickerPicker.module.css';

const CATS = Object.keys(STICKER_CATS) as StickerCategoryName[];

/** Modal grid for browsing and adding stickers to the board. */
export default function StickerPicker({ onClose }: { onClose: () => void }) {
  const [activeCat, setActiveCat] = useState<StickerCategoryName>(CATS[0]);
  const addElement = useBoardStore((s) => s.addElement);
  const setSelId   = useAppStore((s) => s.setSelId);

  function addSticker(svg: string) {
    const id = addElement({
      type: 'sticker', svg,
      x: 120, y: 120, w: 60, h: 60,
      rotation: 0, locked: false,
      opacity: 100,
    });
    setSelId(id);
    onClose();
  }

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <span>Stickers</span>
          <button className={styles.close} onClick={onClose}>✕</button>
        </div>

        <div className={styles.tabs}>
          {CATS.map((cat) => (
            <button
              key={cat}
              className={`${styles.tab} ${activeCat === cat ? styles.tabActive : ''}`}
              onClick={() => setActiveCat(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className={styles.grid}>
          {STICKER_CATS[activeCat].map((st) => (
            <button key={st.id} className={styles.item} title={st.label} onClick={() => addSticker(st.svg)}>
              <svg width="36" height="36" viewBox="0 0 24 24" dangerouslySetInnerHTML={{ __html: st.svg }} />
              <span>{st.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
