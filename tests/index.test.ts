/* eslint-disable */

/* @ts-ignore */
import fs from 'fs';
/* @ts-ignore */
import os from 'os';
/* @ts-ignore */
import path, { ParsedPath } from 'path';

import Notes, { Link, Metadata, NoteData } from '../dist';
import { backlinker } from '../dist/tools';

import {
  notes as expectedNotes,
  withTransform as expectedNotesWithTransform,
} from './fixtures/notes/expected';

describe('Notes', () => {
  test('initializes with empty files list', () => {
    const notes = new Notes();
    expect(notes.collect()).toEqual([]);
  });

  describe('load()', () => {
    test('loads files from filepath', async () => {
      const filepath = path.join(__dirname, './fixtures/notes/notes');
      const notes = new Notes();

      await notes.load(filepath);
      expect(notes.collect()).toEqual(expectedNotes);
    });

    test('loads files from `/**/*.md` glob', async () => {
      const glob = path.join(__dirname, './fixtures/notes/notes/**/*.md');
      const notes = new Notes();

      await notes.load(glob);
      expect(notes.collect()).toEqual(expectedNotes);
    });

    test('loads files with initial transform map', async () => {
      const glob = path.join(__dirname, './fixtures/notes/notes/**/*.md');
      const notes = new Notes();

      const transform = {
        body: (body: string) => body.replace('multiple lines', 'an additional line'),
        metadata: {
          file: ({ file }: Metadata) => ({ ...file, url: path.join('/notes/', file.name) }), 
          project: () => 'my project',
        },
      };

      await notes.load(glob, { transform });
      expect(notes.collect()).toEqual(expectedNotesWithTransform);
    });

    test('loads files with initial transform function', async () => {
      const glob = path.join(__dirname, './fixtures/notes/notes/**/*.md');
      const notes = new Notes();

      const transform = ({ body, metadata }: NoteData) => ({
        body: body.replace('multiple lines', 'an additional line'),
        metadata: {
          ...metadata,
          file: {
            ...metadata.file,
            url: path.join('/notes/', metadata.file.name),
          },
          project: 'my project',
        },
      });

      await notes.load(glob, { transform });
      expect(notes.collect()).toEqual(expectedNotesWithTransform);
    });
  });

  describe('export2JSON()', () => {
    const notes = new Notes();
    let exportDestination: string;

    beforeAll(async () => {
      const glob = path.join(__dirname, './fixtures/notes/notes/**/*.md');
      await notes.load(glob);
    });

    beforeEach(async () => {
      const tmpDir = await fs.mkdtempSync(os.tmpdir());
      exportDestination = path.join(tmpDir, 'export.json');
    });

    test('exports file data to JSON', async () => {
      await notes.export2JSON(exportDestination);
      const exportContent = JSON.parse(await fs.readFileSync(exportDestination).toString());
      expect(exportContent).toEqual(JSON.parse(JSON.stringify(expectedNotes)));
    });

    test('exports file data to JSON with transform', async () => {
      const transform = ({ body, metadata }: NoteData) => ({
        body: body.replace('multiple lines', 'an additional line'),
        metadata: {
          ...metadata,
          file: {
            ...metadata.file,
            url: path.join('/notes/', metadata.file.name),
          },
          project: 'my project',
        },
      });

      await notes.export2JSON(exportDestination, { transform });
      const exportContent = JSON.parse(await fs.readFileSync(exportDestination).toString());
      expect(exportContent).toEqual(JSON.parse(JSON.stringify(expectedNotesWithTransform)));
    });
  });
});
