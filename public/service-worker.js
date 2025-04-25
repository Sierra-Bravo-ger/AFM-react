// Service Worker für AFM Dashboard
const CACHE_NAME = 'afm-dashboard-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/AFM3.svg',
  '/manifest.json'
];

// Installation - Cache öffnen und Ressourcen speichern
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache geöffnet');
        return cache.addAll(urlsToCache);
      })
  );
});

// Aktivierung - Alte Caches löschen
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Alter Cache wird gelöscht:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch - Anfragen abfangen und aus dem Cache bedienen
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - Ressource aus dem Cache zurückgeben
        if (response) {
          return response;
        }

        // Anfrage klonen, da sie nur einmal verwendet werden kann
        const fetchRequest = event.request.clone();

        // Netzwerkanfrage stellen
        return fetch(fetchRequest).then(
          response => {
            // Prüfen, ob wir eine gültige Antwort erhalten haben
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Antwort klonen, da sie nur einmal verwendet werden kann
            const responseToCache = response.clone();

            // Antwort im Cache speichern
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});
