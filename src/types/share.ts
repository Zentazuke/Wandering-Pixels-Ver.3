/**
 * share.ts — social-ready export formats and privacy controls.
 * Sharing is EXPORT to existing platforms (Instagram, WhatsApp, Messages…)
 * via the Web Share API or a download — never a feed, never profiles.
 */
export type ShareFormat = 'story' | 'square' | 'portrait' | 'original';

export interface ShareFormatDef {
  format: ShareFormat;
  label:  string;
  /** Output pixel size; null means "the board's own size". */
  width:  number | null;
  height: number | null;
}

export const SHARE_FORMATS: ShareFormatDef[] = [
  { format: 'story',    label: 'Story 9:16',    width: 1080, height: 1920 },
  { format: 'square',   label: 'Square 1:1',    width: 1080, height: 1080 },
  { format: 'portrait', label: 'Portrait 4:5',  width: 1080, height: 1350 },
  { format: 'original', label: 'Original board', width: null, height: null },
];

/** What stays private when a memory leaves the device — all default to safe. */
export interface SharePrivacy {
  hideText:       boolean;
  hideDate:       boolean;
  hideLocation:   boolean;
  hideNames:      boolean;
  hideTranscript: boolean;
  watermark:      boolean;
}

export const DEFAULT_SHARE_PRIVACY: SharePrivacy = {
  hideText: false, hideDate: false, hideLocation: false,
  hideNames: false, hideTranscript: true, watermark: true,
};
