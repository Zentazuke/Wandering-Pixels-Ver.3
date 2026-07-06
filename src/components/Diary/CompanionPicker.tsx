import { useState } from 'react';
import { Plus } from 'lucide-react';
import type { Companion, CompanionType } from '../../types/companions.js';
import styles from './CompanionPicker.module.css';

interface Props {
  companions:  Companion[];
  selectedIds: string[];
  onToggle:    (id: string) => void;
  onCreate:    (name: string, type: CompanionType) => void;
}

import { COMPANION_ICON } from '../../data/companionIcons.js';

/** "Who was there?" — tag the people and pets a memory belongs to. */
export default function CompanionPicker({ companions, selectedIds, onToggle, onCreate }: Props) {
  const [adding, setAdding] = useState(false);
  const [name, setName]     = useState('');
  const [type, setType]     = useState<CompanionType>('person');

  function submit() {
    if (!name.trim()) return;
    onCreate(name, type);
    setName(''); setAdding(false);
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.chips}>
        {companions.map((c) => (
          <button key={c.id} type="button"
            className={`${styles.chip} ${selectedIds.includes(c.id) ? styles.chipActive : ''}`}
            onClick={() => onToggle(c.id)}>
            <span aria-hidden="true">{COMPANION_ICON[c.type]}</span> {c.name}
          </button>
        ))}
        <button type="button" className={styles.addBtn} onClick={() => setAdding(!adding)}>
          <Plus size={11} /> {companions.length ? 'Add' : 'Add someone'}
        </button>
      </div>

      {adding && (
        <div className={styles.addRow}>
          <select className={styles.typeSel} value={type} onChange={(e) => setType(e.target.value as CompanionType)}>
            <option value="person">Person</option>
            <option value="pet">Pet</option>
            <option value="other">Other</option>
          </select>
          <input
            className={styles.nameInput}
            placeholder={type === 'pet' ? 'e.g. Luna…' : 'e.g. Maria…'}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
          />
          <button type="button" className={styles.saveBtn} onClick={submit}>Add</button>
        </div>
      )}
    </div>
  );
}
