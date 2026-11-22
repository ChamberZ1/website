import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://zcharles.com',
  // /page.html is served as /page by Cloudflare Pages, keeping existing URLs.
  build: { format: 'file', inlineStylesheets: 'never' },
  // The site's CSP forbids inline scripts and styles.
  vite: { build: { assetsInlineLimit: 0 } },
  markdown: { syntaxHighlight: false },
});
