import { useRef } from 'react';
import { BringToFront, ChevronsUp, ChevronsDown, SendToBack, FolderOpen } from 'lucide-react';

const IC = 13;
import useBoardStore from '../../store/boardStore.js';
import useAppStore from '../../store/appStore.js';
import { makeThumb } from '../../utils/imageThumb.js';
import { FILTER_PRESETS } from '../../constants/filterPresets.js';
import { FRAMES, resolveFrame } from '../../constants/frames.js';
import { SHAPES } from '../../constants/shapes.js';
import PropSection from './PropSection.jsx';
import { PropRow, PropSlider, PropBtn, ElementActions } from './PropRow.jsx';
import type { PhotoElement } from '../../types/index.js';
import type { Shape } from '../../constants/shapes.js';
import type { Frame } from '../../constants/frames.js';
import styles from './PhotoProps.module.css';
/* Atelier mats — papers, deep inks, and muted pigments. One of each,
   no near-duplicates. 11 swatches + the custom well = two clean rows of 6. */
const FRAME_COLOR_SWATCHES = [
  '#ffffff', '#f3ead3', '#c9b795', '#211a11', '#0e1320', '#31594f',
  '#9caf97', '#5e6e8c', '#d9a0a8', '#c77e5e', '#c9952e',
];
const NO_COLOR_FRAMES = new Set(['none','burned']);

/** Props panel for a selected photo element. */
export default function PhotoProps({ el }: { el: PhotoElement }) {
  const update     = useBoardStore((s) => s.updateElement);
  const deselect   = useAppStore((s) => s.deselect);
  const removeEl   = useBoardStore((s) => s.removeElement);
  const duplicate    = useBoardStore((s) => s.duplicateElement);
  const bringFront   = useBoardStore((s) => s.bringToFront);
  const bringForward = useBoardStore((s) => s.bringForward);
  const sendBackward = useBoardStore((s) => s.sendBackward);
  const sendBack     = useBoardStore((s) => s.sendToBack);
  const replaceRef = useRef<HTMLInputElement>(null);

  const upd = (patch: Partial<PhotoElement>) => update(el.id, patch);
  const rf          = resolveFrame(el);
  const activeShape = el.shape || 'square';

  const activePreset = FILTER_PRESETS.find(
    (p) => p.br === (el.br??100) && p.co === (el.co??100) && p.sa === (el.sa??100) && p.se === (el.se??0)
  )?.name || '';

  function applyPreset(p: typeof FILTER_PRESETS[number]) {
    upd({ br: p.br, co: p.co, sa: p.sa, bl: p.bl, se: p.se, hr: p.hr, iv: p.iv, op: p.op });
  }

  function resetFilters() {
    upd({ br: 100, co: 100, sa: 100, bl: 0, se: 0, hr: 0, iv: 0, op: 100 });
  }

  function handleReplace(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const src = ev.target!.result as string;
      // Regenerate the panel thumb alongside the new source
      const thumb = await makeThumb(src).catch(() => undefined);
      upd({ src, thumb });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  return (
    <div className={styles.root}>
      <ElementActions
        onDuplicate={() => duplicate(el.id)}
        onDelete={() => { deselect(); removeEl(el.id); }}
      >
        <PropBtn onClick={() => replaceRef.current?.click()} title="Replace photo"><FolderOpen size={IC} /></PropBtn>
        <input ref={replaceRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleReplace} />
      </ElementActions>

      <PropSection title="Arrange" defaultOpen>
        <PropSlider label="Rotate" min={-180} max={180} value={Math.round(el.rotation ?? 0)} unit="°"
          onChange={(v) => upd({ rotation: v })} />
        <PropRow label="Width">
          <input className={styles.numInput} type="number" min={60} max={700}
            value={el.w} onChange={(e) => upd({ w: Number(e.target.value) })} />
        </PropRow>
        <PropRow>
          <PropBtn onClick={() => bringFront(el.id)}   title="Bring to front"><BringToFront size={IC} /></PropBtn>
          <PropBtn onClick={() => bringForward(el.id)} title="Move forward one layer"><ChevronsUp size={IC} /></PropBtn>
          <PropBtn onClick={() => sendBackward(el.id)} title="Move back one layer"><ChevronsDown size={IC} /></PropBtn>
          <PropBtn onClick={() => sendBack(el.id)}     title="Send to back"><SendToBack size={IC} /></PropBtn>
        </PropRow>
      </PropSection>

      <PropSection title="Orientation & Crop" defaultOpen>
        <PropRow>
          <PropBtn active={el.flipH} onClick={() => upd({ flipH: !el.flipH })}>⇔ Flip H</PropBtn>
          <PropBtn active={el.flipV} onClick={() => upd({ flipV: !el.flipV })}>⇕ Flip V</PropBtn>
        </PropRow>
        <PropSlider label="Zoom"   min={100} max={300} value={Math.round((el.imgZoom ?? 1) * 100)} unit="%"
          onChange={(v) => upd({ imgZoom: v / 100 })} />
        <PropSlider label="Crop X" min={0}   max={100} value={el.imgX ?? 50} unit="%"
          onChange={(v) => upd({ imgX: v })} />
        <PropSlider label="Crop Y" min={0}   max={100} value={el.imgY ?? 50} unit="%"
          onChange={(v) => upd({ imgY: v })} />
      </PropSection>

      <PropSection title="Filter Presets">
        <div className={styles.presetGrid}>
          {FILTER_PRESETS.map((p) => {
            const f = `brightness(${p.br}%) contrast(${p.co}%) saturate(${p.sa}%) blur(${p.bl}px) sepia(${p.se}%) hue-rotate(${p.hr}deg) invert(${p.iv}%) opacity(${p.op / 100})`;
            return (
              <div
                key={p.name}
                className={`${styles.preset} ${activePreset === p.name ? styles.presetActive : ''}`}
                onClick={() => applyPreset(p)}
                title={p.name}
              >
                <img src={el.thumb || el.src} decoding="async" style={{ filter: f }} draggable={false} />
                <span>{p.name}</span>
              </div>
            );
          })}
        </div>
        <PropBtn style={{ width: '100%' }} onClick={resetFilters}>Reset</PropBtn>
      </PropSection>

      <PropSection title="Adjustments">
        <PropSlider label="Bright"   min={0}   max={200} value={el.br ?? 100} onChange={(v) => upd({ br: v })} />
        <PropSlider label="Contrast" min={0}   max={200} value={el.co ?? 100} onChange={(v) => upd({ co: v })} />
        <PropSlider label="Saturate" min={0}   max={200} value={el.sa ?? 100} onChange={(v) => upd({ sa: v })} />
        <PropSlider label="Blur"     min={0}   max={20}  step={0.5} value={el.bl ?? 0} onChange={(v) => upd({ bl: v })} />
        <PropSlider label="Sepia"    min={0}   max={100} value={el.se ?? 0}   onChange={(v) => upd({ se: v })} />
        <PropSlider label="Hue"      min={0}   max={360} value={el.hr ?? 0}   onChange={(v) => upd({ hr: v })} />
        <PropSlider label="Invert"   min={0}   max={100} value={el.iv ?? 0}   onChange={(v) => upd({ iv: v })} />
        <PropSlider label="Opacity"  min={10}  max={100} value={el.op ?? 100} unit="%" onChange={(v) => upd({ op: v })} />
      </PropSection>

      <PropSection title="Shape">
        <div className={styles.shapeGrid}>
          {Object.entries(SHAPES).map(([sid, sh]) => (
            <ShapeBtn key={sid} sid={sid} sh={sh} active={activeShape === sid} onClick={() => upd({ shape: sid })} />
          ))}
        </div>
      </PropSection>

      <PropSection title="Frame" defaultOpen>
        <div className={styles.frameGrid}>
          {Object.entries(FRAMES).map(([fid, fr]) => (
            <FrameBtn key={fid} fid={fid} fr={fr} el={el} active={rf.key === fid} onClick={() => upd({ frame: fid })} />
          ))}
        </div>

        {rf.key !== 'none' && (
          <>
            <PropSlider label="Width"   min={0} max={40} value={rf.w}      unit="px"
              onChange={(v) => upd({ frameW: v })} />
            <PropSlider label="Tail"    min={0} max={48} value={rf.tail}   unit="px"
              onChange={(v) => upd({ frameTail: v })} />
            <PropSlider label="Corners" min={0} max={24} value={rf.radius} unit="px"
              onChange={(v) => upd({ frameRadius: v })} />
            <PropRow>
              <PropBtn active={rf.double} onClick={() => upd({ frameDouble: !rf.double })}>Double ring</PropBtn>
            </PropRow>
          </>
        )}

        {!NO_COLOR_FRAMES.has(rf.key) && (
          <>
            <div className={styles.swatchLabel}>Border Color</div>
            <div className={styles.swatchRow}>
              {FRAME_COLOR_SWATCHES.map((c) => (
                <div
                  key={c}
                  className={`${styles.swatch} ${(el.frameColor || rf.bg) === c ? styles.swatchActive : ''}`}
                  style={{ background: c }}
                  onClick={() => upd({ frameColor: c })}
                />
              ))}
              <input type="color" className={styles.colorInput}
                value={el.frameColor?.startsWith('#') ? el.frameColor : '#ffffff'}
                onChange={(e) => upd({ frameColor: e.target.value })} />
            </div>
          </>
        )}

        <PropRow>
          <PropBtn active={el.shadow !== false} onClick={() => upd({ shadow: el.shadow === false })}>
            Shadow
          </PropBtn>
        </PropRow>
      </PropSection>

      {/* Hidden for archetypes with no caption area (None, Torn, Burned) */}
      {rf.capColor !== '' && (
        <PropSection title="Caption">
          <PropRow label="Text">
            <input className={styles.textInput} type="text" maxLength={60}
              placeholder="Add caption…" value={el.caption || ''}
              onChange={(e) => upd({ caption: e.target.value })} />
          </PropRow>
          <PropSlider label="Size" min={7} max={24} value={el.captionSize ?? 11} unit="px"
            onChange={(v) => upd({ captionSize: v })} />
          <PropRow label="Color">
            <input type="color" className={styles.colorInput} value={el.captionColor ?? '#3b3328'}
              onChange={(e) => upd({ captionColor: e.target.value })} />
          </PropRow>
          <PropRow>
            <PropBtn active={el.captionBold}              onClick={() => upd({ captionBold:   !el.captionBold })}><b>B</b></PropBtn>
            <PropBtn active={el.captionItalic !== false}  onClick={() => upd({ captionItalic: !el.captionItalic })}><i>I</i></PropBtn>
          </PropRow>
        </PropSection>
      )}
    </div>
  );
}

function ShapeBtn({ sid, sh, active, onClick }: { sid: string; sh: Shape; active: boolean; onClick: () => void }) {
  return (
    <button className={`${styles.shapeBtn} ${active ? styles.btnActive : ''}`} onClick={onClick} title={sh.label}>
      {sh.svgPath ? (
        <svg width="32" height="32" viewBox="0 0 1 1">
          <defs>
            <linearGradient id={`sg-${sid}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#c4a050" />
              <stop offset="100%" stopColor="#8a6820" />
            </linearGradient>
          </defs>
          <path d={sh.svgPath} fill={`url(#sg-${sid})`} />
        </svg>
      ) : (
        <div style={{
          width: 32, height: 32,
          background: 'linear-gradient(135deg,#c4a050,#8a6820)',
          borderRadius: sh.br,
          clipPath: sh.clipPath ?? undefined,
        }} />
      )}
      <span>{sh.label}</span>
    </button>
  );
}

function FrameBtn({ fid, fr, el, active, onClick }: { fid: string; fr: Frame; el: PhotoElement; active: boolean; onClick: () => void }) {
  const THUMB = 46;
  const isFrameless = fid === 'none';
  const padNum  = Math.min(fr.defaultW, 8);
  const padBtm  = Math.min(fr.defaultW + fr.defaultTail, 14);
  const frameBg = (active && el.frameColor) ? el.frameColor : fr.bg;
  const shadow  = isFrameless ? 'none' : '2px 3px 8px rgba(0,0,0,0.22)';

  return (
    <button className={`${styles.frameBtn} ${active ? styles.btnActive : ''}`} onClick={onClick} title={fr.label}>
      <div className={styles.framePrev} style={{
        background: frameBg,
        padding: isFrameless ? 0 : `${padNum}px ${padNum}px ${padBtm}px ${padNum}px`,
        borderRadius: fr.defaultRadius ?? 0, boxShadow: shadow,
      }}>
        <img src={el.thumb || el.src} decoding="async" draggable={false}
          style={{ width: THUMB, height: THUMB, objectFit: 'cover', display: 'block' }} />
        {fr.capColor && (
          <div style={{ fontSize: 7, textAlign: 'center', fontFamily: fr.capFont, color: fr.capColor, padding: '2px 0' }}>
            {fr.label}
          </div>
        )}
      </div>
      <span>{fr.label}</span>
    </button>
  );
}
