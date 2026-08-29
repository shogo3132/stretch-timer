(function(){
  if(window.__timerRuntimeV84)return;
  window.__timerRuntimeV84=true;

  var SNAP='stretchTimer.activeTimerV82';
  var restoredOnce=false;

  var style=document.createElement('style');
  style.setAttribute('data-timer-runtime-v84','');
  style.textContent='\
body.timer-active.timer-rest #timer{background:#d9f0e2!important;color:#1b1f24!important}\
body.timer-active.timer-rest #topBar{background:#d9f0e2!important;color:#1b1f24!important;border-bottom-color:#c3e3cf!important}\
body.timer-active.timer-rest #topBar #backBtn{background:#c9e8d5!important;color:#3f5e50!important}\
body.timer-active.timer-rest .timer-name{color:#245f48!important}\
body.timer-active.timer-rest .compact-time{background:transparent!important;box-shadow:none!important}\
body.timer-active.timer-rest .compact-time.paused{background:#cde9d7!important}\
body.timer-active.timer-rest .compact-seconds{color:#245f48!important}\
body.timer-active.timer-rest .compact-progress{background:#c3e3cf!important}\
body.timer-active.timer-rest .compact-progress-fill{background:#58ad84!important}\
body.timer-active.timer-rest .compact-rest-next{color:#45695a!important}\
body.timer-active.timer-rest .timer-count{color:#628171!important}\
';
  document.head.appendChild(style);

  function menuSafe(){try{return typeof menu==='function'?menu():null}catch(e){return null}}
  function syncRestClass(){
    var on=typeof currentScreen!=='undefined'&&currentScreen==='timer'&&timerState&&timerState.phase==='rest';
    document.body.classList.toggle('timer-rest',!!on);
  }

  function snapshot(){
    try{
      if(typeof currentScreen==='undefined'||currentScreen!=='timer'||!timerState||typeof currentMenuId==='undefined'||!currentMenuId)return;
      localStorage.setItem(SNAP,JSON.stringify({
        menuId:currentMenuId,
        timer:{index:+timerState.index||0,phase:timerState.phase||'item',remaining:Math.max(0,+timerState.remaining||0),total:Math.max(1,+timerState.total||1),paused:!!timerState.paused,reverseSide:!!timerState.reverseSide,restTarget:timerState.restTarget||''},
        savedAt:Date.now()
      }));
    }catch(e){}
  }
  function clearSnapshot(){try{localStorage.removeItem(SNAP)}catch(e){}}
  function readSnapshot(){try{return JSON.parse(localStorage.getItem(SNAP)||'null')}catch(e){return null}}

  var oldRender=typeof renderTimer==='function'?renderTimer:null;
  if(oldRender){renderTimer=function(){var r=oldRender.apply(this,arguments);syncRestClass();snapshot();return r}}
  if(window.StretchUI&&StretchUI.registerScreenHook)StretchUI.registerScreenHook({key:'timer-runtime',after:function(id){syncRestClass();if(id==='timer')snapshot()}});
  var oldFinish=typeof finishTimer==='function'?finishTimer:null;
  if(oldFinish){finishTimer=function(){clearSnapshot();return oldFinish.apply(this,arguments)}}
  var oldStop=typeof stopTimer==='function'?stopTimer:null;
  if(oldStop){stopTimer=function(){clearSnapshot();return oldStop.apply(this,arguments)}}

  function currentTimerItem(){
    try{var m=menuSafe();return m&&timerState&&Array.isArray(m.items)?m.items[timerState.index]||null:null}catch(e){return null}
  }

  document.addEventListener('click',function(e){
    var edit=e.target&&e.target.closest?e.target.closest('.timer-edit-current'):null;
    if(!edit)return;
    if(typeof currentScreen==='undefined'||currentScreen!=='timer'||!timerState||!timerState.paused)return;
    var x=currentTimerItem();if(!x)return;
    e.preventDefault();e.stopImmediatePropagation();
    snapshot();
    if(typeof openItem==='function')openItem(x.id);
  },true);

  function restoreRecentTimer(){
    var s=readSnapshot();if(!s||!s.menuId||!s.timer)return false;
    if(Date.now()-(+s.savedAt||0)>60000){clearSnapshot();return false}
    if(typeof state==='undefined'||!state||!Array.isArray(state.menus))return false;
    var m=state.menus.find(function(x){return x.id===s.menuId});if(!m||!Array.isArray(m.items)||!m.items.length){clearSnapshot();return false}
    var idx=Math.max(0,Math.min(m.items.length-1,+s.timer.index||0));
    currentMenuId=s.menuId;
    timerState={index:idx,phase:s.timer.phase==='rest'?'rest':'item',remaining:Math.max(0,+s.timer.remaining||0),total:Math.max(1,+s.timer.total||1),paused:!!s.timer.paused,reverseSide:!!s.timer.reverseSide,restTarget:s.timer.restTarget||'',interval:null};
    if(timerState.remaining<=0){timerState.remaining=timerState.phase==='rest'?Math.max(1,+m.items[Math.max(0,idx-1)]?.restSeconds||20):Math.max(1,+m.items[idx].seconds||1);timerState.total=timerState.remaining}
    if(typeof show==='function')show('timer',m.name);
    if(typeof renderTimer==='function')renderTimer();
    if(typeof keepAwake==='function')keepAwake();
    if(!timerState.paused&&typeof runTick==='function')runTick();
    restoredOnce=true;
    return true;
  }

  window.addEventListener('pagehide',snapshot);
  document.addEventListener('visibilitychange',function(){if(document.hidden)snapshot()});
  window.addEventListener('orientationchange',snapshot);
  [80,450,1200].forEach(function(ms){setTimeout(function(){if(restoredOnce)return;if(typeof currentScreen!=='undefined'&&currentScreen==='timer')return;restoreRecentTimer()},ms)});
  syncRestClass();
})();
