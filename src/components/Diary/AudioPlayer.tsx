import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { loadAudioBlob } from '../../db/audioStorage.js';
import type { VoiceNote } from '../../types/diary.js';
import styles from './AudioPlayer.module.css';

interface Props {
  note:      VoiceNote;
  onDelete?: () => void;
}

function fmt(ms: number): string {
  const s = Math.round(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/** Plays one voice note from its IDB asset. */
export default function AudioPlayer({ note, onDelete }: Props) {
  const [url, setUrl]       = useState<string | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let alive = true;
    let objectUrl: string | null = null;
    loadAudioBlob(note.assetKey)
      .then((blob) => {
        if (!alive) return;
        if (!blob) { setMissing(true); return; }
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      })
      .catch(() => { if (alive) setMissing(true); });
    return () => {
      alive = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [note.assetKey]);

  return (
    <div className={styles.player}>
      {missing ? (
        <span className={styles.missing}>voice note missing from storage</span>
      ) : url ? (
        <audio className={styles.audio} controls preload="metadata" src={url} />
      ) : (
        <span className={styles.loading}>loading…</span>
      )}
      <span className={styles.duration}>{fmt(note.durationMs)}</span>
      {onDelete && (
        <button type="button" className={styles.delete} onClick={onDelete} title="Delete voice note">
          <X size={12} />
        </button>
      )}
    </div>
  );
}
