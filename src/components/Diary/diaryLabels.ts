import type { WorkspaceMode } from '../../types';

interface DiaryLabels {
  label1: string; ph1: string;
  label2: string; ph2: string;
  label3: string; ph3: string;
  reflectionPh: string;
}

/** Mode-aware field labels/placeholders — shared by DiaryView (write) and
 *  MemoryViewer (read). Lives in its own file so both can import it without
 *  tripping react-refresh's component-only-export rule. */
export const LABELS: Record<WorkspaceMode, DiaryLabels> = {
  default: { label1:'Title',    ph1:'e.g. Something on my mind…',   label2:'Place',    ph2:'e.g. The study, the garden…', label3:'With',      ph3:'e.g. Alone, with friends…',      reflectionPh:'What did you feel in this moment?' },
  travel:  { label1:'Location', ph1:'e.g. Kyoto, Japan…',           label2:'Area',     ph2:'e.g. Gion Quarter…',          label3:'With',      ph3:'e.g. Solo, with Maria…',          reflectionPh:'Describe the atmosphere — the light, the sounds…' },
  love:    { label1:'Occasion', ph1:'e.g. Our Anniversary…',        label2:'Place',    ph2:'e.g. The little café…',       label3:'With',      ph3:'e.g. Maya, my mum…',              reflectionPh:'Write something beautiful…' },
  family:  { label1:'Occasion', ph1:'e.g. Sunday dinner…',          label2:'Place',    ph2:"e.g. Grandma's kitchen…",     label3:'Who',       ph3:'e.g. Mum, Dad, Lia…',             reflectionPh:'What memory do you want to keep?' },
  game:    { label1:'Game',     ph1:'e.g. Elden Ring…',             label2:'Location', ph2:'e.g. The Lands Between…',    label3:'Character', ph3:'e.g. Tarnished…',                 reflectionPh:'Analyse the gameplay loop…' },
};
