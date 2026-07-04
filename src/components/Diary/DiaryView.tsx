import { useEffect, useRef, useState } from 'react';
import { ImagePlus, RefreshCw, X } from 'lucide-react';
import useAppStore from '../../store/appStore.js';
import { dbSave, dbLoad, dbDelete, dbGetByPrefix } from '../../db/boardDB.js';
import { ensurePersistentStorage } from '../../db/persistentStorage.js';
import { LABELS } from './diaryLabels.js';
import { findOnThisDay, type Memory } from '../../utils/onThisDay.js';
import MemoryViewer from '../Archive/MemoryViewer.jsx';
import type { DiaryEntry } from '../Archive/ArchiveView.jsx';
import styles from './DiaryView.module.css';

// Draft key must NOT start with 'diary-' — ArchiveView lists entries via
// dbGetByPrefix('diary-') and a draft must never show up as a real entry.
const DRAFT_KEY = 'draft-diary';

interface DiaryDraft {
  field1:     string;
  field2:     string;
  field3:     string;
  reflection: string;
  photo:      string | null;
  photoPos?:  { x: number; y: number };
}

const CENTERED = { x: 50, y: 50 };

function todayStr(): string {
  return new Date().toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
}

/**
 * Read an image file and downscale it so a longest side > 1400px doesn't
 * bloat IndexedDB — diary photos are keepsakes, not print masters.
 */
function readAndResize(file: File, maxDim = 1400): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.naturalWidth, img.naturalHeight));
        if (scale === 1) { resolve(reader.result as string); return; }
        const canvas  = document.createElement('canvas');
        canvas.width  = Math.round(img.naturalWidth  * scale);
        canvas.height = Math.round(img.naturalHeight * scale);
        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/** Mode-aware journal entry — info fields on the left, photo on the right. */
export default function DiaryView() {
  const mode = useAppStore((s) => s.mode);

  const [field1, setField1]  = useState('');
  const [field2, setField2]  = useState('');
  const [field3, setField3]  = useState('');
  const [reflection, setRef] = useState('');
  const [photo, setPhoto]       = useState<string | null>(null);
  const [photoPos, setPhotoPos] = useState(CENTERED);
  const [saved, setSaved]       = useState(false);
  const [memories, setMemories]       = useState<Memory[]>([]);
  const [memoryIndex, setMemoryIndex] = useState<number | null>(null);
  const fileRef     = useRef<HTMLInputElement>(null);
  const draftLoaded = useRef(false);
  // Live drag state — a ref so pointer moves don't re-render until the position changes
  const dragRef = useRef<{ startX: number; startY: number; posX: number; posY: number } | null>(null);

  // Restore an unsaved draft on mount — a diary must never eat someone's writing.
  useEffect(() => {
    dbLoad<DiaryDraft>(DRAFT_KEY)
      .then((d) => {
        if (!d) return;
        setField1(d.field1 ?? '');
        setField2(d.field2 ?? '');
        setField3(d.field3 ?? '');
        setRef(d.reflection ?? '');
        setPhoto(d.photo ?? null);
        setPhotoPos(d.photoPos ?? CENTERED);
      })
      .catch(() => {}) // a failed read just means no restore
      .finally(() => { draftLoaded.current = true; });
  }, []);

  // "On this day" — resurface entries from a year / six months / a month ago
  useEffect(() => {
    dbGetByPrefix('diary-')
      .then(({ vals }) => setMemories(findOnThisDay((vals as DiaryEntry[]).filter((e) => e && e.id))))
      .catch(() => {}); // no memories is fine
  }, []);

  // Debounced draft autosave (800ms, same rhythm as board persistence).
  // Guarded until the restore resolves so the empty mount state can't
  // overwrite an existing draft (see loadedRef bug in the captain's log).
  useEffect(() => {
    if (!draftLoaded.current) return;
    const t = setTimeout(() => {
      if (!field1 && !field2 && !field3 && !reflection && !photo) {
        dbDelete(DRAFT_KEY).catch(() => {});
        return;
      }
      dbSave(DRAFT_KEY, { field1, field2, field3, reflection, photo, photoPos }).catch(() => {});
    }, 800);
    return () => clearTimeout(t);
  }, [field1, field2, field3, reflection, photo, photoPos]);

  async function handleFile(file: File | undefined) {
    if (!file || !file.type.startsWith('image/')) return;
    try {
      setPhoto(await readAndResize(file));
      setPhotoPos(CENTERED); // a fresh photo starts centered
    } catch {
      useAppStore.getState().showToast('Couldn\'t read that image', 'error');
    }
  }

  // ── Drag to reframe — the photo is cropped to 4:5, dragging shifts which
  //    part shows. Pixel-accurate: 1px of mouse = 1px of image, mapped onto
  //    the object-position % across the cover overflow.
  function photoDragStart(e: React.PointerEvent<HTMLImageElement>) {
    e.preventDefault();
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* synthetic pointers */ }
    dragRef.current = { startX: e.clientX, startY: e.clientY, posX: photoPos.x, posY: photoPos.y };
  }

  function photoDragMove(e: React.PointerEvent<HTMLImageElement>) {
    const drag = dragRef.current;
    if (!drag) return;
    const img  = e.currentTarget;
    const rect = img.getBoundingClientRect();
    const { naturalWidth: nw, naturalHeight: nh } = img;
    if (!nw || !nh) return;
    const scale     = Math.max(rect.width / nw, rect.height / nh);
    const overflowX = nw * scale - rect.width;
    const overflowY = nh * scale - rect.height;
    const nx = overflowX > 1 ? drag.posX - ((e.clientX - drag.startX) / overflowX) * 100 : drag.posX;
    const ny = overflowY > 1 ? drag.posY - ((e.clientY - drag.startY) / overflowY) * 100 : drag.posY;
    setPhotoPos({ x: Math.min(100, Math.max(0, nx)), y: Math.min(100, Math.max(0, ny)) });
  }

  function photoDragEnd() {
    dragRef.current = null;
  }

  async function save() {
    const entry = {
      id: `diary-${Date.now()}`,
      date: new Date().toISOString(),
      mode, field1, field2, field3, reflection,
      photo,
      photoPos: photo ? photoPos : undefined,
    };
    try {
      await dbSave(entry.id, entry);
      // First real entry saved — ask the browser to shield the diary from
      // storage eviction (fire-and-forget, inside the user-gesture chain).
      ensurePersistentStorage();
      // The entry is safe in the archive — the draft has done its job.
      // (Fields stay on screen; editing again simply starts a new draft.)
      dbDelete(DRAFT_KEY).catch(() => {});
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      useAppStore.getState().showToast('Couldn\'t save entry — storage may be full', 'error');
    }
  }

  const labels = LABELS[mode] || LABELS.default;

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <div className={styles.date}>{todayStr()}</div>
        <h2 className={styles.heading}>Journal Entry</h2>

        {/* ── On this day — a memory resurfaces above the fresh page ── */}
        {memories.length > 0 && (
          <button className={styles.onThisDay} onClick={() => setMemoryIndex(0)}>
            <span className={styles.otdBadge} aria-hidden="true">✦</span>
            <span className={styles.otdLabel}>{memories[0].label}</span>
            <span className={styles.otdTitle}>
              {memories[0].entry.field1 || 'read the entry'}
            </span>
            {memories.length > 1 && <span className={styles.otdMore}>+{memories.length - 1} more</span>}
          </button>
        )}

        <div className={styles.layout}>
          {/* ── Left: photo — the first thing you do ── */}
          <div className={styles.photoCol}>
            <label className={styles.label}>Photo</label>

            {photo ? (
              <div className={styles.photoFrame}>
                <img
                  src={photo}
                  className={styles.photoImg}
                  alt="Diary entry"
                  draggable={false}
                  title="Drag to reframe"
                  style={{ objectPosition: `${photoPos.x}% ${photoPos.y}%` }}
                  onPointerDown={photoDragStart}
                  onPointerMove={photoDragMove}
                  onPointerUp={photoDragEnd}
                  onPointerCancel={photoDragEnd}
                />
                <div className={styles.photoActions}>
                  <button className={styles.photoBtn} onClick={() => fileRef.current?.click()} title="Replace photo">
                    <RefreshCw size={13} /> Replace
                  </button>
                  <button className={`${styles.photoBtn} ${styles.photoBtnDanger}`} onClick={() => setPhoto(null)} title="Remove photo">
                    <X size={13} /> Remove
                  </button>
                </div>
              </div>
            ) : (
              <button
                className={styles.dropZone}
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files?.[0]); }}
              >
                <ImagePlus size={28} />
                <span className={styles.dropTitle}>Add a photo</span>
                <span className={styles.dropHint}>Click to browse or drag an image here</span>
              </button>
            )}

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => { handleFile(e.target.files?.[0]); e.target.value = ''; }}
            />
          </div>

          {/* ── Right: info fields ── */}
          <div className={styles.fields}>
            <label className={styles.label}>{labels.label1}</label>
            <input  className={styles.input}    placeholder={labels.ph1} value={field1} onChange={(e) => setField1(e.target.value)} />

            <label className={styles.label}>{labels.label2}</label>
            <input  className={styles.input}    placeholder={labels.ph2} value={field2} onChange={(e) => setField2(e.target.value)} />

            <label className={styles.label}>{labels.label3}</label>
            <input  className={styles.input}    placeholder={labels.ph3} value={field3} onChange={(e) => setField3(e.target.value)} />
          </div>
        </div>

        {/* ── The entry itself — full-width ruled writing surface ── */}
        <div className={styles.entrySection}>
          <label className={styles.label} htmlFor="diary-entry">Entry</label>
          <textarea
            id="diary-entry"
            className={styles.entryArea}
            placeholder={labels.reflectionPh}
            value={reflection}
            onChange={(e) => setRef(e.target.value)}
          />
        </div>

        <button className={`${styles.saveBtn} ${saved ? styles.saveBtnDone : ''}`} onClick={save}>
          {saved ? '✦ Saved' : 'Save Entry'}
        </button>
      </div>

      {memoryIndex !== null && (
        <MemoryViewer
          entries={memories.map((m) => m.entry)}
          index={memoryIndex}
          onClose={() => setMemoryIndex(null)}
          onNavigate={setMemoryIndex}
        />
      )}
    </div>
  );
}
