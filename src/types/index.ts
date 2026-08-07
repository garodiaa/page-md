export type ExportFormat = 'markdown' | 'html' | 'text';

export interface PageMetadata {
  title: string;
  url: string;
  author?: string;
  siteName?: string;
  publishedAt?: string;
}

export interface ReadingStats {
  words: number;
  characters: number;
  minutes: number;
}

export interface ExtractionData {
  metadata: PageMetadata;
  html: string;
  markdown: string;
  plainText: string;
  stats: ReadingStats;
  usedSelection: boolean;
}

export type ExtractionResult =
  | { ok: true; data: ExtractionData }
  | { ok: false; error: string };

export interface ExtractPageMessage {
  type: 'EXTRACT_PAGE';
  readerMode: boolean;
}

export interface CopyMarkdownMessage {
  type: 'COPY_MARKDOWN';
  readerMode: boolean;
  selectionOnly?: boolean;
}

export type ExtensionMessage = ExtractPageMessage | CopyMarkdownMessage;

export interface ExtensionSettings {
  includeFrontmatter: boolean;
  aiEndpoint: string;
  aiApiKey: string;
  aiModel: string;
}

export const DEFAULT_SETTINGS: ExtensionSettings = {
  includeFrontmatter: false,
  aiEndpoint: '',
  aiApiKey: '',
  aiModel: 'gpt-4o-mini',
};
