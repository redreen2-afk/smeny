const CACHE = 'smeny-v2';
const FILES = [
  './',
  './index.html',
  './manifest.json',
  'https://fonts.googleapis.com/css2?family=Unbounded:wght@300;400;600;800&family=Golos+Text:wght@400;500;600&display=swap'
];

// Установка — кэшируем все файлы
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(FILES))
  );
  self.skipWaiting(); // Сразу активируемся, не ждём закрытия вкладок
});

// Активация — удаляем старый кэш
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim(); // Берём контроль над всеми вкладками сразу
});

// Запросы — сначала сеть, при ошибке кэш
self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request)
      .then(response => {
        // Если получили ответ — обновляем кэш
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, clone));
        }
        return response;
      })
      .catch(() => {
        // Нет интернета — берём из кэша
        return caches.match(e.request).then(cached => cached || caches.match('./index.html'));
      })
  );
});
