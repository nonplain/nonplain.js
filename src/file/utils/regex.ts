export const body = {
  whole: /(?<=^---[^]*?^---\n)[^]*/m,
};

export const frontmatter = {
  whole: /^---[^]*?^---\n/m,
  sansDelimiters: /(?<=^---\n)[^]*?(?=\n^---)/m,
};

export const regex = {
  body,
  frontmatter,
};
