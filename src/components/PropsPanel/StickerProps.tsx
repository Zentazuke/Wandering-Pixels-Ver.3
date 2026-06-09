import useBoardStore from '../../store/boardStore.js';
import useAppStore from '../../store/appStore.js';
import PropSection from './PropSection.jsx';
import { PropRow, PropSlider, PropBtn } from './PropRow.jsx';
import type { StickerElement } from '../../types';

const STICKER_COLORS: (string | null)[] = [
  null,
  '#EF9F27','#E24B4A','#D85A30','#1D9E75','#7F77DD','#378ADD',
  '#2e2416','#ffffff','#b5943a','#39ff9f',
];

/** Props panel for a selected sticker element. */
export default function StickerProps({ el }: { el: StickerElement }) {
  const update     = useBoardStore((s) => s.updateElement);
  const deselect   = useAppStore((s) => s.deselect);
  const removeEl   = useBoardStore((s) => s.removeElement);
  const duplicate  = useBoardStore((s) => s.duplicateElement);
  const bringFront = useBoardStore((s) => s.bringToFront);
  const sendBack   = useBoardStore((s) => s.sendToBack);

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
          <PropBtn onClick={() => bringFront(el.id)}>Front</PropBtn>
          <PropBtn onClick={() => sendBack(el.id)}>Back</PropBtn>
          <PropBtn onClick={() => duplicate(el.id)}>Copy</PropBtn>
        </PropRow>
        <PropRow>
          <PropBtn danger onClick={() => { deselect(); removeEl(el.id); }} style={{ flex: 1 }}>Delete</PropBtn>
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
                width: 18, height: 18, borderRadius: 3, cursor: 'pointer',
                background: c || 'conic-gradient(red,yellow,lime,cyan,blue,magenta,red)',
                border: `1.5px solid ${(el.customColor ?? null) === c ? 'var(--gold)' : 'rgba(0,0,0,0.12)'}`,
                outline: (el.customColor ?? null) === c ? '2px solid var(--gold)' : 'none',
                outlineOffset: 1,
              }}
            />
          ))}
          <input
            type="color"
            style={{ width: 22, height: 22, border: 'none', borderRadius: 3, padding: 0, cursor: 'pointer' }}
            value={el.customColor?.startsWith('#') ? el.customColor : '#b5943a'}
            onChange={(e) => upd({ customColor: e.target.value })}
          />
        </PropRow>
      </PropSection>
    </div>
  );
}
