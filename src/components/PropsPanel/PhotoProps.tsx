import { useRef } from 'react';
import { BringToFront, SendToBack, Copy, Trash2, FolderOpen } from 'lucide-react';

const IC = 13;
import useBoardStore from '../../store/boardStore.js';
import useAppStore from '../../store/appStore.js';
import { FILTER_PRESETS } from '../../constants/filterPresets.js';
import { FRAMES } from '../../constants/frames.js';
import { SHAPES } from '../../constants/shapes.js';
import PropSection from './PropSection.jsx';
import { PropRow, PropSlider, PropBtn } from './PropRow.jsx';
import type { PhotoElement, Shape } from '../../types/index.js';
import type { Frame } from '../../constants/frames.js';
import styles from './PhotoProps.module.css';

const FRAME_REMAP: Record<string, string> = {
  dark:'polaroid', navy:'polaroid', sage:'polaroid', rose:'polaroid',
  kraft:'vintage', black:'thick', rounded:'none', round14:'none',
};
const FRAME_COLOR_SWATCHES = ['#ffffff','#f0e6cc','#faf6ee','#1a1712','#0a0806','#0c1426','#e8ede4','#fce4ec','#c4973a','#111111'];
const NO_COLOR_FRAMES = new Set(['none','shadow','burned']);

/** Props panel for a selected photo element. */
export default function PhotoProps({ el }: { el: PhotoElement }) {
  const update     = useBoardStore((s) => s.updateElement);
  const deselect   = useAppStore((s) => s.deselect);
  const removeEl   = useBoardStore((s) => s.removeElement);
  const duplicate  = useBoardStore((s) => s.duplicateElement);
  const bringFront = useBoardStore((s) => s.bringToFront);
  const sendBack   = useBoardStore((s) => s.sendToBack);
  const replaceRef = useRef<HTMLInputElement>(null);

  const upd = (patch: Partial<PhotoElement>) => update(el.id, patch);
  const frameKey    = FRAME_REMAP[el.frame ?? ''] || el.frame || 'polaroid';
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
    reader.onload = (ev) => upd({ src: ev.target!.result as string });
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  return (
    <div className={styles.root}>
      <PropSection title="Transform" defaultOpen>
        <PropSlider label="Rotate" min={-180} max={180} value={Math.round(el.rotation ?? 0)} unit="°"
          onChange={(v) => upd({ rotation: v })} />
        <PropRow>
          <PropBtn onClick={() => bringFront(el.id)} title="Bring to front"><BringToFront size={IC} /></PropBtn>
          <PropBtn onClick={() => sendBack(el.id)}   title="Send to back"><SendToBack size={IC} /></PropBtn>
          <PropBtn onClick={() => duplicate(el.id)}  title="Duplicate"><Copy size={IC} /></PropBtn>
        </PropRow>
        <PropRow>
          <PropBtn danger onClick={() => { deselect(); removeEl(el.id); }} style={{ flex: 1 }} title="Delete"><Trash2 size={IC} /></PropBtn>
        </PropRow>
      </PropSection>

      <PropSection title="Orientation & Crop" defaultOpen>
        <PropRow>
          <PropBtn active={el.flipH} onClick={() => upd({ flipH: !el.flipH })}>⇔ Flip H</PropBtn>
          <PropBtn active={el.flipV} onClick={() => upd({ flipV: !el.flipV })}>⇕ Flip V</PropBtn>
        </PropRow>
        <PropRow>
          <PropBtn style={{ flex: 1 }} onClick={() => replaceRef.current?.click()}><FolderOpen size={IC} />&nbsp;Replace</PropBtn>
          <input ref={replaceRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleReplace} />
        </PropRow>
        <PropSlider label="Zoom"   min={100} max={300} value={Math.round((el.imgZoom ?? 1) * 100)} unit="%"
          onChange={(v) => upd({ imgZoom: v / 100 })} />
        <PropSlider label="Crop X" min={0}   max={100} value={el.imgX ?? 50} unit="%"
          onChange={(v) => upd({ imgX: v })} />
        <PropSlider label="Crop Y" min={0}   max={100} value={el.imgY ?? 50} unit="%"
          onChange={(v) => upd({ imgY: v })} />
        <PropRow label="Width">
          <input className={styles.numInput} type="number" min={60} max={700}
            value={el.w} onChange={(e) => upd({ w: Number(e.target.value) })} />
        </PropRow>
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
            <FrameBtn key={fid} fid={fid} fr={fr} el={el} active={frameKey === fid} onClick={() => upd({ frame: fid })} />
          ))}
        </div>

        {!NO_COLOR_FRAMES.has(frameKey) && (
          <>
            <div className={styles.swatchLabel}>Border Color</div>
            <div className={styles.swatchRow}>
              {FRAME_COLOR_SWATCHES.map((c) => (
                <div
                  key={c}
                  className={`${styles.swatch} ${(el.frameColor || FRAMES[frameKey]?.bg) === c ? styles.swatchActive : ''}`}
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

        <PropRow label="Caption">
          <input className={styles.textInput} type="text" maxLength={60}
            placeholder="Add caption…" value={el.caption || ''}
            onChange={(e) => upd({ caption: e.target.value })} />
        </PropRow>
        <PropRow label="Shadow">
          <input type="checkbox" checked={el.shadow !== false}
            onChange={(e) => upd({ shadow: e.target.checked })} />
        </PropRow>
      </PropSection>

      <PropSection title="Caption Style">
        <PropSlider label="Size" min={7} max={24} value={el.captionSize ?? 11} unit="px"
          onChange={(v) => upd({ captionSize: v })} />
        <PropRow label="Color">
          <input type="color" value={el.captionColor ?? '#3b3328'}
            onChange={(e) => upd({ captionColor: e.target.value })} />
        </PropRow>
        <PropRow>
          <PropBtn active={el.captionBold}              onClick={() => upd({ captionBold:   !el.captionBold })}><b>B</b></PropBtn>
          <PropBtn active={el.captionItalic !== false}  onClick={() => upd({ captionItalic: !el.captionItalic })}><i>I</i></PropBtn>
        </PropRow>
      </PropSection>
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

const LABEL_MAP: Record<string, string> = {
  none:'None', polaroid:'Polaroid', vintage:'Vintage', thick:'Thick', thin:'Thin',
  double:'Double', shadow:'Shadow', painting:'Painting', burned:'Burned',
  comic:'Comic', torn:'Torn', filmstrip:'Film', stamp:'Stamp',
};

function FrameBtn({ fid, fr, el, active, onClick }: { fid: string; fr: Frame; el: PhotoElement; active: boolean; onClick: () => void }) {
  const THUMB = 46;
  const isFrameless = fid === 'none';
  const padNum  = Math.min(parseInt(fr.pt) || 0, 8);
  const frameBg = (active && el.frameColor) ? el.frameColor : fr.bg;
  const shadow  = fr.shadowOnly ? '0 4px 16px rgba(0,0,0,0.4)' : isFrameless ? 'none' : '2px 3px 8px rgba(0,0,0,0.22)';
  const label   = LABEL_MAP[fid] || fid;

  return (
    <button className={`${styles.frameBtn} ${active ? styles.btnActive : ''}`} onClick={onClick} title={label}>
      <div className={styles.framePrev} style={{
        background: frameBg, padding: isFrameless ? 0 : padNum,
        borderRadius: fr.br, boxShadow: shadow,
      }}>
        <img src={el.thumb || el.src} decoding="async" draggable={false}
          style={{ width: THUMB, height: THUMB, objectFit: 'cover', display: 'block', borderRadius: fr.br === '0px' ? 0 : fr.br }} />
        {fr.capColor && (
          <div style={{ fontSize: 7, textAlign: 'center', fontFamily: fr.capFont, color: fr.capColor, padding: '2px 0' }}>
            {label}
          </div>
        )}
      </div>
      <span>{label}</span>
    </button>
  );
}
