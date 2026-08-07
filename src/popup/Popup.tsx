import { useEffect, useState } from 'react';
import { useMarkdownExtraction } from '../hooks/useMarkdownExtraction';
import { copyText } from '../services/clipboard';
import { downloadMarkdown } from '../services/download';

type Toast = { message: string; tone: 'success' | 'error' } | null;

export function Popup() {
  const { data, error, loading, refresh } = useMarkdownExtraction();
  const [markdownOverride, setMarkdownOverride] = useState<string | null>(null);
  const [busy, setBusy] = useState<'copy' | 'download' | null>(null);
  const [toast, setToast] = useState<Toast>(null);
  const markdown = markdownOverride ?? data?.markdown ?? '';

  useEffect(() => {
    setMarkdownOverride(null);
  }, [data]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), 2_500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const notify = (message: string, tone: 'success' | 'error' = 'success'): void => {
    setToast({ message, tone });
  };

  const copyMarkdown = async (): Promise<void> => {
    setBusy('copy');
    try {
      await copyText(markdown);
      notify('Markdown copied to clipboard.');
    } catch (reason) {
      notify(reason instanceof Error ? reason.message : 'Could not copy Markdown.', 'error');
    } finally {
      setBusy(null);
    }
  };

  const handleDownload = async (): Promise<void> => {
    setBusy('download');
    try {
      await downloadMarkdown(markdown);
      notify('Downloaded article.md.');
    } catch (reason) {
      notify(reason instanceof Error ? reason.message : 'Could not download Markdown.', 'error');
    } finally {
      setBusy(null);
    }
  };

  return (
    <main className="popup-shell">
      <header className="header">
        <div>
          <p className="eyebrow">FULL PAGE TO MARKDOWN</p>
          <h1>page-md</h1>
        </div>
        <button type="button" className="refresh-button" onClick={() => void refresh()} disabled={loading}>
          Refresh
        </button>
      </header>

      <section className="metadata" aria-label="Page details">
        <div>
          <span>Title</span>
          <strong title={data?.metadata.title}>{data?.metadata.title || 'Current active tab'}</strong>
        </div>
        <div>
          <span>URL</span>
          <p title={data?.metadata.url}>{data?.metadata.url || 'Open a webpage and press Refresh'}</p>
        </div>
      </section>

      <p className="mode-note">
        Full-page mode captures visible page content, including authenticated Moodle pages. Cookie banners,
        pop-ups, scripts, and hidden elements are excluded.
      </p>

      {data && (
        <div className="stats" aria-label="Reading statistics">
          <span>{data.usedSelection ? 'Selected content' : 'Full visible page'}</span>
          <span>{data.stats.words.toLocaleString()} words</span>
          <span>{data.stats.minutes} min read</span>
        </div>
      )}

      <section className="preview-section">
        <div className="section-title">
          <h2>Markdown Preview</h2>
          {loading && <span className="loading">Reading page…</span>}
        </div>
        {error ? (
          <div className="message error-message">{error}</div>
        ) : (
          <textarea
            className="preview"
            value={markdown}
            onChange={(event) => setMarkdownOverride(event.target.value)}
            aria-label="Generated Markdown"
            spellCheck={false}
            disabled={loading || !data}
            placeholder="Markdown will appear here."
          />
        )}
      </section>

      <div className="actions">
        <button type="button" className="button primary" disabled={!data || busy !== null} onClick={() => void copyMarkdown()}>
          {busy === 'copy' ? 'Copying…' : 'Copy Markdown'}
        </button>
        <button type="button" className="button secondary" disabled={!data || busy !== null} onClick={() => void handleDownload()}>
          {busy === 'download' ? 'Downloading…' : 'Download article.md'}
        </button>
      </div>

      <p className="shortcut">Shortcut: Ctrl + Shift + M copies your selection, or the full page.</p>
      {toast && <div className={`toast ${toast.tone}`}>{toast.message}</div>}
    </main>
  );
}