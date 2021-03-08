import { regex } from './utils';

export type LinkStyle = 'markdown' | 'wiki';

export default class Link {
  initStyle: LinkStyle;

  style: LinkStyle;

  path: string;

  innerText: string;

  constructor(content: string) {
    this.initStyle = Link.detectStyle(content);
    this.style = this.initStyle;

    switch (this.style) {
      case 'wiki':
        [this.path] = content.match(regex.links.wiki.innerText);
        [this.innerText] = content.match(regex.links.wiki.innerText);
        break;
      case 'markdown':
      default:
        [this.path] = content.match(regex.links.markdown.path);
        [this.innerText] = content.match(regex.links.markdown.innerText);
        break;
    }
  }

  static detectStyle(content: string): LinkStyle {
    if (regex.links.wiki.whole.test(content)) {
      regex.links.wiki.whole.lastIndex = 0;
      return 'wiki';
    }

    return 'markdown';
  }
}
