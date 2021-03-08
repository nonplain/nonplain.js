/* @ts-ignore */
import path from 'path';

import { NoteData } from '../../../dist';

const base = [
  {
    body: "\nTest note 1 body\nwith multiple lines\nhere's a [[wiki link]]\nhere's a [md link](./Test note 2.md) as well\n",
    metadata: {
      date: new Date('2021-01-01T00:00:00.000Z'),
      file: {
        base: 'Test note 1.md',
        dir: path.join(__dirname, '/notes'),
        ext: '.md',
        name: 'Test note 1',
        root: '/',
      },
      title: 'Test note 1',
    },
  },
  {
    body: "\nTest note 2 body\nwith multiple lines\nhere's a [[wiki link]]\nhere's a [md link](./Test note 1.md) as well\n",
    metadata: {
      date: new Date('2021-01-02T00:00:00.000Z'),
      file: {
        base: 'Test note 2.md',
        dir: path.join(__dirname, '/notes'),
        ext: '.md',
        name: 'Test note 2',
        root: '/',
      },
      title: 'Test note 2',
    },
  },
];

export const notes = base;

export const withTransform = base.map(({ body, metadata }: NoteData) => ({
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
