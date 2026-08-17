const CACHE='stretch-timer-v34';
const APP_VERSION='0.12.20';
const ASSETS=['./','./index.html','./manifest.webmanifest','./icon.svg','./ux-v22.js?v=34','./ux-v18.js?v=34','./ux-v26-detail.js?v=34','./ux-v34-timer.js?v=34'];

function patchHtml(html){
  if(!html.includes('id="appVersion"')){
    html=html.replace(
      '<h1 id="title">ホーム</h1>',
      `<h1 id="title">ホーム</h1><span id="appVersion" style="font-size:11px;color:#8a929c;white-space:nowrap">v${APP_VERSION}</span>`
    );
  }else{
    html=html.replace(/(<span id="appVersion"[^>]*>)[^<]*(<\/span>)/,`$1v${APP_VERSION}$2`);
  }

  if(!html.includes('data-keyboard-dismiss-patch')){
    html=html.replace(
      '</body>',
      `<script data-keyboard-dismiss-patch>
(function(){
  function isTextEditor(el){return !!el && (el.tagName==='INPUT' || el.tagName==='TEXTAREA' || el.isContentEditable);}
  document.addEventListener('pointerdown',function(e){
    var active=document.activeElement;
    if(!isTextEditor(active)) return;
    if(e.target===active || active.contains(e.target)) return;
    if(isTextEditor(e.target)) return;
    active.blur();
  },true);
})();
</script></body>`
    );
  }

  html=html
    .replaceAll('マイメニュー','マイルーティン')
    .replaceAll('メニュー','ルーティン')
    .replaceAll('項目','種目');

  html=html.replace(/<script\s+src="\.\/ux-v[^"?]+\.js(?:\?v=\d+)?"><\/script>/g,'');
  html=html.replace('</body>',
    '<script src="./ux-v22.js?v=34"></script>'+
    '<script src="./ux-v18.js?v=34"></script>'+
    '<script src="./ux-v26-detail.js?v=34"></script>'+
    '<script src="./ux-v34-timer.js?v=34"></script></body>'
  );
  return html;
}

async function patchedResponse(response){
  const text=patchHtml(await response.text());
  const headers=new Headers(response.headers);
  headers.delete('content-length');
  headers.delete('content-encoding');
  return new Response(text,{status:response.status,statusText:response.statusText,headers});
}

self.addEventListener('install',e=>{
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));
});

self.addEventListener('activate',e=>{
  e.waitUntil(Promise.all([
    self.clients.claim(),
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
  ]));
});

self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET') return;
  const url=new URL(e.request.url);
  const isAppHtml=url.origin===self.location.origin &&
    (url.pathname.endsWith('/stretch-timer/') || url.pathname.endsWith('/stretch-timer/index.html'));

  if(isAppHtml){
    e.respondWith(
      fetch(e.request,{cache:'no-store'})
        .then(async r=>{
          const patched=await patchedResponse(r);
          caches.open(CACHE).then(c=>c.put(e.request,patched.clone()));
          return patched;
        })
        .catch(()=>caches.match(e.request).then(async r=>r?patchedResponse(r):caches.match('./index.html').then(x=>x?patchedResponse(x):x)))
    );
    return;
  }

  e.respondWith(
    fetch(e.request,{cache:'no-store'})
      .then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return r})
      .catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html')))
  );
});
