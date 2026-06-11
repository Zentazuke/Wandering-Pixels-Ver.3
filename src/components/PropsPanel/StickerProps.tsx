import { BringToFront, ChevronsUp, ChevronsDown, SendToBack, Copy, Trash2 } from 'lucide-react';
import useBoardStore from '../../store/boardStore.js';
import useAppStore from '../../store/appStore.js';
import PropSection from './PropSection.jsx';
import { PropRow, PropSlider, PropBtn } from './PropRow.jsx';
import type { StickerElement } from '../../types';

const IC = 13;

/* null = original sticker colors; tints follow the atelier palette. */
const STICKER_COLORS: (string | null)[] = [
  null,
  '#c9952e','#c77e5e','#6b2737','#31594f','#9caf97','#5e6e8c',
  '#2c3a58','#211a11','#d9a0a8','#f3ead3','#ffffff',
];

/** Props panel for a selected sticker element. */
export default function StickerProps({ el }: { el: StickerElement }) {
  const update     = useBoardStore((s) => s.updateElement);
  const deselect   = useAppStore((s) => s.deselect);
  const removeEl   = useBoardStore((s) => s.removeElement);
  const duplicate    = useBoardStore((s) => s.duplicateElement);
  const bringFront   = useBoardStore((s) => s.bringToFront);
  const bringForward = useBoardStore((s) => s.bringForward);
  const sendBackward = useBoardStore((s) => s.sendBackward);
  const sendBack     = useBoardStore((s) => s.sendToBack);

  const upd = (patch: Partial<StickerElement>) => update(el.id, patch);

  return (
    <div style={{ paddingBottom: 24 }}>
      <PropSection title="Transform" defaultOpen>
        <PropSlider label="Rotate"  min={-180} max={180} value={Math.round(el.rotation ?? 0)} unit="°"
          onChange={(v) => upd({ rotation: v })} />
        <PropSlider label="Size"    min={24}   max={240} value={el.w} unit="px"
          onChange={(v) => upd({ w: v, h: v })} />
        <PropSlider label="Opacity" min={10}   max={100} value={el.opacity ?? 100} unit="%"
          onChange={(v) => upd({ opacity: v })} />
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

      <PropSection title="Colour" defaultOpen>
        <PropRow wrap>
          {STICKER_COLORS.map((c, i) => (
            <div
              key={i}
              title={c ?? 'Original'}
              onClick={() => upd({ customColor: c ?? undefined })}
              style={{
                width: 22, height: 22,
                borderRadius: '50%',
                cursor: 'pointer',
                flexShrink: 0,
                background: c || 'conic-gradient(red,yellow,lime,cyan,blue,magenta,red)',
                border: '1.5px solid rgba(0,0,0,0.1)',
                outline: (el.customColor ?? null) === c ? '2px solid var(--gold)' : '2px solid transparent',
                outlineOffset: 2,
                transition: 'outline-color 0.28s cubic-bezier(0.16,1,0.3,1), transform 0.28s cubic-bezier(0.16,1,0.3,1)',
              }}
            />
          ))}
          <input
            type="color"
            style={{
              width: 28, height: 28,
              border: '1.5px solid rgba(102,90,75,0.12)',
              borderRadius: '50%',
              padding: 1,
              cursor: 'pointer',
              background: 'none',
            }}
            value={el.customColor?.startsWith('#') ? el.customColor : '#A8741A'}
            onChange={(e) => upd({ customColor: e.target.value })}
          />
        </PropRow>
      </PropSection>
    </div>
  );
}
