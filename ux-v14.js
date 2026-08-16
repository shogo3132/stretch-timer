(function(){
  var BUILD_KEY='stretchTimer.appBuild';
  var PENDING_NOTICE='stretchTimer.pendingNotice';
  var PULL_SCREENS=['home','menuEdit','itemEdit'];
  var refreshRunning=false;

  function activeScreenId(){
    var el=document.querySelector('.screen.active');
    return el?el.id:'';
  }

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

  function setupEditors(){
    var start=document.getElementById('startMenuBtn');
    var add=document.getElementById('addItemBtn');
    var duplicateMenu=document.getElementById('duplicateMenuBtn');
    var duplicateItem=document.getElementById('duplicateItemBtn');
    if(start)start.style.display='none';
    if(duplicateMenu)duplicateMenu.style.display='none';
    if(duplicateItem)duplicateItem.style.display='none';
    if(add){
      add.style.width='100%';
      add.style.minHeight='56px';
      add.style.fontSize='16px';
      add.style.fontWeight='700';
    }
  }

  function currentMenu(){
    try{return typeof menu==='function'?menu():null}catch(e){return null}
  }

  function duplicateRoutineById(id){
    if(typeof state==='undefined'||!state||!Array.isArray(state.menus))return;
    var i=state.menus.findIndex(function(x){return x.id===id});if(i<0)return;
    var src=state.menus[i],copy=JSON.parse(JSON.stringify(src));
    copy.id=typeof uid==='function'?uid():(Date.now()+Math.random().toString(16).slice(2));
    copy.name=(src.name||'ルーティン')+' コピー';
    copy.items=Array.isArray(copy.items)?copy.items:[];
    copy.items.forEach(function(x){x.id=typeof uid==='function'?uid():(Date.now()+Math.random().toString(16).slice(2))});
    state.menus.splice(i+1,0,copy);
    if(typeof save==='function')save();
    if(typeof renderHome==='function')renderHome();
  }

  function deleteRoutineById(id){
    if(typeof state==='undefined'||!state||!Array.isArray(state.menus))return;
    var i=state.menus.findIndex(function(x){return x.id===id});if(i<0)return;
    if(!confirm('このルーティンを削除しますか？'))return;
    state.menus.splice(i,1);
    if(typeof save==='function')save();
    if(typeof renderHome==='function')renderHome();
  }

  function duplicateItemById(id){
    var m=currentMenu();if(!m||!Array.isArray(m.items))return;
    var i=m.items.findIndex(function(x){return x.id===id});if(i<0)return;
    var src=m.items[i],copy=JSON.parse(JSON.stringify(src));
    copy.id=typeof uid==='function'?uid():(Date.now()+Math.random().toString(16).slice(2));
    copy.name=(src.name||'種目')+' コピー';
    m.items.splice(i+1,0,copy);
    if(typeof save==='function')save();
    if(typeof renderItems==='function')renderItems();
    if(typeof updateDuration==='function')updateDuration();
  }

  function deleteItemById(id){
    var m=currentMenu();if(!m||!Array.isArray(m.items))return;
    var i=m.items.findIndex(function(x){return x.id===id});if(i<0)return;
    if(!confirm('この種目を削除しますか？'))return;
    m.items.splice(i,1);
    if(typeof save==='function')save();
    if(typeof renderItems==='function')renderItems();
    if(typeof updateDuration==='function')updateDuration();
  }

  function closeCard(card){
    if(card)card.classList.remove('swipe-open','swipe-copy-open');
  }

  function closeAllSwipes(except){
    document.querySelectorAll('.menu-card.swipe-open,.menu-card.swipe-copy-open,.item.swipe-open,.item.swipe-copy-open').forEach(function(card){
      if(card!==except)closeCard(card);
    });
  }

  function fixDeleteButton(el,type,id){
    var del=el.querySelector('.swipe-delete');
    if(!del)return;
    var fixed=del.cloneNode(true);
    del.replaceWith(fixed);
    fixed.addEventListener('click',function(e){
      e.preventDefault();e.stopPropagation();
      if(type==='routine')deleteRoutineById(id);else deleteItemById(id);
    });
  }

  function addDuplicateButton(el,type,id){
    var old=el.querySelector('.swipe-duplicate');if(old)old.remove();
    var dup=document.createElement('button');
    dup.type='button';dup.className='swipe-duplicate';dup.textContent='複製';
    dup.addEventListener('click',function(e){
      e.preventDefault();e.stopPropagation();
      if(type==='routine')duplicateRoutineById(id);else duplicateItemById(id);
    });
    el.appendChild(dup);
  }

  function removeItemEditButton(el){
    Array.prototype.slice.call(el.children).forEach(function(child){
      if(child.tagName==='BUTTON'&&!child.classList.contains('swipe-delete')&&!child.classList.contains('swipe-duplicate'))child.remove();
    });
  }

  function handleSwipe(el,dx){
    var deleteOpen=el.classList.contains('swipe-open');
    var copyOpen=el.classList.contains('swipe-copy-open');

    if(deleteOpen){
      if(dx>0)closeCard(el);
      return;
    }
    if(copyOpen){
      if(dx<0)closeCard(el);
      return;
    }

    closeAllSwipes(el);
    if(dx<0)el.classList.add('swipe-open');
    else el.classList.add('swipe-copy-open');
  }

  function decorateCard(el,type){
    if(!el||el.dataset.v14Ready==='1')return;
    var id=el.dataset.id;if(!id)return;
    el.dataset.v14Ready='1';

    if(type==='routine'){
      var gear=el.querySelector('.edit');
      if(gear){
        gear.textContent='⚙';gear.title='設定';gear.setAttribute('aria-label','設定');
        gear.onclick=function(e){e.preventDefault();e.stopPropagation()};
      }
    }else{
      removeItemEditButton(el);
    }

    fixDeleteButton(el,type,id);
    addDuplicateButton(el,type,id);

    el.addEventListener('click',function(e){
      if(e.target.closest('button'))return;
      var t=Number(el.dataset.lastSwipe||0);if(Date.now()-t<550)return;
      if(el.classList.contains('swipe-open')||el.classList.contains('swipe-copy-open')){
        closeCard(el);return;
      }
      if(type==='routine'){
        if(typeof openMenu==='function')openMenu(id);
      }else{
        if(typeof openItem==='function')openItem(id);
      }
    });

    var sx=0,sy=0;
    el.addEventListener('touchstart',function(e){
      if(e.touches.length!==1)return;
      sx=e.touches[0].clientX;sy=e.touches[0].clientY;
    },{passive:true,capture:true});

    el.addEventListener('touchend',function(e){
      if(!e.changedTouches.length)return;
      var dx=e.changedTouches[0].clientX-sx;
      var dy=e.changedTouches[0].clientY-sy;
      if(Math.abs(dx)<=45||Math.abs(dx)<=Math.abs(dy)*1.25)return;
      el.dataset.lastSwipe=String(Date.now());
      e.stopImmediatePropagation();
      handleSwipe(el,dx);
    },{passive:true,capture:true});
  }

  function decorateRoutineCards(){
    document.querySelectorAll('.menu-card').forEach(function(el){decorateCard(el,'routine')});
  }

  function decorateItemCards(){
    document.querySelectorAll('.item').forEach(function(el){decorateCard(el,'item')});
  }

  function getLastSync(){
    try{return +(JSON.parse(localStorage.getItem('stretchTimer.syncMeta')||'{}').lastSync||0)}catch(e){return 0}
  }

  async function serverBuild(){
    try{
      var r=await fetch('./sw.js?check='+Date.now(),{cache:'no-store'});
      var t=await r.text();
      var m=t.match(/const CACHE='([^']+)'/);
      return m?m[1]:'';
    }catch(e){return''}
  }

  async function activateBuild(remoteBuild){
    if(!('serviceWorker'in navigator))return false;
    try{
      var reg=await navigator.serviceWorker.getRegistration();
      if(!reg)return false;
      var changed=false;
      var controllerChanged=new Promise(function(resolve){
        var timer=setTimeout(function(){resolve(false)},3200);
        navigator.serviceWorker.addEventListener('controllerchange',function(){clearTimeout(timer);changed=true;resolve(true)},{once:true});
      });
      await reg.update();
      var w=reg.installing||reg.waiting;
      if(w){
        var activated=new Promise(function(resolve){
          var timer=setTimeout(function(){resolve(false)},3200);
          w.addEventListener('statechange',function(){
            if(w.state==='activated'){clearTimeout(timer);resolve(true)}
            else if(w.state==='redundant'){clearTimeout(timer);resolve(false)}
          });
        });
        changed=await Promise.race([controllerChanged,activated]);
      }else{
        changed=await controllerChanged;
      }
      if(!changed&&'caches'in window){
        var keys=await caches.keys();
        changed=keys.indexOf(remoteBuild)>=0;
      }
      return changed;
    }catch(e){console.error(e);return false}
  }

  async function unifiedRefresh(){
    if(refreshRunning)return;
    refreshRunning=true;
    var btn=document.getElementById('refreshBtn');if(btn)btn.classList.add('refreshing');

    var buildBefore=localStorage.getItem(BUILD_KEY)||'';
    var remoteBuild=await serverBuild();
    if(!buildBefore&&remoteBuild){localStorage.setItem(BUILD_KEY,remoteBuild);buildBefore=remoteBuild}
    var appChanged=!!(remoteBuild&&buildBefore&&remoteBuild!==buildBefore);
    var lastSyncBefore=getLastSync();
    var syncChanged=false;

    try{
      if(typeof hasDropboxAuth==='function'&&hasDropboxAuth()&&typeof syncNow==='function'){
        var oldAlert=window.alert;
        window.alert=function(){};
        try{await syncNow(false)}catch(e){console.error(e)}finally{window.alert=oldAlert}
        syncChanged=getLastSync()!==lastSyncBefore;
      }

      if(appChanged){
        var activated=await activateBuild(remoteBuild);
        if(activated){
          localStorage.setItem(BUILD_KEY,remoteBuild);
          localStorage.setItem(PENDING_NOTICE,'アプリを最新版に更新しました');
          location.replace(location.pathname+'?r='+Date.now());
          return;
        }
      }

      if(syncChanged)toast('最新データを同期しました');
    }finally{
      setTimeout(function(){refreshRunning=false;if(btn)btn.classList.remove('refreshing')},500);
    }
  }
  window.unifiedRefresh=unifiedRefresh;

  function updateScreenUi(){
    setupEditors();
    decorateRoutineCards();
    decorateItemCards();
    var rb=document.getElementById('refreshBtn');if(rb)rb.onclick=unifiedRefresh;
  }

  var style=document.createElement('style');
  style.textContent='\
#menuEdit #startMenuBtn{display:none!important}\
#menuEdit #duplicateMenuBtn{display:none!important}\
#itemEdit #duplicateItemBtn{display:none!important}\
#menuEdit #addItemBtn{width:100%!important;min-height:56px!important;font-size:16px;font-weight:700}\
.item{grid-template-columns:78px 1fr!important;cursor:pointer}\
.menu-card{cursor:pointer}\
.menu-card.swipe-open>*:not(.swipe-delete):not(.swipe-duplicate),.item.swipe-open>*:not(.swipe-delete):not(.swipe-duplicate){transform:translateX(-82px)!important}\
.menu-card.swipe-copy-open>*:not(.swipe-delete):not(.swipe-duplicate),.item.swipe-copy-open>*:not(.swipe-delete):not(.swipe-duplicate){transform:translateX(82px)!important}\
.swipe-duplicate{position:absolute;left:-2px;top:0;bottom:0;width:76px;border:0;background:#7f8a96;color:#fff;font-weight:700;display:flex;align-items:center;justify-content:center;transform:translateX(-100%);opacity:0;z-index:2;transition:transform .18s ease,opacity .08s ease}\
.menu-card.swipe-copy-open>.swipe-duplicate,.item.swipe-copy-open>.swipe-duplicate{transform:translateX(0);opacity:1}\
.menu-card.swipe-copy-open>.swipe-delete,.item.swipe-copy-open>.swipe-delete{opacity:0!important;transform:translateX(100%)!important}\
.menu-card .edit{cursor:default}\
';
  document.head.appendChild(style);

  if(typeof renderHome==='function'){
    var prevRenderHome=renderHome;
    renderHome=function(){var r=prevRenderHome.apply(this,arguments);setTimeout(decorateRoutineCards,0);return r}
  }
  if(typeof renderItems==='function'){
    var prevRenderItems=renderItems;
    renderItems=function(){var r=prevRenderItems.apply(this,arguments);setTimeout(decorateItemCards,0);return r}
  }
  if(typeof show==='function'){
    var prevShow=show;
    show=function(){var r=prevShow.apply(this,arguments);setTimeout(updateScreenUi,0);return r}
  }

  document.addEventListener('pointerdown',function(e){
    if(!e.target.closest('.menu-card,.item'))closeAllSwipes();
  },true);

  var indicator=document.getElementById('pullRefreshIndicator');
  if(!indicator){indicator=document.createElement('div');indicator.id='pullRefreshIndicator';indicator.textContent='↻';document.body.appendChild(indicator)}

  function atTop(){
    var sc=document.scrollingElement||document.documentElement;
    return (!sc||sc.scrollTop<=2)&&window.scrollY<=2;
  }

  var pullStartX=0,pullStartY=0,pullCandidate=false,pullActive=false,pullReady=false;
  document.addEventListener('touchstart',function(e){
    if(PULL_SCREENS.indexOf(activeScreenId())<0||e.touches.length!==1||!atTop())return;
    pullStartX=e.touches[0].clientX;
    pullStartY=e.touches[0].clientY;
    pullCandidate=true;pullActive=false;pullReady=false;
  },{passive:true,capture:true});

  document.addEventListener('touchmove',function(e){
    if(!pullCandidate||e.touches.length!==1)return;
    var dx=e.touches[0].clientX-pullStartX;
    var dy=e.touches[0].clientY-pullStartY;
    if(dy<=0||Math.abs(dx)>Math.abs(dy)*.9){
      pullCandidate=false;pullActive=false;pullReady=false;
      indicator.classList.remove('visible','ready');
      return;
    }
    if(dy>10){
      pullActive=true;
      if(e.cancelable)e.preventDefault();
      indicator.classList.add('visible');
      indicator.style.transform='translate(-50%,'+Math.min(28,dy*.28-55)+'px)';
    }
    pullReady=dy>=85;
    indicator.classList.toggle('ready',pullReady);
  },{passive:false,capture:true});

  document.addEventListener('touchend',function(e){
    if(!pullCandidate&&!pullActive)return;
    var ready=pullReady;
    pullCandidate=false;pullActive=false;pullReady=false;
    indicator.style.transform='translate(-50%,-70px)';
    indicator.classList.remove('visible','ready');
    if(ready){
      if(e.cancelable)e.preventDefault();
      e.stopImmediatePropagation();
      unifiedRefresh();
    }
  },{passive:false,capture:true});

  setTimeout(updateScreenUi,0);
})();
