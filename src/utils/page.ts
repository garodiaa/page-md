export function isSupportedPage(): boolean {
  return /^https?:$/.test(window.location.protocol);
}

export function canonicalUrl(document: Document): string {
  const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href;
  return canonical || window.location.href;
}

export function findPublishedDate(document: Document): string | undefined {
  const selectors = [
    'meta[property="article:published_time"]',
    'meta[name="date"]',
    'time[datetime]',
  ];

  for (const selector of selectors) {
    const node = document.querySelector<HTMLElement>(selector);
    const value = node?.getAttribute('content') || node?.getAttribute('datetime');
    if (value) return value;
  }

  return undefined;
}
