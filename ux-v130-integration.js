(function(){
  'use strict';
  var api=window.StretchUI=window.StretchUI||{},lockUntil=0;

  function closeSwipes(except){
    document.querySelectorAll('.unified-swipe-left,.unified-swipe-right').forEach(function(row){
      if(row!==except)row.classList.remove('unified-swipe-left','unified-swipe-right');
    });
  }
  function bindSwipe(row,options){
    if(!row||row.dataset.unifiedSwipe==='1')return;
    options=options||{};row.dataset.unifiedSwipe='1';row.classList.add('unified-swipe-row');
    var left=options.left&&row.querySelector(options.left),right=options.right&&row.querySelector(options.right);
    if(left)left.classList.add('unified-swipe-action','unified-swipe-action-left');
    if(right)right.classList.add('unified-swipe-action','unified-swipe-action-right');
    var x=0,y=0,moved=false,ignore=false;
    row.addEventListener('touchstart',function(e){ignore=!!(e.target&&e.target.closest(options.ignore||'button,input,textarea,select,a,.task-drag-handle'));if(ignore||e.touches.length!==1)return;x=e.touches[0].clientX;y=e.touches[0].clientY;moved=false},{passive:true});
    row.addEventListener('touchmove',function(e){if(ignore||e.touches.length!==1)return;var dx=e.touches[0].clientX-x,dy=e.touches[0].clientY-y;if(Math.abs(dx)>22&&Math.abs(dx)>Math.abs(dy)*1.25)moved=true},{passive:true});
    row.addEventListener('touchend',function(e){if(ignore){ignore=false;return}if(!moved||!e.changedTouches.length)return;var dx=e.changedTouches[0].clientX-x,dy=e.changedTouches[0].clientY-y;if(Math.abs(dx)<45||Math.abs(dx)<Math.abs(dy)*1.25)return;lockUntil=Date.now()+550;closeSwipes(row);row.classList.remove('unified-swipe-left','unified-swipe-right');if(dx<0&&left)row.classList.add('unified-swipe-left');else if(dx>0&&right)row.classList.add('unified-swipe-right')},{passive:true});
    row.addEventListener('click',function(e){var action=e.target.closest('.unified-swipe-action');if(Date.now()<lockUntil&&!action){e.preventDefault();e.stopPropagation();return}if((row.classList.contains('unified-swipe-left')||row.classList.contains('unified-swipe-right'))&&!action){row.classList.remove('unified-swipe-left','unified-swipe-right');e.preventDefault();e.stopPropagation()}},true);
  }
  function createAutoScroll(onFrame){
    var speed=0,frame=null,last=0,pointerY=0;
    function stop(){speed=0;last=0;if(frame!==null){cancelAnimationFrame(frame);frame=null}}
    function step(now){if(!speed){frame=null;return}var s=document.scrollingElement||document.documentElement,old=s.scrollTop,max=Math.max(0,s.scrollHeight-s.clientHeight);if((speed<0&&old<=0)||(speed>0&&old>=max-.5)){stop();return}if(!last)last=now;var dt=Math.max(0,Math.min(34,now-last));last=now;s.scrollTop=Math.max(0,Math.min(max,old+speed*dt/1000));if(onFrame)onFrame(pointerY);frame=requestAnimationFrame(step)}
    function update(y){pointerY=y;var h=window.visualViewport&&window.visualViewport.height||window.innerHeight,top=Math.max(80,Math.min(120,h/6)),bottom=Math.max(110,Math.min(160,h/6)),next=0,ratio=0;if(y<top){ratio=Math.max(0,Math.min(1,(top-y)/top));next=-Math.round(90+ratio*550)}else if(y>h-bottom){ratio=Math.max(0,Math.min(1,(y-(h-bottom))/bottom));next=Math.round(90+ratio*550)}if(!speed&&next)last=0;speed=next;if(speed&&frame===null)frame=requestAnimationFrame(step);else if(!speed)stop();return speed}
    return {update:update,stop:stop,getSpeed:function(){return speed}};
  }
  var routes={routine:function(){renderHome()},tasks:function(){window.renderTasks&&window.renderTasks()},recipes:function(){window.renderRecipes&&window.renderRecipes()},'app-settings':function(){window.renderAppSettings?window.renderAppSettings():renderSettings()}};
  function syncNav(screen){var nav=document.getElementById('modeNav');if(!nav)return;var visible=['home','tasks','recipes','settings','diagnostics'].indexOf(screen)>=0;nav.hidden=!visible;document.body.classList.toggle('mode-nav-visible',visible);nav.querySelectorAll('.mode-nav-btn').forEach(function(b){var active=(screen==='home'&&b.dataset.mode==='routine')||(screen==='tasks'&&b.dataset.mode==='tasks')||(screen==='recipes'&&b.dataset.mode==='recipes')||((screen==='settings'||screen==='diagnostics')&&b.dataset.mode==='app-settings');b.classList.toggle('active',active);b.setAttribute('aria-current',active?'page':'false');if(routes[b.dataset.mode])b.onclick=routes[b.dataset.mode]})}
  function updateFixedStack(){var nav=document.getElementById('modeNav'),rec=document.getElementById('diagnosticRecDock'),navHeight=nav&&!nav.hidden?nav.getBoundingClientRect().height:0;document.documentElement.style.setProperty('--fixed-nav-height',navHeight+'px');if(rec&&!rec.hidden)rec.style.bottom='calc(max(10px, env(safe-area-inset-bottom)) + '+(navHeight?navHeight+8:0)+'px)'}
  var dataProviders=[];
  function registerDataProvider(provider){if(provider&&provider.key&&!dataProviders.some(function(x){return x.key===provider.key}))dataProviders.push(provider)}
  if(typeof syncPayload==='function'&&typeof applyRemote==='function'){
    var legacySyncPayload=syncPayload,legacyApplyRemote=applyRemote;
    syncPayload=function(){var payload=JSON.parse(legacySyncPayload());dataProviders.forEach(function(provider){if(provider.write)provider.write(payload,state)});return JSON.stringify(payload)};
    applyRemote=function(raw,remoteTime){var remote={};try{remote=JSON.parse(raw)||{}}catch(e){}var result=legacyApplyRemote.apply(this,arguments);dataProviders.forEach(function(provider){if(provider.read)provider.read(remote,state)});return result};
  }
  api.bindSwipe=bindSwipe;api.closeSwipes=closeSwipes;api.createAutoScroll=createAutoScroll;api.syncNav=syncNav;api.updateFixedStack=updateFixedStack;api.registerDataProvider=registerDataProvider;api.routes=routes;
  var style=document.createElement('style');style.dataset.overallIntegration='0.13.0';style.textContent='.unified-swipe-row{position:relative!important;overflow:hidden!important;isolation:isolate}.unified-swipe-row>*:not(.unified-swipe-action){position:relative;z-index:2;transition:transform .18s ease}.unified-swipe-action{position:absolute!important;top:0!important;bottom:0!important;width:76px!important;border:0!important;color:#fff!important;font-weight:800!important;display:flex!important;align-items:center!important;justify-content:center!important;opacity:1!important;z-index:1!important;transition:transform .18s ease!important}.unified-swipe-action-left{right:0!important;left:auto!important;background:#d9535f!important;transform:translateX(100%)!important;border-radius:0 20px 20px 0!important}.unified-swipe-action-right{left:0!important;right:auto!important;background:#599f8a!important;transform:translateX(-100%)!important;border-radius:20px 0 0 20px!important}.unified-swipe-left>*:not(.unified-swipe-action){transform:translateX(-76px)!important}.unified-swipe-right>*:not(.unified-swipe-action){transform:translateX(76px)!important}.unified-swipe-left>.unified-swipe-action-left,.unified-swipe-right>.unified-swipe-action-right{transform:translateX(0)!important}#modeNav{padding-top:6px!important;padding-bottom:max(6px,env(safe-area-inset-bottom))!important}body.mode-nav-visible .screen.active{padding-bottom:calc(var(--fixed-nav-height,74px) + 34px)!important}';document.head.appendChild(style);
  var menuStyle=document.createElement('style');menuStyle.textContent='.task-action-pop,.recipe-action-pop,.item-action-pop{position:fixed!important;z-index:10050!important;min-width:142px!important;padding:6px!important;border:1px solid #edf0f2!important;border-radius:15px!important;background:#fff!important;box-shadow:0 10px 30px rgba(25,32,39,.18)!important}.task-action-pop button,.recipe-action-pop button,.item-action-pop button{width:100%!important;min-height:40px!important;border:0!important;border-radius:10px!important;background:transparent!important;color:#303841!important;text-align:left!important;padding:9px 11px!important;font-size:14px!important;font-weight:700!important}.task-action-pop button.danger,.recipe-action-pop button.danger,.item-action-pop button.danger{color:#bf4653!important}';document.head.appendChild(menuStyle);
  if(typeof show==='function'){var oldShow=show;show=function(id){var result=oldShow.apply(this,arguments);syncNav(id);requestAnimationFrame(updateFixedStack);return result}}
  document.addEventListener('click',function(e){if(!e.target.closest('.unified-swipe-row'))closeSwipes()},true);window.addEventListener('resize',updateFixedStack,{passive:true});
  new MutationObserver(function(){syncNav(typeof currentScreen==='string'?currentScreen:'home');updateFixedStack()}).observe(document.body,{childList:true,subtree:true});syncNav(typeof currentScreen==='string'?currentScreen:'home');requestAnimationFrame(updateFixedStack);
})();
