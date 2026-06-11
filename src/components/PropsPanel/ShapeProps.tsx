import { BringToFront, ChevronsUp, ChevronsDown, SendToBack } from 'lucide-react';
import useBoardStore from '../../store/boardStore.js';
import useAppStore from '../../store/appStore.js';
import PropSection from './PropSection.jsx';
import { PropRow, PropSlider, PropBtn, ElementActions } from './PropRow.jsx';
import type { ShapeElement } from '../../types';
import styles from './ShapeProps.module.css';

const IC = 13;

// ── Palettes ───────────────────────────────────────────────────────────────────

/* Atelier palette — papers, pigments, deep inks. Three rows of six. */
const FILL_COLORS = [
  'transparent',
  '#ffffff','#fff9e6','#f3ead3','#c9b795','#f6e3dd',
  '#e4eadf','#dfe7ec','#d9a0a8','#9caf97','#5e6e8c',
  '#c77e5e','#c9952e','#211a11','#0e1320','#31594f',
  '#4a3527','#6b2737',
];

const STROKE_COLORS = [
  '#a8741a','#3b3328','#211a11','#6b2737','#31594f','#2c3a58',
  '#2d4a2d','#c77e5e','#d9a0a8','#9caf97','#ffffff','transparent',
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

  const upd = (patch: Partial<ShapeElement>) => update(el.id, patch);
  const isLine = el.shape === 'line' || el.shape === 'arrow';
  const activeFrame = el.shapeFrame || 'none';

  return (
    <div className={styles.root}>
      <ElementActions
        onDuplicate={() => duplicate(el.id)}
        onDelete={() => { deselect(); removeEl(el.id); }}
      />

      <PropSection title="Arrange" defaultOpen>
        {!isLine && (
          <PropSlider label="Rotate" min={-180} max={180} value={Math.round(el.rotation ?? 0)} unit="°"
            onChange={(v) => upd({ rotation: v })} />
        )}
        <PropRow>
          <PropBtn onClick={() => bringFront(el.id)}   title="Bring to front"><BringToFront size={IC} /></PropBtn>
          <PropBtn onClick={() => bringForward(el.id)} title="Move forward one layer"><ChevronsUp size={IC} /></PropBtn>
          <PropBtn onClick={() => sendBackward(el.id)} title="Move back one layer"><ChevronsDown size={IC} /></PropBtn>
          <PropBtn onClick={() => sendBack(el.id)}     title="Send to back"><SendToBack size={IC} /></PropBtn>
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
            value={el.stroke?.startsWith('#') ? el.stroke : '#a8741a'}
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
