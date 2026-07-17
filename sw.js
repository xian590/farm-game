const CACHE_NAME = 'cosmos-island-v8';
const OFFLINE_PAGE = './index.html';

const urlsToCache = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json',
  './data/affirmations.js',
  './data/plans.js',
  './data/personality_test.js',
  './data/personas.js',
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/npm/chart.js@4',
  'https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;700&family=ZCOOL+XiaoWei&family=Ma+Shan+Zheng&display=swap'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .catch(err => console.error('[SW] Cache install failed:', err))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(names =>
      Promise.all(
        names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n))
      )
    ).catch(err => console.error('[SW] Cache cleanup failed:', err))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const req = event.request;

  // 仅处理 GET 请求
  if (req.method !== 'GET') return;

  // 跳过 chrome-extension 和 blob 请求
  if (req.url.startsWith('chrome-extension:') || req.url.startsWith('blob:')) return;

  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) {
        // 后台更新缓存（stale-while-revalidate）
        fetch(req).then(resp => {
          if (resp && resp.status === 200 && resp.type === 'basic') {
            caches.open(CACHE_NAME).then(cache => cache.put(req, resp.clone()));
          }
        }).catch(() => {});
        return cached;
      }

      return fetch(req).then(resp => {
        if (!resp || resp.status !== 200 || resp.type !== 'basic') return resp;
        const clone = resp.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(req, clone)).catch(() => {});
        return resp;
      }).catch(() => {
        // 导航请求回退到离线页面
        if (req.mode === 'navigate') {
          return caches.match(OFFLINE_PAGE);
        }
        return new Response('离线模式：部分功能可能不可用', {
          status: 503,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });
      });
    })
  );
});

self.addEventListener('sync', event => {
  if (event.tag === 'daily-reminder') {
    event.waitUntil(Promise.resolve());
  }
});

// 推送通知支持（预留）
self.addEventListener('push', event => {
  const data = event.data?.json() ?? {};
  event.waitUntil(
    self.registration.showNotification(data.title || '许愿岛', {
      body: data.body || '今日肯定语已准备好 ✨',
      icon: data.icon || '',
      badge: data.badge || '',
      tag: data.tag || 'default',
      requireInteraction: false
    })
  );
});
