import useAppStore from '../../store/appStore.js';
import useBoardStore from '../../store/boardStore.js';
import PhotoProps from './PhotoProps.jsx';
import TextProps from './TextProps.jsx';
import StickerProps from './StickerProps.jsx';
import styles from './PropsPanel.module.css';

export default function PropsPanel() {
  const selId    = useAppStore((s) => s.selId);
  const elements = useBoardStore((s) => s.elements);

  const el = selId ? elements.find((e) => e.id === selId) : null;

  return (
    <aside className={styles.panel}>
      {!el && (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>✦</div>
          <p>Select an element<br />to edit its properties</p>
        </div>
      )}
      {el?.type === 'photo'   && <PhotoProps   el={el} />}
      {el?.type === 'text'    && <TextProps    el={el} />}
      {el?.type === 'sticker' && <StickerProps el={el} />}
    </aside>
  );
}
