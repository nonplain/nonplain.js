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

export type ReplaceFn = (data: string) => string;

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

export type WriteOptions = WriteFileOptions & {
  body?: boolean;
  metadata?: boolean;
  fmFormat?: FrontmatterFormatConfig;
  transform?: TransformFn<FileData>;
  replace?: ReplaceFn;
};

export type Export2JSONOptions = WriteFileOptions & {
  space?: number;
  transform?: TransformFn<FileData>;
};

export type FilterFilepathsFn = (filename: string) => boolean;

export type FilesLoadOptions = {
  filterFilepaths?: FilterFilepathsFn;
  overwrite?: boolean;
}

export type MapCallbackFn = (currentValue: FileData, index: number) => Array<any>;

export type ReduceCallbackFn = (accumulator: any, currentValue: FileData, index: number) => any;
