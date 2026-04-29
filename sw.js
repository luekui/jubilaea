const CACHE = "jubilaea-v2";
const ASSETS = [
  "./index.html",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", function(e){
  e.waitUntil(
    caches.open(CACHE).then(function(cache){
      return cache.addAll(ASSETS);
    })
  );
  // Don't skipWaiting - wait for user confirmation
});

self.addEventListener("activate", function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){return k!==CACHE;}).map(function(k){return caches.delete(k);}));
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", function(e){
  e.respondWith(
    caches.match(e.request).then(function(cached){
      return cached || fetch(e.request).catch(function(){
        return caches.match("./index.html");
      });
    })
  );
});

// Listen for skip waiting message from app
self.addEventListener("message", function(e){
  if(e.data && e.data.type === "SKIP_WAITING"){
    self.skipWaiting();
  }
});
