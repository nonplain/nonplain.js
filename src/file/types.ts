import { WriteFileOptions } from 'fs';
import { ParsedPath } from 'path';

export type BaseMetadata = {
  file?: ParsedPath;
};

export type Metadata = BaseMetadata & Record<string, unknown> | any;

export interface FileData {
  body: string;
  metadata: Metadata;
}

export type ParsedFile = {
  file: ParsedPath,
  frontmatter: string,
  body: string,
};

export type ParseFileFn = (content: string) => ParsedFile;

export type ParseFrontmatterFn = (content: string) => Metadata;

export type FileOptions = {
  parseFile?: ParseFileFn;
  parseFrontmatter?: ParseFrontmatterFn;
};

export type TransformFn<T> = (data: T) => T;

export type TransformData<T> = Record<string, T | T[keyof T]>;

export type TransformMap<T> = Record<string, TransformFn<T | T[keyof T]>>

export type TransformItem<T> = TransformFn<T> | TransformMap<T>;

export type Transform = TransformFn<FileData> | {
  body?: TransformFn<string>;
  metadata?: TransformItem<Metadata>;
};

export type FrontmatterFormat = 'json' | 'JSON' | 'yaml' | 'YAML';

export type FrontmatterFormatConfig = {
  format?: FrontmatterFormat,
  space?: number;
} | FrontmatterFormat;

export type ReplaceFn = (data: string) => string;

export type WriteOptions = WriteFileOptions & {
  body?: boolean;
  metadata?: boolean;
  fmFormat?: FrontmatterFormatConfig;
  transform?: TransformFn<FileData>;
  replace?: ReplaceFn;
};
