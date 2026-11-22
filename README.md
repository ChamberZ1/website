# zcharles.com

Personal portfolio website for yours truly.

## Pages

- **/** (`src/pages/index.astro`): introduction, resume link, projects, photography card
- **/cyber** (`public/cyber.html`): cybersecurity portfolio, styled as a desktop OS environment (live, but not linked from the landing page)
- **/photography** (`public/photography.html`): photography gallery
- **/services** (`public/services.html`): services and booking page (live, but not linked from the landing page)

Homepage content lives in `src/data/`. Turn a section on in `src/data/sections.ts`
once it has a page and real content.

## Projects Featured

| Project | Description |
|---|---|
| KubeRange | Kubernetes-based cyber range that provisions isolated vulnerable environments (DVWA, Juice Shop) with ELK Stack log monitoring |
| Phisherman | Cascading phishing email detection using rules, classic ML, and deep learning |
| Sliver C2 Stager | Custom C++ stager delivering a Sliver C2 implant with AV evasion |
| Pi-hole Adblocker | DNS sinkhole on Raspberry Pi to block and monitor DNS traffic |
| CyberTwitDaily | X feed aggregating cybersecurity news from top infosec sources |

## Stack

- Astro (static output); existing pages are plain HTML / CSS / JavaScript in `public/`
- Shared base CSS and page-specific styles
- Font Awesome 6


## Development

Requires Node 22.23.4 or newer.

```sh
npm ci
npm run dev      # local server
npm run build    # output in dist/
```

## Deployment

Cloudflare Pages: build command `npm run build`, output directory `dist`.

## Validation

Build first, then run the static integration checks with Python 3:

```sh
python3 -m unittest discover -s tests
```

For browser checks, start Firefox's geckodriver in a separate terminal:

```sh
geckodriver --host 127.0.0.1 --port 4444
```

With Snap Firefox on Ubuntu, use a standalone terminal for the driver; its
AppArmor profile can block termination signals from VS Code. Stop the driver
with Ctrl+C when finished.

Then run the full suite:

```sh
WEBDRIVER_URL=http://127.0.0.1:4444 python3 -m unittest discover -s tests -v
```

The suite starts its own temporary localhost server and headless Firefox session.
It covers keyboard navigation, native-dialog focus containment, scroll
restoration, mouse and keyboard zoom/panning, synthetic touch gestures, desktop window state,
theme persistence and blocked storage, and layouts
at narrow widths, the mobile breakpoint, and short landscape windows.
It requires no Python packages. Browser checks are skipped when `WEBDRIVER_URL`
is unset; physical touch devices still warrant a manual check.

## Hosting security

`public/_headers` sets these response headers on Cloudflare Pages:

```text
Content-Security-Policy: frame-ancestors 'none'
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
```

Keep the page-specific CSP meta tags as well. Browsers ignore `frame-ancestors`
in a meta tag, so it must stay in the response header.
