export interface Sticker {
  id:    string;
  label: string;
  svg:   string;
}

export type StickerCategoryName = 'Nature' | 'Gaming' | 'Decorative' | 'Shapes';

export const STICKER_CATS: Record<StickerCategoryName, Sticker[]> = {
  Nature: [
    { id: 'star',      label: 'Star',     svg: '<polygon points="12,2 15.1,8.3 22,9.5 17,14.1 18.2,21 12,17.8 5.8,21 7,14.1 2,9.5 8.9,8.3" fill="#EF9F27" stroke="#BA7517" stroke-width="0.5"/>' },
    { id: 'heart',     label: 'Heart',    svg: '<path d="M12 21C12 21 3 13.5 3 8a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 5.5-9 13-9 13z" fill="#D85A30"/>' },
    { id: 'flower',    label: 'Flower',   svg: '<circle cx="12" cy="12" r="3" fill="#EF9F27"/><ellipse cx="12" cy="5" rx="2.5" ry="3.5" fill="#F2A623"/><ellipse cx="12" cy="19" rx="2.5" ry="3.5" fill="#F2A623"/><ellipse cx="5" cy="12" rx="3.5" ry="2.5" fill="#F2A623"/><ellipse cx="19" cy="12" rx="3.5" ry="2.5" fill="#F2A623"/>' },
    { id: 'leaf',      label: 'Leaf',     svg: '<path d="M12 3C8 3 4 7 4 12s4 9 8 9c0-4-1-7-2-9 2 1 5 2 8 2-1-5-3-11-6-11z" fill="#1D9E75"/>' },
    { id: 'cloud',     label: 'Cloud',    svg: '<path d="M5 18a4 4 0 0 1 0-8h.5A5.5 5.5 0 0 1 17 12a3.5 3.5 0 1 1 0 6H5z" fill="#85B7EB" stroke="#378ADD" stroke-width="0.8"/>' },
    { id: 'moon',      label: 'Moon',     svg: '<path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" fill="#EF9F27"/>' },
    { id: 'sun',       label: 'Sun',      svg: '<circle cx="12" cy="12" r="4" fill="#EF9F27"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" stroke="#EF9F27" stroke-width="2" stroke-linecap="round"/>' },
    { id: 'rainbow',   label: 'Rainbow',  svg: '<path d="M3 16a9 9 0 0 1 18 0" fill="none" stroke="#E24B4A" stroke-width="2.5"/><path d="M5 16a7 7 0 0 1 14 0" fill="none" stroke="#EF9F27" stroke-width="2.5"/><path d="M7 16a5 5 0 0 1 10 0" fill="none" stroke="#639922" stroke-width="2.5"/><path d="M9 16a3 3 0 0 1 6 0" fill="none" stroke="#378ADD" stroke-width="2.5"/>' },
    { id: 'mushroom',  label: 'Mushroom', svg: '<ellipse cx="12" cy="11" rx="8" ry="6" fill="#E24B4A"/><path d="M8 11v5a4 4 0 0 0 8 0v-5" fill="#f0d0b8"/><circle cx="9" cy="9" r="1.5" fill="white" opacity="0.7"/><circle cx="13" cy="8" r="1" fill="white" opacity="0.7"/><circle cx="15" cy="11" r="1.2" fill="white" opacity="0.7"/>' },
    { id: 'butterfly', label: 'Fly',      svg: '<path d="M12 12C10 8 4 6 3 10s5 6 9 2z" fill="#7F77DD" opacity="0.85"/><path d="M12 12C14 8 20 6 21 10s-5 6-9 2z" fill="#7F77DD" opacity="0.85"/><path d="M12 12C10 15 5 17 4 14s4-5 8-2z" fill="#AFA9EC" opacity="0.85"/><path d="M12 12C14 15 19 17 20 14s-4-5-8-2z" fill="#AFA9EC" opacity="0.85"/><ellipse cx="12" cy="12" rx="1" ry="3" fill="#3C3489"/>' },
    { id: 'wave',      label: 'Wave',     svg: '<path d="M2 12c2-4 4-4 6 0s4 4 6 0 4-4 6 0" fill="none" stroke="#378ADD" stroke-width="2.5" stroke-linecap="round"/>' },
    { id: 'mountain',  label: 'Mountain', svg: '<path d="M2 20L8 8l4 5 3-4 7 11H2z" fill="#888780" stroke="#5F5E5A" stroke-width="0.5"/><path d="M8 8l2 3h-4z" fill="white" opacity="0.6"/>' },
  ],
  Gaming: [
    { id: 'gem',       label: 'Gem',      svg: '<polygon points="12,3 20,9 20,15 12,21 4,15 4,9" fill="#5DCAA5" stroke="#0F6E56" stroke-width="0.8"/><polygon points="12,3 20,9 12,9 4,9" fill="#9FE1CB" opacity="0.7"/>' },
    { id: 'sword',     label: 'Sword',    svg: '<path d="M15 3l6 6-12 12-2-2 10-10-1-1L5 19l-2-2L15 3z" fill="#B4B2A9"/><path d="M8 18l-4 4" stroke="#888780" stroke-width="2" stroke-linecap="round"/>' },
    { id: 'shield',    label: 'Shield',   svg: '<path d="M12 3L4 7v5c0 4.5 3.5 8.5 8 9.5 4.5-1 8-5 8-9.5V7L12 3z" fill="#7F77DD" stroke="#534AB7" stroke-width="0.8"/><path d="M9 12l2 2 4-4" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>' },
    { id: 'skull',     label: 'Skull',    svg: '<path d="M12 3a7 7 0 0 0-7 7c0 2.5 1.3 4.7 3.2 5.9V18h7.6v-2.1A7 7 0 0 0 12 3z" fill="#D3D1C7"/><rect x="8" y="18" width="8" height="2" rx="1" fill="#D3D1C7"/><circle cx="9.5" cy="10" r="1.5" fill="#141210"/><circle cx="14.5" cy="10" r="1.5" fill="#141210"/><path d="M10 15h4" stroke="#888780" stroke-width="1"/>' },
    { id: 'crown',     label: 'Crown',    svg: '<path d="M3 17L5 8l4 4 3-6 3 6 4-4 2 9H3z" fill="#EF9F27" stroke="#BA7517" stroke-width="0.8"/><circle cx="5" cy="8" r="1.5" fill="#E24B4A"/><circle cx="12" cy="6" r="1.5" fill="#E24B4A"/><circle cx="19" cy="8" r="1.5" fill="#E24B4A"/>' },
    { id: 'potion',    label: 'Potion',   svg: '<path d="M9 4h6v4l3 6a4 4 0 0 1-12 0l3-6V4z" fill="#7F77DD" opacity="0.85" stroke="#534AB7" stroke-width="0.8"/><rect x="9" y="2" width="6" height="2.5" rx="1" fill="#B4B2A9"/><circle cx="12" cy="14" r="2" fill="white" opacity="0.4"/>' },
    { id: 'lightning', label: 'Bolt',     svg: '<path d="M13 2L4 13h7l-1 9 9-11h-7z" fill="#EF9F27"/>' },
    { id: 'fire',      label: 'Fire',     svg: '<path d="M12 2c0 4-4 4-4 8a4 4 0 0 0 8 0c0-2-1-3-1-5-1 1-1 3-3 3 0-3 2-4 0-6z" fill="#E24B4A"/><path d="M12 10c0 2-2 2-2 4a2 2 0 0 0 4 0c0-2-2-2-2-4z" fill="#EF9F27"/>' },
    { id: 'pixel-h',   label: 'PxHeart',  svg: '<rect x="3" y="5" width="4" height="2" fill="#D85A30"/><rect x="13" y="5" width="4" height="2" fill="#D85A30"/><rect x="1" y="7" width="6" height="2" fill="#D85A30"/><rect x="11" y="7" width="6" height="2" fill="#D85A30"/><rect x="1" y="9" width="18" height="2" fill="#D85A30"/><rect x="3" y="11" width="14" height="2" fill="#D85A30"/><rect x="5" y="13" width="10" height="2" fill="#D85A30"/><rect x="7" y="15" width="6" height="2" fill="#D85A30"/><rect x="9" y="17" width="2" height="2" fill="#D85A30"/>' },
  ],
  Decorative: [
    { id: 'tape1',     label: 'Tape',     svg: '<rect x="1" y="8" width="22" height="8" rx="2" fill="rgba(181,148,58,0.4)"/>' },
    { id: 'tape2',     label: 'Tape B',   svg: '<rect x="1" y="8" width="22" height="8" rx="2" fill="rgba(125,155,118,0.45)"/>' },
    { id: 'tape3',     label: 'Tape R',   svg: '<rect x="1" y="8" width="22" height="8" rx="2" fill="rgba(193,122,92,0.42)"/>' },
    { id: 'tape4',     label: 'Tape P',   svg: '<rect x="1" y="8" width="22" height="8" rx="2" fill="rgba(127,119,221,0.4)"/>' },
    { id: 'tape-dot',  label: 'Tape Dot', svg: '<rect x="1" y="8" width="22" height="8" rx="2" fill="rgba(181,148,58,0.35)"/><circle cx="5" cy="12" r="1.2" fill="rgba(181,148,58,0.8)"/><circle cx="9" cy="12" r="1.2" fill="rgba(181,148,58,0.8)"/><circle cx="13" cy="12" r="1.2" fill="rgba(181,148,58,0.8)"/><circle cx="17" cy="12" r="1.2" fill="rgba(181,148,58,0.8)"/>' },
    { id: 'pin',       label: 'Pin',      svg: '<circle cx="12" cy="8" r="5" fill="#D85A30"/><line x1="12" y1="13" x2="12" y2="22" stroke="#993C1D" stroke-width="2" stroke-linecap="round"/>' },
    { id: 'bow',       label: 'Bow',      svg: '<path d="M12 12C9 9 4 8 4 11s5 4 8 1z" fill="#D85A30"/><path d="M12 12C15 9 20 8 20 11s-5 4-8 1z" fill="#D85A30"/><circle cx="12" cy="12" r="2" fill="#993C1D"/>' },
    { id: 'key',       label: 'Key',      svg: '<circle cx="8" cy="9" r="4" fill="none" stroke="#EF9F27" stroke-width="2"/><path d="M11.5 9h9M17 9v3" stroke="#EF9F27" stroke-width="2" stroke-linecap="round"/>' },
    { id: 'compass',   label: 'Compass',  svg: '<circle cx="12" cy="12" r="9" fill="none" stroke="#B4B2A9" stroke-width="1.2"/><path d="M12 5l2 7-2 2-2-2z" fill="#E24B4A"/><path d="M12 19l-2-7 2-2 2 2z" fill="#B4B2A9"/><circle cx="12" cy="12" r="1.5" fill="#5F5E5A"/>' },
    { id: 'check',     label: 'Check',    svg: '<circle cx="12" cy="12" r="9" fill="none" stroke="#1D9E75" stroke-width="1.5"/><path d="M7 12l3.5 3.5L17 8" stroke="#1D9E75" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>' },
    { id: 'x-mark',    label: 'Cross',    svg: '<circle cx="12" cy="12" r="9" fill="none" stroke="#D85A30" stroke-width="1.5"/><path d="M8 8l8 8M16 8l-8 8" stroke="#D85A30" stroke-width="2" stroke-linecap="round"/>' },
    { id: 'ribbon',    label: 'Ribbon',   svg: '<path d="M12 12L6 4h12z" fill="#7F77DD"/><path d="M12 12L6 20h12z" fill="#534AB7"/><circle cx="12" cy="12" r="2" fill="#EEEDFE"/>' },
    { id: 'arrow-r',   label: '→',        svg: '<path d="M5 12h14M12 5l7 7-7 7" stroke="#3b3328" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>' },
    { id: 'arrow-up',  label: '↑',        svg: '<path d="M12 19V5M5 12l7-7 7 7" stroke="#3b3328" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>' },
    { id: 'sparkle',   label: 'Sparkle',  svg: '<path d="M12 2v4M12 18v4M2 12h4M18 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" stroke="#EF9F27" stroke-width="1.5" stroke-linecap="round"/><circle cx="12" cy="12" r="2.5" fill="#EF9F27"/>' },
  ],
  Shapes: [
    { id: 'tri',       label: 'Triangle', svg: '<polygon points="12,3 22,20 2,20" fill="none" stroke="#b5943a" stroke-width="2"/>' },
    { id: 'hex',       label: 'Hexagon',  svg: '<polygon points="12,2 20,7 20,17 12,22 4,17 4,7" fill="none" stroke="#b5943a" stroke-width="2"/>' },
    { id: 'diamond-s', label: 'Diamond',  svg: '<polygon points="12,2 22,12 12,22 2,12" fill="none" stroke="#b5943a" stroke-width="2"/>' },
    { id: 'circle-s',  label: 'Circle',   svg: '<circle cx="12" cy="12" r="9" fill="none" stroke="#b5943a" stroke-width="2"/>' },
    { id: 'plus-s',    label: 'Plus',     svg: '<path d="M12 3v18M3 12h18" stroke="#b5943a" stroke-width="2.5" stroke-linecap="round"/>' },
    { id: 'squiggle',  label: 'Squiggle', svg: '<path d="M3 12c2-4 4 4 6 0s4-4 6 0 4 4 6 0" fill="none" stroke="#b5943a" stroke-width="2.5" stroke-linecap="round"/>' },
  ],
};

/** Flat array of all stickers — useful for lookup by id. */
export const STICKERS: Sticker[] = Object.values(STICKER_CATS).flat();
