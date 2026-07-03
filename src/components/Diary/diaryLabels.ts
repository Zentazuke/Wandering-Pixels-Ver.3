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

  /* The personal spreads — July 2026 */
  pets:      { label1:'Pet',          ph1:'e.g. Nino, the neighbourhood cat…', label2:'Place',          ph2:'e.g. The park, the sofa…',          label3:'Mood',       ph3:'e.g. Zoomies, sleepy, dramatic…',      reflectionPh:'What did they do today that made you smile?' },
  children:  { label1:'Child',        ph1:'e.g. Lia…',                         label2:'Moment',         ph2:'e.g. First steps, bedtime story…',  label3:'Age',        ph3:'e.g. 3 years, 8 months…',              reflectionPh:'What do you want them to read one day?' },
  sports:    { label1:'Activity',     ph1:'e.g. Morning run, five-a-side…',    label2:'Where',          ph2:'e.g. Riverside trail, the gym…',    label3:'Result',     ph3:'e.g. 10k in 52:10, won 3–2…',          reflectionPh:'How did it feel — what did you push through?' },
  dreams:    { label1:'Dream',        ph1:'e.g. The house by the sea…',        label2:'Mood on waking', ph2:'e.g. Calm, unsettled, wistful…',    label3:'Recurring?', ph3:'e.g. First time, third this month…',   reflectionPh:'Write it down before it fades — every detail you can still hold…' },
  gratitude: { label1:'Grateful for', ph1:'e.g. A quiet morning…',             label2:'Because',        ph2:'e.g. It let me breathe…',           label3:'Who',        ph3:'e.g. Maria, an old friend, myself…',   reflectionPh:'Why did this matter today?' },

  /* Day-to-day life — July 2026 */
  work:      { label1:'Project / Task', ph1:'e.g. The big presentation…',      label2:'Where',          ph2:'e.g. Office, home desk…',           label3:'Wins / Blockers', ph3:'e.g. Shipped it, stuck on a bug…', reflectionPh:'How was the workday, really?' },
  wellbeing: { label1:'Mood',           ph1:'e.g. Steady, foggy, bright…',     label2:'Energy',         ph2:'e.g. Slept 7h, low battery…',       label3:'One good thing',  ph3:'e.g. A walk in the sun…',          reflectionPh:'Check in with yourself — what’s on your mind?' },
  food:      { label1:'Dish',           ph1:'e.g. Grandma’s caldo verde…', label2:'Where',         ph2:'e.g. Home kitchen, the tasca…',     label3:'Shared with',     ph3:'e.g. Solo, the whole table…',      reflectionPh:'What did it taste like? What memory does the flavour carry?' },
  friends:   { label1:'Who',            ph1:'e.g. Miguel, the old crew…',      label2:'Where',          ph2:'e.g. The café, a late call…',       label3:'Occasion',        ph3:'e.g. Catch-up, birthday…',         reflectionPh:'What did the conversation leave you with?' },
};
