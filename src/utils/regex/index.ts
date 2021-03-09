const body = {
  whole: /(?<=^---[^]*?^---\n)[^]*/m,
};

const frontmatter = {
  whole: /^---[^]*?^---/m,
  sansDelimiters: /(?<=^---\n)[^]*?(?=\n^---)/m,
  yaml: {
    listItemBeginningWithLink: /^- \[.*$/gm,
  },
};

const links = {
  all: /(\[[^\[\]]*\]\([^\(\)]*\)|\[\[[^\[\]]*\]\])/g,
  markdown: {
    whole: /\[[^\[\]]*\]\([^\(\)]*\)/g,
    innerText: /(?<=\[)[^\[\]]+?(?=\]\([^\(\)]*\))/g,
    path: /(?<=\[[^\[\]]*\]\()[^\(\)]+?(?=\))/g,
  },
  wiki: {
    whole: /\[\[[^\[\]]*\]\]/g,
    innerText: /(?<=\[\[)[^\[\]]+?(?=\]\])/g,
  },
};

const patterns = {
  body,
  frontmatter,
  links,
};

export default patterns;
