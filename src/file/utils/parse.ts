import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

import { regex } from './regex';
import { Metadata, ParsedFile } from '../types';

export function parseFile(filepath: string): ParsedFile {
  let content = '';
  try {
    content = fs.readFileSync(filepath, 'utf-8');
  } catch (err) {
    throw new Error(`FileReadError: ${err} `);
  }

  const [frontmatter = ''] = content
    .match(regex.frontmatter.sansDelimiters) || [];
  const [body = ''] = content
    .match(regex.body.whole) || [];

  return {
    file: path.parse(filepath),
    frontmatter,
    body,
  };
}

export function parseFrontmatter(content: string): Metadata {
  const parseJSON = (j: string) => JSON.parse(j);
  const parseYAML = (y: string) => yaml.load(y);

  try {
    return parseJSON(content);
  } catch (e1) {
    try {
      return parseYAML(content);
    } catch (e2) {
      throw new Error('ParseError: Could not parse frontmatter.');
    }
  }
}
