const CACHE='stretch-timer-v123';
const APP_VERSION='0.12.109';
const ITEM_MEDIA_CACHE='stretch-timer-item-media-v1';
const ASSETS=['./','./index.html','./manifest.webmanifest','./icon.svg','./favicon.svg','./vendor/xlsx.mini.min.js?v=96','./ux-v22.js?v=115','./ux-v18.js?v=101','./ux-v26-detail.js?v=96','./ux-v34-timer.js?v=96','./ux-v35-history.js?v=96','./ux-v36-sample.js?v=96','./ux-v38-polish.js?v=115','./ux-v41-timer-compact.js?v=107','./ux-v43-timer-back.js?v=96','./ux-v46-desktop-dnd.js?v=96','./ux-v79-item-editor-core.js?v=122','./ux-v79-item-card-sync.js?v=96','./ux-v52-scroll-restore.js?v=96','./ux-v51-update-watch.js?v=123','./ux-v54-refresh-motion.js?v=96','./ux-v79-transition-stability.js?v=115','./ux-v56-browser-history.js?v=96','./ux-v81-timer-edit-save.js?v=120','./ux-v82-timer-runtime.js?v=120','./ux-v85-xlsx-import.js?v=96','./ux-v86-video-reference.js?v=96','./ux-v88-focus-variants.js?v=96','./ux-v96-native-pip.js?v=105','./ux-v106-tasks.js?v=117','./ux-v107-timer-exit.js?v=119','./ux-v108-small-fixes.js?v=121','./ux-v109-item-media.js?v=123','./ux-v110-recipes.js?v=123'];

function patchHtml(html){
  if(!html.includes('rel="icon"')){
    html=html.replace(
      '<link rel="manifest" href="manifest.webmanifest">',
      '<link rel="manifest" href="manifest.webmanifest">\n<link rel="icon" type="image/svg+xml" href="./favicon.svg?v=96">'
    );
  }

  if(!html.includes('id="appVersion"')){
    html=html.replace(
      '<h1 id="title">ストレッチ</h1>',
      `<h1 id="title">ストレッチ</h1><span id="appVersion" style="font-size:11px;color:#8a929c;white-space:nowrap">v${APP_VERSION}</span>`
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
  html=html.replace(/<script\s+src="\.\/vendor\/xlsx\.mini\.min\.js(?:\?v=\d+)?"><\/script>/g,'');
  html=html.replace('</body>',
    '<script src="./vendor/xlsx.mini.min.js?v=96"></script>'+
    '<script src="./ux-v22.js?v=115"></script>'+
    '<script src="./ux-v18.js?v=101"></script>'+
    '<script src="./ux-v26-detail.js?v=96"></script>'+
    '<script src="./ux-v34-timer.js?v=96"></script>'+
    '<script src="./ux-v35-history.js?v=96"></script>'+
    '<script src="./ux-v36-sample.js?v=96"></script>'+
    '<script src="./ux-v38-polish.js?v=115"></script>'+
    '<script src="./ux-v41-timer-compact.js?v=107"></script>'+
    '<script src="./ux-v43-timer-back.js?v=96"></script>'+
    '<script src="./ux-v46-desktop-dnd.js?v=96"></script>'+
    '<script src="./ux-v79-item-editor-core.js?v=98"></script>'+
    '<script src="./ux-v79-item-card-sync.js?v=96"></script>'+
    '<script src="./ux-v52-scroll-restore.js?v=96"></script>'+
    '<script src="./ux-v51-update-watch.js?v=119"></script>'+
    '<script src="./ux-v54-refresh-motion.js?v=96"></script>'+
    '<script src="./ux-v79-transition-stability.js?v=115"></script>'+
    '<script src="./ux-v56-browser-history.js?v=96"></script>'+
    '<script src="./ux-v81-timer-edit-save.js?v=118"></script>'+
    '<script src="./ux-v82-timer-runtime.js?v=96"></script>'+
    '<script src="./ux-v85-xlsx-import.js?v=96"></script>'+
    '<script src="./ux-v86-video-reference.js?v=96"></script>'+
    '<script src="./ux-v88-focus-variants.js?v=96"></script>'+
    '<script src="./ux-v96-native-pip.js?v=105"></script>'+
    '<script src="./ux-v106-tasks.js?v=117"></script>'+
    '<script src="./ux-v107-timer-exit.js?v=119"></script>'+
    '<script src="./ux-v108-small-fixes.js?v=121"></script>'+
    '<script src="./ux-v109-item-media.js?v=123"></script>'+
    '<script src="./ux-v110-recipes.js?v=123"></script></body>'
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
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE&&k!==ITEM_MEDIA_CACHE).map(k=>caches.delete(k))))
  ]));
});

self.addEventListener('message',e=>{
  if(e.data&&e.data.type==='GET_BUILD'&&e.ports&&e.ports[0]){
    e.ports[0].postMessage({build:CACHE,version:APP_VERSION});
  }
});

self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET') return;
  const url=new URL(e.request.url);
  const isItemMedia=url.origin===self.location.origin&&url.pathname.includes('/item-media-cache/');
  if(isItemMedia){e.respondWith(caches.match(e.request).then(r=>r||new Response('',{status:404})));return}
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
