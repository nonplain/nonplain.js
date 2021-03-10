import fs, { PathLike } from 'fs';

import {
  composeFrontmatterString,
  handleTransformFn,
  handleTransformFnOrMap,
  parseFrontmatter,
  parseFile,
} from './utils/file';
import {
  Export2JSONOptions,
  Metadata,
  FileData,
  Transform,
  WriteOptions,
} from './types';

export default class File implements FileData {
  body: string;

  metadata: Metadata;

  async load(src: string): Promise<File> {
    const { file, frontmatter, body } = await parseFile(src);
    const parsedFrontmatter = parseFrontmatter(frontmatter);
    const metadata = {
      file,
      ...parsedFrontmatter,
    };

    this.body = body;
    this.metadata = metadata;

    return this;
  }

  async write(file: PathLike | number, options?: WriteOptions): Promise<void> {
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
      await fs.writeFileSync(
        file,
        writeFileStr,
        writeFileOptions,
      );
    } catch (err) {
      throw new Error(`WriteError: error while writing file.\n${err}`);
    }
  }

  async export2JSON(file: PathLike | number, options?: Export2JSONOptions): Promise<void> {
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
      await fs.writeFileSync(
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
