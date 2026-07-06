import { useEffect, useRef, useState } from 'react';
import { Mic, Square } from 'lucide-react';
import useAppStore from '../../store/appStore.js';
import styles from './VoiceRecorder.module.css';

interface Props {
  /** Called with the finished recording — caller owns storage. */
  onSave: (blob: Blob, durationMs: number, mimeType: string) => void;
}

function fmt(ms: number): string {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/** A private confession booth, not a podcast rig: one button to speak,
 *  a quiet timer, one button to stop. */
export default function VoiceRecorder({ onSave }: Props) {
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed]     = useState(0);
  const recRef    = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startRef  = useRef(0);
  const timerRef  = useRef<ReturnType<typeof setInterval> | null>(null);

  // Never leave the mic open if the view unmounts mid-recording
  useEffect(() => () => {
    if (recRef.current && recRef.current.state !== 'inactive') recRef.current.stop();
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  async function start() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : '';
      const rec  = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      chunksRef.current = [];
      rec.ondataavailable = (e) => { if (e.data.size) chunksRef.current.push(e.data); };
      rec.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        if (timerRef.current) clearInterval(timerRef.current);
        const type = rec.mimeType || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type });
        const durationMs = Date.now() - startRef.current;
        setRecording(false);
        if (durationMs > 400 && blob.size > 0) onSave(blob, durationMs, type);
      };
      rec.start();
      recRef.current  = rec;
      startRef.current = Date.now();
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed(Date.now() - startRef.current), 500);
      setRecording(true);
    } catch {
      useAppStore.getState().showToast('Microphone unavailable — check permissions', 'error');
    }
  }

  function stop() {
    recRef.current?.stop();
  }

  if (recording) {
    return (
      <div className={styles.recordingRow}>
        <span className={styles.pulse} aria-hidden="true" />
        <span className={styles.timer}>{fmt(elapsed)}</span>
        <span className={styles.recLabel}>recording…</span>
        <button type="button" className={styles.stopBtn} onClick={stop}>
          <Square size={11} /> Stop
        </button>
      </div>
    );
  }

  return (
    <button type="button" className={styles.speakBtn} onClick={start}>
      <Mic size={14} /> Speak your memory
    </button>
  );
}
