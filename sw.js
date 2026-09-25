// Service worker de la página puente: guarda solo la "cáscara" (logo, íconos) para
// que la app abra rápido. El portal siempre se carga en vivo desde internet, por eso
// los cambios que publiques en Apps Script se ven sin reinstalar nada.
const CACHE = 'infra-puente-v2';
const ARCHIVOS = ['./', 'index.html', 'manifest.json', 'logo.png', 'favicon.png', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', function(e) {
  e.waitUntil(caches.open(CACHE).then(function(c) { return c.addAll(ARCHIVOS); }).then(function() { return self.skipWaiting(); }));
});

self.addEventListener('activate', function(e) {
  e.waitUntil(caches.keys().then(function(ks) {
    return Promise.all(ks.filter(function(k) { return k !== CACHE; }).map(function(k) { return caches.delete(k); }));
  }).then(function() { return self.clients.claim(); }));
});

self.addEventListener('fetch', function(e) {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return; // el portal va directo a internet
  e.respondWith(
    fetch(e.request).then(function(r) {
      const copia = r.clone();
      caches.open(CACHE).then(function(c) { c.put(e.request, copia); });
      return r;
    }).catch(function() { return caches.match(e.request).then(function(r) { return r || caches.match('index.html'); }); })
  );
});
