import { useState } from 'react';
import {
  BringToFront, ChevronsUp, ChevronsDown, SendToBack, Copy, Trash2,
  Bold, Italic, List, AlignLeft, AlignCenter, AlignRight,
} from 'lucide-react';
import useBoardStore from '../../store/boardStore.js';
import useAppStore from '../../store/appStore.js';
import PropSection from './PropSection.jsx';
import { PropRow, PropSlider, PropBtn } from './PropRow.jsx';
import type { TextElement } from '../../types';
import styles from './TextProps.module.css';

const IC = 13; // icon size for prop panel buttons

const FONTS = ['Lora', 'Playfair', 'DM Sans'];

/* Atelier papers — washes, pigments, deep inks. Three rows of six. */
const NOTE_BG_COLORS = [
  '#fff9e6','#faf6ee','#f3ead3','#c9b795','#f6e3dd','#e4eadf',
  '#dfe7ec','#e7e2ec','#d9a0a8','#9caf97','#5e6e8c','#c77e5e',
  '#c9952e','#211a11','#0e1320','#31594f','#4a3527','transparent',
];

/* Writing inks first, light inks for dark papers after. Two rows of six. */
const TEXT_COLORS = [
  '#3b3328','#211a11','#5a3e1a','#31594f','#2c3a58','#6b2737',
  '#2d4a2d','#ffffff','#f3ead3','#d9a0a8','#c9952e','transparent',
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

/** Toggle content between plain text and a bullet list. */
function toggleBulletList(el: TextElement, update: (id: string, patch: Partial<TextElement>) => void) {
  const isList = el.content.trimStart().startsWith('<ul');
  if (isList) {
    // strip <ul>/<li> tags to plain text
    const plain = el.content
      .replace(/<ul[^>]*>/gi, '')
      .replace(/<\/ul>/gi, '')
      .replace(/<li[^>]*>/gi, '')
      .replace(/<\/li>/gi, '\n')
      .replace(/<br\s*\/?>/gi, '')
      .trim();
    update(el.id, { content: plain });
  } else {
    // wrap in a <ul>
    const lines = el.content.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '').split('\n').filter(Boolean);
    const items = (lines.length ? lines : ['Item 1']).map((l) => `<li>${l.trim()}</li>`).join('');
    update(el.id, { content: `<ul>${items}</ul>` });
  }
}

/** Props panel for a selected text note element. */
export default function TextProps({ el }: { el: TextElement }) {
  const update     = useBoardStore((s) => s.updateElement);
  const deselect   = useAppStore((s) => s.deselect);
  const removeEl   = useBoardStore((s) => s.removeElement);
  const duplicate    = useBoardStore((s) => s.duplicateElement);
  const bringFront   = useBoardStore((s) => s.bringToFront);
  const bringForward = useBoardStore((s) => s.bringForward);
  const sendBackward = useBoardStore((s) => s.sendBackward);
  const sendBack     = useBoardStore((s) => s.sendToBack);

  const upd = (patch: Partial<TextElement>) => update(el.id, patch);
  const activeFrame = el.noteFrame || 'shadow';
  const isBulletList = el.content.trimStart().startsWith('<ul');
  const [colorTab, setColorTab] = useState<'text' | 'bg'>('text');

  return (
    <div className={styles.root}>
      <PropSection title="Transform" defaultOpen>
        <PropSlider label="Rotate" min={-180} max={180} value={Math.round(el.rotation ?? 0)} unit="°"
          onChange={(v) => upd({ rotation: v })} />
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
          <PropBtn active={el.bold}      onClick={() => upd({ bold:   !el.bold })}   title="Bold"><Bold size={IC} /></PropBtn>
          <PropBtn active={el.italic}    onClick={() => upd({ italic: !el.italic })} title="Italic"><Italic size={IC} /></PropBtn>
          <PropBtn active={isBulletList} onClick={() => toggleBulletList(el, update)} title="Bullet list"><List size={IC} /></PropBtn>
        </PropRow>
        <PropRow>
          <PropBtn active={(el.align || 'left') === 'left'}   onClick={() => upd({ align: 'left' })}   title="Align left"><AlignLeft size={IC} /></PropBtn>
          <PropBtn active={(el.align || 'left') === 'center'} onClick={() => upd({ align: 'center' })} title="Align center"><AlignCenter size={IC} /></PropBtn>
          <PropBtn active={(el.align || 'left') === 'right'}  onClick={() => upd({ align: 'right' })}  title="Align right"><AlignRight size={IC} /></PropBtn>
        </PropRow>

        {/* ── Colour tabs ── */}
        <div className={styles.colorTabs}>
          <button
            className={`${styles.colorTab} ${colorTab === 'text' ? styles.colorTabActive : ''}`}
            onClick={() => setColorTab('text')}
          >
            Text Color
          </button>
          <button
            className={`${styles.colorTab} ${colorTab === 'bg' ? styles.colorTabActive : ''}`}
            onClick={() => setColorTab('bg')}
          >
            Paper Color
          </button>
        </div>

        {colorTab === 'text' ? (
          <>
            <div className={styles.swatchRow}>
              {TEXT_COLORS.map((c) => (
                <div key={c}
                  className={`${styles.swatch} ${(el.color || '#3b3328') === c ? styles.swatchActive : ''}`}
                  style={{ background: c === 'transparent' ? 'none' : c, border: c === 'transparent' ? '1.5px dashed rgba(0,0,0,0.3)' : '1.5px solid rgba(0,0,0,0.12)' }}
                  onClick={() => upd({ color: c })}
                />
              ))}
            </div>
            <div className={styles.customRow}>
              <span className={styles.swatchLabel}>Custom</span>
              <input type="color" className={styles.colorInput} title="Pick a custom text colour"
                value={el.color?.startsWith('#') ? el.color : '#3b3328'}
                onChange={(e) => upd({ color: e.target.value })} />
            </div>
          </>
        ) : (
          <>
            <div className={styles.swatchRow}>
              {NOTE_BG_COLORS.map((c) => (
                <div key={c}
                  className={`${styles.swatch} ${(el.bg || '#fff9e6') === c ? styles.swatchActive : ''}`}
                  style={{ background: c === 'transparent' ? 'none' : c, border: c === 'transparent' ? '1.5px dashed rgba(0,0,0,0.3)' : '1.5px solid rgba(0,0,0,0.12)' }}
                  onClick={() => upd({ bg: c })}
                />
              ))}
            </div>
            <div className={styles.customRow}>
              <span className={styles.swatchLabel}>Custom</span>
              <input type="color" className={styles.colorInput} title="Pick a custom background colour"
                value={el.bg?.startsWith('#') ? el.bg : '#fff9e6'}
                onChange={(e) => upd({ bg: e.target.value })} />
            </div>
          </>
        )}
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
