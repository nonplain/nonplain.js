import fs, { PathLike } from 'fs';

import {
  handleTransformFn,
  handleTransformFnOrMap,
  parseFrontmatter,
  parseFile,
} from './utils/note';
import {
  Export2JSONOptions,
  Metadata,
  FileData,
  Transform,
} from './types';

type FileOptions = {
  transform?: Transform;
}

export class File implements FileData {
  body: string;

  metadata: Metadata;

  async load(src: string, options?: FileOptions): Promise<void> {
    const { file, frontmatter, body } = await parseFile(src);
    const parsedFrontmatter = parseFrontmatter(frontmatter);
    const metadata = {
      file,
      ...parsedFrontmatter,
    };

    this.body = body;
    this.metadata = metadata;

    if (options?.transform) {
      this.transform(options.transform);
    }
  }

  async export2JSON(file: PathLike | number, options?: Export2JSONOptions): Promise<void> {
    const { transform, space } = options || {};
    const validTransform = transform && typeof transform === 'function';

    if (transform && !validTransform) {
      throw new Error('TypeError: transform must be a function');
    }

    const noteData = validTransform ? transform(this.getData()) : this.getData;

    const writeFileOptions = options || {};
    delete writeFileOptions.transform;
    delete writeFileOptions.space;

    await fs.writeFileSync(
      file,
      JSON.stringify(noteData, null, space),
      writeFileOptions,
    );
  }

  getData(): FileData {
    return {
      body: this.body,
      metadata: this.metadata,
    };
  }

  transform(transform: Transform): void {
    if (typeof transform === 'function') {
      const { body, metadata } = transform(this.getData());

      this.body = body || this.body;
      this.metadata = metadata || this.metadata;
    } else {
      this.body = transform.body ? handleTransformFn<string>(transform.body, this.body) : this.body;
      this.metadata = transform.metadata
        ? handleTransformFnOrMap<Metadata>(transform.metadata, this.metadata)
        : this.metadata;
    }
  }
}
