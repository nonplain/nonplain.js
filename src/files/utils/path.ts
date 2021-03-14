import fs from 'fs';
import glob from 'glob';
import os from 'os';
import path from 'path';

export function formatPath(src: string): string {
  src = path.normalize(src);
  if (src[0] === '~') {
    src = path.join(os.homedir(), src.slice(1));
  }

  return src;
}

export function getFilepathsFromSrcOrGlob(src: string): string[] {
  let srcFilepaths;

  if (glob.hasMagic(src)) {
    srcFilepaths = glob.sync(src);
  } else {
    const stats = fs.statSync(src);

    if (stats.isFile()) {
      srcFilepaths = [src];
    } else {
      srcFilepaths = fs.readdirSync(src)
        .map((filename) => path.join(src, filename));
    }
  }

  return srcFilepaths;
}
