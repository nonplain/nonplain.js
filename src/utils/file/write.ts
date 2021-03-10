import yaml from 'js-yaml';

import { FrontmatterFormatConfig, Metadata } from '../../types';

export function composeFrontmatterString(
  metadata: Metadata,
  format: FrontmatterFormatConfig,
): string {
  let fmFormat: FrontmatterFormatConfig;
  if (typeof format === 'string') {
    fmFormat = {
      format,
      space: 4,
    };
  } else {
    fmFormat = format;
  }

  let metadataStr = '';
  const metadataCopy = { ...metadata };
  delete metadataCopy.file;

  const { format: fmt, space } = fmFormat || {};

  metadataStr = '---\n';
  if (fmt?.toLowerCase() === 'json') {
    metadataStr += JSON.stringify(metadataCopy, null, space);
    metadataStr += '\n';
  } else {
    metadataStr += yaml.dump(metadataCopy, { indent: space });
  }
  metadataStr += '---\n';

  return metadataStr;
}
