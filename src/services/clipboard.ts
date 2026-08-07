export async function copyText(text: string): Promise<void> {
  if (!text.trim()) throw new Error('There is no Markdown to copy.');

  try {
    await navigator.clipboard.writeText(text);
    return;
  } catch {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.cssText = 'position:fixed;opacity:0;pointer-events:none;';
    document.body.append(textarea);
    textarea.select();
    const copied = document.execCommand('copy');
    textarea.remove();
    if (!copied) throw new Error('Chrome blocked clipboard access.');
  }
}
