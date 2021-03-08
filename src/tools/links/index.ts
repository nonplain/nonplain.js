import Link from '../../core/link';
import { regex } from '../../core/utils';

import { HtmlLinkOptions } from './types';

export const extractAllLinksFromContent = (content: string): Link[] =>
  (content.match(regex.links.all) || []).map((link) => new Link(link));

export const markdownLinks2Html = (content: string, options?: HtmlLinkOptions) => {
  const {
    attributes = '',
    transformInnerText = ((x: string): string => x),
    transformPath = ((x: string): string => x),
  } = options || {};

  content = content.replace(regex.links.markdown.whole, (link) => {
    const path = link.match(regex.links.markdown.path)[0];
    const innerText = link.match(regex.links.markdown.innerText)[0];

    const outHref = transformPath(path);
    const outAttributes = `href="${outHref}"${attributes ? ` ${attributes}` : ''}`;
    const outInnerText = transformInnerText(innerText);

    return `<a ${outAttributes}>${outInnerText}</a>`;
  });

  return content;
};

export const wikiLinks2Html = (content: string, options?: HtmlLinkOptions) => {
  const {
    attributes = '',
    transformInnerText = ((x: string): string => x),
  } = options || {};

  content = content.replace(regex.links.wiki.whole, (link) => {
    const innerText = link.match(regex.links.wiki.innerText)[0];

    const givenHrefMatches = attributes.match(/href="[^"]*"/g);
    const outHrefAttribute = givenHrefMatches.length > 0
      ? givenHrefMatches[0]
      : 'href="transformPath(innerText)"';
    const outAttributes = outHrefAttribute + (attributes ? ` ${attributes}` : '');
    const outInnerText = transformInnerText(innerText);

    return `<a ${outAttributes}>${outInnerText}</a>`;
  });

  return content;
};
