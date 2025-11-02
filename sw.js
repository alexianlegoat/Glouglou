/* Fichier: sw.js (Service Worker) */

const CACHE_NAME = 'glouglou-cache-v1';
const urlsToCache = [
    './', // L'alias pour index.html
    'index.html',
    'style.css',
    'script.js',
    'game.html',
    'packs.js',
    'logo_glouglou.png',
    'retour.png'
];

// 1. Installation du Service Worker (Mise en cache)
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Cache ouvert');
                return cache.addAll(urlsToCache);
            })
    );
});

// 2. Interception des requêtes (Stratégie Cache-First)
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Si la ressource est dans le cache, on la retourne
                if (response) {
                    return response;
                }
                
                // Sinon, on essaie de la récupérer sur le réseau
                return fetch(event.request)
                    .then(networkResponse => {
                        // Optionnel : On peut aussi la mettre en cache pour la prochaine fois
                        return caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, networkResponse.clone());
                                return networkResponse;
                            });
                    })
                    .catch(() => {
                        // Gérer les erreurs de fetch (par exemple, si hors-ligne et non-caché)
                        console.error('Fetch a échoué pour :', event.request.url);
                    });
            })
    );
});
