import { useEffect, useRef, useState } from 'react';
import { BookOpenText, LayoutGrid, DownloadCloud, UploadCloud } from 'lucide-react';
import useBoardStore, { makePhotoElement, makeTextElement } from '../../store/boardStore.js';
import useAppStore from '../../store/appStore.js';
import { dbGetByPrefix, dbSave, dbDelete } from '../../db/boardDB.js';
import { ensurePersistentStorage } from '../../db/persistentStorage.js';
import { downloadBackup, restoreBackup } from '../../utils/backup.js';
import { exportBoard } from '../../utils/exportBoard.js';
import { makeThumb } from '../../utils/imageThumb.js';
import { escapeHtml } from '../../utils/sanitizeHtml.js';
import { useFlash } from '../../hooks/useFlash.js';
import MemoryViewer from './MemoryViewer.jsx';
import DiaryCalendar from './DiaryCalendar.jsx';
import { dayKey } from '../../utils/dayKey.js';
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

export interface DiaryEntry {
  id:         string;
  date:       string;       // ISO
  mode:       WorkspaceMode;
  field1:     string;
  field2:     string;
  field3:     string;
  reflection: string;
  photo?:     string | null;
  /** How the photo was framed in its diary crop (object-position %). */
  photoPos?:  { x: number; y: number };
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
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const [query, setQuery]         = useState('');
  const [dayFilter, setDayFilter] = useState<string | null>(null);
  const loadBoard  = useBoardStore((s) => s.loadBoard);
  const flash      = useFlash();
  const restoreRef = useRef<HTMLInputElement>(null);

  // Search across everything written, plus the spread name; day filter from
  // the calendar composes with it.
  const q = query.trim().toLowerCase();
  const visibleEntries = entries.filter((e) =>
    (!dayFilter || dayKey(new Date(e.date)) === dayFilter) &&
    (!q || [e.field1, e.field2, e.field3, e.reflection, e.mode]
      .some((f) => (f || '').toLowerCase().includes(q))));

  useEffect(() => { loadSnapshots(); loadEntries(); }, []);

  // ── Backup — the device is the only copy; the backup file is the insurance ──

  async function handleBackup() {
    try {
      await downloadBackup();
      useAppStore.getState().showToast('Backup downloaded — keep it somewhere safe', 'success');
    } catch {
      useAppStore.getState().showToast('Couldn\'t create the backup', 'error');
    }
  }

  async function handleRestore(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!window.confirm(
      'Restore this backup? Entries and boards from the file will be added; ' +
      'anything with the same id is overwritten.'
    )) return;
    try {
      const count = await restoreBackup(file);
      useAppStore.getState().showToast(`Restored ${count} records — reloading…`, 'success');
      // The board store hydrates from IDB on mount only — a reload is the
      // honest way to apply everything the file brought back.
      setTimeout(() => window.location.reload(), 900);
    } catch {
      useAppStore.getState().showToast('That doesn\'t look like a Wandering Pixels backup', 'error');
    }
  }

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
      ensurePersistentStorage();
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
        <div className={styles.headerActions}>
          <button className={styles.backupBtn} onClick={handleBackup} title="Download every entry and board as one backup file">
            <DownloadCloud size={13} /> Back up
          </button>
          <button className={styles.backupBtn} onClick={() => restoreRef.current?.click()} title="Restore from a backup file">
            <UploadCloud size={13} /> Restore
          </button>
          <input ref={restoreRef} type="file" accept="application/json,.json" style={{ display: 'none' }} onChange={handleRestore} />
          {tab === 'boards' && (
            <button className={styles.saveBtn} onClick={saveSnapshot} disabled={saving}>
              {saving ? 'Saving…' : '✦ Save current board'}
            </button>
          )}
        </div>
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
          <div className={styles.diaryLayout}>
            <aside className={styles.diarySide}>
              <input
                className={styles.search}
                type="search"
                placeholder="Search your entries…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <DiaryCalendar entries={entries} selectedDay={dayFilter} onSelectDay={setDayFilter} />
            </aside>

            <div className={styles.diaryMain}>
              {visibleEntries.length === 0 ? (
                <div className={styles.empty}>
                  <p>Nothing matches{dayFilter ? ' that day' : ''}{q ? ` “${query.trim()}”` : ''}.</p>
                  <p>Try clearing the search or the selected day.</p>
                </div>
              ) : (
          <div className={styles.grid}>
            {visibleEntries.map((entry, i) => (
              <div key={entry.id} className={styles.card}
                style={{ cursor: 'pointer' }}
                onClick={() => setViewerIndex(i)}
                title="Open entry">
                {/* text-only entries skip the image slot — the words are the card */}
                {entry.photo && (
                  <img
                    src={entry.photo}
                    className={styles.thumb}
                    alt={entry.field1 || 'Diary photo'}
                    style={entry.photoPos ? { objectPosition: `${entry.photoPos.x}% ${entry.photoPos.y}%` } : undefined}
                  />
                )}
                <div className={styles.entryBody}>
                  <div className={styles.entryMeta}>
                    <span className={styles.entryDate}>{entryDateLabel(entry.date)}</span>
                    <span className={styles.entryMode}>{entry.mode}</span>
                  </div>
                  {entry.field1 && <div className={styles.entryTitle}>{entry.field1}</div>}
                  {entry.reflection && (
                    <p className={`${styles.entryExcerpt} ${entry.photo ? '' : styles.entryExcerptFull}`}>
                      {entry.reflection}
                    </p>
                  )}
                  <div className={styles.cardActions}>
                    <button className={styles.restoreBtn} onClick={(e) => { e.stopPropagation(); addEntryToBoard(entry); }}>Add to board</button>
                    <button className={styles.deleteBtn}  onClick={(e) => { e.stopPropagation(); deleteEntry(entry); }}>✕</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
              )}
            </div>
          </div>
        )
      )}

      {viewerIndex !== null && viewerIndex < visibleEntries.length && (
        <MemoryViewer
          entries={visibleEntries}
          index={viewerIndex}
          onClose={() => setViewerIndex(null)}
          onNavigate={setViewerIndex}
          onAddToBoard={addEntryToBoard}
          onDelete={deleteEntry}
          onEdit={(entry) => {
            useAppStore.getState().setEditingEntryId(entry.id);
            flash(() => useAppStore.getState().setView('diary'));
          }}
        />
      )}
    </div>
  );
}
