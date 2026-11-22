"""Browser regressions. Run with WEBDRIVER_URL=http://127.0.0.1:4444.

Requires a running Firefox geckodriver; uses only Python's standard library.
"""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
import os
from pathlib import Path
from threading import Thread
import unittest
from urllib.error import HTTPError
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1] / 'dist'
DRIVER = os.environ.get('WEBDRIVER_URL', '').rstrip('/')
ELEMENT_KEY = 'element-6066-11e4-a52e-4f735466cecf'


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass

    def translate_path(self, path):
        """Serve /page from page.html, as Cloudflare Pages does."""
        target = super().translate_path(path)
        html = target.rstrip('/' + os.sep) + '.html'
        return html if not os.path.exists(target) and os.path.exists(html) else target


@unittest.skipUnless(DRIVER, 'Set WEBDRIVER_URL to run Firefox browser checks')
class BrowserTests(unittest.TestCase):
    @classmethod
    def request(cls, method, path, data=None):
        body = json.dumps(data).encode() if data is not None else None
        request = Request(DRIVER + path, data=body, method=method,
                          headers={'Content-Type': 'application/json'})
        try:
            with urlopen(request, timeout=60) as response:
                return json.load(response)['value']
        except HTTPError as error:
            with error:
                message = error.read().decode()
            raise AssertionError(message) from error

    @classmethod
    def setUpClass(cls):
        session = cls.request('POST', '/session', {
            'capabilities': {'alwaysMatch': {
                'browserName': 'firefox', 'pageLoadStrategy': 'eager',
                'moz:firefoxOptions': {
                    'args': ['-headless'],
                    'prefs': {'ui.systemUsesDarkTheme': 1},
                },
            }},
        })
        cls.session = '/session/' + session['sessionId']
        cls.addClassCleanup(cls.request, 'DELETE', cls.session)
        cls.server = ThreadingHTTPServer(('127.0.0.1', 0),
                                        partial(QuietHandler, directory=str(ROOT)))
        Thread(target=cls.server.serve_forever, daemon=True).start()
        cls.addClassCleanup(cls.server.server_close)
        cls.addClassCleanup(cls.server.shutdown)
        cls.base_url = f'http://127.0.0.1:{cls.server.server_port}/'

    def setUp(self):
        self.resize(1280, 900)

    def resize(self, width, height):
        self.request('POST', self.session + '/window/rect',
                     {'width': width, 'height': height})

    def load(self, page):
        self.request('POST', self.session + '/url', {'url': self.base_url + page})

    def reload(self):
        self.request('POST', self.session + '/refresh', {})

    def script(self, script, *args):
        return self.request('POST', self.session + '/execute/sync',
                            {'script': script, 'args': args})

    def wait_for_photo(self):
        loaded = self.request('POST', self.session + '/execute/async', {
            'script': '''
                const done = arguments[arguments.length - 1];
                const img = document.getElementById('fullImage');
                if (img.complete) done(img.naturalWidth > 0);
                else {
                    img.addEventListener('load', () => done(true), {once:true});
                    img.addEventListener('error', () => done(false), {once:true});
                }
            ''', 'args': [],
        })
        self.assertTrue(loaded, 'Expanded photograph must load before zooming')

    def click(self, selector):
        node = self.request('POST', self.session + '/element',
                            {'using': 'css selector', 'value': selector})
        self.request('POST', self.session + '/element/' + node[ELEMENT_KEY] + '/click', {})

    def key(self, key, shift=False):
        actions = []
        if shift:
            actions.append({'type': 'keyDown', 'value': '\ue008'})
        actions.extend([{'type': 'keyDown', 'value': key},
                        {'type': 'keyUp', 'value': key}])
        if shift:
            actions.append({'type': 'keyUp', 'value': '\ue008'})
        self.request('POST', self.session + '/actions', {
            'actions': [{'type': 'key', 'id': 'keyboard', 'actions': actions}],
        })

    def test_photo_keyboard_navigation_and_focus(self):
        self.load('photography.html')
        self.script("document.body.style.overflow = 'scroll'; document.querySelector('.masonry-grid img').focus()")
        self.key('\ue007')  # Enter
        self.assertEqual(self.script('return document.activeElement.id'), 'modalCloseBtn')
        self.key('\ue004', shift=True)  # Reverse navigation stays inside the native dialog
        self.assertTrue(self.script('return photoModal.contains(document.activeElement)'))
        self.key('\ue004')
        self.assertEqual(self.script('return document.activeElement.id'), 'modalCloseBtn')
        self.key('\ue012')  # Left wraps to last photograph
        self.assertTrue(self.script("return fullImage.src.endsWith([...document.querySelectorAll('.masonry-grid img')].at(-1).dataset.full)"))
        self.key('\ue014')  # Right wraps to first
        self.assertTrue(self.script("return fullImage.src.endsWith(document.querySelector('.masonry-grid img').dataset.full)"))
        self.key('\ue00c')  # Escape
        self.assertEqual(self.script('return getComputedStyle(photoModal).display'), 'none')
        self.assertTrue(self.script("return document.activeElement === document.querySelector('.masonry-grid img')"))
        self.assertEqual(self.script('return document.body.style.overflow'), 'scroll')

    def test_theme_follows_system_and_persists_explicit_choice(self):
        self.load('index.html')
        self.script("localStorage.removeItem('theme')")
        self.reload()
        system = self.script("return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'")
        opposite = 'light' if system == 'dark' else 'dark'
        self.assertEqual(self.script('return getComputedStyle(document.documentElement).colorScheme'), system)
        self.assertEqual(self.script("return document.getElementById('theme-toggle').getAttribute('aria-label')"),
                         f'Switch to {opposite} mode')
        self.click('#theme-toggle')
        self.assertEqual(self.script("return localStorage.getItem('theme')"), opposite)
        self.reload()
        self.assertEqual(self.script('return document.documentElement.dataset.theme'), opposite)
        self.assertEqual(self.script('return getComputedStyle(document.documentElement).colorScheme'), opposite)
        self.script("localStorage.setItem('theme', 'invalid')")
        self.reload()
        self.assertIsNone(self.script('return document.documentElement.getAttribute("data-theme")'))
        self.assertEqual(self.script('return getComputedStyle(document.documentElement).colorScheme'), system)

    def test_theme_works_when_storage_is_blocked(self):
        self.load('index.html')
        result = self.request('POST', self.session + '/execute/async', {
            'script': '''
                const done = arguments[arguments.length - 1];
                Object.defineProperty(window, 'localStorage', {
                    get() { throw new DOMException('Blocked storage', 'SecurityError'); }
                });
                document.documentElement.removeAttribute('data-theme');
                const errors = [];
                const onError = event => errors.push(event.message);
                window.addEventListener('error', onError);
                const script = document.createElement('script');
                script.src = '/js/theme.js';
                script.onload = () => {
                    window.removeEventListener('error', onError);
                    done(errors);
                };
                script.onerror = () => done(['Theme script failed to load']);
                document.head.append(script);
            ''', 'args': [],
        })
        self.assertEqual(result, [])
        system = self.script("return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'")
        self.click('#theme-toggle')
        self.assertEqual(self.script('return document.documentElement.dataset.theme'),
                         'light' if system == 'dark' else 'dark')

    def test_mobile_sidebar_keyboard_and_resizing(self):
        self.resize(700, 800)
        self.load('index.html')
        self.assertTrue(self.script("return document.getElementById('sidebar-content').hidden"))
        self.assertLess(self.script('return document.querySelector("main").getBoundingClientRect().top'),
                        self.script('return innerHeight / 2'))
        self.script("document.getElementById('sidebar-toggle').focus()")
        self.key('\ue007')
        self.assertEqual(self.script("return document.getElementById('sidebar-toggle').getAttribute('aria-expanded')"), 'true')
        self.key('\ue004')
        self.assertTrue(self.script("return document.activeElement.matches('.links a')"))
        self.key('\ue00c')
        self.assertTrue(self.script("return document.getElementById('sidebar-content').hidden"))
        self.assertEqual(self.script('return document.activeElement.id'), 'sidebar-toggle')
        self.click('#sidebar-toggle')
        for _ in range(8):
            self.key('\ue004')
        self.assertTrue(self.script("return document.getElementById('sidebar-content').hidden"))
        self.assertTrue(self.script("return document.activeElement.matches('.project-card a')"))
        self.click('#sidebar-toggle')
        self.click('#theme-toggle')
        self.assertTrue(self.script("return document.getElementById('sidebar-content').hidden"))
        self.assertEqual(self.script('return document.activeElement.id'), 'theme-toggle')
        self.resize(1280, 900)
        self.assertTrue(self.script("return document.getElementById('sidebar-toggle').hidden"))
        self.assertFalse(self.script("return document.getElementById('sidebar-content').hidden"))
        self.script("document.querySelector('.links a').focus()")
        self.resize(700, 800)
        self.assertTrue(self.script("return document.getElementById('sidebar-content').hidden"))
        self.assertEqual(self.script('return document.activeElement.id'), 'sidebar-toggle')
        self.click('#sidebar-toggle')
        self.click('.links a[href="photography.html"]')
        self.assertTrue(self.script("return document.body.classList.contains('photography')"))

    def test_zoom_is_stable_and_cleared_when_changing_images(self):
        self.load('photography.html')
        self.click('.masonry-grid img')
        self.wait_for_photo()
        result = self.script('''
            const img = document.getElementById('fullImage');
            const rect = img.getBoundingClientRect();
            const init = {bubbles:true, detail:1, clientX:rect.left + rect.width * .25,
                          clientY:rect.top + rect.height * .75};
            img.dispatchEvent(new MouseEvent('click', init));
            const origin = img.style.transformOrigin;
            for (let i = 0; i < 4; i++) img.dispatchEvent(new MouseEvent('mousemove', init));
            return [img.classList.contains('is-zoomed'), origin, img.style.transformOrigin];
        ''')
        self.assertTrue(result[0])
        self.assertEqual(result[1], result[2])
        self.resize(400, 800)
        self.assertFalse(self.script("return fullImage.classList.contains('is-zoomed')"))
        self.resize(1280, 900)
        self.assertTrue(self.script('''
            fullImage.dispatchEvent(new MouseEvent('click', {bubbles:true}));
            return fullImage.classList.contains('is-zoomed');
        '''))
        self.click('#modalNextBtn')
        self.assertFalse(self.script("return fullImage.classList.contains('is-zoomed')"))
        self.assertTrue(self.script("return fullImage.style.transformOrigin.startsWith('center center')"))

    def test_keyboard_zoom_and_pan_preserve_browser_shortcuts(self):
        self.load('photography.html')
        self.click('.masonry-grid img')
        self.wait_for_photo()
        self.script("document.getElementById('modalZoomBtn').focus()")
        self.key('\ue007')
        self.assertEqual(self.script("return document.getElementById('modalZoomBtn').getAttribute('aria-pressed')"), 'true')
        self.assertTrue(self.script("return fullImage.classList.contains('is-zoomed')"))
        before = self.script('return fullImage.src')
        self.key('\ue014')
        self.key('\ue013')  # Up
        self.assertEqual(self.script("return fullImage.style.transformOrigin.split(' ').slice(0, 2)"), ['60%', '40%'])
        self.assertEqual(self.script('return fullImage.src'), before)
        self.key(' ')
        self.assertFalse(self.script("return fullImage.classList.contains('is-zoomed')"))
        self.assertEqual(self.script("return document.getElementById('modalZoomBtn').getAttribute('aria-pressed')"), 'false')
        result = self.script('''
            return ['altKey', 'ctrlKey', 'metaKey', 'shiftKey'].map(modifier => {
                const event = new KeyboardEvent('keydown', {
                    key:'ArrowLeft', [modifier]:true, bubbles:true, cancelable:true,
                });
                document.getElementById('modalZoomBtn').dispatchEvent(event);
                return event.defaultPrevented;
            });
        ''')
        self.assertEqual(result, [False] * 4)
        self.assertEqual(self.script('return fullImage.src'), before)
        self.key('\ue014')  # Plain arrow still advances the gallery when unzoomed
        self.assertNotEqual(self.script('return fullImage.src'), before)

    def test_desktop_icons_remain_reachable_in_short_landscape_window(self):
        self.resize(800, 360)
        self.load('cyber.html')
        self.assertTrue(self.script('''
            const layer = document.querySelector('.icon-layer');
            return layer.scrollHeight > layer.clientHeight;
        '''))
        self.click('.desktop-icon[data-window="edu-window"]')
        self.assertEqual(self.script("return document.querySelector('.desktop-icon[data-window=\"edu-window\"]').getAttribute('aria-expanded')"), 'true')
        self.key('\ue00c')
        self.assertTrue(self.script('''
            const icon = document.querySelector('.desktop-icon[data-window="edu-window"]');
            const r = icon.getBoundingClientRect();
            const bar = document.querySelector('.taskbar').getBoundingClientRect();
            return document.activeElement === icon && r.top >= 0 && r.bottom <= bar.top;
        '''))

    def test_mobile_gestures_and_visible_navigation(self):
        self.resize(400, 800)
        self.load('photography.html')
        self.click('.masonry-grid img')
        for selector in ('#modalCloseBtn', '#modalPrevBtn', '#modalNextBtn'):
            self.assertTrue(self.script('''
                const r = document.querySelector(arguments[0]).getBoundingClientRect();
                return r.width >= 44 && r.height >= 44 && r.top >= 0 && r.bottom <= innerHeight;
            ''', selector), selector)
        result = self.script('''
            const modal = document.getElementById('photoModal');
            const img = document.getElementById('fullImage');
            // Desktop Firefox may omit the Touch constructor. Dispatch through
            // the real DOM with the same contact data the handlers receive.
            const touch = (id, x, y, target=img) => ({identifier:id, target, screenX:x, screenY:y});
            const emit = (type, touches, changedTouches, target=img) => {
                const event = new Event(type, {bubbles:true});
                Object.assign(event, {touches, changedTouches});
                target.dispatchEvent(event);
            };
            const start = touch(1, 200, 100), end = touch(1, 100, 100);
            const initial = img.src;
            emit('touchstart', [start], [start]);
            emit('touchend', [], [end]);
            const swiped = img.src !== initial;
            const after = img.src;
            emit('touchstart', [start], [start]);
            emit('touchend', [], [touch(1, 100, 300)]); // vertical drag
            const verticalIgnored = img.src === after;
            emit('touchstart', [start], [start]);
            const second = touch(2, 250, 150, modal);
            emit('touchstart', [start, second], [second], modal); // different descendants
            emit('touchend', [start], [second], modal);
            emit('touchend', [], [end]);
            const pinchIgnored = img.src === after;
            emit('touchstart', [start], [start]);
            emit('touchcancel', [], [start]);
            emit('touchend', [], [end]);
            const cancelIgnored = img.src === after;
            const button = document.getElementById('modalNextBtn');
            emit('touchstart', [start], [start], button);
            emit('touchend', [], [end], button);
            return [swiped, verticalIgnored, pinchIgnored, cancelIgnored, img.src === after];
        ''')
        self.assertEqual(result, [True] * 5)
        self.click('#modalPrevBtn')
        self.assertTrue(self.script("return fullImage.src.endsWith(document.querySelector('.masonry-grid img').dataset.full)"))

    def test_cyber_window_focus_close_and_switching(self):
        self.load('cyber.html')
        toggle = '.window-toggle[data-window="kuberange-window"]'
        self.click(toggle)
        self.assertTrue(self.script("return document.activeElement.matches('#kuberange-window .window-close')"))
        self.click('.window-toggle[data-window="phisherman-window"]')
        self.assertEqual(self.script("return getComputedStyle(document.getElementById('kuberange-window')).display"), 'none')
        self.assertEqual(self.script('return document.querySelector(arguments[0]).getAttribute("aria-expanded")', toggle), 'false')
        self.click('#phisherman-window .window-close')
        self.assertTrue(self.script("return document.activeElement.matches('.window-toggle[data-window=\"phisherman-window\"]')"))
        self.click(toggle)
        self.key('\ue00c')
        self.assertTrue(self.script('return document.activeElement.matches(arguments[0])', toggle))
        self.click('.start-btn')
        self.assertTrue(self.script("return document.activeElement.matches('#start-menu a')"))
        self.click('.desktop-env')
        self.assertEqual(self.script("return document.querySelector('.start-btn').getAttribute('aria-expanded')"), 'false')
        self.script('document.querySelector(arguments[0]).focus()', toggle)
        self.request('POST', self.session + '/actions', {
            'actions': [{'type': 'key', 'id': 'keyboard',
                         'actions': [{'type': 'keyDown', 'value': ' '}]}],
        })
        self.assertEqual(self.script('return document.querySelector(arguments[0]).getAttribute("aria-expanded")', toggle), 'false')
        self.request('POST', self.session + '/actions', {
            'actions': [{'type': 'key', 'id': 'keyboard',
                         'actions': [{'type': 'keyUp', 'value': ' '}]}],
        })
        self.assertTrue(self.script("return document.activeElement.matches('#kuberange-window .window-close')"))
        self.key('\ue00c')
        self.assertTrue(self.script('return document.activeElement.matches(arguments[0])', toggle))

    def test_pages_do_not_overflow_at_mobile_width(self):
        self.resize(320, 800)
        for page in ('index.html', 'services.html', 'photography.html', 'cyber.html'):
            with self.subTest(page=page):
                self.load(page)
                self.assertLessEqual(self.script('return document.documentElement.scrollWidth'),
                                     self.script('return innerWidth'))
        self.click('.window-toggle[data-window="edu-window"]')
        self.assertTrue(self.script('''
            const r = document.getElementById('edu-window').getBoundingClientRect();
            return r.left >= 0 && r.right <= innerWidth && r.top >= 0 && r.bottom <= innerHeight;
        '''))


if __name__ == '__main__':
    unittest.main()
