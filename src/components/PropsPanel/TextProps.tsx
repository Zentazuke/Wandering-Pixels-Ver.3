import useBoardStore from '../../store/boardStore.js';
import useAppStore from '../../store/appStore.js';
import PropSection from './PropSection.jsx';
import { PropRow, PropSlider, PropBtn } from './PropRow.jsx';
import type { TextElement } from '../../types';
import styles from './TextProps.module.css';

const FONTS = ['Lora', 'Playfair', 'DM Sans'];

const NOTE_BG_COLORS = [
  '#fff9e6','#fdf6ee','#fffef0','#fce8e8','#fce4ec','#fde8f5',
  '#e8f5e9','#e8f5f0','#e3f2fd','#e8eaf6','#ede7f6','#f3e5f5',
  '#fff3e0','#fff8e1','#e0f7fa','#f5f5f5','#eceff1','#fafafa',
  '#2a2520','#1a1a2e','#0d1f10','transparent',
];

const TEXT_COLORS = [
  '#3b3328','#5a3e1a','#2d4a2d','#6b2737','#1a3080','#0d1f10',
  '#ffffff','#f0e6cc','#e8f5e9','#e3f2fd','#39ff9f','#ffd700',
  '#000000','transparent',
];

const NOTE_FRAMES = [
  { id: 'none',       label: 'Plain'     },
  { id: 'shadow',     label: 'Shadow'    },
  { id: 'border',     label: 'Border'    },
  { id: 'rounded',    label: 'Rounded'   },
  { id: 'pill',       label: 'Pill'      },
  { id: 'dashed',     label: 'Dashed'    },
  { id: 'double-b',   label: 'Double'    },
  { id: 'gold',       label: 'Gold'      },
  { id: 'gold-round', label: 'Gold+'     },
  { id: 'polaroid',   label: 'Polaroid'  },
  { id: 'torn',       label: 'Torn'      },
  { id: 'stamp',      label: 'Stamp'     },
  { id: 'tag',        label: 'Tag'       },
  { id: 'speech',     label: 'Speech'    },
  { id: 'tape-top',   label: 'Taped'     },
  { id: 'neon-glow',  label: 'Neon'      },
  { id: 'dark-card',  label: 'Dark'      },
  { id: 'crt',        label: 'CRT'       },
  { id: 'blueprint',  label: 'Blueprint' },
  { id: 'kraft',      label: 'Kraft'     },
];

/** Props panel for a selected text note element. */
export default function TextProps({ el }: { el: TextElement }) {
  const update     = useBoardStore((s) => s.updateElement);
  const deselect   = useAppStore((s) => s.deselect);
  const removeEl   = useBoardStore((s) => s.removeElement);
  const duplicate  = useBoardStore((s) => s.duplicateElement);
  const bringFront = useBoardStore((s) => s.bringToFront);
  const sendBack   = useBoardStore((s) => s.sendToBack);

  const upd = (patch: Partial<TextElement>) => update(el.id, patch);
  const activeFrame = el.noteFrame || 'shadow';

  return (
    <div className={styles.root}>
      <PropSection title="Transform" defaultOpen>
        <PropSlider label="Rotate" min={-180} max={180} value={Math.round(el.rotation ?? 0)} unit="°"
          onChange={(v) => upd({ rotation: v })} />
        <PropRow>
          <PropBtn onClick={() => bringFront(el.id)}>Front</PropBtn>
          <PropBtn onClick={() => sendBack(el.id)}>Back</PropBtn>
          <PropBtn onClick={() => duplicate(el.id)}>Copy</PropBtn>
        </PropRow>
        <PropRow>
          <PropBtn danger onClick={() => { deselect(); removeEl(el.id); }} style={{ flex: 1 }}>Delete</PropBtn>
        </PropRow>
      </PropSection>

      <PropSection title="Text Style" defaultOpen>
        <PropRow label="Font">
          <div className={styles.fontBtns}>
            {FONTS.map((f) => (
              <PropBtn key={f} active={(el.fontFamily || 'Lora') === f} onClick={() => upd({ fontFamily: f })}>
                {f.split(' ')[0]}
              </PropBtn>
            ))}
          </div>
        </PropRow>

        <PropSlider label="Size" min={8} max={48} value={el.fontSize ?? 15} unit="px"
          onChange={(v) => upd({ fontSize: v })} />

        <PropRow>
          <PropBtn active={el.bold}   onClick={() => upd({ bold:   !el.bold })}><b>B</b></PropBtn>
          <PropBtn active={el.italic} onClick={() => upd({ italic: !el.italic })}><i>I</i></PropBtn>
          <PropBtn active={(el.align || 'left') === 'left'}   onClick={() => upd({ align: 'left' })}>≡L</PropBtn>
          <PropBtn active={(el.align || 'left') === 'center'} onClick={() => upd({ align: 'center' })}>≡C</PropBtn>
          <PropBtn active={(el.align || 'left') === 'right'}  onClick={() => upd({ align: 'right' })}>≡R</PropBtn>
        </PropRow>

        <div className={styles.swatchLabel}>Text Color</div>
        <div className={styles.swatchRow}>
          {TEXT_COLORS.map((c) => (
            <div key={c}
              className={`${styles.swatch} ${(el.color || '#3b3328') === c ? styles.swatchActive : ''}`}
              style={{ background: c === 'transparent' ? 'none' : c, border: c === 'transparent' ? '1.5px dashed rgba(0,0,0,0.3)' : '1.5px solid rgba(0,0,0,0.12)' }}
              onClick={() => upd({ color: c })}
            />
          ))}
          <input type="color" className={styles.colorInput} value={el.color?.startsWith('#') ? el.color : '#3b3328'}
            onChange={(e) => upd({ color: e.target.value })} />
        </div>
      </PropSection>

      <PropSection title="Background">
        <div className={styles.swatchRow}>
          {NOTE_BG_COLORS.map((c) => (
            <div key={c}
              className={`${styles.swatch} ${(el.bg || '#fff9e6') === c ? styles.swatchActive : ''}`}
              style={{ background: c === 'transparent' ? 'none' : c, border: c === 'transparent' ? '1.5px dashed rgba(0,0,0,0.3)' : '1.5px solid rgba(0,0,0,0.12)' }}
              onClick={() => upd({ bg: c })}
            />
          ))}
          <input type="color" className={styles.colorInput} value={el.bg?.startsWith('#') ? el.bg : '#fff9e6'}
            onChange={(e) => upd({ bg: e.target.value })} />
        </div>
      </PropSection>

      <PropSection title="Frame Style" defaultOpen>
        <div className={styles.frameGrid}>
          {NOTE_FRAMES.map(({ id, label }) => (
            <PropBtn key={id} active={activeFrame === id} onClick={() => upd({ noteFrame: id })}>
              {label}
            </PropBtn>
          ))}
        </div>
      </PropSection>
    </div>
  );
}
