import { useCallback, useEffect, useState } from 'react';
import type { ExtractionData } from '../types';

interface ExtractionState {
  data: ExtractionData | null;
  error: string | null;
  loading: boolean;
}

export function useMarkdownExtraction(): ExtractionState & { refresh: () => Promise<void> } {
  const [state, setState] = useState<ExtractionState>({ data: null, error: null, loading: true });

  const refresh = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) throw new Error('No active tab was found.');
      if (!/^https?:/.test(tab.url || '')) {
        throw new Error('Chrome pages, PDFs, and local files cannot be converted.');
      }

      const result = await chrome.runtime.sendMessage({ type: 'EXTRACT_ACTIVE_TAB', tabId: tab.id });
      if (!result?.ok) throw new Error(result?.error || 'The page did not respond.');
      setState({ data: result.data, error: null, loading: false });
    } catch (error) {
      setState({
        data: null,
        error: error instanceof Error ? error.message : 'Could not read this page.',
        loading: false,
      });
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { ...state, refresh };
}