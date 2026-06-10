import { useEffect, useState } from 'react';
import { ImagePlus, BookOpenText, LayoutGrid } from 'lucide-react';
import useBoardStore, { makePhotoElement, makeTextElement } from '../../store/boardStore.js';
import useAppStore from '../../store/appStore.js';
import { dbGetByPrefix, dbSave, dbDelete } from '../../db/boardDB.js';
import { exportBoard } from '../../utils/exportBoard.js';
import { makeThumb } from '../../utils/imageThumb.js';
import { escapeHtml } from '../../utils/sanitizeHtml.js';
import { useFlash } from '../../hooks/useFlash.js';
import type { BoardElement, WorkspaceMode } from '../../types';
import styles from './ArchiveView.module.css';

interface Snapshot {
  key:           string;
  ts:            number;
  label:         string;
  thumb:         string;
  elements:      BoardElement[];
  currentBg:     string;
  customBgColor: string | null;
  customBgImage: string | null;
}

interface DiaryEntry {
  id:         string;
  date:       string;       // ISO
  mode:       WorkspaceMode;
  field1:     string;
  field2:     string;
  field3:     string;
  reflection: string;
  photo?:     string | null;
}

type Tab = 'boards' | 'diary';

function entryDateLabel(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** Archive — saved board snapshots and past diary entries. */
export default function ArchiveView() {
  const [tab, setTab]             = useState<Tab>('boards');
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [entries, setEntries]     = useState<DiaryEntry[]>([]);
  const [saving, setSaving]       = useState(false);
  const loadBoard = useBoardStore((s) => s.loadBoard);
  const flash     = useFlash();

  useEffect(() => { loadSnapshots(); loadEntries(); }, []);

  // ── Boards ──────────────────────────────────────────────────────────────────

  async function loadSnapshots() {
    try {
      const { keys, vals } = await dbGetByPrefix('snap-');
      const snaps = keys
        .map((k, i) => ({ key: k, ...(vals[i] as Omit<Snapshot, 'key'>) }))
        .sort((a, b) => b.ts - a.ts);
      setSnapshots(snaps);
    } catch {
      useAppStore.getState().showToast('Couldn\'t load archive', 'error');
    }
  }

  async function saveSnapshot() {
    setSaving(true);
    try {
      const { elements, currentBg, customBgColor, customBgImage } = useBoardStore.getState();
      const thumb = await exportBoard(elements, currentBg, customBgColor, customBgImage, true) as string;
      const snap: Snapshot = {
        key:   `snap-${Date.now()}`,
        ts:    Date.now(),
        label: `Board — ${new Date().toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })}`,
        thumb, elements, currentBg, customBgColor, customBgImage,
      };
      await dbSave(snap.key, snap);
      await loadSnapshots();
      useAppStore.getState().showToast('Board saved to archive', 'success');
    } catch {
      useAppStore.getState().showToast('Couldn\'t save snapshot — storage may be full', 'error');
    } finally {
      setSaving(false);
    }
  }

  function restoreSnapshot(snap: Snapshot) {
    flash(() => {
      loadBoard(snap.elements, snap.currentBg);
      if (snap.customBgColor) useBoardStore.setState({ customBgColor: snap.customBgColor });
      if (snap.customBgImage) useBoardStore.setState({ customBgImage: snap.customBgImage });
      useAppStore.getState().setView('board');
    });
  }

  async function deleteSnapshot(snap: Snapshot) {
    // Permanent and unrecoverable — always confirm.
    if (!window.confirm(`Delete "${snap.label}"? This can't be undone.`)) return;
    try {
      await dbDelete(snap.key);
      await loadSnapshots();
    } catch {
      useAppStore.getState().showToast('Couldn\'t delete snapshot', 'error');
    }
  }

  // ── Diary entries ───────────────────────────────────────────────────────────

  async function loadEntries() {
    try {
      const { vals } = await dbGetByPrefix('diary-');
      const list = (vals as DiaryEntry[])
        .filter((e) => e && e.id)
        .sort((a, b) => (a.date < b.date ? 1 : -1));
      setEntries(list);
    } catch {
      useAppStore.getState().showToast('Couldn\'t load diary entries', 'error');
    }
  }

  async function deleteEntry(entry: DiaryEntry) {
    const label = entry.field1 || entryDateLabel(entry.date);
    if (!window.confirm(`Delete diary entry "${label}"? This can't be undone.`)) return;
    try {
      await dbDelete(entry.id);
      await loadEntries();
    } catch {
      useAppStore.getState().showToast('Couldn\'t delete entry', 'error');
    }
  }

  /** Compose the entry onto the current board: photo + a taped note. */
  async function addEntryToBoard(entry: DiaryEntry) {
    const { addElement } = useBoardStore.getState();
    const count = () => useBoardStore.getState().elements.length;

    if (entry.photo) {
      const photo = entry.photo;
      const ratio = await new Promise<number>((resolve) => {
        const img = new Image();
        img.onload  = () => resolve(img.naturalWidth / img.naturalHeight || 1);
        img.onerror = () => resolve(1);
        img.src = photo;
      });
      const thumb = await makeThumb(photo).catch(() => undefined);
      const w = 240;
      addElement(makePhotoElement(photo, count(), {
        x: 460, y: 220, w, h: Math.round(w / ratio),
        rotation: -2, caption: entry.field1 || entryDateLabel(entry.date),
        thumb,
      }));
    }

    // Entry text as a note — plain text fields escaped into safe markup.
    const meta = [entry.field2, entry.field3].filter(Boolean).map(escapeHtml).join(' · ');
    const content =
      `<b>${escapeHtml(entry.field1 || 'Journal entry')}</b>` +
      `<div>${escapeHtml(entryDateLabel(entry.date))}${meta ? ' — ' + meta : ''}</div>` +
      (entry.reflection ? `<br><div>${escapeHtml(entry.reflection)}</div>` : '');

    addElement(makeTextElement(count(), {
      x: 740, y: 260, w: 250, h: 150,
      rotation: 1.5, content, noteFrame: 'tape-top', fontSize: 13,
    }));

    useAppStore.getState().showToast('Entry added to board', 'success');
    flash(() => useAppStore.getState().setView('board'));
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h2 className={styles.title}>Archive</h2>
          <div className={styles.tabs}>
            <button className={`${styles.tabBtn} ${tab === 'boards' ? styles.tabActive : ''}`}
              onClick={() => setTab('boards')}>
              <LayoutGrid size={13} /> Boards
            </button>
            <button className={`${styles.tabBtn} ${tab === 'diary' ? styles.tabActive : ''}`}
              onClick={() => setTab('diary')}>
              <BookOpenText size={13} /> Diary
            </button>
          </div>
        </div>
        {tab === 'boards' && (
          <button className={styles.saveBtn} onClick={saveSnapshot} disabled={saving}>
            {saving ? 'Saving…' : '✦ Save current board'}
          </button>
        )}
      </div>

      {tab === 'boards' && (
        snapshots.length === 0 ? (
          <div className={styles.empty}>
            <p>No saved boards yet.</p>
            <p>Click "Save current board" to create a snapshot.</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {snapshots.map((snap) => (
              <div key={snap.key} className={styles.card}>
                {snap.thumb ? (
                  <img src={snap.thumb} className={styles.thumb} alt={snap.label} />
                ) : (
                  <div className={styles.thumbPlaceholder}>No preview</div>
                )}
                <div className={styles.cardBody}>
                  <span className={styles.cardLabel}>{snap.label}</span>
                  <div className={styles.cardActions}>
                    <button className={styles.restoreBtn} onClick={() => restoreSnapshot(snap)}>Restore</button>
                    <button className={styles.deleteBtn}  onClick={() => deleteSnapshot(snap)}>✕</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {tab === 'diary' && (
        entries.length === 0 ? (
          <div className={styles.empty}>
            <p>No diary entries yet.</p>
            <p>Write one in the Diary tab — it'll appear here.</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {entries.map((entry) => (
              <div key={entry.id} className={styles.card}>
                {entry.photo ? (
                  <img src={entry.photo} className={styles.thumb} alt={entry.field1 || 'Diary photo'} />
                ) : (
                  <div className={styles.thumbPlaceholder}><ImagePlus size={18} /></div>
                )}
                <div className={styles.entryBody}>
                  <div className={styles.entryMeta}>
                    <span className={styles.entryDate}>{entryDateLabel(entry.date)}</span>
                    <span className={styles.entryMode}>{entry.mode}</span>
                  </div>
                  {entry.field1 && <div className={styles.entryTitle}>{entry.field1}</div>}
                  {entry.reflection && <p className={styles.entryExcerpt}>{entry.reflection}</p>}
                  <div className={styles.cardActions}>
                    <button className={styles.restoreBtn} onClick={() => addEntryToBoard(entry)}>Add to board</button>
                    <button className={styles.deleteBtn}  onClick={() => deleteEntry(entry)}>✕</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
