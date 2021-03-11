/* eslint-disable */

/* @ts-ignore */
import fs from 'fs';
/* @ts-ignore */
import os from 'os';
/* @ts-ignore */
import path from 'path';

import { Files, File, Metadata, FileData, regex } from '../dist';

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
    const files = new Files();

    afterEach(async () => {
      files.clear();
    });

    test('loads individual file from filepath', async () => {
      const filepath = path.join(__dirname, './fixtures/files/src/Test file 2.md');

      await files.load(filepath);
      expect(files.collect().length).toEqual(1);
      expect(files.collect()[0]).toEqual(expectedFiles[1]);
    });

    test('loads files from filepath', async () => {
      const filepath = path.join(__dirname, './fixtures/files/src');

      await files.load(filepath);
      expect(files.collect()).toEqual(expectedFiles);
    });

    test('loads files from glob', async () => {
      const glob = path.join(__dirname, './fixtures/files/src/**/*.md');

      await files.load(glob);
      expect(files.collect()).toEqual(expectedFiles);
    });

    test('loads files consecutively', async () => {
      const glob = path.join(__dirname, './fixtures/files/src/**/*.md');

      await files.load(glob);
      await files.load(glob);
      expect(files.collect().length).toEqual((expectedFiles.length * 2));
      expect(files.collect()).toEqual(expectedFiles.concat(expectedFiles));
    });

    test('overwrites current files when `options.overwrite=true`', async () => {
      const glob1 = path.join(__dirname, './fixtures/files/src/*1.md');
      const glob2 = path.join(__dirname, './fixtures/files/src/*2.md');

      await files.load(glob1);
      await files.load(glob2, { overwrite: true });
      expect(files.collect()[0]).toEqual(expectedFiles[1]);
    });

    test('filters new files with `options.filterFilepaths` function', async () => {
      const glob = path.join(__dirname, './fixtures/files/src/**/*.md');

      const filterFilepaths = (filepath: string) => filepath.includes('2');

      await files.load(glob, { filterFilepaths });
      expect(files.collect().length).toEqual(1);
      expect(files.collect()[0]).toEqual(expectedFiles[1]);
    });
  });

  describe('clear', () => {
    const glob = path.join(__dirname, './fixtures/files/src/**/*.md');
    const files = new Files();

    beforeEach(async () => {
      await files.load(glob);
    });

    test('clears currently loaded files', async () => {
      files.clear();
      expect(files.collect()).toEqual([]);
    });
  });

  describe('export2JSON', () => {
    const glob = path.join(__dirname, './fixtures/files/src/**/*.md');
    const files = new Files();
    let exportDestination: string;

    beforeAll(async () => {
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
    const glob = path.join(__dirname, './fixtures/files/src/**/*.md');
    const files = new Files();

    beforeEach(async () => {
      await files.load(glob);
    });

    afterEach(async () => {
      files.clear();
    });

    test('returns array of currently loaded files', async () => {
      expect(files.collect()).toEqual(expectedFiles);
    });
  });

  describe('collectInstances', () => {
    const glob = path.join(__dirname, './fixtures/files/src/**/*.md');
    const files = new Files();

    beforeEach(async () => {
      await files.load(glob);
    });

    afterEach(async () => {
      files.clear();
    });

    test('returns array of currently loaded File instances', async () => {
      expect(files.collectInstances()[0]).toBeInstanceOf(File);
    });
  });

  describe('map', () => {
    const glob = path.join(__dirname, './fixtures/files/src/**/*.md');
    const files = new Files();

    beforeEach(async () => {
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
    const glob = path.join(__dirname, './fixtures/files/src/**/*.md');
    const files = new Files();

    beforeEach(async () => {
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
    const glob = path.join(__dirname, './fixtures/files/src/**/*.md');
    const files = new Files();

    beforeEach(async () => {
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

describe('File', () => {
  describe('load', () => {
    test('loads individual file from filepath', async () => {
      const filepath = path.join(__dirname, './fixtures/files/src/Test file 2.md');
      const file = await new File().load(filepath);
      expect(file.getData()).toEqual(expectedFiles[1]);
    });
  });

  describe('write', () => {
    test('writes new file with YAML metadata from currently loaded data', async () => {
      const filepath = path.join(__dirname, './fixtures/files/src/Test file 1.md');
      const file = await new File().load(filepath);

      const tmpDir = await fs.mkdtempSync(os.tmpdir());
      const writeDestination = path.join(tmpDir, 'write.md');

      const replace = (content: string) => content.replace('T00:00:00.000Z', '');

      await file.write(writeDestination, { replace });
      const writeContent = await fs.readFileSync(writeDestination).toString()
      const originalContent = await fs.readFileSync(filepath).toString()
      expect(writeContent).toEqual(originalContent);
    });

    test('writes new file with JSON metadata from currently loaded data', async () => {
      const filepath = path.join(__dirname, './fixtures/files/src/Test file 2.md');
      const file = await new File().load(filepath);

      const tmpDir = await fs.mkdtempSync(os.tmpdir());
      const writeDestination = path.join(tmpDir, 'write.md');

      await file.write(writeDestination, { fmFormat: { format: 'json', space: 2 } });
      const writeContent = await fs.readFileSync(writeDestination).toString()
      const originalContent = await fs.readFileSync(filepath).toString()
      expect(writeContent).toEqual(originalContent);
    });

    test('writes new file from currently loaded metadata only', async () => {
      const filepath = path.join(__dirname, './fixtures/files/src/Test file 2.md');
      const file = await new File().load(filepath);

      const tmpDir = await fs.mkdtempSync(os.tmpdir());
      const writeDestination = path.join(tmpDir, 'write.md');

      await file.write(writeDestination, { body: false, fmFormat: { format: 'json', space: 2 } });
      const writeContent = await fs.readFileSync(writeDestination).toString()
      const originalContent = await fs.readFileSync(filepath).toString()
      const originalContentSansBody = originalContent.replace(regex.body.whole, '');
      expect(writeContent).toEqual(originalContentSansBody);
    });

    test('writes new file from currently loaded body only', async () => {
      const filepath = path.join(__dirname, './fixtures/files/src/Test file 2.md');
      const file = await new File().load(filepath);

      const tmpDir = await fs.mkdtempSync(os.tmpdir());
      const writeDestination = path.join(tmpDir, 'write.md');

      await file.write(writeDestination, { metadata: false, fmFormat: { format: 'json', space: 2 } });
      const writeContent = await fs.readFileSync(writeDestination).toString()
      const originalContent = await fs.readFileSync(filepath).toString()
      const originalContentSansFrontmatter = originalContent.replace(regex.frontmatter.whole, '');
      expect(writeContent).toEqual(originalContentSansFrontmatter);
    });
  });

  describe('export2JSON', () => {
    test('exports individual file data to JSON', async () => {
      const filepath = path.join(__dirname, './fixtures/files/src/Test file 2.md');
      const file = await new File().load(filepath);

      const tmpDir = await fs.mkdtempSync(os.tmpdir());
      const exportDestination = path.join(tmpDir, 'export.json');

      await file.export2JSON(exportDestination);
      const exportContent = JSON.parse(await fs.readFileSync(exportDestination).toString())
      expect(exportContent).toEqual(JSON.parse(JSON.stringify(expectedFiles[1])));
    });

    test('exports individual file data to JSON using files.collectInstances() iteration', async () => {
      const glob = path.join(__dirname, './fixtures/files/src/**/*.md');
      const files = await new Files().load(glob);

      let exportDestinations: string[] = [];
      const tmpDir = await fs.mkdtempSync(os.tmpdir());
      exportDestinations.push(path.join(tmpDir, 'export1.json'));
      exportDestinations.push(path.join(tmpDir, 'export2.json'));

      const instances = files.collectInstances();

      for (let i = 0; i < instances.length; i++) {
        await instances[i].export2JSON(exportDestinations[i]);
      }

      const exportContents = await Promise.all(
        exportDestinations.map(async (d) => JSON.parse(await fs.readFileSync(d).toString()))
      );

      expect(exportContents).toEqual(JSON.parse(JSON.stringify(expectedFiles)));
    });
  });

  describe('transform', () => {
    let file: File;

    beforeEach(async () => {
      const filepath = path.join(__dirname, './fixtures/files/src/Test file 2.md');
      file = await new File().load(filepath);
    });

    test('transforms file with transform map', async () => {
      const transform = {
        body: (body: string) => body.replace('multiple lines', 'an additional line'),
        metadata: {
          file: ({ file }: Metadata) => ({ ...file, url: path.join('/notes/', file.name) }), 
          project: () => 'my project',
        },
      };

      file.transform(transform);
      expect(file.getData()).toEqual(expectedFilesWithTransform[1]);
    });

    test('transforms file with transform map', async () => {
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

      file.transform(transform);
      expect(file.getData()).toEqual(expectedFilesWithTransform[1]);
    });
  });
});
