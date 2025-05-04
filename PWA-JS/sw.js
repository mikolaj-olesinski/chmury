const cacheName = 'koty-pwa-v1';
const filesToCache = [
  '/',
  '/index.html',
  '/memy.html',
  '/fakty.html',
  '/style.css',
  '/js/main.js',
  '/images/cat1.jpg',
  '/images/mem1.jpg',
  '/images/mem2.jpg',
  '/images/mem3.jpg',
  '/images/pwa-icon-128.png',
  '/images/pwa-icon-144.png',
  '/images/pwa-icon-192.png',
  '/images/pwa-icon-256.png',
  '/images/pwa-icon-512.png',
  '/images/pwa-icon-152.png',
  '/images/apple-splash-640-1136.jpg',
  '/images/apple-splash-750-1334.jpg',
  '/images/apple-splash-828-1792.jpg',
  '/images/apple-splash-1125-2436.jpg',
  '/images/apple-splash-1242-2688.jpg',
  '/images/apple-splash-1536-2048.jpg',
  '/images/apple-splash-1668-2224.jpg',
  '/images/apple-splash-1668-2388.jpg',
  '/images/apple-splash-2048-2732.jpg',
  '/images/apple-icon-180.png',
  '/images/favicon.ico'
];

// Instalacja Service Workera
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(cacheName).then((cache) => {
      return cache.addAll(filesToCache);
    })
  );
});

// Dynamiczne buforowanie i obsługa żądań
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((fetchResponse) => {
        if (event.request.method === 'GET') {
          return caches.open(cacheName).then((cache) => {
            cache.put(event.request, fetchResponse.clone());
            return fetchResponse;
          });
        }
        return fetchResponse;
      });
    }).catch(() => {
      // Fallback dla braku połączenia
      if (event.request.mode === 'navigate') {
        return caches.match('/index.html');
      }
    })
  );
});

// Aktywacja i czyszczenie starych cache'ów
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [cacheName];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (!cacheWhitelist.includes(cache)) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Obsługa powiadomień push
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Koty internetowe';
  const options = {
    body: data.body || 'Nowa wiadomość o kotach!',
    icon: 'images/pwa-icon-192.png',
    badge: 'images/pwa-icon-128.png'
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Obsługa kliknięcia w powiadomienie
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/')
  );
});