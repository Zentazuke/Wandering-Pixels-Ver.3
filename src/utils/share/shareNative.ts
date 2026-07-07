/**
 * shareNative.ts — hand an image to the platform's share sheet.
 * Web Share API where available (the mobile path to Instagram/WhatsApp/…),
 * plain download everywhere else. Sharing is always the user's own act.
 */
export type ShareOutcome = 'shared' | 'downloaded' | 'cancelled';

export async function shareOrDownload(blob: Blob, filename: string, title: string): Promise<ShareOutcome> {
  const file = new File([blob], filename, { type: blob.type });
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title });
      return 'shared';
    } catch (err) {
      // user closed the sheet — not an error, and don't force a download
      if ((err as DOMException)?.name === 'AbortError') return 'cancelled';
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 3000);
  return 'downloaded';
}
