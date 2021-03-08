import fs from 'fs';
import path, { ParsedPath } from 'path';
import yaml from 'js-yaml';

import { regex } from '..';
import { Metadata } from '../../types';

type ParsedNoteFile = {
  file: ParsedPath,
  frontmatter: string,
  body: string,
};

export async function parseNoteFile(filepath: string): Promise<ParsedNoteFile> {
  let content = '';
  try {
    content = await fs.readFileSync(filepath, 'utf-8');
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
  try {
    return yaml.load(content);
  } catch (err) {
    throw new Error('ParseError: Could not parse frontmatter.');
  }
}
