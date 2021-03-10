import { TransformFn, TransformData, TransformItem } from '../../types';

export function handleTransformFn<T>(transform: TransformFn<T>, data: T): T {
  return transform(data);
}

export function handleTransformFnOrMap<T extends TransformData<T>>(
  transform: TransformItem<T>,
  data: T,
): T {
  if (typeof transform === 'function') {
    return transform(data);
  }

  return Object.keys(transform).reduce((result: TransformData<T>, key) => {
    result[key] = transform[key](data);
    return result;
  }, data) as T;
}
