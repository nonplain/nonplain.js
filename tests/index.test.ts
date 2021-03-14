/* eslint-disable */

/* @ts-ignore */
import fs from 'fs';
/* @ts-ignore */
import os from 'os';
/* @ts-ignore */
import path from 'path';

import Files, { File, Metadata, FileData, regex } from '../dist';

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

    afterEach(() => {
      files.clear();
    });

    test('loads individual file from filepath', () => {
      const filepath = path.join(__dirname, './fixtures/files/src/Test file 2.md');

      files.load(filepath);
      expect(files.collect().length).toEqual(1);
      expect(files.collect()[0]).toEqual(expectedFiles[1]);
    });

    test('loads files from filepath', () => {
      const filepath = path.join(__dirname, './fixtures/files/src');

      files.load(filepath);
      expect(files.collect()).toEqual(expectedFiles);
    });

    test('loads files from glob', () => {
      const glob = path.join(__dirname, './fixtures/files/src/**/*.md');

      files.load(glob);
      expect(files.collect()).toEqual(expectedFiles);
    });

    test('loads files consecutively', () => {
      const glob = path.join(__dirname, './fixtures/files/src/**/*.md');

      files.load(glob);
      files.load(glob);
      expect(files.collect().length).toEqual((expectedFiles.length * 2));
      expect(files.collect()).toEqual(expectedFiles.concat(expectedFiles));
    });

    test('overwrites current files when `options.overwrite=true`', () => {
      const glob1 = path.join(__dirname, './fixtures/files/src/*1.md');
      const glob2 = path.join(__dirname, './fixtures/files/src/*2.md');

      files.load(glob1);
      files.load(glob2, { overwrite: true });
      expect(files.collect()[0]).toEqual(expectedFiles[1]);
    });

    test('filters new files with `options.filterFilepaths` function', () => {
      const glob = path.join(__dirname, './fixtures/files/src/**/*.md');

      const filterFilepaths = (filepath: string) => filepath.includes('2');

      files.load(glob, { filterFilepaths });
      expect(files.collect().length).toEqual(1);
      expect(files.collect()[0]).toEqual(expectedFiles[1]);
    });
  });

  describe('clear', () => {
    const glob = path.join(__dirname, './fixtures/files/src/**/*.md');
    const files = new Files();

    beforeEach(() => {
      files.load(glob);
    });

    test('clears currently loaded files', () => {
      files.clear();
      expect(files.collect()).toEqual([]);
    });
  });

  describe('export2JSON', () => {
    const glob = path.join(__dirname, './fixtures/files/src/**/*.md');
    const files = new Files();
    let exportDestination: string;

    beforeAll(() => {
      files.load(glob);
    });

    beforeEach(() => {
      const tmpDir = fs.mkdtempSync(os.tmpdir());
      exportDestination = path.join(tmpDir, 'export.json');
    });

    test('exports file data to JSON', () => {
      files.export2JSON(exportDestination);
      const exportContent = JSON.parse(fs.readFileSync(exportDestination).toString());
      expect(exportContent).toEqual(JSON.parse(JSON.stringify(expectedFiles)));
    });

    test('exports file data to JSON with transform', () => {
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

      files.export2JSON(exportDestination, { transform });
      const exportContent = JSON.parse(fs.readFileSync(exportDestination).toString());
      expect(exportContent).toEqual(JSON.parse(JSON.stringify(expectedFilesWithTransform)));
    });
  });

  describe('collect', () => {
    const glob = path.join(__dirname, './fixtures/files/src/**/*.md');
    const files = new Files();

    beforeEach(() => {
      files.load(glob);
    });

    afterEach(() => {
      files.clear();
    });

    test('returns array of currently loaded files', () => {
      expect(files.collect()).toEqual(expectedFiles);
    });
  });

  describe('collectInstances', () => {
    const glob = path.join(__dirname, './fixtures/files/src/**/*.md');
    const files = new Files();

    beforeEach(() => {
      files.load(glob);
    });

    afterEach(() => {
      files.clear();
    });

    test('returns array of currently loaded File instances', () => {
      expect(files.collectInstances()[0]).toBeInstanceOf(File);
    });
  });

  describe('map', () => {
    const glob = path.join(__dirname, './fixtures/files/src/**/*.md');
    const files = new Files();

    beforeEach(() => {
      files.load(glob);
    });

    afterEach(() => {
      files.clear();
    });

    test('iterates over currently loaded files with Array.map()', () => {
      const mappedFiles = files.map((file: FileData) => file);
      expect(mappedFiles).toEqual(expectedFiles);
    });
  });

  describe('reduce', () => {
    const glob = path.join(__dirname, './fixtures/files/src/**/*.md');
    const files = new Files();

    beforeEach(() => {
      files.load(glob);
    });

    afterEach(() => {
      files.clear();
    });

    test('iterates over currently loaded files with Array.reduce()', () => {
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

    beforeEach(() => {
      files.load(glob);
    });

    afterEach(() => {
      files.clear();
    });

    test('transforms files with transform map', () => {
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

    test('transforms files with transform function', () => {
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
    test('loads individual file from filepath', () => {
      const filepath = path.join(__dirname, './fixtures/files/src/Test file 2.md');
      const file = new File().load(filepath);
      expect(file.getData()).toEqual(expectedFiles[1]);
    });
  });

  describe('write', () => {
    test('writes new file with YAML metadata from currently loaded data', () => {
      const filepath = path.join(__dirname, './fixtures/files/src/Test file 1.md');
      const file = new File().load(filepath);

      const tmpDir = fs.mkdtempSync(os.tmpdir());
      const writeDestination = path.join(tmpDir, 'write.md');

      const replace = (content: string) => content.replace('T00:00:00.000Z', '');

      file.write(writeDestination, { replace });
      const writeContent = fs.readFileSync(writeDestination).toString()
      const originalContent = fs.readFileSync(filepath).toString()
      expect(writeContent).toEqual(originalContent);
    });

    test('writes new file with JSON metadata from currently loaded data', () => {
      const filepath = path.join(__dirname, './fixtures/files/src/Test file 2.md');
      const file = new File().load(filepath);

      const tmpDir = fs.mkdtempSync(os.tmpdir());
      const writeDestination = path.join(tmpDir, 'write.md');

      file.write(writeDestination, { fmFormat: { format: 'json', space: 2 } });
      const writeContent = fs.readFileSync(writeDestination).toString()
      const originalContent = fs.readFileSync(filepath).toString()
      expect(writeContent).toEqual(originalContent);
    });

    test('writes new file from currently loaded metadata only', () => {
      const filepath = path.join(__dirname, './fixtures/files/src/Test file 2.md');
      const file = new File().load(filepath);

      const tmpDir = fs.mkdtempSync(os.tmpdir());
      const writeDestination = path.join(tmpDir, 'write.md');

      file.write(writeDestination, { body: false, fmFormat: { format: 'json', space: 2 } });
      const writeContent = fs.readFileSync(writeDestination).toString()
      const originalContent = fs.readFileSync(filepath).toString()
      const originalContentSansBody = originalContent.replace(regex.body.whole, '');
      expect(writeContent).toEqual(originalContentSansBody);
    });

    test('writes new file from currently loaded body only', () => {
      const filepath = path.join(__dirname, './fixtures/files/src/Test file 2.md');
      const file = new File().load(filepath);

      const tmpDir = fs.mkdtempSync(os.tmpdir());
      const writeDestination = path.join(tmpDir, 'write.md');

      file.write(writeDestination, { metadata: false, fmFormat: { format: 'json', space: 2 } });
      const writeContent = fs.readFileSync(writeDestination).toString()
      const originalContent = fs.readFileSync(filepath).toString()
      const originalContentSansFrontmatter = originalContent.replace(regex.frontmatter.whole, '');
      expect(writeContent).toEqual(originalContentSansFrontmatter);
    });
  });

  describe('export2JSON', () => {
    test('exports individual file data to JSON', () => {
      const filepath = path.join(__dirname, './fixtures/files/src/Test file 2.md');
      const file = new File().load(filepath);

      const tmpDir = fs.mkdtempSync(os.tmpdir());
      const exportDestination = path.join(tmpDir, 'export.json');

      file.export2JSON(exportDestination);
      const exportContent = JSON.parse(fs.readFileSync(exportDestination).toString())
      expect(exportContent).toEqual(JSON.parse(JSON.stringify(expectedFiles[1])));
    });

    test('exports individual file data to JSON using files.collectInstances() iteration', () => {
      const glob = path.join(__dirname, './fixtures/files/src/**/*.md');
      const files = new Files().load(glob);

      let exportDestinations: string[] = [];
      const tmpDir = fs.mkdtempSync(os.tmpdir());
      exportDestinations.push(path.join(tmpDir, 'export1.json'));
      exportDestinations.push(path.join(tmpDir, 'export2.json'));

      const instances = files.collectInstances();

      for (let i = 0; i < instances.length; i++) {
        instances[i].export2JSON(exportDestinations[i]);
      }

      const exportContents = exportDestinations.map((d) => JSON.parse(fs.readFileSync(d).toString()));

      expect(exportContents).toEqual(JSON.parse(JSON.stringify(expectedFiles)));
    });
  });

  describe('transform', () => {
    let file: File;

    beforeEach(() => {
      const filepath = path.join(__dirname, './fixtures/files/src/Test file 2.md');
      file = new File().load(filepath);
    });

    test('transforms file with transform map', () => {
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

    test('transforms file with transform map', () => {
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
