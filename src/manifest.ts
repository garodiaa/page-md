import type { ManifestV3Export } from '@crxjs/vite-plugin';

const manifest: ManifestV3Export = {
  manifest_version: 3,
  name: 'page-md',
  version: '1.0.0',
  description: 'Turn visible webpage content into clean Markdown.',
  icons: {
    16: 'icons/icon-16.svg',
    32: 'icons/icon-32.svg',
    48: 'icons/icon-48.svg',
    128: 'icons/icon-128.png',
  },
  action: {
    default_title: 'page-md',
    default_popup: 'src/popup/index.html',
    default_icon: {
      16: 'icons/icon-16.svg',
      32: 'icons/icon-32.svg',
      48: 'icons/icon-48.svg',
      128: 'icons/icon-128.png',
    },
  },
  background: {
    service_worker: 'src/background/background.ts',
    type: 'module',
  },
  content_scripts: [
    {
      matches: ['http://*/*', 'https://*/*'],
      js: ['src/content/content.ts'],
      all_frames: true,
      run_at: 'document_idle',
    },
  ],
  permissions: ['activeTab', 'clipboardWrite', 'contextMenus', 'scripting', 'downloads', 'storage'],
  host_permissions: ['http://*/*', 'https://*/*'],
  commands: {
    copy_markdown: {
      suggested_key: {
        default: 'Ctrl+Shift+M',
        mac: 'Command+Shift+M',
      },
      description: 'Copy the selected content or page as Markdown',
    },
  },
};

export default manifest;
