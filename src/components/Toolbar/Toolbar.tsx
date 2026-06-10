import { useRef, useState, useEffect } from 'react';
// `Image` is renamed to ImageIcon — the bare name would shadow the global
// `new Image()` constructor used in handlePhotoFiles and break photo upload.
import {
  MousePointer2, Image as ImageIcon, Type, Sparkles,
  Square, Circle, Minus, MoveRight,
  Palette, LayoutGrid,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import useAppStore from '../../store/appStore.js';
import useBoardStore from '../../store/boardStore.js';
import { makeShapeElement } from '../../store/boardStore.js';
import StickerPicker from '../ui/StickerPicker.jsx';
import BgPicker from '../ui/BgPicker.jsx';
import styles from './Toolbar.module.css';
import type { ShapeElement } from '../../types';

interface Props {
  open:     boolean;
  onToggle: () => void;
}

const ICON_SIZE = 18;

const MAIN_TOOLS = [
  { id: 'select',  Icon: MousePointer2, title: 'Select (V)' },
  { id: 'photo',   Icon: ImageIcon,     title: 'Photo (P)'  },
  { id: 'text',    Icon: Type,          title: 'Text note (T)' },
  { id: 'sticker', Icon: Sparkles,      title: 'Sticker (S)' },
] as const;

const SHAPE_TOOLS: { id: ShapeElement['shape']; Icon: React.FC<{ size?: number }>; title: string; short: string }[] = [
  { id: 'rect',   Icon: Square,    title: 'Rectangle',       short: 'Rect'   },
  { id: 'circle', Icon: Circle,    title: 'Circle / Ellipse', short: 'Circle' },
  { id: 'line',   Icon: Minus,     title: 'Line',            short: 'Line'   },
  { id: 'arrow',  Icon: MoveRight, title: 'Arrow',           short: 'Arrow'  },
];

/** Left toolbar — tool selector, shapes flyout, background, collapse toggle. */
export default function Toolbar({ open, onToggle }: Props) {
  const tool    = useAppStore((s) => s.tool);
  const setTool = useAppStore((s) => s.setTool);
  const zoom    = useAppStore((s) => s.zoom);
  const panX    = useAppStore((s) => s.panX);
  const panY    = useAppStore((s) => s.panY);

  const addElement = useBoardStore((s) => s.addElement);

  const [showStickers,     setShowStickers]     = useState(false);
  const [showBg,           setShowBg]           = useState(false);
  const [showShapesFlyout, setShowShapesFlyout] = useState(false);
  const [flyoutPos,        setFlyoutPos]        = useState({ top: 0, left: 0 });

  const shapeBtnRef   = useRef<HTMLButtonElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Close flyout when clicking outside
  useEffect(() => {
    if (!showShapesFlyout) return;
    function handleOutside(e: MouseEvent) {
      if (shapeBtnRef.current?.contains(e.target as Node)) return;
      setShowShapesFlyout(false);
    }
    document.addEventListener('pointerdown', handleOutside);
    return () => document.removeEventListener('pointerdown', handleOutside);
  }, [showShapesFlyout]);

  function openShapesFlyout() {
    if (showShapesFlyout) { setShowShapesFlyout(false); return; }
    if (shapeBtnRef.current) {
      const rect = shapeBtnRef.current.getBoundingClientRect();
      setFlyoutPos({ top: rect.top, left: rect.right + 6 });
    }
    setShowShapesFlyout(true);
  }

  function handleToolClick(id: string) {
    if (id === 'photo')   { photoInputRef.current?.click(); return; }
    if (id === 'sticker') { setShowStickers(true); return; }
    if (id === 'text')    { addTextNote(); return; }
    setTool('select');
  }

  function addTextNote() {
    const id = addElement({
      type: 'text', x: 100, y: 100, w: 220, h: 120,
      rotation: 0, locked: false,
      content: '', color: '#3b3328', bg: '#fff9e6',
      fontSize: 15, fontFamily: 'Lora', align: 'left',
      bold: false, italic: false, noteFrame: 'shadow',
    });
    useAppStore.getState().setSelId(id);
    setTool('select');
  }

  function addShape(shape: ShapeElement['shape']) {
    const el = document.querySelector('[data-board-canvas]') as HTMLElement | null;
    const cw = el?.clientWidth  ?? 900;
    const ch = el?.clientHeight ?? 600;
    const cx = (cw / 2 - panX) / zoom;
    const cy = (ch / 2 - panY) / zoom;

    const isLine = shape === 'line' || shape === 'arrow';
    const extra = isLine
      ? { x: cx - 90, y: cy, x2: cx + 90, y2: cy }
      : { x: cx - 80, y: cy - 50 };

    const id = addElement(makeShapeElement(shape, useBoardStore.getState().elements.length, extra));
    useAppStore.getState().setSelId(id);
    setTool('select');
    setShowShapesFlyout(false);
  }

  function handlePhotoFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    files.forEach((file, i) => {
      const isPng = file.type === 'image/png' || file.name.toLowerCase().endsWith('.png');
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          const ratio = img.naturalWidth / img.naturalHeight;
          const w = 200, h = Math.round(w / ratio);
          const id = addElement({
            type: 'photo', x: 100 + i * 30, y: 100 + i * 20, w, h,
            rotation: (Math.random() - 0.5) * 6, locked: false,
            src: ev.target!.result as string, caption: '', shadow: !isPng,
            frame: isPng ? 'none' : 'polaroid', shape: 'square',
            br: 100, co: 100, sa: 100, bl: 0, se: 0, hr: 0, iv: 0, op: 100,
            flipH: false, flipV: false, imgZoom: 1, imgX: 50, imgY: 50,
          });
          useAppStore.getState().setSelId(id);
        };
        img.src = ev.target!.result as string;
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
    setTool('select');
  }

  return (
    <>
      {/* ── Collapse tab ── */}
      <button
        className={styles.collapseTab}
        onClick={onToggle}
        title={open ? 'Hide toolbar' : 'Show toolbar'}
      >
        {open ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
      </button>

      {open && (
        <aside className={styles.toolbar}>
          {/* ── Main tools ── */}
          <div className={styles.group}>
            {MAIN_TOOLS.map(({ id, Icon, title }) => (
              <button
                key={id}
                className={`${styles.toolBtn} ${tool === id ? styles.active : ''}`}
                title={title}
                onClick={() => handleToolClick(id)}
              >
                <Icon size={ICON_SIZE} />
              </button>
            ))}
          </div>

          <div className={styles.divider} />

          {/* ── Shapes flyout trigger ── */}
          <div className={styles.group}>
            <button
              ref={shapeBtnRef}
              className={`${styles.toolBtn} ${showShapesFlyout ? styles.active : ''}`}
              title="Shapes"
              onClick={openShapesFlyout}
            >
              <LayoutGrid size={ICON_SIZE} />
            </button>
          </div>

          <div className={styles.divider} />

          {/* ── Background ── */}
          <div className={styles.group}>
            <button className={styles.toolBtn} title="Background" onClick={() => setShowBg(true)}>
              <Palette size={ICON_SIZE} />
            </button>
          </div>

          {/* ── Spacer ── */}
          <div className={styles.spacer} />

          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: 'none' }}
            onChange={handlePhotoFiles}
          />
        </aside>
      )}

      {/* ── Shapes flyout — fixed position, not clipped by overflow:hidden ── */}
      {showShapesFlyout && (
        <div
          className={styles.flyout}
          style={{ top: flyoutPos.top, left: flyoutPos.left }}
        >
          {SHAPE_TOOLS.map(({ id, Icon, title, short }) => (
            <button
              key={id}
              className={styles.flyoutBtn}
              title={title}
              onClick={() => addShape(id)}
            >
              <Icon size={16} />
              <span>{short}</span>
            </button>
          ))}
        </div>
      )}

      {showStickers && <StickerPicker onClose={() => setShowStickers(false)} />}
      {showBg       && <BgPicker     onClose={() => setShowBg(false)} />}
    </>
  );
}
