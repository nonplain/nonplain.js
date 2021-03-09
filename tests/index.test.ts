/* eslint-disable */

/* @ts-ignore */
import fs from 'fs';
/* @ts-ignore */
import os from 'os';
/* @ts-ignore */
import path, { ParsedPath } from 'path';

import { Files, Metadata, FileData } from '../dist';

import {
  files as expectedFiles,
  withTransform as expectedFilesWithTransform,
} from './fixtures/files/expected';

describe('Files', () => {
  test('initializes with empty files list', () => {
    const files = new Files();
    expect(files.collect()).toEqual([]);
  });

  describe('load()', () => {
    test('loads files from filepath', async () => {
      const filepath = path.join(__dirname, './fixtures/files/src');
      const files = new Files();

      await files.load(filepath);
      expect(files.collect()).toEqual(expectedFiles);
    });

    test('loads files from `/**/*.md` glob', async () => {
      const glob = path.join(__dirname, './fixtures/files/src/**/*.md');
      const files = new Files();

      await files.load(glob);
      expect(files.collect()).toEqual(expectedFiles);
    });

    test('loads files with initial transform map', async () => {
      const glob = path.join(__dirname, './fixtures/files/src/**/*.md');
      const files = new Files();

      const transform = {
        body: (body: string) => body.replace('multiple lines', 'an additional line'),
        metadata: {
          file: ({ file }: Metadata) => ({ ...file, url: path.join('/notes/', file.name) }), 
          project: () => 'my project',
        },
      };

      await files.load(glob, { transform });
      expect(files.collect()).toEqual(expectedFilesWithTransform);
    });

    test('loads files with initial transform function', async () => {
      const glob = path.join(__dirname, './fixtures/files/src/**/*.md');
      const files = new Files();

      const transform = ({ body, metadata }: FileData) => ({
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

      await files.load(glob, { transform });
      expect(files.collect()).toEqual(expectedFilesWithTransform);
    });
  });

  describe('export2JSON()', () => {
    const files = new Files();
    let exportDestination: string;

    beforeAll(async () => {
      const glob = path.join(__dirname, './fixtures/files/src/**/*.md');
      await files.load(glob);
    });

    beforeEach(async () => {
      const tmpDir = await fs.mkdtempSync(os.tmpdir());
      exportDestination = path.join(tmpDir, 'export.json');
    });

    test('exports file data to JSON', async () => {
      await files.export2JSON(exportDestination);
      const exportContent = JSON.parse(await fs.readFileSync(exportDestination).toString());
      expect(exportContent).toEqual(JSON.parse(JSON.stringify(expectedFiles)));
    });

    test('exports file data to JSON with transform', async () => {
      const transform = ({ body, metadata }: FileData) => ({
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

      await files.export2JSON(exportDestination, { transform });
      const exportContent = JSON.parse(await fs.readFileSync(exportDestination).toString());
      expect(exportContent).toEqual(JSON.parse(JSON.stringify(expectedFilesWithTransform)));
    });
  });
});
