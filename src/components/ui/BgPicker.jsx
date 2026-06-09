import { useRef } from 'react';
import useBoardStore from '../../store/boardStore.js';
import { BG_OPTIONS } from '../../constants/backgrounds.js';
import styles from './BgPicker.module.css';

const GROUPS = ['Light', 'Pattern', 'Dark', 'Gradient', 'Texture'];

export default function BgPicker({ onClose }) {
  const currentBg       = useBoardStore((s) => s.currentBg);
  const setBg           = useBoardStore((s) => s.setBg);
  const setCustomBgColor = useBoardStore((s) => s.setCustomBgColor);
  const setCustomBgImage = useBoardStore((s) => s.setCustomBgImage);
  const imgInputRef     = useRef(null);

  function handleImageFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { setCustomBgImage(ev.target.result); onClose(); };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <span>Background</span>
          <button className={styles.close} onClick={onClose}>✕</button>
        </div>

        {/* Custom colour + image */}
        <div className={styles.customRow}>
          <label className={styles.customLabel}>Custom colour</label>
          <input type="color" defaultValue="#f7f2e8"
            onChange={(e) => setCustomBgColor(e.target.value)} />
          <button className={styles.imgBtn} onClick={() => imgInputRef.current?.click()}>
            📷 Image
          </button>
          <input ref={imgInputRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleImageFile} />
        </div>

        {GROUPS.map((group) => {
          const opts = BG_OPTIONS.filter((b) => b.group === group);
          if (!opts.length) return null;
          return (
            <div key={group} className={styles.group}>
              <div className={styles.groupLabel}>{group}</div>
              <div className={styles.swatches}>
                {opts.map((opt) => (
                  <button
                    key={opt.id}
                    className={`${styles.swatch} ${currentBg === opt.id ? styles.active : ''}`}
                    title={opt.label}
                    onClick={() => { setBg(opt.id); onClose(); }}
                  >
                    <div className={styles.preview} style={parseStyle(opt.style)} />
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Convert bg style string → React inline style object */
function parseStyle(str) {
  const obj = {};
  str.split(';').forEach((part) => {
    const i = part.indexOf(':');
    if (i < 0) return;
    const k = part.slice(0, i).trim().replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    const v = part.slice(i + 1).trim();
    if (k && v) obj[k] = v;
  });
  return obj;
}
