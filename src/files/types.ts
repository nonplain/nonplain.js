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

export type MapCallbackFn = (currentValue: FileData, index: number) => any;

export type ReduceCallbackFn = (accumulator: any, currentValue: FileData, index: number) => any;
