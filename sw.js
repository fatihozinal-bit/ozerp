// OZerp — uygulama olarak kurulum için önbellek (r371)
// Program dosyası (index.html) ve simgeler AĞ ÖNCE alınır: internet varken her zaman yayındaki son sürüm açılır,
// bağlantı yoksa son açılan sürüm önbellekten gösterilir. Veri (Supabase), yazı tipleri ve kütüphaneler bu dosyaya girmez.
var ONBELLEK = 'ozerp-kabuk-v1';
var KABUK = ['./', './index.html', './manifest.webmanifest', './simge/simge-192.png', './simge/simge-512.png', './simge/apple-touch-icon.png'];

self.addEventListener('install', function(e){
  e.waitUntil(caches.open(ONBELLEK).then(function(c){ return c.addAll(KABUK); }).catch(function(){}).then(function(){ return self.skipWaiting(); }));
});

self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(ad){
    return Promise.all(ad.filter(function(k){ return k.indexOf('ozerp-kabuk-') === 0 && k !== ONBELLEK; }).map(function(k){ return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});

self.addEventListener('fetch', function(e){
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // Supabase, yazı tipleri, CDN: tarayıcı kendisi alır
  e.respondWith(
    fetch(req).then(function(cevap){
      if (cevap && cevap.ok && (req.mode === 'navigate' || /\.(html|png|webmanifest|json)$/.test(url.pathname) || url.pathname.slice(-1) === '/')){
        var kopya = cevap.clone();
        caches.open(ONBELLEK).then(function(c){ c.put(req.mode === 'navigate' ? './index.html' : req, kopya); });
      }
      return cevap;
    }).catch(function(){
      return caches.match(req, { ignoreSearch: true }).then(function(r){
        return r || (req.mode === 'navigate' ? caches.match('./index.html') : undefined) || Response.error();
      });
    })
  );
});
