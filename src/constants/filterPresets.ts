/** Photo filter preset. All values match the short-name filter properties on PhotoElement. */
export interface FilterPreset {
  name: string;
  br: number; co: number; sa: number; bl: number;
  se: number; hr: number; iv: number; op: number;
}

export const FILTER_PRESETS: FilterPreset[] = [
  { name: 'Normal',  br: 100, co: 100, sa: 100, bl: 0,   se: 0,  hr: 0,   iv: 0,   op: 100 },
  { name: 'Vintage', br: 108, co: 88,  sa: 75,  bl: 0,   se: 40, hr: 12,  iv: 0,   op: 100 },
  { name: 'Film',    br: 105, co: 82,  sa: 68,  bl: 0,   se: 18, hr: 0,   iv: 0,   op: 95  },
  { name: 'Fade',    br: 118, co: 72,  sa: 58,  bl: 0,   se: 12, hr: 0,   iv: 0,   op: 88  },
  { name: 'Chrome',  br: 104, co: 132, sa: 145, bl: 0,   se: 0,  hr: 0,   iv: 0,   op: 100 },
  { name: 'Cold',    br: 100, co: 108, sa: 88,  bl: 0,   se: 0,  hr: 205, iv: 0,   op: 100 },
  { name: 'Warm',    br: 106, co: 102, sa: 115, bl: 0,   se: 28, hr: 352, iv: 0,   op: 100 },
  { name: 'Drama',   br: 88,  co: 145, sa: 125, bl: 0,   se: 0,  hr: 0,   iv: 0,   op: 100 },
  { name: 'B&W',     br: 100, co: 112, sa: 0,   bl: 0,   se: 0,  hr: 0,   iv: 0,   op: 100 },
  { name: 'Matte',   br: 112, co: 78,  sa: 48,  bl: 0,   se: 22, hr: 0,   iv: 0,   op: 85  },
  { name: 'Vivid',   br: 106, co: 122, sa: 165, bl: 0,   se: 0,  hr: 0,   iv: 0,   op: 100 },
  { name: 'Noir',    br: 82,  co: 155, sa: 0,   bl: 0,   se: 22, hr: 0,   iv: 0,   op: 100 },
  { name: 'Dreamy',  br: 115, co: 75,  sa: 80,  bl: 1,   se: 8,  hr: 0,   iv: 0,   op: 92  },
  { name: 'Haze',    br: 120, co: 68,  sa: 55,  bl: 1.5, se: 0,  hr: 0,   iv: 0,   op: 88  },
  { name: 'Golden',  br: 108, co: 105, sa: 120, bl: 0,   se: 45, hr: 5,   iv: 0,   op: 100 },
  { name: 'Invert',  br: 100, co: 100, sa: 100, bl: 0,   se: 0,  hr: 0,   iv: 100, op: 100 },
];
