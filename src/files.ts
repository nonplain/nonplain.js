import fs, { PathLike } from 'fs';
import glob from 'glob';
import path from 'path';

import { File } from './file';
import { Export2JSONOptions, FileData, Transform } from './types';
import { formatPath } from './utils/path';

type FilterFilepathsFn = (filename: string) => boolean;

export type LoadOptions = {
  filterFilepaths?: FilterFilepathsFn;
  overwrite?: boolean;
  transform?: Transform;
}

type MapCallbackFn = (currentValue: FileData, index: number) => unknown;

type ReduceCallbackFn = (accumulator: unknown, currentValue: FileData, index: number) => unknown;

export class Files {
  private files: File[];

  srcSet: Set<string>;

  constructor() {
    this.files = [];
    this.srcSet = new Set();
  }

  async load(src: string, options?: LoadOptions): Promise<void> {
    this.addSrc(src);
    src = formatPath(src);

    const { filterFilepaths, overwrite = false, transform } = options || {};
    const validFilterFilepaths = filterFilepaths && typeof filterFilepaths === 'function';

    if (overwrite) {
      this.clear();
    }

    if (filterFilepaths && !validFilterFilepaths) {
      throw new Error('TypeError: filterFilepaths must be a function');
    }

    let srcFilepaths = glob.hasMagic(src)
      ? await glob.sync(src)
      : await fs.promises.readdir(src)
        .then((filenames) => filenames.map((filename) => path.join(src, filename)));

    if (validFilterFilepaths) {
      srcFilepaths = srcFilepaths.filter(filterFilepaths);
    }

    const newFiles = await Promise.all(
      srcFilepaths.map(async (filepath) => {
        const note = new File();

        try {
          await note.load(filepath, { transform });
        } catch (err) {
          /* eslint-disable-next-line no-console */
          console.error(`Error while handling file: ${filepath}.\n`, err);
        }

        return note;
      }),
    ).then((results) => results.filter((x) => !!x));

    this.files = this.files.concat(newFiles);
  }

  private addSrc(src: string): void {
    this.srcSet.add(src);
  }

  clear(): void {
    this.constructor();
  }

  async export2JSON(file: PathLike | number, options?: Export2JSONOptions): Promise<void> {
    if (!this.files.length) {
      throw new Error('No files loaded.');
    }

    const { transform, space } = options || {};
    const validTransform = transform && typeof transform === 'function';

    if (transform && !validTransform) {
      throw new Error('TypeError: transform must be a function');
    }

    const filesData = validTransform
      ? this.files.map((note) => transform(note.getData()))
      : this.files;

    const writeFileOptions = options || {};
    delete writeFileOptions.transform;
    delete writeFileOptions.space;

    await fs.writeFileSync(
      file,
      JSON.stringify(filesData, null, space),
      writeFileOptions,
    );
  }

  map(callback: MapCallbackFn): Object {
    return this.collect().map(callback);
  }

  reduce(callback: ReduceCallbackFn, initialValue?: Object): Object {
    return this.collect().reduce(callback, initialValue);
  }

  collect(): FileData[] {
    return this.files.map((note) => note.getData());
  }

  transform(transform: Transform): void {
    this.files.forEach((note) => note.transform(transform));
  }
}
