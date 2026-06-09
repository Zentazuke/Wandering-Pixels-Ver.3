import { useRef, useState } from 'react';
import {
  MousePointer2, Image, Type, Sparkles,
  Square, Circle, Minus, MoveRight,
  Palette, Copy, BringToFront, ChevronsUp, ChevronsDown, SendToBack, Trash2,
  ZoomIn, ZoomOut, Maximize2,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import useAppStore from '../../store/appStore.js';
import useBoardStore from '../../store/boardStore.js';
import { makeShapeElement } from '../../store/boardStore.js';
import { BOARD_W, BOARD_H } from '../../constants/board.js';
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
  { id: 'photo',   Icon: Image,         title: 'Photo (P)'  },
  { id: 'text',    Icon: Type,          title: 'Text note (T)' },
  { id: 'sticker', Icon: Sparkles,      title: 'Sticker (S)' },
] as const;

const SHAPE_TOOLS: { id: ShapeElement['shape']; Icon: React.FC<{ size?: number; style?: React.CSSProperties }>; title: string }[] = [
  { id: 'rect',   Icon: Square,    title: 'Rectangle' },
  { id: 'circle', Icon: Circle,    title: 'Circle / Ellipse' },
  { id: 'line',   Icon: Minus,     title: 'Line' },
  { id: 'arrow',  Icon: MoveRight, title: 'Arrow' },
];

/** Left toolbar — tool selector, shape tools, zoom, collapse toggle. */
export default function Toolbar({ open, onToggle }: Props) {
  const tool    = useAppStore((s) => s.tool);
  const setTool = useAppStore((s) => s.setTool);
  const selId   = useAppStore((s) => s.selId);
  const zoom    = useAppStore((s) => s.zoom);
  const panX    = useAppStore((s) => s.panX);
  const panY    = useAppStore((s) => s.panY);
  const setTransform = useAppStore((s) => s.setTransform);

  const addElement  = useBoardStore((s) => s.addElement);
  const removeEl    = useBoardStore((s) => s.removeElement);
  const duplicate      = useBoardStore((s) => s.duplicateElement);
  const bringFront     = useBoardStore((s) => s.bringToFront);
  const bringForward   = useBoardStore((s) => s.bringForward);
  const sendBackward   = useBoardStore((s) => s.sendBackward);
  const sendBack       = useBoardStore((s) => s.sendToBack);

  const [showStickers, setShowStickers] = useState(false);
  const [showBg, setShowBg]             = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // ── Zoom helpers ──────────────────────────────────────────────────────────────
  function zoomIn()  { setTransform(Math.min(zoom * 1.2, 4), panX, panY); }
  function zoomOut() { setTransform(Math.max(zoom / 1.2, 0.1), panX, panY); }
  function fitBoard() {
    const el = document.querySelector('[data-board-canvas]') as HTMLElement | null;
    if (!el) return;
    const ww = el.clientWidth  || 900;
    const wh = el.clientHeight || 600;
    const z  = Math.min(ww / BOARD_W, wh / BOARD_H) * 0.9;
    setTransform(z, (ww - BOARD_W * z) / 2, (wh - BOARD_H * z) / 2);
  }

  // ── Tool click ────────────────────────────────────────────────────────────────
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
      {/* Collapse tab */}
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

          {/* ── Shape tools ── */}
          <div className={styles.group}>
            {SHAPE_TOOLS.map(({ id, Icon, title }) => (
              <button
                key={id}
                className={styles.toolBtn}
                title={title}
                onClick={() => addShape(id)}
              >
                <Icon size={ICON_SIZE} />
              </button>
            ))}
          </div>

          <div className={styles.divider} />

          {/* ── Background ── */}
          <div className={styles.group}>
            <button className={styles.toolBtn} title="Background" onClick={() => setShowBg(true)}>
              <Palette size={ICON_SIZE} />
            </button>
          </div>

          <div className={styles.divider} />

          {/* ── Element actions (when selected) ── */}
          {selId && (
            <>
              <div className={styles.group}>
                <button className={styles.actionBtn} title="Duplicate (Ctrl+D)" onClick={() => duplicate(selId)}>
                  <Copy size={ICON_SIZE} />
                </button>
                <button className={styles.actionBtn} title="Bring to front" onClick={() => bringFront(selId)}>
                  <BringToFront size={ICON_SIZE} />
                </button>
                <button className={styles.actionBtn} title="Move forward one layer" onClick={() => bringForward(selId)}>
                  <ChevronsUp size={ICON_SIZE} />
                </button>
                <button className={styles.actionBtn} title="Move back one layer" onClick={() => sendBackward(selId)}>
                  <ChevronsDown size={ICON_SIZE} />
                </button>
                <button className={styles.actionBtn} title="Send to back" onClick={() => sendBack(selId)}>
                  <SendToBack size={ICON_SIZE} />
                </button>
                <button className={`${styles.actionBtn} ${styles.danger}`} title="Delete"
                  onClick={() => { useAppStore.getState().deselect(); removeEl(selId); }}>
                  <Trash2 size={ICON_SIZE} />
                </button>
              </div>
              <div className={styles.divider} />
            </>
          )}

          {/* ── Spacer ── */}
          <div className={styles.spacer} />

          {/* ── Zoom ── */}
          <div className={styles.zoomGroup}>
            <button className={styles.zoomBtn} title="Zoom in (+)" onClick={zoomIn}>
              <ZoomIn size={16} />
            </button>
            <button className={styles.zoomBtn} title="Fit to screen" onClick={fitBoard}>
              <Maximize2 size={16} />
            </button>
            <button className={styles.zoomBtn} title="Zoom out (-)" onClick={zoomOut}>
              <ZoomOut size={16} />
            </button>
            <span className={styles.zoomPct}>{Math.round(zoom * 100)}%</span>
          </div>

          <input ref={photoInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handlePhotoFiles} />
        </aside>
      )}

      {showStickers && <StickerPicker onClose={() => setShowStickers(false)} />}
      {showBg       && <BgPicker     onClose={() => setShowBg(false)} />}
    </>
  );
}
