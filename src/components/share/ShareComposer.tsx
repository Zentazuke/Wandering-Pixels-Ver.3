import { useCallback, useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { SHARE_FORMATS, DEFAULT_SHARE_PRIVACY, type ShareFormat, type SharePrivacy } from '../../types/share.js';
import { renderEntryShareImage, renderBoardShareImage } from '../../utils/share/exportShareImage.js';
import { shareOrDownload } from '../../utils/share/shareNative.js';
import useAppStore from '../../store/appStore.js';
import type { DiaryEntry } from '../../types/diary.js';
import type { Companion } from '../../types/companions.js';
import styles from './ShareComposer.module.css';

interface Props {
  /** Entry mode — the memory drawn as a designed card. */
  entry?:      DiaryEntry;
  companions?: Companion[];
  /** Board mode — a capture of the live board to fit into formats. */
  board?:      HTMLCanvasElement;
  onClose:     () => void;
}

const PRIVACY_LABELS: Partial<Record<keyof SharePrivacy, string>> = {
  hideText:     'Hide diary text',
  hideDate:     'Hide date',
  hideLocation: 'Hide place',
  hideNames:    'Hide names',
  watermark:    'Wandering Pixels watermark',
};

/** Format · privacy · preview · share — the one sanctioned way a memory
 *  leaves the device, always by the user's own hand. */
export default function ShareComposer({ entry, companions = [], board, onClose }: Props) {
  const isBoard = !!board;
  const [format, setFormat]   = useState<ShareFormat>(isBoard ? 'original' : 'portrait');
  const [privacy, setPrivacy] = useState<SharePrivacy>(DEFAULT_SHARE_PRIVACY);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy]       = useState(false);

  const render = useCallback(async (): Promise<Blob> => {
    if (board) return renderBoardShareImage(board, format, privacy);
    return renderEntryShareImage(entry!, format, privacy, companions);
  }, [board, entry, companions, format, privacy]);

  // live preview — re-render on every format/privacy change
  useEffect(() => {
    let alive = true;
    let url: string | null = null;
    render()
      .then((blob) => {
        if (!alive) return;
        url = URL.createObjectURL(blob);
        setPreview(url);
      })
      .catch(() => { if (alive) setPreview(null); });
    return () => { alive = false; if (url) URL.revokeObjectURL(url); };
  }, [render]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  async function share() {
    setBusy(true);
    try {
      const blob = await render();
      const outcome = await shareOrDownload(
        blob,
        `wandering-pixels-${format}-${Date.now()}.png`,
        entry?.field1 || 'A memory',
      );
      if (outcome === 'shared')     useAppStore.getState().showToast('Shared ✦', 'success');
      if (outcome === 'downloaded') useAppStore.getState().showToast('Image saved — share it anywhere', 'success');
    } catch {
      useAppStore.getState().showToast('Couldn\'t create the share image', 'error');
    } finally {
      setBusy(false);
    }
  }

  const toggles = (Object.keys(PRIVACY_LABELS) as (keyof SharePrivacy)[])
    .filter((k) => !isBoard || k === 'watermark'); // a board is already an image — only the mark applies

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true" aria-label="Share memory">
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <button className={styles.close} onClick={onClose} aria-label="Close"><X size={16} /></button>
        <h3 className={styles.title}>Share this {isBoard ? 'board' : 'memory'}</h3>

        <div className={styles.body}>
          <div className={styles.previewCol}>
            {preview
              ? <img className={styles.preview} src={preview} alt="Share preview" />
              : <div className={styles.previewLoading}>rendering…</div>}
          </div>

          <div className={styles.controls}>
            <span className={styles.groupLabel}>Format</span>
            <div className={styles.formats}>
              {SHARE_FORMATS
                .filter((f) => isBoard || f.format !== 'original')
                .map((f) => (
                  <button key={f.format}
                    className={`${styles.formatBtn} ${format === f.format ? styles.formatActive : ''}`}
                    onClick={() => setFormat(f.format)}>
                    {f.label}
                  </button>
                ))}
            </div>

            <span className={styles.groupLabel}>Privacy</span>
            <div className={styles.toggles}>
              {toggles.map((k) => (
                <label key={k} className={styles.toggle}>
                  <input type="checkbox" checked={privacy[k]}
                    onChange={() => setPrivacy({ ...privacy, [k]: !privacy[k] })} />
                  {PRIVACY_LABELS[k]}
                </label>
              ))}
            </div>

            <button className={styles.shareBtn} onClick={share} disabled={busy || !preview}>
              {busy ? 'Preparing…' : '✦ Share / save image'}
            </button>
            <p className={styles.note}>Nothing leaves your device until you share it.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
