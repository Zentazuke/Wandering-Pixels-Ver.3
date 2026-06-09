import type { StickerCategoryName } from './stickers';

export interface WorkspaceModeConfig {
  label:             string;
  bg:                string;
  font:              string;
  textColor:         string;
  noteBg:            string;
  fontSize:          number;
  placeholder:       string;
  stickerHighlight:  StickerCategoryName[];
}

interface DiaryLabels {
  label1: string; ph1: string;
  label2: string; ph2: string;
  label3: string; ph3: string;
  reflectionPh: string;
}

interface TemplateElement {
  type:      'text' | 'photo';
  x:         number;
  y:         number;
  w:         number;
  h?:        number;
  content?:  string;
  bg?:       string;
  color?:    string;
  caption?:  string;
}

interface WorkspaceTemplate {
  name:   string;
  board:  TemplateElement[];
  diary:  DiaryLabels;
}

export const WORKSPACE_MODES: Record<string, WorkspaceModeConfig> = {
  default: {
    label: '✦ Default', bg: 'paper',
    font: 'Lora', textColor: '#3b3328', noteBg: '#fff9e6', fontSize: 16,
    placeholder: 'Type here…',
    stickerHighlight: ['Nature', 'Decorative', 'Gaming', 'Shapes'],
  },
  travel: {
    label: '🧭 Travel', bg: 'linen',
    font: 'Lora', textColor: '#3b3328', noteBg: '#fdf6e3', fontSize: 15,
    placeholder: 'Where did you wander?',
    stickerHighlight: ['Nature', 'Decorative'],
  },
  love: {
    label: '❤️ Love', bg: 'cork',
    font: 'Playfair', textColor: '#6b2737', noteBg: '#fff0f3', fontSize: 15,
    placeholder: 'Write something beautiful…',
    stickerHighlight: ['Decorative', 'Nature'],
  },
  family: {
    label: '🏡 Family', bg: 'grid',
    font: 'DM Sans', textColor: '#2d4a2d', noteBg: '#f0f7f0', fontSize: 16,
    placeholder: 'A memory to keep…',
    stickerHighlight: ['Nature', 'Shapes', 'Decorative'],
  },
  game: {
    label: '🎮 Game', bg: 'slate',
    font: 'DM Sans', textColor: '#39ff9f', noteBg: '#0a141e', fontSize: 14,
    placeholder: 'Log your session…',
    stickerHighlight: ['Gaming', 'Shapes'],
  },
};

export const WORKSPACE_TEMPLATES: Record<string, WorkspaceTemplate> = {
  travel: {
    name: '🧭 Travel & Wanderlust',
    board: [
      { type: 'text',  x: 140, y: 100, w: 300, h: 210, content: '<b>✨ TRAVEL LOG</b><br>🗺️ Destination:<br>📅 Date:<br><br>Initial atmospheric impressions…', bg: '#fdf6e3', color: '#3b3328' },
      { type: 'photo', x: 490, y: 90,  w: 240, h: 180, caption: '📍 Key Landmark' },
      { type: 'photo', x: 760, y: 170, w: 180, h: 135, caption: 'Local Details ☕' },
      { type: 'text',  x: 490, y: 295, w: 240, h: 80,  content: '<i>What did it smell like? What sounds?</i>', bg: 'transparent', color: '#7a6548' },
    ],
    diary: {
      label1: 'Location',             ph1: 'e.g. Kyoto, Japan…',
      label2: 'Neighbourhood / Area', ph2: 'e.g. Gion Quarter…',
      label3: 'Travel Companion',     ph3: 'e.g. Solo, with Maria…',
      reflectionPh: 'Describe the atmosphere — the light, the sounds, the textures that photography missed…',
    },
  },
  love: {
    name: '❤️ Love & Memory',
    board: [
      { type: 'text',  x: 160, y: 110, w: 280, h: 180, content: '<b>❤️ A MOMENT</b><br><br>Date:<br>Place:<br><br>What made it perfect…', bg: '#fff0f3', color: '#6b2737' },
      { type: 'photo', x: 480, y: 100, w: 260, h: 195, caption: '📸 The Memory' },
      { type: 'text',  x: 160, y: 320, w: 280, h: 60,  content: '<i>"…and I never wanted it to end."</i>', bg: 'transparent', color: '#6b2737' },
    ],
    diary: {
      label1: 'Title / Occasion', ph1: 'e.g. Our Anniversary…',
      label2: 'Place',            ph2: 'e.g. The little café on Rue Cler…',
      label3: 'With',             ph3: 'e.g. Maya, my mum…',
      reflectionPh: 'Write something beautiful — what did you feel in this moment?',
    },
  },
  family: {
    name: '🏡 Family Memory',
    board: [
      { type: 'text',  x: 130, y: 90,  w: 300, h: 200, content: '<b>🏡 FAMILY MOMENT</b><br><br>Date:<br>Who was there:<br><br>What happened…', bg: '#f0f7f0', color: '#2d4a2d' },
      { type: 'photo', x: 470, y: 90,  w: 260, h: 195, caption: 'The Memory' },
      { type: 'photo', x: 760, y: 90,  w: 180, h: 135, caption: 'A Detail' },
    ],
    diary: {
      label1: 'Occasion / Event', ph1: 'e.g. Sunday dinner, birthday…',
      label2: 'Place',            ph2: "e.g. Grandma's kitchen…",
      label3: 'People',           ph3: 'e.g. Mum, Dad, Lia…',
      reflectionPh: 'What memory do you want to keep? What did it feel like to be there?',
    },
  },
  game: {
    name: '🎮 Gaming Session',
    board: [
      { type: 'text',  x: 110, y: 90,  w: 330, h: 250, content: '<b>🎮 SESSION DEBRIEF</b><br>━━━━━━━━━━━━━━<br>• Game / Project:<br>• Core Mechanics:<br><br>Design observations &amp; feedback:', bg: '#0a141e', color: '#39ff9f' },
      { type: 'photo', x: 490, y: 90,  w: 290, h: 218, caption: '🖼️ Screenshot / Composition' },
    ],
    diary: {
      label1: 'Game Title',       ph1: 'e.g. Elden Ring…',
      label2: 'Virtual Location', ph2: 'e.g. The Lands Between…',
      label3: 'Character',        ph3: 'e.g. Tarnished, Geralt…',
      reflectionPh: 'Analyse the gameplay loop. What felt tactile or satisfying? Document mechanics, UI layouts, technical hitches…',
    },
  },
  default: {
    name: '✦ Default',
    board: [],
    diary: {
      label1: 'Title', ph1: 'e.g. Something on my mind…',
      label2: 'Place', ph2: 'e.g. The study, the garden…',
      label3: 'With',  ph3: 'e.g. Alone, with friends…',
      reflectionPh: 'What did you feel in this moment?',
    },
  },
};
