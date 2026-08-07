import contentScript from '../content/injected.iife.ts?script';
import type { CopyMarkdownMessage, ExtractionResult } from '../types';

const CONTEXT_MENU_ID = 'convert-selection-to-markdown';

type EnsureContentScriptMessage = { type: 'ENSURE_CONTENT_SCRIPT'; tabId: number };
type ExtractActiveTabMessage = { type: 'EXTRACT_ACTIVE_TAB'; tabId: number };
type BackgroundMessage = EnsureContentScriptMessage | ExtractActiveTabMessage;

type FramedExtraction = { frameId: number; result: ExtractionResult };

function setFeedback(text: string, color: string): void {
  void chrome.action.setBadgeText({ text });
  void chrome.action.setBadgeBackgroundColor({ color });
  setTimeout(() => void chrome.action.setBadgeText({ text: '' }), 2_500);
}

async function ensureContentScript(tabId: number): Promise<number[]> {
  const injections = await chrome.scripting.executeScript({
    target: { tabId, allFrames: true },
    files: [contentScript],
  });
  return [...new Set(injections.map((injection) => injection.frameId))];
}

async function getFrameExtractions(tabId: number, selectionOnly = false): Promise<FramedExtraction[]> {
  const frameIds = await ensureContentScript(tabId);
  const attempts = await Promise.all(
    frameIds.map(async (frameId) => {
      try {
        const result = (await chrome.tabs.sendMessage(
          tabId,
          { type: 'EXTRACT_PAGE', readerMode: false },
          { frameId },
        )) as ExtractionResult;
        return { frameId, result };
      } catch {
        return null;
      }
    }),
  );

  return attempts.filter((attempt): attempt is FramedExtraction => attempt !== null).filter((attempt) => {
    return selectionOnly ? attempt.result.ok && attempt.result.data.usedSelection : attempt.result.ok;
  });
}

function bestExtraction(extractions: FramedExtraction[]): FramedExtraction | null {
  if (!extractions.length) return null;
  return [...extractions].sort((left, right) => {
    const leftSelection = left.result.ok && left.result.data.usedSelection ? 1 : 0;
    const rightSelection = right.result.ok && right.result.data.usedSelection ? 1 : 0;
    if (leftSelection !== rightSelection) return rightSelection - leftSelection;
    const leftSize = left.result.ok ? left.result.data.stats.characters : 0;
    const rightSize = right.result.ok ? right.result.data.stats.characters : 0;
    return rightSize - leftSize;
  })[0];
}

async function extractActiveTab(tabId: number): Promise<ExtractionResult> {
  const extraction = bestExtraction(await getFrameExtractions(tabId));
  return extraction?.result ?? {
    ok: false,
    error: 'No readable content was found in this page or its embedded content frames.',
  };
}

async function requestCopy(tabId: number, selectionOnly: boolean): Promise<void> {
  try {
    const extraction = bestExtraction(await getFrameExtractions(tabId, selectionOnly));
    if (!extraction?.result.ok) throw new Error('No readable content was found.');

    const result = (await chrome.tabs.sendMessage(
      tabId,
      {
        type: 'COPY_MARKDOWN',
        readerMode: false,
        selectionOnly,
      } satisfies CopyMarkdownMessage,
      { frameId: extraction.frameId },
    )) as ExtractionResult;
    if (!result.ok) throw new Error(result.error);
    setFeedback('Copied', '#16a34a');
  } catch (error) {
    console.warn('[Markdown Extractor] copy failed', error);
    setFeedback('Error', '#dc2626');
  }
}

chrome.runtime.onMessage.addListener(
  (message: BackgroundMessage, _sender, sendResponse: (result: ExtractionResult | { ok: boolean; error?: string }) => void) => {
    if (message.type === 'ENSURE_CONTENT_SCRIPT') {
      void ensureContentScript(message.tabId)
        .then(() => sendResponse({ ok: true }))
        .catch((error: unknown) => {
          sendResponse({
            ok: false,
            error: error instanceof Error ? error.message : 'Chrome could not access this page.',
          });
        });
      return true;
    }

    if (message.type === 'EXTRACT_ACTIVE_TAB') {
      void extractActiveTab(message.tabId)
        .then(sendResponse)
        .catch((error: unknown) => {
          sendResponse({
            ok: false,
            error: error instanceof Error ? error.message : 'Chrome could not read this page.',
          });
        });
      return true;
    }

    return false;
  },
);

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: CONTEXT_MENU_ID,
      title: 'Convert Selection to Markdown',
      contexts: ['selection'],
    });
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === CONTEXT_MENU_ID && tab?.id !== undefined) {
    void requestCopy(tab.id, true);
  }
});

chrome.commands.onCommand.addListener((command, tab) => {
  if (command === 'copy_markdown' && tab?.id !== undefined) {
    void requestCopy(tab.id, false);
  }
});