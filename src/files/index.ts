import fs, { PathLike } from 'fs';

import File from '../file';
import {
  FileData,
  ParseFileFn,
  ParseFrontmatterFn,
  Transform,
} from '../file/types';
import { isValidFn } from '../file/utils';
import {
  Export2JSONOptions,
  FilesLoadOptions,
  FilesOptions,
  MapCallbackFn,
  ReduceCallbackFn,
} from './types';
import { formatPath, getFilepathsFromSrcOrGlob } from './utils';

export default class Files {
  private files: File[];

  srcSet: Set<string>;

  parseFile: ParseFileFn;

  parseFrontmatter: ParseFrontmatterFn

  constructor(options?: FilesOptions) {
    this.files = [];
    this.srcSet = new Set();

    this.parseFile = options?.parseFile;
    this.parseFrontmatter = options?.parseFrontmatter;
  }

  load(src: string, options?: FilesLoadOptions): Files {
    this.addSrc(src);
    src = formatPath(src);

    const { filterFilepaths, overwrite = false } = options || {};
    const validFilterFilepaths = isValidFn(filterFilepaths);

    if (overwrite) {
      this.clear();
    }

    if (filterFilepaths && !validFilterFilepaths) {
      throw new Error('TypeError: filterFilepaths must be a function');
    }

    let srcFilepaths;
    try {
      srcFilepaths = getFilepathsFromSrcOrGlob(src);
    } catch (err) {
      throw new Error(`Error while loading file(s) from src: ${src}.\n${err}`);
    }

    if (validFilterFilepaths) {
      srcFilepaths = srcFilepaths.filter(filterFilepaths);
    }

    const newFiles = srcFilepaths.map((filepath: string) => {
      let file;

      try {
        file = new File({
          // parseFile: this.parseFile,
          // parseFrontmatter: this.parseFrontmatter,
        }).load(filepath);
      } catch (err) {
        /* eslint-disable-next-line no-console */
        console.error(`Error while handling file: ${filepath}.\n`, err);
      }

      return file;
    }).filter((x: File | undefined) => !!x);

    this.files = this.files.concat(newFiles);

    return this;
  }

  private addSrc(src: string): void {
    this.srcSet.add(src);
  }

  clear(): void {
    this.files = [];
    this.srcSet = new Set();
  }

  export2JSON(file: PathLike | number, options?: Export2JSONOptions): void {
    if (!this.files.length) {
      throw new Error('No files loaded.');
    }

    const { transform, space } = options || {};
    const validTransform = isValidFn(transform);

    if (transform && !validTransform) {
      throw new Error('TypeError: transform must be a function');
    }

    const filesData = validTransform
      ? this.files.map((f) => transform(f.getData()))
      : this.files;

    const writeFileOptions = options || {};
    delete writeFileOptions.transform;
    delete writeFileOptions.space;

    try {
      fs.writeFileSync(
        file,
        JSON.stringify(filesData, null, space),
        writeFileOptions,
      );
    } catch (err) {
      throw new Error(`WriteError: error while writing file.\n${err}`);
    }
  }

  map(callback: MapCallbackFn): Array<any> {
    return this.collect().map(callback);
  }

  reduce<T>(callback: ReduceCallbackFn, initialValue?: T): T {
    return this.collect().reduce(callback, initialValue);
  }

  collect(): FileData[] {
    return this.files.map((file) => file.getData());
  }

  collectInstances(): File[] {
    return this.files;
  }

  transform(transform: Transform): Files {
    this.files.forEach((file) => file.transform(transform));
    return this;
  }
}
