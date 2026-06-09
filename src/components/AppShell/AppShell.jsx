import useAppStore from '../../store/appStore.js';
import TopBar from '../TopBar/TopBar.jsx';
import Board from '../Board/Board.jsx';
import Toolbar from '../Toolbar/Toolbar.jsx';
import PropsPanel from '../PropsPanel/PropsPanel.jsx';
import DiaryView from '../Diary/DiaryView.jsx';
import ArchiveView from '../Archive/ArchiveView.jsx';
import styles from './AppShell.module.css';

export default function AppShell() {
  const view = useAppStore((s) => s.view);

  return (
    <div className={styles.shell}>
      <TopBar />
      <div className={styles.body}>
        {/* Board view: toolbar + canvas side by side */}
        {view === 'board' && (
          <>
            <Toolbar />
            <Board />
            <PropsPanel />
          </>
        )}
        {view === 'diary'   && <DiaryView />}
        {view === 'archive' && <ArchiveView />}
      </div>
    </div>
  );
}
