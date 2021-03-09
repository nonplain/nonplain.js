import path from 'path';
import os from 'os';

export function formatPath(src: string): string {
  src = path.normalize(src);
  if (src[0] === '~') {
    src = path.join(os.homedir(), src.slice(1));
  }

  return src;
}
