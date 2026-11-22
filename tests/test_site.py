"""Static checks on the built site. Run `npm run build` first, then:
python3 -m unittest discover -s tests
"""
from html.parser import HTMLParser
from pathlib import Path
import unittest
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1] / 'dist'


def resolve(page, url_path):
    """Map a link to a built file the way Cloudflare Pages does."""
    if not url_path:
        return page
    base = ROOT if url_path.startswith('/') else page.parent
    target = base / url_path.lstrip('/')
    if target == ROOT or url_path.endswith('/'):
        return target / 'index.html'
    return target if target.suffix else target.with_suffix('.html')


class Page(HTMLParser):
    def __init__(self, path):
        super().__init__()
        self.tags = []
        self.feed(path.read_text(encoding='utf-8'))

    def handle_starttag(self, tag, attrs):
        self.tags.append((tag, dict(attrs)))


class SiteTests(unittest.TestCase):
    def test_site_is_built(self):
        for name in ('index', 'cyber', 'photography', 'services', '404'):
            self.assertTrue((ROOT / f'{name}.html').is_file(), f'{name}.html missing; run npm run build')

    def test_local_resources_and_fragments(self):
        for path in ROOT.rglob('*.html'):
            page = Page(path)
            ids = [attrs['id'] for _, attrs in page.tags if 'id' in attrs]
            self.assertEqual(len(ids), len(set(ids)), path.name)
            for tag, attrs in page.tags:
                for name in ('href', 'src', 'data-full'):
                    value = attrs.get(name)
                    if not value:
                        continue
                    url = urlsplit(value)
                    if url.scheme or url.netloc:
                        continue
                    target = resolve(path, url.path)
                    self.assertTrue(target.is_file(), f'{path.name}: missing {value}')
                    if url.fragment and target.suffix == '.html':
                        self.assertTrue(any(a.get('id') == url.fragment for _, a in Page(target).tags))
                if 'data-window' in attrs:
                    self.assertIn(attrs['data-window'], ids)
                for name in ('aria-controls', 'aria-labelledby', 'aria-describedby'):
                    for reference in attrs.get(name, '').split():
                        self.assertIn(reference, ids, f'{path.name}: {name} references missing #{reference}')
                if 'data-full' in attrs:
                    self.assertGreater(int(attrs['width']), 0)
                    self.assertGreater(int(attrs['height']), 0)

    def test_security_and_accessibility_contracts(self):
        for path in ROOT.rglob('*.html'):
            page = Page(path)
            for tag, attrs in page.tags:
                self.assertFalse(any(name.startswith('on') for name in attrs), path.name)
                self.assertNotIn('style', attrs, f'{path.name}: CSP blocks inline styles')
                self.assertNotEqual(tag, 'style', f'{path.name}: CSP blocks inline styles')
                if tag == 'script' and attrs.get('type') != 'application/ld+json':
                    self.assertIn('src', attrs, f'{path.name}: CSP blocks inline scripts')
                if attrs.get('target') == '_blank':
                    self.assertIn('noopener', attrs.get('rel', '').split())
                if tag == 'img':
                    self.assertIn('alt', attrs, path.name)
                if tag == 'meta' and attrs.get('name') == 'viewport':
                    self.assertNotIn('user-scalable=no', attrs['content'])
            policies = [a['content'] for t, a in page.tags if t == 'meta' and a.get('http-equiv') == 'Content-Security-Policy']
            self.assertEqual(len(policies), 1)
            self.assertNotIn("'unsafe-inline'", policies[0])
            directives = {}
            for value in policies[0].split(';'):
                parts = value.split()
                if parts:
                    directives[parts[0]] = parts[1:]
            self.assertNotIn('frame-ancestors', directives,
                             f'{path.name}: frame-ancestors requires an HTTP response header')
            local_scripts = [attrs['src'] for tag, attrs in page.tags
                             if tag == 'script' and attrs.get('src')
                             and not urlsplit(attrs['src']).scheme
                             and not urlsplit(attrs['src']).netloc]
            if local_scripts:
                script_sources = directives.get(
                    'script-src-elem', directives.get('script-src', directives.get('default-src', [])))
                self.assertIn("'self'", script_sources,
                              f'{path.name}: CSP blocks its local scripts')
        photo = Page(ROOT / 'photography.html')
        modal_tag, modal = next((tag, attrs) for tag, attrs in photo.tags
                                if attrs.get('id') == 'photoModal')
        self.assertEqual(modal_tag, 'dialog')
        self.assertTrue(modal.get('aria-label', '').strip() or modal.get('aria-labelledby', '').strip(),
                        'The photo viewer needs an accessible name')
        self.assertTrue(any(t == 'button' and a.get('id') == 'modalCloseBtn' for t, a in photo.tags))

    def test_unfinished_sections_are_not_published(self):
        for path in ROOT.rglob('*.html'):
            self.assertNotIn('[Placeholder', path.read_text(encoding='utf-8'), path.name)
            self.assertNotIn('[Dev preview', path.read_text(encoding='utf-8'), path.name)

    def test_private_documents_stay_removed(self):
        self.assertEqual([p.name for p in ROOT.rglob('*.pdf')], ['zcharles-resume.pdf'])


if __name__ == '__main__':
    unittest.main()
