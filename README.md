# zcharles.com

Personal portfolio website for yours truly.

## Pages

- **index.html** — Projects landing page with name and navigation sidebar, mobile hamburger menu, resume link, and dark/light toggle
- **cyber.html** — Cybersecurity portfolio, styled as a desktop OS environment
- **photography.html** — Photography gallery
- **services.html** — Services and booking page (live, but not linked from the landing page)

## Projects Featured

| Project | Description |
|---|---|
| KubeRange | Kubernetes-based cyber range that provisions isolated vulnerable environments (DVWA, Juice Shop) with ELK Stack log monitoring |
| Phisherman | Cascading phishing email detection using rules, classic ML, and deep learning |
| Sliver C2 Stager | Custom C++ stager delivering a Sliver C2 implant with AV evasion |
| Pi-hole Adblocker | DNS sinkhole on Raspberry Pi to block and monitor DNS traffic |
| CyberTwitDaily | X feed aggregating cybersecurity news from top infosec sources |

## Stack

- HTML / CSS / JavaScript
- Shared base CSS and page-specific styles
- Font Awesome 6


## Validation

Run the static integration checks with Python 3:

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

Serve the following as HTTP response headers for HTML pages:

```text
Content-Security-Policy: frame-ancestors 'none'
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
```

Keep the existing page-specific CSP meta tags as well. `frame-ancestors` must be
sent as a response header; browsers do not enforce it in a meta tag. Configure
these headers in the hosting service (this repository has no hosting config).
