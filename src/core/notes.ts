import fs, { PathLike } from 'fs';
import glob from 'glob';
import os from 'os';
import path from 'path';

import Note from './note';
import { Export2JSONOptions, NoteData, Transform } from './types';

type FilterNoteFilepathsFn = (filename: string) => boolean;

export type LoadOptions = {
  filterNoteFilepaths?: FilterNoteFilepathsFn;
  overwrite?: boolean;
  transform?: Transform;
}

type MapCallbackFn = (currentValue: NoteData, index: number) => unknown;

type ReduceCallbackFn = (accumulator: unknown, currentValue: NoteData, index: number) => unknown;

function formatPath(src: string): string {
  src = path.normalize(src);
  if (src[0] === '~') {
    src = path.join(os.homedir(), src.slice(1));
  }

  return src;
}

export default class Notes {
  private notes: Note[];

  srcSet: Set<string>;

  constructor() {
    this.notes = [];
    this.srcSet = new Set();
  }

  async load(src: string, options?: LoadOptions): Promise<void> {
    this.addSrc(src);
    src = formatPath(src);

    const { filterNoteFilepaths, overwrite = false, transform } = options || {};
    const validFilterNoteFilepaths = filterNoteFilepaths && typeof filterNoteFilepaths === 'function';

    if (overwrite) {
      this.clear();
    }

    if (filterNoteFilepaths && !validFilterNoteFilepaths) {
      throw new Error('TypeError: filterNoteFilepaths must be a function');
    }

    let srcFilepaths = glob.hasMagic(src)
      ? await glob.sync(src)
      : await fs.promises.readdir(src)
        .then((filenames) => filenames.map((filename) => path.join(src, filename)));

    if (validFilterNoteFilepaths) {
      srcFilepaths = srcFilepaths.filter(filterNoteFilepaths);
    }

    const newNotes = await Promise.all(
      srcFilepaths.map(async (filepath) => {
        const note = new Note();

        try {
          await note.init(filepath, { transform });
        } catch (err) {
          /* eslint-disable-next-line no-console */
          console.error(`Error while handling file: ${filepath}.\n`, err);
        }

        return note;
      }),
    ).then((results) => results.filter((x) => !!x));

    this.notes = this.notes.concat(newNotes);
  }

  private addSrc(src: string): void {
    this.srcSet.add(src);
  }

  clear(): void {
    this.constructor();
  }

  async export2JSON(file: PathLike | number, options?: Export2JSONOptions): Promise<void> {
    if (!this.notes.length) {
      throw new Error('No notes loaded.');
    }

    const { transform, space } = options || {};
    const validTransform = transform && typeof transform === 'function';

    if (transform && !validTransform) {
      throw new Error('TypeError: transform must be a function');
    }

    const notesData = validTransform
      ? this.notes.map((note) => transform(note.getData()))
      : this.notes;

    const writeFileOptions = options || {};
    delete writeFileOptions.transform;
    delete writeFileOptions.space;

    await fs.writeFileSync(
      file,
      JSON.stringify(notesData, null, space),
      writeFileOptions,
    );
  }

  map(callback: MapCallbackFn): Object {
    return this.collect().map(callback);
  }

  reduce(callback: ReduceCallbackFn, initialValue?: Object): Object {
    return this.collect().reduce(callback, initialValue);
  }

  collect(): NoteData[] {
    return this.notes.map((note) => note.getData());
  }

  transform(transform: Transform): void {
    this.notes.forEach((note) => note.transform(transform));
  }
}
