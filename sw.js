const CACHE="fd-v1";
self.addEventListener("install",function(){self.skipWaiting();});
self.addEventListener("activate",function(e){e.waitUntil((async function(){
  var ks=await caches.keys();
  await Promise.all(ks.filter(function(k){return k!==CACHE}).map(function(k){return caches.delete(k)}));
  await self.clients.claim();
})());});
self.addEventListener("fetch",function(e){
  var req=e.request; if(req.method!=="GET") return;
  var url=new URL(req.url);
  if(url.pathname.endsWith("version.json")){
    e.respondWith(fetch(req).catch(function(){return new Response("{}",{headers:{"Content-Type":"application/json"}})}));
    return;
  }
  e.respondWith((async function(){
    try{
      var res=await fetch(req);
      if(res&&res.status===200){var c=await caches.open(CACHE); c.put(req,res.clone());}
      return res;
    }catch(err){
      var cached=await caches.match(req);
      if(cached) return cached;
      if(req.mode==="navigate"){var idx=await caches.match("index.html"); if(idx) return idx;}
      throw err;
    }
  })());
});
