const CACHE='stretch-timer-v3';
const ASSETS=['./','./index.html','./manifest.webmanifest','./icon.svg'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS))) });
self.addEventListener('activate',e=>{e.waitUntil(Promise.all([self.clients.claim(),caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))]))});

function patchHtml(html){
  const old="(async()=>{try{const connected=await finishDropboxAuth();renderHome();if(connected)await syncNow(true);else if(hasDropboxAuth())setTimeout(()=>syncNow(false),700)}catch(e){console.error(e);alert('Dropboxへの接続に失敗しました。');renderHome()}})();";
  const safe="(async()=>{try{const q=new URLSearchParams(location.search);if(q.get('code')&&(!sessionStorage.getItem('dbx_state')||!sessionStorage.getItem('dbx_verifier'))){history.replaceState({},'',REDIRECT_URI);renderHome();if(hasDropboxAuth())setTimeout(()=>syncNow(false),700);return;}const connected=await finishDropboxAuth();renderHome();if(connected)await syncNow(true);else if(hasDropboxAuth())setTimeout(()=>syncNow(false),700)}catch(e){console.error(e);try{history.replaceState({},'',REDIRECT_URI)}catch{}renderHome();if(!hasDropboxAuth())alert('Dropboxへの接続に失敗しました。')}})();";
  return html.includes(old)?html.replace(old,safe):html;
}

self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const u=new URL(e.request.url);
  const isAppHtml=u.origin===self.location.origin&&(u.pathname.endsWith('/stretch-timer/')||u.pathname.endsWith('/stretch-timer/index.html'));
  if(isAppHtml){
    e.respondWith(fetch(e.request).then(async r=>{
      const text=patchHtml(await r.text());
      const patched=new Response(text,{status:r.status,statusText:r.statusText,headers:r.headers});
      caches.open(CACHE).then(c=>c.put(e.request,patched.clone()));
      return patched;
    }).catch(()=>caches.match(e.request).then(async r=>{
      if(!r)return caches.match('./index.html');
      const text=patchHtml(await r.text());
      return new Response(text,{status:r.status,statusText:r.statusText,headers:r.headers});
    })));
    return;
  }
  e.respondWith(fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return r}).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html'))));
});
