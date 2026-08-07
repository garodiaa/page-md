# page-md

![page-md icon](public/icons/icon-128.png)

![Version](https://img.shields.io/badge/version-1.0.0-purple?style=flat)
![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?logo=typescript&logoColor=white&style=flat)
![React](https://img.shields.io/badge/UI-React-61DAFB?logo=react&logoColor=black&style=flat)
![Vite](https://img.shields.io/badge/Bundler-Vite-646CFF?logo=vite&logoColor=white&style=flat)
![Chrome Extension](https://img.shields.io/badge/Type-Chrome%20Extension-4285F4?style=flat)
![Platform](https://img.shields.io/badge/Platform-Chrome%20%7C%20Chromium-0078D7?style=flat)
![License](https://img.shields.io/badge/License-Private-3E7C17?style=flat)

**Turn the visible content of any webpage into clean, readable Markdown.**

page-md is a Chrome Manifest V3 extension for saving webpages as well-structured Markdown for Obsidian, GitHub, Notion, ChatGPT, Claude, and other Markdown tools. It works locally in your browser, including on authenticated learning platforms and embedded lesson pages when Chrome allows access.

## Features

- Extracts the visible, meaningful content of a webpage into clean Markdown
- Supports headings, paragraphs, links, images, blockquotes, lists, nested lists, tables, inline code, and fenced code blocks
- Preserves code-block language hints when available
- Select text to export only that selection; otherwise exports the full visible page
- Handles embedded lesson frames, including many Brightspace/D2L pages
- Preview and edit Markdown before copying or downloading
- Copy Markdown to the clipboard
- Download as `article.md`
- Context-menu action: **Convert Selection to Markdown**
- Keyboard shortcut: `Ctrl + Shift + M` (`Command + Shift + M` on macOS)
- Shows word count and estimated reading time
- Minimal, fixed light-mode interface

## Install from Releases

1. Go to the Releases page.
2. Download the latest ZIP.
3. Extract it.
4. Open Chrome.
5. Navigate to `chrome://extensions`.
6. Enable Developer Mode.
7. Click Load unpacked.
8. Select the extracted folder.

The extracted folder contains `manifest.json`, `assets/`, `icons/`, and the rest of the built extension files directly, so Chrome can load it without any extra nesting.

## Build locally

### Requirements

- Google Chrome or a Chromium-based browser
- Node.js 20 or newer

### Build

```bash
git clone <your-repository-url>
cd page-md
npm install
npm run build
```

### Load in Chrome

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Choose **Load unpacked**.
4. Select the generated `dist` folder.
5. Pin **page-md** from Chrome's Extensions menu.

After changing the source code, run `npm run build` again and click the reload icon on page-md's card in `chrome://extensions`.

## Usage

1. Open any regular `http` or `https` webpage.
2. Click the page-md extension icon.
3. Review or edit the generated Markdown.
4. Choose **Copy Markdown** or **Download article.md**.

For a specific section, select the text on the page before opening page-md. Use the right-click menu or the keyboard shortcut to copy it quickly.

## Permissions

page-md requests only the permissions needed for its features:

| Permission | Why it is needed |
| --- | --- |
| `activeTab` | Access the current tab after you invoke the extension. |
| `scripting` | Read already-open pages and embedded lesson frames without requiring a reload. |
| `http://*/*`, `https://*/*` | Extract content from webpages, including pages where you are signed in. |
| `clipboardWrite` | Copy generated Markdown. |
| `contextMenus` | Add the selection-to-Markdown right-click action. |
| `downloads` | Save `article.md`. |

## Privacy

page-md processes page content locally in the browser. It does not send extracted Markdown, page text, credentials, or browsing data to an external service.

Do not commit copied page source or exported HTML from authenticated sites to a public repository: these files can contain session-related values or personal information.

## Acceptable Use

Do not use page-md for illegal activity, unauthorized access, or any use that violates applicable laws, regulations, or website terms of service.

## Development

```bash
npm run dev
npm run lint
npm run build
```

- `npm run dev` starts Vite's development workflow.
- `npm run lint` checks the TypeScript and React code with ESLint.
- `npm run build` type-checks and creates the installable extension in `dist`.

## Project structure

```text
src/
├── background/       # Chrome service worker, shortcuts, menus, frame handling
├── content/          # Page extraction and copy handlers
├── hooks/            # Popup data-loading hook
├── popup/            # React popup UI and styles
├── services/         # Extraction, Markdown conversion, clipboard, download
├── types/            # Shared TypeScript types
├── utils/            # Page and reading-statistics helpers
└── manifest.ts       # Manifest V3 definition
```

## Limitations

- Chrome internal pages, browser settings pages, PDFs, and local files cannot be extracted.
- Some third-party or sandboxed embedded frames cannot be accessed by Chrome, even when visible on a page.
- Markdown captures semantic content, not the exact visual styling or interactive state of a webpage.

## Tech stack

- TypeScript
- React
- Vite + CRXJS
- Tailwind CSS
- Chrome Extension Manifest V3
- Mozilla Readability
- Turndown with GitHub Flavored Markdown support
- DOMPurify

---

Built for fast, local, readable web-to-Markdown conversion.