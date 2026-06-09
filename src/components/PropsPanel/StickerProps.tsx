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
            value={el.customColor?.startsWith('#') ? el.customColor : '#A6802B'}
            onChange={(e) => upd({ customColor: e.target.value })}
          />
        </PropRow>
      </PropSection>
    </div>
  );
}
