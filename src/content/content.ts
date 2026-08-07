import { copyText } from '../services/clipboard';
import { extractPage } from '../services/extractor';
import type { CopyMarkdownMessage, ExtensionMessage, ExtractionResult } from '../types';

const listenerFlag = '__markdownExtractorListenerInstalled__';
const contentGlobal = globalThis as typeof globalThis & Record<string, boolean | undefined>;

function extractForMessage(message: CopyMarkdownMessage): ExtractionResult {
  return extractPage(message.readerMode, message.selectionOnly);
}

if (!contentGlobal[listenerFlag]) {
  contentGlobal[listenerFlag] = true;
  chrome.runtime.onMessage.addListener(
    (message: ExtensionMessage, _sender, sendResponse: (response: ExtractionResult) => void) => {
      if (message.type === 'EXTRACT_PAGE') {
        sendResponse(extractPage(message.readerMode));
        return false;
      }

      if (message.type === 'COPY_MARKDOWN') {
        const result = extractForMessage(message);
        if (!result.ok) {
          sendResponse(result);
          return false;
        }

        void copyText(result.data.markdown)
          .then(() => sendResponse(result))
          .catch((error: unknown) => {
            sendResponse({
              ok: false,
              error: error instanceof Error ? error.message : 'Could not copy Markdown.',
            });
          });
        return true;
      }

      return false;
    },
  );
}