import { defineConfig } from 'astro/config';

// Cloudflare Pages serves public/photography.html at /photography; do the same in `npm run dev`.
const plainPages = {
  name: 'plain-pages',
  configureServer(server) {
    server.middlewares.use((request, response, next) => {
      request.url = request.url.replace(/^\/(cyber|photography|services)(?=$|\?)/, '/$1.html');
      next();
    });
  },
};

export default defineConfig({
  site: 'https://zcharles.com',
  // /page.html is served as /page by Cloudflare Pages, keeping existing URLs.
  build: { format: 'file', inlineStylesheets: 'never' },
  // The site's CSP forbids inline scripts and styles.
  vite: { build: { assetsInlineLimit: 0 }, plugins: [plainPages] },
  markdown: { syntaxHighlight: false },
});
