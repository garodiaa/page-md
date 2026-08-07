import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';
import type { PageMetadata } from '../types';

function languageFromCodeBlock(node: HTMLElement): string {
  const code = node.querySelector('code');
  const className = code?.className || node.className || '';
  const match = className.match(/(?:language-|lang-)([a-z0-9_+-]+)/i);
  return match?.[1] || '';
}

function cleanMarkdown(markdown: string): string {
  return markdown
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^\s+$/gm, '')
    .trim();
}

export function htmlToMarkdown(html: string): string {
  const turndown = new TurndownService({
    bulletListMarker: '-',
    codeBlockStyle: 'fenced',
    emDelimiter: '_',
    headingStyle: 'atx',
    hr: '---',
    linkStyle: 'inlined',
    strongDelimiter: '**',
  });

  turndown.use(gfm);
  turndown.addRule('fencedCodeWithLanguage', {
    filter: (node) => node.nodeName === 'PRE' && Boolean(node.querySelector('code')),
    replacement: (_content, node) => {
      const element = node as HTMLElement;
      const code = element.querySelector('code');
      const source = (code?.textContent || element.textContent || '').replace(/\n$/, '');
      const fence = source.includes('```') ? '````' : '```';
      return `\n\n${fence}${languageFromCodeBlock(element)}\n${source}\n${fence}\n\n`;
    },
  });

  turndown.addRule('lazyImageSource', {
    filter: (node) => {
      if (node.nodeName !== 'IMG') return false;
      const image = node as HTMLImageElement;
      return !image.getAttribute('src') && Boolean(image.dataset.src || image.dataset.original);
    },
    replacement: (_content, node) => {
      const image = node as HTMLImageElement;
      const source = image.dataset.src || image.dataset.original || '';
      return source ? `![${image.alt || ''}](${source})` : '';
    },
  });

  return cleanMarkdown(turndown.turndown(html));
}

function yamlValue(value: string): string {
  return JSON.stringify(value);
}

export function withFrontmatter(markdown: string, metadata: PageMetadata): string {
  const fields = [
    `title: ${yamlValue(metadata.title)}`,
    `url: ${yamlValue(metadata.url)}`,
    `date: ${yamlValue(metadata.publishedAt || new Date().toISOString())}`,
  ];

  if (metadata.author) fields.push(`author: ${yamlValue(metadata.author)}`);
  return `---\n${fields.join('\n')}\n---\n\n${markdown}`;
}

export function asPrompt(markdown: string, metadata: PageMetadata): string {
  return `# Source\n\n${metadata.url}\n\n# Title\n\n${metadata.title}\n\n# Content\n\n${markdown}`;
}
