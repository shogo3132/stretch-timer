const CACHE='stretch-timer-v16';
const APP_VERSION='0.12.8';
const ASSETS=['./','./index.html','./manifest.webmanifest','./icon.svg','./ux-v14.js','./ux-v15.js'];

function patchHtml(html){
  if(!html.includes('id="appVersion"')){
    html=html.replace(
      '<h1 id="title">ホーム</h1>',
      `<h1 id="title">ホーム</h1><span id="appVersion" style="font-size:11px;color:#8a929c;white-space:nowrap">v${APP_VERSION}</span>`
    );
  }

  if(!html.includes('data-keyboard-dismiss-patch')){
    html=html.replace(
      '</body>',
      `<script data-keyboard-dismiss-patch>
(function(){
  function isTextEditor(el){
    return !!el && (el.tagName==='INPUT' || el.tagName==='TEXTAREA' || el.isContentEditable);
  }
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

  if(!html.includes('data-refresh-swipe-patch')){
    html=html.replace(
      '</body>',
      `<style data-refresh-swipe-patch>
#homeSyncRow{display:none!important}
#home .headline,#menuEdit>.stack>.headline,#itemEdit>.stack>.headline{display:none!important}
#refreshBtn.refreshing{animation:spinRefresh .7s linear infinite}
@keyframes spinRefresh{to{transform:rotate(360deg)}}
#pullRefreshIndicator{position:fixed;left:50%;top:62px;z-index:30;transform:translate(-50%,-70px);width:38px;height:38px;border-radius:50%;background:#fff;box-shadow:0 2px 10px rgba(0,0,0,.14);display:grid;place-items:center;font-size:21px;color:#65707c;transition:transform .14s ease,opacity .14s ease;opacity:0;pointer-events:none}
#pullRefreshIndicator.visible{opacity:1}
#pullRefreshIndicator.ready{color:#27ae8b}
.menu-card,.item{position:relative;overflow:hidden}
.menu-card>*:not(.swipe-delete),.item>*:not(.swipe-delete){transition:transform .18s ease}
.menu-card.swipe-open>*:not(.swipe-delete),.item.swipe-open>*:not(.swipe-delete){transform:translateX(-82px)}
.swipe-delete{position:absolute;right:-2px;top:0;bottom:0;width:76px;border:0;background:#d9535f;color:#fff;font-weight:700;display:flex;align-items:center;justify-content:center;transform:translateX(100%);opacity:0;transition:transform .18s ease,opacity .08s ease;z-index:2}
.swipe-open>.swipe-delete{transform:translateX(0);opacity:1}
.menu-card .edit{flex:0 0 46px!important;min-width:46px;min-height:42px;padding:5px 10px;font-size:21px;line-height:1}
.menu-card.over,.item.over{overflow:visible;outline:none!important}
.menu-card.over::before,.item.over::before{content:'';position:absolute;left:8px;right:8px;top:-9px;height:3px;border-radius:3px;background:#27ae8b;box-shadow:0 0 0 1px rgba(39,174,139,.08);z-index:20;pointer-events:none}
.menu-card.over::after,.item.over::after{content:'';position:absolute;left:3px;top:-12px;width:9px;height:9px;border-radius:50%;background:#27ae8b;z-index:21;pointer-events:none}
</style>
<script data-refresh-swipe-patch>
(function(){
  function isHomeScreen(){
    var home=document.getElementById('home');
    return !!home && home.classList.contains('active');
  }

  function closeSwipes(except){
    document.querySelectorAll('.swipe-open').forEach(function(el){if(el!==except)el.classList.remove('swipe-open')});
  }

  function ensureRefreshButton(){
    var settings=document.getElementById('topAction');
    if(!settings) return;
    var btn=document.getElementById('refreshBtn');
    if(!btn){
      btn=document.createElement('button');
      btn.id='refreshBtn';
      btn.className='btn sub icon';
      btn.setAttribute('aria-label','更新');
      btn.title='更新';
      btn.textContent='↻';
      btn.onclick=function(){if(typeof window.unifiedRefresh==='function')window.unifiedRefresh()};
      settings.insertAdjacentElement('afterend',btn);
    }
    btn.style.display=isHomeScreen()?'inline-block':'none';
  }

  function gearRoutineSettings(){
    document.querySelectorAll('.menu-card .edit').forEach(function(btn){
      btn.textContent='⚙';
      btn.setAttribute('aria-label','ルーティン設定');
      btn.title='ルーティン設定';
    });
  }

  function addSwipeDelete(el,type){
    if(!el||el.dataset.swipeDeleteReady==='1') return;
    var id=el.dataset.id;
    if(!id) return;
    el.dataset.swipeDeleteReady='1';
    var del=document.createElement('button');
    del.className='swipe-delete';
    del.type='button';
    del.textContent='削除';
    del.addEventListener('click',function(e){
      e.preventDefault();e.stopPropagation();
      if(type==='routine'){
        if(!confirm('このルーティンを削除しますか？')) return;
        var i=state.menus.findIndex(function(x){return x.id===id});
        if(i>=0){state.menus.splice(i,1);save();renderHome()}
      }else{
        if(!confirm('この種目を削除しますか？')) return;
        var m=typeof menu==='function'?menu():null;
        if(!m) return;
        var j=m.items.findIndex(function(x){return x.id===id});
        if(j>=0){m.items.splice(j,1);save();renderItems();if(typeof updateDuration==='function')updateDuration()}
      }
    });
    el.appendChild(del);

    var sx=0,sy=0,moved=false;
    el.addEventListener('touchstart',function(e){
      if(e.touches.length!==1) return;
      var t=e.touches[0];sx=t.clientX;sy=t.clientY;moved=false;
    },{passive:true});
    el.addEventListener('touchmove',function(e){
      if(e.touches.length!==1) return;
      var t=e.touches[0],dx=t.clientX-sx,dy=t.clientY-sy;
      if(Math.abs(dx)>22 && Math.abs(dx)>Math.abs(dy)*1.35) moved=true;
    },{passive:true});
    el.addEventListener('touchend',function(e){
      if(!moved||!e.changedTouches.length) return;
      var t=e.changedTouches[0],dx=t.clientX-sx,dy=t.clientY-sy;
      if(Math.abs(dx)<=45||Math.abs(dx)<=Math.abs(dy)*1.35) return;
      if(dx<0){closeSwipes(el);el.classList.add('swipe-open')}
      else el.classList.remove('swipe-open');
    },{passive:true});
  }

  function decorateRoutineCards(){
    gearRoutineSettings();
    document.querySelectorAll('.menu-card').forEach(function(el){addSwipeDelete(el,'routine')});
  }
  function decorateExerciseCards(){
    document.querySelectorAll('.item').forEach(function(el){addSwipeDelete(el,'exercise')});
  }

  if(typeof renderHome==='function'){
    var originalRenderHome=renderHome;
    renderHome=function(){var r=originalRenderHome.apply(this,arguments);ensureRefreshButton();decorateRoutineCards();return r};
  }
  if(typeof renderItems==='function'){
    var originalRenderItems=renderItems;
    renderItems=function(){var r=originalRenderItems.apply(this,arguments);decorateExerciseCards();return r};
  }
  if(typeof show==='function'){
    var originalShow=show;
    show=function(){var r=originalShow.apply(this,arguments);setTimeout(ensureRefreshButton,0);return r};
  }

  document.addEventListener('pointerdown',function(e){
    if(!e.target.closest('.menu-card,.item')) closeSwipes();
  },true);

  var indicator=document.createElement('div');
  indicator.id='pullRefreshIndicator';
  indicator.textContent='↻';
  document.body.appendChild(indicator);

  setTimeout(function(){ensureRefreshButton();decorateRoutineCards();decorateExerciseCards()},0);
})();
</script></body>`
    );
  }

  if(!html.includes('src="./ux-v14.js"')){
    html=html.replace('</body>','<script src="./ux-v14.js"></script></body>');
  }
  if(!html.includes('src="./ux-v15.js"')){
    html=html.replace('</body>','<script src="./ux-v15.js"></script></body>');
  }

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
      fetch(e.request)
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
    fetch(e.request)
      .then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return r})
      .catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html')))
  );
});
