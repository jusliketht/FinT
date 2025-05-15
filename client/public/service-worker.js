const CACHE_NAME = 'fint-cache-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/static/js/main.chunk.js',
  '/static/js/bundle.js',
  '/static/js/vendors~main.chunk.js',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png'
];

// Install service worker and cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(STATIC_ASSETS);
      })
      .catch(error => {
        console.error('Error caching static assets:', error);
      })
  );
});

// Cache and network race
self.addEventListener('fetch', event => {
  event.respondWith(
    Promise.race([
      // Try network first
      fetch(event.request)
        .then(response => {
          // Clone the response as it can only be consumed once
          const responseClone = response.clone();
          
          // Cache the fresh data
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseClone);
            });

          return response;
        })
        .catch(() => {
          // If network fails, try cache
          return caches.match(event.request);
        }),
      
      // Try cache first
      caches.match(event.request)
        .then(response => {
          if (response) {
            // Return cached response and update cache in background
            fetch(event.request)
              .then(freshResponse => {
                caches.open(CACHE_NAME)
                  .then(cache => {
                    cache.put(event.request, freshResponse);
                  });
              })
              .catch(() => {/* Ignore network errors */});
            
            return response;
          }
          // If no cache, try network
          return fetch(event.request);
        })
    ])
  );
});

// Clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Handle push notifications
self.addEventListener('push', event => {
  const options = {
    body: event.data.text(),
    icon: '/logo192.png',
    badge: '/logo192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };

  event.waitUntil(
    self.registration.showNotification('FinT Update', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();

  event.waitUntil(
    clients.openWindow('/')
  );
}); 