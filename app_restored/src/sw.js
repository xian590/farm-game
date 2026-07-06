// 宇宙许愿岛 Service Worker
const CACHE_NAME = 'wish-island-v5';
const STATIC_ASSETS = [
  '/index.html',
  '/manifest.json'
];

// 安装：缓存核心资源
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS).catch(() => {
        // 部分资源可能离线时不可达，静默处理
      });
    }).then(() => self.skipWaiting())
  );
});

// 激活：清理旧缓存
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      );
    }).then(() => self.clients.claim())
  );
});

// 拦截请求：缓存优先 + 网络回退
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // 跳过非 GET 请求和跨域请求（Google Fonts 等 CDN 由浏览器缓存）
  if (request.method !== 'GET') return;

  // 对 HTML 使用 Network First（确保内容最新）
  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(
      fetch(request).then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
        return response;
      }).catch(() => {
        return caches.match(request).then(cached => {
          return cached || new Response('<h1>离线模式</h1><p>宇宙许愿岛需要联网才能首次加载。请检查网络后重试。</p>', {
            headers: { 'Content-Type': 'text/html' }
          });
        });
      })
    );
    return;
  }

  // 其他资源：Cache First
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(response => {
        if (response.ok && url.origin === self.location.origin) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
        }
        return response;
      }).catch(() => {
        // 静默失败，让浏览器处理
      });
    })
  );
});

// 后台同步：待办提醒（前端通过 sync.register('daily-reminder') 触发）
self.addEventListener('sync', event => {
  if (event.tag === 'daily-reminder') {
    event.waitUntil(showNotification('今日肯定语', '✨ 你的肯定语已准备好，点击查看今日能量'));
  }
  if (event.tag === 'meditation-reminder') {
    event.waitUntil(showNotification('冥想时间', '🌙 今晚的 SATS 冥想时间到了，给自己一个安静的时刻'));
  }
  if (event.tag === 'challenge-reminder') {
    event.waitUntil(showNotification('21天挑战', '💪 今天的挑战打卡还没完成，坚持就是显化'));
  }
});

// 推送通知
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  event.waitUntil(
    self.registration.showNotification(data.title || '宇宙许愿岛', {
      body: data.body || '✨ 你有一条来自宇宙的温柔提醒',
      icon: data.icon || '/manifest.json', // 浏览器会取合适的图标
      badge: data.badge || '✨',
      tag: data.tag || 'default',
      requireInteraction: data.requireInteraction || false,
      actions: data.actions || [],
      data: data.payload || {}
    })
  );
});

// 通知点击
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const payload = event.notification.data || {};
  let url = '/index.html';
  if (payload.route) url += `?route=${payload.route}`;
  if (event.action) url += `&action=${event.action}`;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
      const existing = clients.find(c => c.url.includes(url) && 'focus' in c);
      if (existing) return existing.focus();
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});

function showNotification(title, body) {
  return self.registration.showNotification(title, {
    body,
    icon: '✨',
    badge: '✨',
    tag: 'reminder',
    requireInteraction: false
  });
}
