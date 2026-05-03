const CACHE = "jubilaea-v18";
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
  // Wait for activation - don't skipWaiting automatically
});

self.addEventListener("activate", function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(
        keys.filter(function(k){return k!==CACHE;})
            .map(function(k){return caches.delete(k);})
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", function(e){
  e.respondWith(
    caches.match(e.request).then(function(cached){
      // Always try network first for HTML, fallback to cache
      if(e.request.url.indexOf(".html")>=0){
        return fetch(e.request).then(function(response){
          var clone=response.clone();
          caches.open(CACHE).then(function(cache){cache.put(e.request,clone);});
          return response;
        }).catch(function(){return cached;});
      }
      return cached || fetch(e.request);
    })
  );
});

// Listen for skip waiting message from app
self.addEventListener("message", function(e){
  if(e.data && e.data.type==="SKIP_WAITING"){
    self.skipWaiting();
  }
});
