import { useEffect, useState } from 'react';
import useBoardStore from '../../store/boardStore.js';
import useAppStore from '../../store/appStore.js';
import { dbGetByPrefix, dbSave, dbDelete } from '../../db/boardDB.js';
import { exportBoard } from '../../utils/exportBoard.js';
import { useFlash } from '../../hooks/useFlash.js';
import type { BoardElement } from '../../types';
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

/** Grid of saved board snapshots — save, restore, or delete. */
export default function ArchiveView() {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [saving, setSaving]       = useState(false);
  const loadBoard = useBoardStore((s) => s.loadBoard);
  const flash     = useFlash();

  useEffect(() => { loadSnapshots(); }, []);

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

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <h2 className={styles.title}>Archive</h2>
        <button className={styles.saveBtn} onClick={saveSnapshot} disabled={saving}>
          {saving ? 'Saving…' : '✦ Save current board'}
        </button>
      </div>

      {snapshots.length === 0 ? (
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
      )}
    </div>
  );
}
