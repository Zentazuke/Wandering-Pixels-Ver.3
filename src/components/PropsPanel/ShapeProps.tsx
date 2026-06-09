import { BringToFront, ChevronsUp, ChevronsDown, SendToBack, Copy, Trash2 } from 'lucide-react';
import useBoardStore from '../../store/boardStore.js';
import useAppStore from '../../store/appStore.js';
import PropSection from './PropSection.jsx';
import { PropRow, PropSlider, PropBtn } from './PropRow.jsx';
import type { ShapeElement } from '../../types';
import styles from './ShapeProps.module.css';

const IC = 13;

// ── Palettes ───────────────────────────────────────────────────────────────────

const FILL_COLORS = [
  'transparent',
  '#ffffff','#fdfaf4','#fff9e6','#fce8e8','#fce4ec',
  '#e8f5e9','#e3f2fd','#ede7f6','#fff3e0','#e0f7fa',
  '#2a2520','#1a1a2e','#0d1f10','#b5943a','#5a3e1a',
  '#000000',
];

const STROKE_COLORS = [
  '#b5943a','#3b3328','#ffffff','#000000',
  '#6b2737','#1a3080','#2d4a2d','#5a3e1a',
  '#ff6b6b','#4ecdc4','#45b7d1','#96e6a1',
  'transparent',
];

// ── Frame presets ──────────────────────────────────────────────────────────────

const SHAPE_FRAMES = [
  { id: 'none',    label: 'Plain'   },
  { id: 'shadow',  label: 'Shadow'  },
  { id: 'rounded', label: 'Rounded' },
  { id: 'dashed',  label: 'Dashed'  },
  { id: 'dotted',  label: 'Dotted'  },
  { id: 'gold',    label: 'Gold'    },
  { id: 'neon',    label: 'Neon'    },
  { id: 'thick',   label: 'Thick'   },
  { id: 'outline', label: 'Outline' },
];

const LINE_STYLES = [
  { id: 'none',   label: 'Solid'  },
  { id: 'dashed', label: 'Dashed' },
  { id: 'dotted', label: 'Dotted' },
  { id: 'gold',   label: 'Gold'   },
  { id: 'neon',   label: 'Neon'   },
  { id: 'thick',  label: 'Thick'  },
];

/** Props panel for a selected shape element. */
export default function ShapeProps({ el }: { el: ShapeElement }) {
  const update     = useBoardStore((s) => s.updateElement);
  const deselect   = useAppStore((s) => s.deselect);
  const removeEl   = useBoardStore((s) => s.removeElement);
  const duplicate    = useBoardStore((s) => s.duplicateElement);
  const bringFront   = useBoardStore((s) => s.bringToFront);
  const bringForward = useBoardStore((s) => s.bringForward);
  const sendBackward = useBoardStore((s) => s.sendBackward);
  const sendBack     = useBoardStore((s) => s.sendToBack);

  const upd = (patch: Partial<ShapeElement>) => update(el.id, patch as Parameters<typeof update>[1]);
  const isLine = el.shape === 'line' || el.shape === 'arrow';
  const activeFrame = el.shapeFrame || 'none';

  return (
    <div className={styles.root}>
      <PropSection title="Transform" defaultOpen>
        {!isLine && (
          <PropSlider label="Rotate" min={-180} max={180} value={Math.round(el.rotation ?? 0)} unit="°"
            onChange={(v) => upd({ rotation: v })} />
        )}
        <PropRow>
          <PropBtn onClick={() => bringFront(el.id)}   title="Bring to front"><BringToFront size={IC} /></PropBtn>
          <PropBtn onClick={() => bringForward(el.id)} title="Move forward one layer"><ChevronsUp size={IC} /></PropBtn>
          <PropBtn onClick={() => sendBackward(el.id)} title="Move back one layer"><ChevronsDown size={IC} /></PropBtn>
          <PropBtn onClick={() => sendBack(el.id)}     title="Send to back"><SendToBack size={IC} /></PropBtn>
          <PropBtn onClick={() => duplicate(el.id)}    title="Duplicate"><Copy size={IC} /></PropBtn>
        </PropRow>
        <PropRow>
          <PropBtn danger onClick={() => { deselect(); removeEl(el.id); }} style={{ flex: 1 }} title="Delete"><Trash2 size={IC} /></PropBtn>
        </PropRow>
      </PropSection>

      {!isLine && (
        <PropSection title="Fill" defaultOpen>
          <div className={styles.swatchRow}>
            {FILL_COLORS.map((c) => (
              <div key={c}
                className={`${styles.swatch} ${el.fill === c ? styles.swatchActive : ''}`}
                style={{
                  background: c === 'transparent' ? 'none' : c,
                  border: c === 'transparent' ? '1.5px dashed rgba(0,0,0,0.3)' : '1.5px solid rgba(0,0,0,0.12)',
                }}
                onClick={() => upd({ fill: c })}
              />
            ))}
          </div>
          <div className={styles.customRow}>
            <span className={styles.customLabel}>Custom</span>
            <input type="color" className={styles.colorInput}
              title="Pick a custom fill colour"
              value={el.fill?.startsWith('#') ? el.fill : '#ffffff'}
              onChange={(e) => upd({ fill: e.target.value })} />
          </div>
          <PropSlider label="Opacity" min={0} max={100} value={el.fillOpacity ?? 100} unit="%"
            onChange={(v) => upd({ fillOpacity: v })} />
        </PropSection>
      )}

      <PropSection title="Stroke" defaultOpen>
        <div className={styles.swatchRow}>
          {STROKE_COLORS.map((c) => (
            <div key={c}
              className={`${styles.swatch} ${el.stroke === c ? styles.swatchActive : ''}`}
              style={{
                background: c === 'transparent' ? 'none' : c,
                border: c === 'transparent' ? '1.5px dashed rgba(0,0,0,0.3)' : '1.5px solid rgba(0,0,0,0.12)',
              }}
              onClick={() => upd({ stroke: c })}
            />
          ))}
        </div>
        <div className={styles.customRow}>
          <span className={styles.customLabel}>Custom</span>
          <input type="color" className={styles.colorInput}
            title="Pick a custom stroke colour"
            value={el.stroke?.startsWith('#') ? el.stroke : '#b5943a'}
            onChange={(e) => upd({ stroke: e.target.value })} />
        </div>
        <PropSlider label="Width" min={1} max={16} value={el.strokeWidth ?? 2} unit="px"
          onChange={(v) => upd({ strokeWidth: v })} />
      </PropSection>

      <PropSection title={isLine ? 'Line Style' : 'Frame Style'} defaultOpen>
        <div className={styles.frameGrid}>
          {(isLine ? LINE_STYLES : SHAPE_FRAMES).map(({ id, label }) => (
            <PropBtn key={id} active={activeFrame === id} onClick={() => upd({ shapeFrame: id })}>
              {label}
            </PropBtn>
          ))}
        </div>
      </PropSection>
    </div>
  );
}
