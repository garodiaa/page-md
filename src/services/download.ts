export async function downloadMarkdown(markdown: string): Promise<void> {
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  try {
    await chrome.downloads.download({
      url,
      filename: 'article.md',
      conflictAction: 'uniquify',
      saveAs: false,
    });
  } finally {
    window.setTimeout(() => URL.revokeObjectURL(url), 5_000);
  }
}