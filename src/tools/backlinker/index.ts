import path from 'path';

import {
  Link,
  Metadata,
  Notes,
  NoteData,
} from '../..';
import { extractAllLinksFromContent } from '../links';

export function backlinker(notes: Notes) {
  const getKey = (dir: string, base: string): string => path.join(dir, base);

  const backlinksMap: Record<string, any> = notes
    .reduce((backlinks: Record<string, any>, { body, metadata }: NoteData) => {
      const { file: { dir } } = metadata;

      extractAllLinksFromContent(body).forEach(({ path: linkPath }: Link) => {
        const key = getKey(dir, linkPath);

        backlinks[key] = backlinks[key] || [];
        backlinks[key].push({ ...metadata });
      });

      return backlinks;
    }, {});

  notes.transform({
    metadata: {
      backlinks: ({ file }: Metadata) => backlinksMap[getKey(file.dir, file.base)] || [],
    },
  });
}
