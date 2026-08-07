import { Readability } from '@mozilla/readability';
import DOMPurify from 'dompurify';
import { canonicalUrl, findPublishedDate, isSupportedPage } from '../utils/page';
import { getReadingStats } from '../utils/stats';
import type { ExtractionResult, PageMetadata } from '../types';
import { htmlToMarkdown } from './markdown';

const NOISE_SELECTORS = [
  'script',
  'style',
  'noscript',
  'template',
  'iframe',
  'nav',
  'header',
  'footer',
  'aside',
  '[role="navigation"]',
  '[role="banner"]',
  '[role="complementary"]',
  '[role="dialog"]',
  '[aria-modal="true"]',
  '[hidden]',
  '[aria-hidden="true"]',
  '.advertisement',
  '.ad',
  '.ads',
  '.cookie',
  '.cookies',
  '.consent',
  '.comment',
  '.comments',
  '.newsletter',
  '.related',
  '.sidebar',
  '.social-share',
  '#comments',
];

function cloneSelectedContent(selection: Selection | null): HTMLElement | null {
  if (!selection || selection.rangeCount === 0 || !selection.toString().trim()) return null;
  const wrapper = document.createElement('article');
  wrapper.append(selection.getRangeAt(0).cloneContents());
  return wrapper;
}

function cleanElement(root: Element): HTMLElement {
  const copy = root.cloneNode(true) as HTMLElement;
  copy.querySelectorAll(NOISE_SELECTORS.join(',')).forEach((element) => element.remove());
  copy.querySelectorAll<HTMLElement>('*').forEach((element) => {
    const style = element.getAttribute('style') || '';
    if (/display\s*:\s*none|visibility\s*:\s*hidden/i.test(style)) element.remove();
  });
  return copy;
}

function fallbackContent(): HTMLElement | null {
  const root = document.body;
  if (!root?.innerText.trim()) return null;
  return cleanElement(root);
}

function readabilityContent(): { html: string; metadata: Partial<PageMetadata> } | null {
  const clone = document.cloneNode(true) as Document;
  clone.querySelectorAll(NOISE_SELECTORS.join(',')).forEach((element) => element.remove());
  const article = new Readability(clone, { keepClasses: true }).parse();
  if (!article?.content || !article.textContent?.trim()) return null;
  return {
    html: article.content,
    metadata: {
      title: article.title || document.title,
      author: article.byline || undefined,
      siteName: article.siteName || undefined,
    },
  };
}

function makeMetadata(partial: Partial<PageMetadata> = {}): PageMetadata {
  const documentTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content');
  const author = document.querySelector('meta[name="author"]')?.getAttribute('content');
  return {
    title: partial.title?.trim() || documentTitle?.trim() || document.title.trim() || 'Untitled page',
    url: canonicalUrl(document),
    author: partial.author || author || undefined,
    siteName: partial.siteName,
    publishedAt: findPublishedDate(document),
  };
}

export function extractPage(readerMode: boolean, selectionOnly = false): ExtractionResult {
  if (!isSupportedPage()) {
    return { ok: false, error: 'This page cannot be read. Try an ordinary http or https webpage.' };
  }

  try {
    const selected = cloneSelectedContent(window.getSelection());
    let html = '';
    let metadata = makeMetadata();

    if (selected) {
      html = cleanElement(selected).innerHTML;
    } else if (selectionOnly) {
      return { ok: false, error: 'Select some readable page content first.' };
    } else if (readerMode) {
      const article = readabilityContent();
      if (article) {
        html = article.html;
        metadata = makeMetadata(article.metadata);
      }
    }

    if (!html) {
      const fallback = fallbackContent();
      if (!fallback) return { ok: false, error: 'No readable content was found on this page.' };
      html = fallback.innerHTML;
    }

    const safeHtml = DOMPurify.sanitize(html, {
      ADD_ATTR: ['data-src', 'data-original'],
      USE_PROFILES: { html: true },
    });
    const holder = document.createElement('article');
    holder.innerHTML = safeHtml;
    const plainText = holder.innerText.replace(/\n{3,}/g, '\n\n').trim();
    if (!plainText) return { ok: false, error: 'The page did not contain readable text.' };

    return {
      ok: true,
      data: {
        metadata,
        html: holder.innerHTML,
        markdown: htmlToMarkdown(holder.innerHTML),
        plainText,
        stats: getReadingStats(plainText),
        usedSelection: Boolean(selected),
      },
    };
  } catch (error) {
    console.error('[Markdown Extractor] extraction failed', error);
    return {
      ok: false,
      error: 'Could not extract this page. It may still be loading or restrict page access.',
    };
  }
}
