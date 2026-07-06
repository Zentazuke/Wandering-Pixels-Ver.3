import { MOODS } from '../../data/moods.js';
import type { MoodValue, MoodIntensity } from '../../types/diary.js';
import styles from './MoodPicker.module.css';

interface Props {
  mood?:      MoodValue;
  intensity?: MoodIntensity;
  onChange:   (mood: MoodValue | undefined, intensity: MoodIntensity | undefined) => void;
}

const INTENSITIES: MoodIntensity[] = ['soft', 'medium', 'strong'];

/** "How did this feel?" — one feeling, optional strength. Tapping the chosen
 *  mood again lets it go; intensity only appears once a feeling is named. */
export default function MoodPicker({ mood, intensity, onChange }: Props) {
  return (
    <div className={styles.wrap}>
      <div className={styles.chips}>
        {MOODS.map((m) => {
          const active = mood === m.value;
          return (
            <button
              key={m.value}
              type="button"
              className={`${styles.chip} ${active ? styles.chipActive : ''}`}
              style={active ? { borderColor: m.color, color: m.color } : undefined}
              onClick={() => onChange(active ? undefined : m.value, active ? undefined : intensity)}
            >
              <span className={styles.dot} style={{ background: m.color }} aria-hidden="true" />
              {m.label}
            </button>
          );
        })}
      </div>

      {mood && (
        <div className={styles.intensityRow}>
          {INTENSITIES.map((i) => (
            <button
              key={i}
              type="button"
              className={`${styles.intensity} ${intensity === i ? styles.intensityActive : ''}`}
              onClick={() => onChange(mood, intensity === i ? undefined : i)}
            >
              {i}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
