const body = {
  whole: /(?<=^---[^]*?^---\n)[^]*/m,
};

const frontmatter = {
  whole: /^---[^]*?^---\n/m,
  sansDelimiters: /(?<=^---\n)[^]*?(?=\n^---)/m,
};

const regex = {
  body,
  frontmatter,
};

export default regex;
