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

  describe('load', () => {
    test('loads individual file from filepath', async () => {
      const filepath = path.join(__dirname, './fixtures/files/src/Test file 2.md');
      const files = new Files();

      await files.load(filepath);
      expect(files.collect().length).toEqual(1);
      expect(files.collect()[0]).toEqual(expectedFiles[1]);
    });

    test('loads files from filepath', async () => {
      const filepath = path.join(__dirname, './fixtures/files/src');
      const files = new Files();

      await files.load(filepath);
      expect(files.collect()).toEqual(expectedFiles);
    });

    test('loads files from glob', async () => {
      const glob = path.join(__dirname, './fixtures/files/src/**/*.md');
      const files = new Files();

      await files.load(glob);
      expect(files.collect()).toEqual(expectedFiles);
    });

    test('loads files consecutively', async () => {
      const glob = path.join(__dirname, './fixtures/files/src/**/*.md');
      const files = new Files();

      await files.load(glob);
      await files.load(glob);
      expect(files.collect().length).toEqual((expectedFiles.length * 2));
      expect(files.collect()).toEqual(expectedFiles.concat(expectedFiles));
    });

    test('overwrites current files when `options.overwrite=true`', async () => {
      const glob1 = path.join(__dirname, './fixtures/files/src/*1.md');
      const glob2 = path.join(__dirname, './fixtures/files/src/*2.md');
      const files = new Files();

      await files.load(glob1);
      await files.load(glob2, { overwrite: true });
      expect(files.collect()[0]).toEqual(expectedFiles[1]);
    });

    test('filters new files with `options.filterFilepaths` function', async () => {
      const glob = path.join(__dirname, './fixtures/files/src/**/*.md');
      const files = new Files();

      const filterFilepaths = (filepath: string) => filepath.includes('2');

      await files.load(glob, { filterFilepaths });
      expect(files.collect().length).toEqual(1);
      expect(files.collect()[0]).toEqual(expectedFiles[1]);
    });
  });

  describe('clear', () => {
    const files = new Files();

    beforeEach(async () => {
      const glob = path.join(__dirname, './fixtures/files/src/**/*.md');
      await files.load(glob);
    });

    test('clears currently loaded files', async () => {
      files.clear();
      expect(files.collect()).toEqual([]);
    });
  });

  describe('export2JSON', () => {
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

  describe('collect', () => {
    const files = new Files();

    beforeEach(async () => {
      const glob = path.join(__dirname, './fixtures/files/src/**/*.md');
      await files.load(glob);
    });

    test('returns array of currently loaded files', async () => {
      expect(files.collect()).toEqual(expectedFiles);
    });
  });

  describe('map', () => {
    const files = new Files();

    beforeEach(async () => {
      const glob = path.join(__dirname, './fixtures/files/src/**/*.md');
      await files.load(glob);
    });

    afterEach(async () => {
      files.clear();
    });

    test('iterates over currently loaded files with Array.map()', async () => {
      const mappedFiles = files.map((file: FileData) => file);
      expect(mappedFiles).toEqual(expectedFiles);
    });
  });

  describe('reduce', () => {
    const files = new Files();

    beforeEach(async () => {
      const glob = path.join(__dirname, './fixtures/files/src/**/*.md');
      await files.load(glob);
    });

    afterEach(async () => {
      files.clear();
    });

    test('iterates over currently loaded files with Array.reduce()', async () => {
      const reducer = (acc: Record<number, FileData>, file: FileData, index: number) => {
        acc[index] = file;
        return acc;
      };

      const reducedExpected = expectedFiles.reduce(reducer, {});
      const reducedFiles = files.reduce(reducer, {});

      expect(reducedFiles).toEqual(reducedExpected);
    });
  });

  describe('transform', () => {
    const files = new Files();

    beforeEach(async () => {
      const glob = path.join(__dirname, './fixtures/files/src/**/*.md');
      await files.load(glob);
    });

    afterEach(async () => {
      files.clear();
    });

    test('transforms files with transform map', async () => {
      const transform = {
        body: (body: string) => body.replace('multiple lines', 'an additional line'),
        metadata: {
          file: ({ file }: Metadata) => ({ ...file, url: path.join('/notes/', file.name) }), 
          project: () => 'my project',
        },
      };

      files.transform(transform);
      expect(files.collect()).toEqual(expectedFilesWithTransform);
    });

    test('transforms files with transform function', async () => {
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

      files.transform(transform);
      expect(files.collect()).toEqual(expectedFilesWithTransform);
    });
  });
});
