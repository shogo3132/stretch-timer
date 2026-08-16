(function(){
  var BUILD_KEY='stretchTimer.appBuild';
  var PENDING_NOTICE='stretchTimer.pendingNotice';
  var PULL_SCREENS=['home','menuEdit','itemEdit'];
  var refreshRunning=false;

  function activeScreenId(){
    var el=document.querySelector('.screen.active');
    return el?el.id:'';
  }

  function isRoutineEdit(){return activeScreenId()==='menuEdit'}

  function toast(text){
    if(!text)return;
    var old=document.getElementById('appToast');if(old)old.remove();
    var el=document.createElement('div');el.id='appToast';el.textContent=text;
    el.style.cssText='position:fixed;left:50%;bottom:28px;transform:translateX(-50%);z-index:9999;background:#20252b;color:#fff;padding:10px 15px;border-radius:14px;font-size:14px;box-shadow:0 4px 18px rgba(0,0,0,.2);max-width:85vw;text-align:center;opacity:0;transition:opacity .16s ease';
    document.body.appendChild(el);requestAnimationFrame(function(){el.style.opacity='1'});
    setTimeout(function(){el.style.opacity='0';setTimeout(function(){el.remove()},180)},2200);
  }

  var pending=localStorage.getItem(PENDING_NOTICE);
  if(pending){localStorage.removeItem(PENDING_NOTICE);setTimeout(function(){toast(pending)},250)}

  function setupRoutineEditor(){
    var top=document.getElementById('topBar');
    var start=document.getElementById('startMenuBtn');
    var add=document.getElementById('addItemBtn');
    var duplicate=document.getElementById('duplicateMenuBtn');
    if(duplicate) duplicate.style.display='none';
    if(add){add.style.width='100%';add.style.minHeight='54px';add.style.fontSize='16px';add.style.fontWeight='700'}
    if(top&&start){
      if(start.parentElement!==top) top.appendChild(start);
      start.className='btn';start.style.flex='0 0 auto';start.style.minHeight='42px';start.style.padding='7px 14px';start.style.borderRadius='13px';
      start.style.display=isRoutineEdit()?'inline-block':'none';start.textContent='▶ 開始';
    }
  }

  function duplicateRoutineById(id){
    if(typeof state==='undefined'||!state||!Array.isArray(state.menus))return;
    var i=state.menus.findIndex(function(x){return x.id===id});if(i<0)return;
    var src=state.menus[i],copy=JSON.parse(JSON.stringify(src));
    copy.id=typeof uid==='function'?uid():(Date.now()+Math.random().toString(16).slice(2));
    copy.name=(src.name||'ルーティン')+' コピー';copy.items=Array.isArray(copy.items)?copy.items:[];
    copy.items.forEach(function(x){x.id=typeof uid==='function'?uid():(Date.now()+Math.random().toString(16).slice(2))});
    state.menus.splice(i+1,0,copy);if(typeof save==='function')save();if(typeof renderHome==='function')renderHome();
  }

  function deleteRoutineById(id){
    if(typeof state==='undefined'||!state||!Array.isArray(state.menus))return;
    var i=state.menus.findIndex(function(x){return x.id===id});if(i<0)return;
    if(!confirm('このルーティンを削除しますか？'))return;
    state.menus.splice(i,1);if(typeof save==='function')save();if(typeof renderHome==='function')renderHome();
  }

  function closeRoutineSwipes(except){
    document.querySelectorAll('.menu-card.swipe-open,.menu-card.swipe-copy-open').forEach(function(card){
      if(card!==except)card.classList.remove('swipe-open','swipe-copy-open');
    });
  }

  function decorateRoutineCard(el){
    if(!el||el.dataset.v13Ready==='1')return;var id=el.dataset.id;if(!id)return;el.dataset.v13Ready='1';
    var gear=el.querySelector('.edit');if(gear){gear.textContent='⚙';gear.title='設定';gear.setAttribute('aria-label','設定');gear.onclick=function(e){e.preventDefault();e.stopPropagation()}}

    var del=el.querySelector('.swipe-delete');
    if(del){
      var fixedDel=del.cloneNode(true);del.replaceWith(fixedDel);
      fixedDel.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();deleteRoutineById(id)});
    }

    var oldDup=el.querySelector('.swipe-duplicate');if(oldDup)oldDup.remove();
    var dup=document.createElement('button');dup.type='button';dup.className='swipe-duplicate';dup.textContent='複製';
    dup.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();duplicateRoutineById(id)});el.appendChild(dup);

    el.addEventListener('click',function(e){
      if(e.target.closest('button'))return;var t=Number(el.dataset.lastSwipe||0);if(Date.now()-t<550)return;
      if(el.classList.contains('swipe-open')||el.classList.contains('swipe-copy-open')){el.classList.remove('swipe-open','swipe-copy-open');return}
      if(typeof openMenu==='function')openMenu(id);
    });

    var sx=0,sy=0;
    el.addEventListener('touchstart',function(e){if(e.touches.length!==1)return;sx=e.touches[0].clientX;sy=e.touches[0].clientY},{passive:true});
    el.addEventListener('touchend',function(e){
      if(!e.changedTouches.length)return;
      var dx=e.changedTouches[0].clientX-sx,dy=e.changedTouches[0].clientY-sy;
      if(Math.abs(dx)<=45||Math.abs(dx)<=Math.abs(dy)*1.25)return;
      el.dataset.lastSwipe=String(Date.now());closeRoutineSwipes(el);
      if(dx>0){el.classList.remove('swipe-open');el.classList.add('swipe-copy-open')}
      else{el.classList.remove('swipe-copy-open')}
    },{passive:true});
  }

  function decorateRoutineCards(){document.querySelectorAll('.menu-card').forEach(decorateRoutineCard)}
  function updateScreenUi(){setupRoutineEditor();decorateRoutineCards();var rb=document.getElementById('refreshBtn');if(rb)rb.onclick=unifiedRefresh}

  async function serverBuild(){
    try{var r=await fetch('./sw.js?check='+Date.now(),{cache:'no-store'});var t=await r.text();var m=t.match(/const CACHE='([^']+)'/);return m?m[1]:''}catch(e){return''}
  }

  function waitForWorker(reg,oldController){
    return new Promise(function(resolve){
      var done=false;function finish(changed){if(done)return;done=true;resolve(changed)}
      if(navigator.serviceWorker.controller!==oldController)return finish(true);
      var timer=setTimeout(function(){finish(navigator.serviceWorker.controller!==oldController)},2600);
      navigator.serviceWorker.addEventListener('controllerchange',function(){clearTimeout(timer);finish(true)},{once:true});
      var w=reg&&(reg.installing||reg.waiting);if(w)w.addEventListener('statechange',function(){if(w.state==='activated'){clearTimeout(timer);finish(true)}});
    });
  }

  async function unifiedRefresh(){
    if(refreshRunning)return;refreshRunning=true;window.__unifiedRefreshInProgress=true;
    var btn=document.getElementById('refreshBtn');if(btn)btn.classList.add('refreshing');
    var stateBefore='';try{stateBefore=JSON.stringify(window.state||null)}catch(e){}
    var buildBefore=localStorage.getItem(BUILD_KEY)||'';var remoteBuild=await serverBuild();if(!buildBefore&&remoteBuild)localStorage.setItem(BUILD_KEY,remoteBuild);
    var syncChanged=false,appChanged=false;
    try{
      if(typeof hasDropboxAuth==='function'&&hasDropboxAuth()&&typeof syncNow==='function'){
        var oldAlert=window.alert;window.alert=function(){};
        try{await syncNow(false)}catch(e){console.error(e)}finally{window.alert=oldAlert}
        var stateAfter='';try{stateAfter=JSON.stringify(window.state||null)}catch(e){}
        syncChanged=!!stateBefore&&!!stateAfter&&stateBefore!==stateAfter;
      }
      if('serviceWorker'in navigator){
        try{var reg=await navigator.serviceWorker.getRegistration();var old=navigator.serviceWorker.controller;if(reg){await reg.update();appChanged=await waitForWorker(reg,old)}}catch(e){console.error(e)}
      }
      if(remoteBuild&&buildBefore&&remoteBuild!==buildBefore){appChanged=true;localStorage.setItem(BUILD_KEY,remoteBuild)}
      if('caches'in window){try{var keys=await caches.keys();await Promise.all(keys.filter(function(k){return k.indexOf('stretch-timer-')===0&&k!==remoteBuild}).map(function(k){return caches.delete(k)}))}catch(e){console.error(e)}}
      if(appChanged)localStorage.setItem(PENDING_NOTICE,'アプリを最新版に更新しました');
      else if(syncChanged)localStorage.setItem(PENDING_NOTICE,'最新データを同期しました');
      location.replace(location.pathname+'?r='+Date.now());
    }finally{
      setTimeout(function(){refreshRunning=false;window.__unifiedRefreshInProgress=false;if(btn)btn.classList.remove('refreshing')},3000)
    }
  }
  window.unifiedRefresh=unifiedRefresh;

  var style=document.createElement('style');style.textContent='\
#menuEdit #duplicateMenuBtn{display:none!important}\
#menuEdit #addItemBtn{width:100%!important;min-height:54px!important;font-size:16px;font-weight:700}\
.menu-card.swipe-open>*:not(.swipe-delete):not(.swipe-duplicate){transform:translateX(-82px)!important}\
.menu-card.swipe-copy-open>*:not(.swipe-delete):not(.swipe-duplicate){transform:translateX(82px)!important}\
.swipe-duplicate{position:absolute;left:-2px;top:0;bottom:0;width:76px;border:0;background:#7f8a96;color:#fff;font-weight:700;display:flex;align-items:center;justify-content:center;transform:translateX(-100%);opacity:0;z-index:2;transition:transform .18s ease,opacity .08s ease}\
.menu-card.swipe-copy-open>.swipe-duplicate{transform:translateX(0);opacity:1}\
.menu-card.swipe-copy-open>.swipe-delete{opacity:0!important;transform:translateX(100%)!important}\
.menu-card .edit{cursor:default}\
';document.head.appendChild(style);

  if(typeof renderHome==='function'){var prevRenderHome=renderHome;renderHome=function(){var r=prevRenderHome.apply(this,arguments);setTimeout(decorateRoutineCards,0);return r}}
  if(typeof show==='function'){var prevShow=show;show=function(){var r=prevShow.apply(this,arguments);setTimeout(updateScreenUi,0);return r}}

  document.addEventListener('pointerdown',function(e){if(!e.target.closest('.menu-card'))closeRoutineSwipes()},true);

  var indicator=document.getElementById('pullRefreshIndicator');if(!indicator){indicator=document.createElement('div');indicator.id='pullRefreshIndicator';indicator.textContent='↻';document.body.appendChild(indicator)}
  var pullStart=0,pullActive=false,pullReady=false;
  document.addEventListener('touchstart',function(e){
    if(PULL_SCREENS.indexOf(activeScreenId())<0||window.scrollY>0||e.touches.length!==1)return;
    if(e.target.closest('button,input,textarea,select,a'))return;pullStart=e.touches[0].clientY;pullActive=true;pullReady=false;
  },true);
  document.addEventListener('touchmove',function(e){
    if(!pullActive||e.touches.length!==1)return;var dy=e.touches[0].clientY-pullStart;
    if(dy<=0){pullActive=false;indicator.classList.remove('visible','ready');return}
    if(dy>10){indicator.classList.add('visible');indicator.style.transform='translate(-50%,'+Math.min(28,dy*.28-55)+'px)'}
    pullReady=dy>=85;indicator.classList.toggle('ready',pullReady);
  },true);
  document.addEventListener('touchend',function(e){
    if(!pullActive)return;var ready=pullReady;pullActive=false;pullReady=false;indicator.style.transform='translate(-50%,-70px)';indicator.classList.remove('visible','ready');
    if(ready){e.stopImmediatePropagation();unifiedRefresh()}
  },true);

  setTimeout(updateScreenUi,0);
})();
