import { useState } from 'react';
import useBoardStore from '../../store/boardStore.js';
import useAppStore from '../../store/appStore.js';
import { STICKER_CATS } from '../../constants/stickers.js';
import styles from './StickerPicker.module.css';

const CATS = Object.keys(STICKER_CATS);

export default function StickerPicker({ onClose }) {
  const [activeCat, setActiveCat] = useState(CATS[0]);
  const addElement = useBoardStore((s) => s.addElement);
  const setSelId   = useAppStore((s) => s.setSelId);

  function addSticker(st) {
    const id = addElement({
      type: 'sticker',
      x: 120, y: 120, w: 60, h: 60,
      sid:  st.id,
      svg:  st.svg,
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

        {/* Category tabs */}
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

        {/* Sticker grid */}
        <div className={styles.grid}>
          {STICKER_CATS[activeCat].map((st) => (
            <button key={st.id} className={styles.item} title={st.label} onClick={() => addSticker(st)}>
              <svg width="36" height="36" viewBox="0 0 24 24" dangerouslySetInnerHTML={{ __html: st.svg }} />
              <span>{st.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
