# zcharles.com

Personal portfolio website for yours truly.

## Pages

- **/** (`src/pages/index.astro`): projects, resume link, photography card
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

## Adding a post to Archives

1. Copy `src/content/archives/example-post.md`. The file name becomes the address:
   `my-trip.md` is published at `/archives/my-trip`.
2. Fill in the top block:

   | Field | Required | Notes |
   |---|---|---|
   | `title`, `summary`, `category` | yes | Reuse a category name exactly to group posts |
   | `date` | yes | `YYYY-MM-DD` |
   | `updated` | no | Date of the last real revision |
   | `cover`, `coverAlt` | no | Such as `./images/my-trip.jpg`, with a description |
   | `draft` | no | Defaults to `true` (hidden). Set `false` to publish |
   | `showOnHome` | no | Defaults to `false`. Set `true` to list it on the homepage |

3. Write below it in Markdown. Put images in `src/content/archives/images/` and
   add them with `![description](./images/photo.jpg)`.
4. Check it with `npm run dev`, then push to `main`.

The Archives link appears by itself once one post is published.

This repository is public, so anyone can read a draft on GitHub, and an image's
location data stays in the original file. Keep private drafts elsewhere and
remove location data before committing photos.

## Adding to Garage

1. Add a side-on photo of the bike as `src/content/garage/bike.jpg`.
2. Edit `src/content/garage/mods.json`. Each mod needs `id`, `name` and
   `description`. Optional: `brand`, `price`, `notes` (installation), `link`,
   `video`, `photo`, `photoAlt`, `post` (an Archives file name without `.md`)
   and `hotspot`.
3. For hotspots, run `npm run dev`, open `/garage` and click the bike. The
   coordinates to paste appear below it.
4. Set `"draft": false` on finished mods and push to `main`.

Garage appears by itself once there is a photo and one finished mod. Before
committing photos, hide the license plate and VIN and remove location data.

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
