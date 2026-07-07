/** collectionTemplates.ts — layouts for multi-entry collections.
 *  MVP: one timeline done beautifully; scrapbook/yearbook come later. */
import type { CollectionTemplate } from '../types/templates';

export const COLLECTION_TEMPLATES: CollectionTemplate[] = [
  {
    id: 'timeline',
    name: 'Through the Years',
    description: 'Memories in order along a golden timeline — oldest to newest.',
    kind: 'timeline',
    bg: 'linen',
  },
];
