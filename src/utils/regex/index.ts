const body = {
  whole: /(?<=^---[^]*?^---\n)[^]*/m,
};

const frontmatter = {
  sansDelimiters: /(?<=^---\n)[^]*?(?=\n^---)/m,
};

const regex = {
  body,
  frontmatter,
};

export default regex;
