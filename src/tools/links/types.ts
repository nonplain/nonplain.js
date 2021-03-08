type LinkOptions = {
  transformPath?: (path: string) => string;
};

export type HtmlLinkOptions = LinkOptions & {
  attributes?: string;
  transformInnerText?: (innerText: string) => string;
};
