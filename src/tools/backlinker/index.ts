import nodePath from 'path';

import {
  Link,
  Metadata,
  Notes,
  NoteData,
} from '../..';
import { extractAllLinksFromContent } from '../links';

export type BacklinkerOptions = {
  keyFn?: (directory: string, path: string) => string;
};

export function backlinker(notes: Notes, options?: BacklinkerOptions) {
  const defaultKeyFn = (dir: string, name: string): string => nodePath.join(dir, name);

  const { keyFn = defaultKeyFn } = options || {};

  const backlinksMap: Record<string, any> = notes
    .reduce((backlinks: Record<string, any>, { body, metadata }: NoteData) => {
      const { file: { dir } } = metadata;

      extractAllLinksFromContent(body).forEach(({ path: linkPath }: Link) => {
        const key = keyFn(dir, linkPath);

        backlinks[key] = backlinks[key] || [];
        backlinks[key].push({ ...metadata });
      });

      return backlinks;
    }, {});

  notes.transform({
    metadata: {
      backlinks: ({ file }: Metadata) => backlinksMap[keyFn(file.dir, file.name)] || [],
    },
  });
}
