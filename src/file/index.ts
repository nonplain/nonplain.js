import fs, { PathLike } from 'fs';

import {
  composeFrontmatterString,
  handleTransformFn,
  handleTransformFnOrMap,
  parseFrontmatter,
  parseFile,
} from './utils';
import {
  FileData,
  FileOptions,
  Metadata,
  ParseFileFn,
  ParseFrontmatterFn,
  Transform,
  WriteOptions,
} from './types';
import {
  Export2JSONOptions,
} from '../files/types';

export default class File implements FileData {
  body: string;

  metadata: Metadata;

  parseFile: ParseFileFn;

  parseFrontmatter: ParseFrontmatterFn;

  constructor(options?: FileOptions) {
    this.parseFile = options?.parseFile || parseFile;
    this.parseFrontmatter = options?.parseFrontmatter || parseFrontmatter;
  }

  load(src: string): File {
    const { file = {}, frontmatter, body } = this.parseFile(src);
    const parsedFrontmatter = this.parseFrontmatter(frontmatter);
    const metadata = {
      file,
      ...parsedFrontmatter,
    };

    this.body = body;
    this.metadata = metadata;

    return this;
  }

  write(file: PathLike | number, options?: WriteOptions): void {
    const {
      body: writeBody = true,
      metadata: writeMetadata = true,
      fmFormat,
      transform,
      replace,
    } = options || {};
    const validTransform = transform && typeof transform === 'function';
    const validReplace = replace && typeof replace === 'function';

    if (transform && !validTransform) {
      throw new Error('TypeError: transform must be a function');
    }

    if (replace && !validReplace) {
      throw new Error('TypeError: transform must be a function');
    }

    const { metadata, body } = validTransform ? transform(this.getData()) : this.getData();
    let fileStr = '';

    if (writeMetadata) {
      fileStr += composeFrontmatterString(metadata, fmFormat);
    }

    if (writeBody) {
      fileStr += body;
    }

    const writeFileStr = validReplace ? replace(fileStr) : fileStr;

    const writeFileOptions = options || {};
    delete writeFileOptions.transform;

    try {
      fs.writeFileSync(
        file,
        writeFileStr,
        writeFileOptions,
      );
    } catch (err) {
      throw new Error(`WriteError: error while writing file.\n${err}`);
    }
  }

  export2JSON(file: PathLike | number, options?: Export2JSONOptions): void {
    const { transform, space } = options || {};
    const validTransform = transform && typeof transform === 'function';

    if (transform && !validTransform) {
      throw new Error('TypeError: transform must be a function');
    }

    const fileData = validTransform ? transform(this.getData()) : this.getData();

    const writeFileOptions = options || {};
    delete writeFileOptions.transform;
    delete writeFileOptions.space;

    try {
      fs.writeFileSync(
        file,
        JSON.stringify(fileData, null, space),
        writeFileOptions,
      );
    } catch (err) {
      throw new Error(`WriteError: error while writing file.\n${err}`);
    }
  }

  getData(): FileData {
    return {
      body: this.body,
      metadata: this.metadata,
    };
  }

  transform(transform: Transform): File {
    if (typeof transform === 'function') {
      const { body, metadata } = transform(this.getData());

      this.body = body || this.body;
      this.metadata = metadata || this.metadata;
    } else {
      this.body = transform.body
        ? handleTransformFn<string>(transform.body, this.body)
        : this.body;
      this.metadata = transform.metadata
        ? handleTransformFnOrMap<Metadata>(transform.metadata, this.metadata)
        : this.metadata;
    }

    return this;
  }
}
