import { WriteFileOptions } from 'fs';

import {
  FileData,
  FileOptions,
  TransformFn,
} from '../file/types';

export type Export2JSONOptions = WriteFileOptions & {
  space?: number;
  transform?: TransformFn<FileData>;
};

export type FilterFilepathsFn = (filename: string) => boolean;

export type FilesLoadOptions = {
  filterFilepaths?: FilterFilepathsFn;
  overwrite?: boolean;
}

export type FilesOptions = FileOptions;

export type FilterFn = (file: FileData, index: number) => boolean;

export type SortCompareFn = (a: FileData, b: FileData) => number;
