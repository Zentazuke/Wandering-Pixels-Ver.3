import { useRef, useState } from 'react';
import useAppStore from '../../store/appStore.js';
import useBoardStore from '../../store/boardStore.js';
import StickerPicker from '../ui/StickerPicker.jsx';
import BgPicker from '../ui/BgPicker.jsx';
import styles from './Toolbar.module.css';

const TOOLS = [
  { id: 'select',  icon: '↖', title: 'Select (V)' },
  { id: 'text',    icon: 'T', title: 'Text note (T)' },
  { id: 'photo',   icon: '⬜', title: 'Photo (P)' },
  { id: 'sticker', icon: '★', title: 'Sticker (S)' },
];

export default function Toolbar() {
  const tool    = useAppStore((s) => s.tool);
  const setTool = useAppStore((s) => s.setTool);
  const selId   = useAppStore((s) => s.selId);

  const addElement  = useBoardStore((s) => s.addElement);
  const removeEl    = useBoardStore((s) => s.removeElement);
  const duplicate   = useBoardStore((s) => s.duplicateElement);
  const bringFront  = useBoardStore((s) => s.bringToFront);
  const sendBack    = useBoardStore((s) => s.sendToBack);

  const [showStickers, setShowStickers] = useState(false);
  const [showBg, setShowBg]             = useState(false);

  const photoInputRef = useRef(null);

  function handleToolClick(id) {
    if (id === 'photo')   { photoInputRef.current?.click(); return; }
    if (id === 'sticker') { setShowStickers(true); return; }
    if (id === 'text')    { addTextNote(); return; }
    setTool(id);
  }

  function addTextNote() {
    const id = addElement({
      type: 'text', x: 100, y: 100, w: 220, h: 120,
      content: 'Type here…', color: '#3b3328', bg: '#fff9e6',
      fontSize: 15, fontFamily: 'Lora', align: 'left',
      bold: false, italic: false, noteFrame: 'shadow',
    });
    useAppStore.getState().setSelId(id);
    setTool('select');
  }

  function handlePhotoFiles(e) {
    const files = Array.from(e.target.files);
    files.forEach((file, i) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          const ratio = img.naturalWidth / img.naturalHeight;
          const w = 200, h = Math.round(w / ratio);
          const id = addElement({
            type: 'photo', x: 100 + i * 30, y: 100 + i * 20, w, h,
            src: ev.target.result, caption: '', shadow: true,
            rotation: (Math.random() - 0.5) * 6, frame: 'polaroid', shape: 'square',
            br: 100, co: 100, sa: 100, bl: 0, se: 0, hr: 0, iv: 0, op: 100,
            flipH: false, flipV: false, imgZoom: 1, imgX: 50, imgY: 50,
          });
          useAppStore.getState().setSelId(id);
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
    setTool('select');
  }

  return (
    <>
      <aside className={styles.toolbar}>
        {/* ── Tools ── */}
        <div className={styles.group}>
          {TOOLS.map(({ id, icon, title }) => (
            <button
              key={id}
              className={`${styles.toolBtn} ${tool === id ? styles.active : ''}`}
              title={title}
              onClick={() => handleToolClick(id)}
            >
              {icon}
            </button>
          ))}
        </div>

        <div className={styles.divider} />

        {/* ── Background ── */}
        <div className={styles.group}>
          <button className={styles.toolBtn} title="Background" onClick={() => setShowBg(true)}>
            ◫
          </button>
        </div>

        <div className={styles.divider} />

        {/* ── Element actions ── */}
        {selId && (
          <div className={styles.group}>
            <button className={styles.actionBtn} title="Duplicate (Ctrl+D)" onClick={() => duplicate(selId)}>⧉</button>
            <button className={styles.actionBtn} title="Bring to front (Ctrl+])" onClick={() => bringFront(selId)}>↑</button>
            <button className={styles.actionBtn} title="Send to back (Ctrl+[)" onClick={() => sendBack(selId)}>↓</button>
            <button className={`${styles.actionBtn} ${styles.danger}`} title="Delete" onClick={() => { useAppStore.getState().deselect(); removeEl(selId); }}>✕</button>
          </div>
        )}

        <input ref={photoInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handlePhotoFiles} />
      </aside>

      {showStickers && <StickerPicker onClose={() => setShowStickers(false)} />}
      {showBg       && <BgPicker     onClose={() => setShowBg(false)} />}
    </>
  );
}
