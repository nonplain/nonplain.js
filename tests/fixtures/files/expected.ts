/* @ts-ignore */
import path from 'path';

import { FileData } from '../../../dist';

const base = [
  {
    body: "\nTest file 1 body\nwith multiple lines\nhere's a [[wiki link]]\nhere's a [md link](./Test file 2.md) as well\n",
    metadata: {
      when: new Date('2021-01-01T00:00:00.000Z'),
      file: {
        base: 'Test file 1.md',
        dir: path.join(__dirname, '/src'),
        ext: '.md',
        name: 'Test file 1',
        root: '/',
      },
      name: 'Test file 1',
    },
  },
  {
    body: "\nTest file 2 body\nwith multiple lines\nhere's a [[wiki link]]\nhere's a [md link](./Test file 1.md) as well\n",
    metadata: {
      when: '2021-01-02',
      file: {
        base: 'Test file 2.md',
        dir: path.join(__dirname, '/src'),
        ext: '.md',
        name: 'Test file 2',
        root: '/',
      },
      name: 'Test file 2',
    },
  },
];

export const files = base;

export const withTransform = base.map(({ body, metadata }: FileData) => ({
  body: body.replace('multiple lines', 'an additional line'),
  metadata: {
    ...metadata,
    file: {
      ...metadata.file,
      url: path.join('/notes/', metadata.file.name),
    },
    project: 'my project',
  },
}));
