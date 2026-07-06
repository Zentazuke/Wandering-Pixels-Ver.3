import { useEffect, useRef, useState } from 'react';
import { ImagePlus, RefreshCw, Shuffle, X } from 'lucide-react';
import useAppStore from '../../store/appStore.js';
import { dbSave, dbLoad, dbDelete, dbGetByPrefix } from '../../db/boardDB.js';
import { ensurePersistentStorage } from '../../db/persistentStorage.js';
import { LABELS } from './diaryLabels.js';
import { getDailyPrompt, getRandomPrompt } from '../../constants/prompts.js';
import { findOnThisDay, type Memory } from '../../utils/onThisDay.js';
import MemoryViewer from '../Archive/MemoryViewer.jsx';
import { normalizeEntry, type DiaryEntry } from '../../types/diary.js';
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
  // When set, the form is editing an existing entry — same id, original date.
  // Holds the WHOLE entry so fields the form doesn't surface (linkedBoardIds,
  // future extras) survive a round-trip through editing.
  const [editing, setEditing] = useState<DiaryEntry | null>(null);
  // Shuffled prompt for restless days — remembered per spread, so switching
  // spreads naturally falls back to that spread's own daily prompt
  const [shuffled, setShuffled] = useState<{ mode: string; prompt: string } | null>(null);
  const prompt = shuffled && shuffled.mode === mode ? shuffled.prompt : getDailyPrompt(mode);
  const fileRef     = useRef<HTMLInputElement>(null);
  const draftLoaded = useRef(false);
  // Live drag state — a ref so pointer moves don't re-render until the position changes
  const dragRef = useRef<{ startX: number; startY: number; posX: number; posY: number } | null>(null);

  function clearForm() {
    setField1(''); setField2(''); setField3('');
    setRef(''); setPhoto(null); setPhotoPos(CENTERED);
  }

  function loadDraft(): Promise<void> {
    return dbLoad<DiaryDraft>(DRAFT_KEY)
      .then((d) => {
        if (!d) return;
        setField1(d.field1 ?? '');
        setField2(d.field2 ?? '');
        setField3(d.field3 ?? '');
        setRef(d.reflection ?? '');
        setPhoto(d.photo ?? null);
        setPhotoPos(d.photoPos ?? CENTERED);
      })
      .catch(() => {}); // a failed read just means no restore
  }

  function startEditing(entry: DiaryEntry) {
    setEditing(entry);
    useAppStore.getState().setMode(entry.mode); // show the entry's own spread labels
    setField1(entry.field1 ?? '');
    setField2(entry.field2 ?? '');
    setField3(entry.field3 ?? '');
    setRef(entry.reflection ?? '');
    setPhoto(entry.photo ?? null);
    setPhotoPos(entry.photoPos ?? CENTERED);
  }

  /** Leave edit mode; any in-progress draft comes back to the form. */
  function stopEditing() {
    setEditing(null);
    clearForm();
    loadDraft();
  }

  // On mount: an entry handed over for editing wins; otherwise restore the
  // draft — a diary must never eat someone's writing.
  // bootRan guards StrictMode's double effect-run: the first run consumes the
  // edit hand-off, so a second run would fall through and load the draft over
  // the entry being edited.
  const bootRan = useRef(false);
  useEffect(() => {
    if (bootRan.current) return;
    bootRan.current = true;
    const editId = useAppStore.getState().editingEntryId;
    if (editId) {
      useAppStore.getState().setEditingEntryId(null);
      dbLoad<DiaryEntry>(editId)
        .then((e) => { if (e) startEditing(normalizeEntry(e)); })
        .catch(() => {})
        .finally(() => { draftLoaded.current = true; });
    } else {
      loadDraft().finally(() => { draftLoaded.current = true; });
    }
  }, []);

  // "On this day" — resurface entries from a year / six months / a month ago
  useEffect(() => {
    dbGetByPrefix('diary-')
      .then(({ vals }) => setMemories(findOnThisDay(
        (vals as DiaryEntry[]).filter((e) => e && e.id).map(normalizeEntry))))
      .catch(() => {}); // no memories is fine
  }, []);

  // Debounced draft autosave (800ms, same rhythm as board persistence).
  // Guarded until the restore resolves so the empty mount state can't
  // overwrite an existing draft (see loadedRef bug in the captain's log).
  useEffect(() => {
    if (!draftLoaded.current) return;
    if (editing) return; // edits touch the real entry, never the draft
    const t = setTimeout(() => {
      if (!field1 && !field2 && !field3 && !reflection && !photo) {
        dbDelete(DRAFT_KEY).catch(() => {});
        return;
      }
      dbSave(DRAFT_KEY, { field1, field2, field3, reflection, photo, photoPos }).catch(() => {});
    }, 800);
    return () => clearTimeout(t);
  }, [field1, field2, field3, reflection, photo, photoPos, editing]);

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
    const entry: DiaryEntry = {
      ...(editing ?? { voiceNotes: [], tags: [], linkedBoardIds: [] }),
      id:   editing ? editing.id   : `diary-${Date.now()}`,
      date: editing ? editing.date : new Date().toISOString(), // edits keep their day
      mode: editing ? editing.mode : mode,
      field1, field2, field3, reflection,
      photo,
      photoPos: photo ? photoPos : undefined,
    };
    try {
      await dbSave(entry.id, entry);
      // First real entry saved — ask the browser to shield the diary from
      // storage eviction (fire-and-forget, inside the user-gesture chain).
      ensurePersistentStorage();
      if (editing) {
        useAppStore.getState().showToast('Entry updated', 'success');
        stopEditing();
        return;
      }
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

        {/* ── Editing an existing entry ── */}
        {editing && (
          <div className={styles.editingBanner}>
            <span>
              Editing the entry from{' '}
              {new Date(editing.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              {' '}— saving overwrites the original
            </span>
            <button className={styles.editingCancel} onClick={stopEditing}>Cancel</button>
          </div>
        )}

        {/* ── On this day — a memory resurfaces above the fresh page ── */}
        {!editing && memories.length > 0 && (
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
          {/* Today's prompt — tap it and the question opens the page for you;
              the shuffle deals a different question from this spread's bank */}
          <div className={styles.promptRow}>
            <button
              type="button"
              className={styles.promptLine}
              title="Start writing from this prompt"
              onClick={() => {
                setRef((prev) => (prev.trim() ? `${prev}\n\n${prompt}\n` : `${prompt}\n\n`));
                document.getElementById('diary-entry')?.focus();
              }}
            >
              <span className={styles.promptMark} aria-hidden="true">✎</span>
              <span className={styles.promptText}>{prompt}</span>
              <span className={styles.promptHint}>tap to start</span>
            </button>
            <button
              type="button"
              className={styles.promptShuffle}
              title="Try a different prompt"
              aria-label="Try a different prompt"
              onClick={() => setShuffled({ mode, prompt: getRandomPrompt(mode, prompt) })}
            >
              <Shuffle size={13} />
            </button>
          </div>
          <textarea
            id="diary-entry"
            className={styles.entryArea}
            placeholder={labels.reflectionPh}
            value={reflection}
            onChange={(e) => setRef(e.target.value)}
          />
        </div>

        <button className={`${styles.saveBtn} ${saved ? styles.saveBtnDone : ''}`} onClick={save}>
          {saved ? '✦ Saved' : editing ? 'Save Changes' : 'Save Entry'}
        </button>
      </div>

      {memoryIndex !== null && (
        <MemoryViewer
          entries={memories.map((m) => m.entry)}
          index={memoryIndex}
          onClose={() => setMemoryIndex(null)}
          onNavigate={setMemoryIndex}
          onEdit={(entry) => { setMemoryIndex(null); startEditing(entry); }}
        />
      )}
    </div>
  );
}
