import { useState } from 'react';
import useAppStore from '../../store/appStore.js';
import { dbSave } from '../../db/boardDB.js';
import type { WorkspaceMode } from '../../types';
import styles from './DiaryView.module.css';

function todayStr(): string {
  return new Date().toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
}

interface DiaryLabels {
  label1: string; ph1: string;
  label2: string; ph2: string;
  label3: string; ph3: string;
  reflectionPh: string;
}

const LABELS: Record<WorkspaceMode, DiaryLabels> = {
  default: { label1:'Title',    ph1:'e.g. Something on my mind…',   label2:'Place',    ph2:'e.g. The study, the garden…', label3:'With',      ph3:'e.g. Alone, with friends…',      reflectionPh:'What did you feel in this moment?' },
  travel:  { label1:'Location', ph1:'e.g. Kyoto, Japan…',           label2:'Area',     ph2:'e.g. Gion Quarter…',          label3:'With',      ph3:'e.g. Solo, with Maria…',          reflectionPh:'Describe the atmosphere — the light, the sounds…' },
  love:    { label1:'Occasion', ph1:'e.g. Our Anniversary…',        label2:'Place',    ph2:'e.g. The little café…',       label3:'With',      ph3:'e.g. Maya, my mum…',              reflectionPh:'Write something beautiful…' },
  family:  { label1:'Occasion', ph1:'e.g. Sunday dinner…',          label2:'Place',    ph2:"e.g. Grandma's kitchen…",     label3:'Who',       ph3:'e.g. Mum, Dad, Lia…',             reflectionPh:'What memory do you want to keep?' },
  game:    { label1:'Game',     ph1:'e.g. Elden Ring…',             label2:'Location', ph2:'e.g. The Lands Between…',    label3:'Character', ph3:'e.g. Tarnished…',                 reflectionPh:'Analyse the gameplay loop…' },
};

/** Mode-aware journal entry form that saves to IndexedDB. */
export default function DiaryView() {
  const mode = useAppStore((s) => s.mode);

  const [field1, setField1]  = useState('');
  const [field2, setField2]  = useState('');
  const [field3, setField3]  = useState('');
  const [reflection, setRef] = useState('');
  const [saved, setSaved]    = useState(false);

  async function save() {
    const entry = {
      id: `diary-${Date.now()}`,
      date: new Date().toISOString(),
      mode, field1, field2, field3, reflection,
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

        <div className={styles.fields}>
          <label className={styles.label}>{labels.label1}</label>
          <input  className={styles.input}    placeholder={labels.ph1} value={field1} onChange={(e) => setField1(e.target.value)} />

          <label className={styles.label}>{labels.label2}</label>
          <input  className={styles.input}    placeholder={labels.ph2} value={field2} onChange={(e) => setField2(e.target.value)} />

          <label className={styles.label}>{labels.label3}</label>
          <input  className={styles.input}    placeholder={labels.ph3} value={field3} onChange={(e) => setField3(e.target.value)} />

          <label className={styles.label}>Reflection</label>
          <textarea
            className={styles.textarea}
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
