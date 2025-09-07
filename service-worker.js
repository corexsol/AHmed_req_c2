const CACHE_NAME = 'hack4saferplates-cache-v1';
const urlsToCache = [
  './',
  './AhmedReqv2.html',
  './screen_1_NB.jpg',
  './screen_two.png',
  './screen_one.png',
  './button.png',
  './manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request))
  );
});
