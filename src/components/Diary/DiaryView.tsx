import { useRef, useState } from 'react';
import { ImagePlus, RefreshCw, X } from 'lucide-react';
import useAppStore from '../../store/appStore.js';
import { dbSave } from '../../db/boardDB.js';
import { LABELS } from './diaryLabels.js';
import styles from './DiaryView.module.css';

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
  const [photo, setPhoto]    = useState<string | null>(null);
  const [saved, setSaved]    = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File | undefined) {
    if (!file || !file.type.startsWith('image/')) return;
    try {
      setPhoto(await readAndResize(file));
    } catch {
      useAppStore.getState().showToast('Couldn\'t read that image', 'error');
    }
  }

  async function save() {
    const entry = {
      id: `diary-${Date.now()}`,
      date: new Date().toISOString(),
      mode, field1, field2, field3, reflection,
      photo,
    };
    try {
      await dbSave(entry.id, entry);
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

        <div className={styles.layout}>
          {/* ── Left: photo — the first thing you do ── */}
          <div className={styles.photoCol}>
            <label className={styles.label}>Photo</label>

            {photo ? (
              <div className={styles.photoFrame}>
                <img src={photo} className={styles.photoImg} alt="Diary entry" draggable={false} />
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
    </div>
  );
}
