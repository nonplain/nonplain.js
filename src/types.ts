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

export type TransformFn<T> = (data: T) => T;

export type TransformData<T> = Record<string, T | T[keyof T]>;

export type TransformMap<T> = Record<string, TransformFn<T | T[keyof T]>>

export type TransformItem<T> = TransformFn<T> | TransformMap<T>;

export type Transform = TransformFn<FileData> | {
  body?: TransformFn<string>;
  metadata?: TransformItem<Metadata>;
};

export type Export2JSONOptions = WriteFileOptions & {
  space?: number;
  transform?: TransformFn<FileData>;
};
