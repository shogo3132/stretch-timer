(function(){
  var CURRENT_BUILD='stretch-timer-v17';
  var BUILD_KEY='stretchTimer.appBuild';
  var PENDING_NOTICE='stretchTimer.pendingNotice';
  var PULL_SCREENS=['home','menuEdit','itemEdit'];
  var refreshRunning=false;
  var suppressClickUntil=0;

  function activeScreenId(){
    var el=document.querySelector('.screen.active');
    return el?el.id:'';
  }
  function currentMenu(){try{return typeof menu==='function'?menu():null}catch(e){return null}}
  function uid2(){return typeof uid==='function'?uid():(Date.now()+Math.random().toString(16).slice(2))}
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
  localStorage.setItem(BUILD_KEY,CURRENT_BUILD);

  function setupStaticUi(){
    var start=document.getElementById('startMenuBtn');if(start)start.style.display='none';
    var d1=document.getElementById('duplicateMenuBtn');if(d1)d1.style.display='none';
    var d2=document.getElementById('duplicateItemBtn');if(d2)d2.style.display='none';
    var add=document.getElementById('addItemBtn');if(add){add.style.width='100%';add.style.minHeight='56px';add.style.fontSize='16px';add.style.fontWeight='700'}
    var sub=document.querySelector('#home .subhead');if(sub)sub.style.display='none';
    var hr=document.querySelector('#home .headline-row');if(hr)hr.style.justifyContent='flex-end';
    var plus=document.getElementById('addMenuHome');if(plus)plus.style.marginLeft='auto';
  }

  function ensureRefreshButton(){
    var settings=document.getElementById('topAction');if(!settings)return;
    var btn=document.getElementById('refreshBtn');
    if(!btn){btn=document.createElement('button');btn.id='refreshBtn';btn.className='btn sub icon';btn.textContent='↻';btn.setAttribute('aria-label','更新');btn.title='更新';settings.insertAdjacentElement('afterend',btn)}
    btn.style.display=activeScreenId()==='home'?'inline-block':'none';
    btn.onclick=unifiedRefresh;
  }

  function duplicateRoutine(id){
    if(typeof state==='undefined'||!state||!Array.isArray(state.menus))return;
    var i=state.menus.findIndex(function(x){return x.id===id});if(i<0)return;
    var src=state.menus[i],copy=JSON.parse(JSON.stringify(src));copy.id=uid2();copy.name=(src.name||'ルーティン')+' コピー';
    copy.items=Array.isArray(copy.items)?copy.items:[];copy.items.forEach(function(x){x.id=uid2()});
    state.menus.splice(i+1,0,copy);if(typeof save==='function')save();if(typeof renderHome==='function')renderHome();
  }
  function deleteRoutine(id){
    if(typeof state==='undefined'||!state||!Array.isArray(state.menus))return;
    var i=state.menus.findIndex(function(x){return x.id===id});if(i<0)return;if(!confirm('このルーティンを削除しますか？'))return;
    state.menus.splice(i,1);if(typeof save==='function')save();if(typeof renderHome==='function')renderHome();
  }
  function duplicateItem(id){
    var m=currentMenu();if(!m||!Array.isArray(m.items))return;var i=m.items.findIndex(function(x){return x.id===id});if(i<0)return;
    var copy=JSON.parse(JSON.stringify(m.items[i]));copy.id=uid2();copy.name=(copy.name||'種目')+' コピー';m.items.splice(i+1,0,copy);
    if(typeof save==='function')save();if(typeof renderItems==='function')renderItems();if(typeof updateDuration==='function')updateDuration();
  }
  function deleteItem(id){
    var m=currentMenu();if(!m||!Array.isArray(m.items))return;var i=m.items.findIndex(function(x){return x.id===id});if(i<0)return;if(!confirm('この種目を削除しますか？'))return;
    m.items.splice(i,1);if(typeof save==='function')save();if(typeof renderItems==='function')renderItems();if(typeof updateDuration==='function')updateDuration();
  }

  function closeCard(el){if(el)el.classList.remove('swipe-open','swipe-copy-open')}
  function closeAll(except){document.querySelectorAll('.menu-card.swipe-open,.menu-card.swipe-copy-open,.item.swipe-open,.item.swipe-copy-open').forEach(function(el){if(el!==except)closeCard(el)})}
  function handleSwipe(el,dx){
    var del=el.classList.contains('swipe-open'),copy=el.classList.contains('swipe-copy-open');
    if(del){if(dx>0)closeCard(el);return}
    if(copy){if(dx<0)closeCard(el);return}
    closeAll(el);if(dx<0)el.classList.add('swipe-open');else el.classList.add('swipe-copy-open');
  }

  function wireReorderFresh(el,id,type){
    var hold=null,dragging=false,lastTarget=null;
    el.addEventListener('touchstart',function(e){
      if(e.touches.length!==1||e.target.closest('button'))return;
      hold=setTimeout(function(){dragging=true;el.classList.add('dragging');if(navigator.vibrate)navigator.vibrate(30)},450);
    },{passive:true});
    el.addEventListener('touchmove',function(e){
      if(!dragging)return;e.preventDefault();
      var t=e.touches[0],selector=type==='menu'?'.menu-card':'.item',target=document.elementFromPoint(t.clientX,t.clientY);target=target&&target.closest(selector);
      document.querySelectorAll(selector).forEach(function(n){n.classList.remove('over')});
      if(target&&target!==el){target.classList.add('over');lastTarget=target}
    },{passive:false});
    el.addEventListener('touchend',function(){
      clearTimeout(hold);
      if(dragging){var selector=type==='menu'?'.menu-card':'.item';if(lastTarget&&typeof moveByIds==='function')moveByIds(type,id,lastTarget.dataset.id);document.querySelectorAll(selector).forEach(function(n){n.classList.remove('over')});suppressClickUntil=Date.now()+500}
      dragging=false;lastTarget=null;el.classList.remove('dragging');
    },{passive:true});
    el.addEventListener('touchcancel',function(){clearTimeout(hold);dragging=false;lastTarget=null;el.classList.remove('dragging')},{passive:true});
  }

  function decorateCard(oldEl,type){
    var id=oldEl.dataset.id;if(!id)return oldEl;
    var el=oldEl.cloneNode(true);oldEl.replaceWith(el);el.dataset.unifiedReady='1';
    el.classList.remove('swipe-open','swipe-copy-open','dragging','over');
    Array.prototype.slice.call(el.querySelectorAll('.swipe-delete,.swipe-duplicate')).forEach(function(x){x.remove()});

    if(type==='routine'){
      var gear=el.querySelector('.edit');if(gear){gear.textContent='⚙';gear.onclick=function(e){e.preventDefault();e.stopPropagation()}}
      var start=el.querySelector('.start');if(start)start.onclick=function(e){e.stopPropagation();if(typeof startTimer==='function')startTimer(id)};
    }else{
      Array.prototype.slice.call(el.children).forEach(function(child){if(child.tagName==='BUTTON')child.remove()});
    }

    var del=document.createElement('button');del.type='button';del.className='swipe-delete';del.textContent='削除';
    del.onclick=function(e){e.preventDefault();e.stopPropagation();type==='routine'?deleteRoutine(id):deleteItem(id)};el.appendChild(del);
    var dup=document.createElement('button');dup.type='button';dup.className='swipe-duplicate';dup.textContent='複製';
    dup.onclick=function(e){e.preventDefault();e.stopPropagation();type==='routine'?duplicateRoutine(id):duplicateItem(id)};el.appendChild(dup);

    var x0=0,y0=0,moved=false;
    el.addEventListener('touchstart',function(e){if(e.touches.length!==1)return;x0=e.touches[0].clientX;y0=e.touches[0].clientY;moved=false},{passive:true});
    el.addEventListener('touchmove',function(e){if(e.touches.length!==1)return;var dx=e.touches[0].clientX-x0,dy=e.touches[0].clientY-y0;if(Math.abs(dx)>22&&Math.abs(dx)>Math.abs(dy)*1.25)moved=true},{passive:true});
    el.addEventListener('touchend',function(e){
      if(!moved||!e.changedTouches.length)return;var dx=e.changedTouches[0].clientX-x0,dy=e.changedTouches[0].clientY-y0;if(Math.abs(dx)<=45||Math.abs(dx)<=Math.abs(dy)*1.25)return;
      suppressClickUntil=Date.now()+550;handleSwipe(el,dx);
    },{passive:true});
    el.addEventListener('click',function(e){
      if(e.target.closest('button')||Date.now()<suppressClickUntil)return;
      if(el.classList.contains('swipe-open')||el.classList.contains('swipe-copy-open')){closeCard(el);return}
      if(type==='routine'){if(typeof openMenu==='function')openMenu(id)}else{if(typeof openItem==='function')openItem(id)}
    });
    wireReorderFresh(el,id,type==='routine'?'menu':'item');
    return el;
  }

  function decorateRoutineCards(){document.querySelectorAll('.menu-card').forEach(function(el){if(el.dataset.unifiedReady!=='1')decorateCard(el,'routine')})}
  function decorateItemCards(){document.querySelectorAll('.item').forEach(function(el){if(el.dataset.unifiedReady!=='1')decorateCard(el,'item')})}

  var prevHome=typeof renderHome==='function'?renderHome:null;
  if(prevHome)renderHome=function(){var r=prevHome.apply(this,arguments);setTimeout(function(){setupStaticUi();ensureRefreshButton();decorateRoutineCards()},0);return r};
  var prevItems=typeof renderItems==='function'?renderItems:null;
  if(prevItems)renderItems=function(){var r=prevItems.apply(this,arguments);setTimeout(decorateItemCards,0);return r};
  var prevShow=typeof show==='function'?show:null;
  if(prevShow)show=function(){var r=prevShow.apply(this,arguments);setTimeout(function(){setupStaticUi();ensureRefreshButton();decorateRoutineCards();decorateItemCards()},0);return r};

  document.addEventListener('pointerdown',function(e){if(!e.target.closest('.menu-card,.item'))closeAll()},true);

  function storedState(){return localStorage.getItem('stretchTimer.v2')||''}
  async function serverBuild(){try{var r=await fetch('./sw.js?check='+Date.now(),{cache:'no-store'}),t=await r.text(),m=t.match(/const CACHE='([^']+)'/);return m?m[1]:''}catch(e){return''}}
  async function unifiedRefresh(){
    if(refreshRunning)return;refreshRunning=true;var btn=document.getElementById('refreshBtn');if(btn)btn.classList.add('refreshing');
    var before=storedState(),remoteBuild=await serverBuild(),appChanged=!!(remoteBuild&&remoteBuild!==CURRENT_BUILD),syncChanged=false;
    try{
      if(typeof hasDropboxAuth==='function'&&hasDropboxAuth()&&typeof syncNow==='function'){
        var oldAlert=window.alert;window.alert=function(){};try{await syncNow(false)}catch(e){console.error(e)}finally{window.alert=oldAlert}
        syncChanged=storedState()!==before;
      }
      if(appChanged&&'serviceWorker'in navigator){
        try{var reg=await navigator.serviceWorker.getRegistration();if(reg)await reg.update()}catch(e){console.error(e)}
        localStorage.setItem(BUILD_KEY,remoteBuild);localStorage.setItem(PENDING_NOTICE,'アプリを最新版に更新しました');location.replace(location.pathname+'?r='+Date.now());return;
      }
      if(syncChanged)toast('最新データを同期しました');
    }finally{setTimeout(function(){refreshRunning=false;if(btn)btn.classList.remove('refreshing')},500)}
  }
  window.unifiedRefresh=unifiedRefresh;

  var ind=document.getElementById('pullRefreshIndicator');if(!ind){ind=document.createElement('div');ind.id='pullRefreshIndicator';ind.textContent='↻';document.body.appendChild(ind)}
  var px=0,py=0,pCandidate=false,pReady=false;
  function atTop(){var sc=document.scrollingElement||document.documentElement;return (!sc||sc.scrollTop<=2)&&window.scrollY<=2}
  function resetPull(){pCandidate=false;pReady=false;ind.style.transform='translate(-50%,-70px)';ind.classList.remove('visible','ready')}
  window.addEventListener('touchstart',function(e){if(PULL_SCREENS.indexOf(activeScreenId())<0||e.touches.length!==1||!atTop())return;px=e.touches[0].clientX;py=e.touches[0].clientY;pCandidate=true;pReady=false},{passive:true,capture:true});
  window.addEventListener('touchmove',function(e){if(!pCandidate||e.touches.length!==1)return;var dx=e.touches[0].clientX-px,dy=e.touches[0].clientY-py;if(dy<=0||Math.abs(dx)>Math.abs(dy)*.9){resetPull();return}if(dy>10){if(e.cancelable)e.preventDefault();ind.classList.add('visible');ind.style.transform='translate(-50%,'+Math.min(28,dy*.28-55)+'px)'}pReady=dy>=85;ind.classList.toggle('ready',pReady)},{passive:false,capture:true});
  window.addEventListener('touchend',function(e){if(!pCandidate)return;var fire=pReady;resetPull();if(fire){if(e.cancelable)e.preventDefault();unifiedRefresh()}},{passive:false,capture:true});
  window.addEventListener('touchcancel',resetPull,{passive:true,capture:true});

  var style=document.createElement('style');style.textContent='\
#homeSyncRow{display:none!important}\
#home .headline,#menuEdit>.stack>.headline,#itemEdit>.stack>.headline{display:none!important}\
#home .subhead{display:none!important}\
#home .headline-row{justify-content:flex-end!important}\
#home #addMenuHome{margin-left:auto!important}\
#menuEdit #startMenuBtn,#menuEdit #duplicateMenuBtn,#itemEdit #duplicateItemBtn{display:none!important}\
#menuEdit #addItemBtn{width:100%!important;min-height:56px!important;font-size:16px;font-weight:700}\
#refreshBtn.refreshing{animation:spinRefresh .7s linear infinite}\
@keyframes spinRefresh{to{transform:rotate(360deg)}}\
#pullRefreshIndicator{position:fixed;left:50%;top:62px;z-index:60;transform:translate(-50%,-70px);width:38px;height:38px;border-radius:50%;background:#fff;box-shadow:0 2px 10px rgba(0,0,0,.14);display:grid;place-items:center;font-size:21px;color:#65707c;transition:transform .14s ease,opacity .14s ease;opacity:0;pointer-events:none}\
#pullRefreshIndicator.visible{opacity:1}#pullRefreshIndicator.ready{color:#27ae8b}\
.menu-card,.item{position:relative;overflow:hidden;cursor:pointer}\
.item{grid-template-columns:78px 1fr!important}\
.menu-card>*:not(.swipe-delete):not(.swipe-duplicate),.item>*:not(.swipe-delete):not(.swipe-duplicate){transform:none!important}\
.swipe-delete,.swipe-duplicate{position:absolute;top:0;bottom:0;width:76px;border:0;color:#fff;font-weight:700;display:flex;align-items:center;justify-content:center;opacity:0;z-index:30;transition:transform .18s ease,opacity .08s ease}\
.swipe-delete{right:0;background:#d9535f;transform:translateX(100%)}\
.swipe-duplicate{left:0;background:#7f8a96;transform:translateX(-100%)}\
.swipe-open>.swipe-delete{transform:translateX(0);opacity:1}\
.swipe-copy-open>.swipe-duplicate{transform:translateX(0);opacity:1}\
.menu-card.over,.item.over{overflow:visible;outline:none!important}\
.menu-card.over::before,.item.over::before{content:"";position:absolute;left:8px;right:8px;top:-9px;height:3px;border-radius:3px;background:#27ae8b;z-index:50}\
.menu-card.over::after,.item.over::after{content:"";position:absolute;left:3px;top:-12px;width:9px;height:9px;border-radius:50%;background:#27ae8b;z-index:51}\
';document.head.appendChild(style);

  setupStaticUi();ensureRefreshButton();decorateRoutineCards();decorateItemCards();
})();
