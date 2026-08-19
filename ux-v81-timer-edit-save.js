(function(){
  if(window.__timerEditSessionV97)return;
  window.__timerEditSessionV97=true;

  var SESSION_KEY='stretchTimer.pausedEditSessionV97';
  var TIMER_SNAPSHOT_KEY='stretchTimer.activeTimerV82';
  var session=readSession();
  var coreOpenItem=typeof openItem==='function'?openItem:null;

  var style=document.createElement('style');
  style.setAttribute('data-timer-edit-session-v97','');
  style.textContent='\
#timerResumeEditBar{display:none!important}\
#pausedRoutineDock{position:fixed;left:50%;bottom:0;z-index:10010;width:min(760px,100%);transform:translateX(-50%);padding:10px 14px max(12px,env(safe-area-inset-bottom));background:rgba(247,248,250,.97);border-top:1px solid #e3e8eb;box-shadow:0 -8px 24px rgba(28,36,44,.09);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px)}\
#pausedRoutineDock[hidden]{display:none!important}\
.paused-routine-inner{display:grid;gap:7px;max-width:680px;margin:0 auto}\
.paused-routine-status{color:#68727c;font-size:12px;line-height:1.35;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\
.paused-routine-resume{width:100%;min-height:49px;font-weight:800}\
.paused-routine-stop{width:100%;min-height:38px;border:0;border-radius:12px;background:#e8ebed;color:#727b84;font-size:13px;font-weight:700;cursor:pointer}\
body.paused-routine-away .screen.active{padding-bottom:170px!important}\
@media(min-width:780px){#pausedRoutineDock{bottom:14px;border:1px solid #e3e8eb;border-radius:20px;padding:12px 14px;box-shadow:0 9px 30px rgba(28,36,44,.13)}body.paused-routine-away .screen.active{padding-bottom:190px!important}}\
';
  document.head.appendChild(style);

  function readSession(){
    try{
      var value=JSON.parse(localStorage.getItem(SESSION_KEY)||'null');
      return value&&value.menuId&&value.timer?value:null;
    }catch(e){return null}
  }
  function writeSession(){
    try{
      if(session)localStorage.setItem(SESSION_KEY,JSON.stringify(session));
      else localStorage.removeItem(SESSION_KEY);
    }catch(e){}
  }
  function clearRuntimeSnapshot(){try{localStorage.removeItem(TIMER_SNAPSHOT_KEY)}catch(e){}}
  function menuById(id){
    try{return state&&Array.isArray(state.menus)?state.menus.find(function(m){return m.id===id}):null}catch(e){return null}
  }
  function stopLiveInterval(){
    if(!timerState)return;
    try{if(timerState.interval)clearInterval(timerState.interval)}catch(e){}
    timerState.interval=null;
  }
  function ensureDock(){
    var dock=document.getElementById('pausedRoutineDock');
    if(dock)return dock;
    dock=document.createElement('div');dock.id='pausedRoutineDock';dock.hidden=true;
    dock.innerHTML='<div class="paused-routine-inner"><div class="paused-routine-status"></div><button type="button" class="btn paused-routine-resume">▶ ルーティンを再開</button><button type="button" class="paused-routine-stop">中止</button></div>';
    document.body.appendChild(dock);
    dock.querySelector('.paused-routine-resume').onclick=resumeSession;
    dock.querySelector('.paused-routine-stop').onclick=stopSession;
    return dock;
  }
  function discardInvalidSession(){
    if(!session)return false;
    var m=menuById(session.menuId);
    if(m&&Array.isArray(m.items)&&m.items.length)return false;
    session=null;writeSession();clearRuntimeSnapshot();
    if(timerState){try{if(timerState.interval)clearInterval(timerState.interval)}catch(e){}timerState=null}
    if(typeof releaseAwake==='function')releaseAwake();
    return true;
  }
  function renderDock(){
    discardInvalidSession();
    var dock=ensureDock();
    var away=!!session&&typeof currentScreen!=='undefined'&&currentScreen!=='timer';
    dock.hidden=!away;document.body.classList.toggle('paused-routine-away',away);
    if(!away)return;
    var m=menuById(session.menuId),x=m&&Array.isArray(m.items)?m.items.find(function(item){return item.id===session.itemId}):null;
    var text='「'+(m&&m.name||'ルーティン')+'」を一時停止中';
    if(x&&x.name)text+=' ・ '+x.name;
    dock.querySelector('.paused-routine-status').textContent=text;
  }
  function setSession(next){session=next||null;writeSession();clearRuntimeSnapshot();renderDock()}

  function capturePausedTimer(){
    if(session||typeof currentScreen==='undefined'||currentScreen!=='timer'||!timerState||!timerState.paused)return;
    var m=menuById(currentMenuId);if(!m||!Array.isArray(m.items)||!m.items.length)return;
    var idx=Math.max(0,Math.min(m.items.length-1,+timerState.index||0)),x=m.items[idx];
    stopLiveInterval();
    setSession({
      menuId:currentMenuId,
      itemId:x&&x.id||'',
      index:idx,
      timer:{
        index:idx,
        phase:timerState.phase==='rest'?'rest':'item',
        remaining:Math.max(0,+timerState.remaining||0),
        total:Math.max(1,+timerState.total||1),
        paused:true
      },
      savedAt:Date.now()
    });
  }

  if(coreOpenItem){
    openItem=function(){capturePausedTimer();var r=coreOpenItem.apply(this,arguments);setTimeout(renderDock,0);return r};
  }

  function saveOpenEditor(){
    if(typeof currentScreen==='undefined'||currentScreen!=='itemEdit')return true;
    var btn=document.getElementById('itemCommitBtn');
    if(!btn||typeof btn.onclick!=='function')return true;
    return btn.onclick()!==false;
  }
  function resumeSession(){
    if(!session)return;
    if(!saveOpenEditor())return;
    var s=session,m=menuById(s.menuId);
    if(!m||!Array.isArray(m.items)||!m.items.length){setSession(null);return}
    currentMenuId=s.menuId;
    var idx=m.items.findIndex(function(x){return x.id===s.itemId}),sameItem=idx>=0;
    if(idx<0)idx=Math.max(0,Math.min(+s.index||0,m.items.length-1));
    var x=m.items[idx],phase=s.timer.phase==='rest'?'rest':'item';
    var total=phase==='rest'?Math.max(1,+s.timer.total||1):Math.max(1,+x.seconds||1);
    var remaining=sameItem?Math.max(1,Math.min(total,+s.timer.remaining||total)):total;
    timerState={index:idx,phase:phase,remaining:remaining,total:total,paused:false,interval:null};
    setSession(null);
    if(typeof show==='function')show('timer',m.name);
    if(typeof renderTimer==='function')renderTimer();
    if(typeof keepAwake==='function')keepAwake();
    if(typeof runTick==='function')runTick();
  }
  function stopSession(){
    if(!session)return;
    var m=menuById(session.menuId),name=m&&m.name||'このルーティン';
    if(!confirm('「'+name+'」の実行を中止しますか？\n編集したルーティンの内容は残ります。'))return;
    setSession(null);
    if(typeof stopTimer==='function')stopTimer();
    else{stopLiveInterval();timerState=null;if(typeof releaseAwake==='function')releaseAwake()}
    renderDock();
  }

  var previousShow=typeof show==='function'?show:null;
  if(previousShow)show=function(){var r=previousShow.apply(this,arguments);setTimeout(renderDock,0);return r};

  var previousRenderTimer=typeof renderTimer==='function'?renderTimer:null;
  if(previousRenderTimer)renderTimer=function(){
    if(session&&timerState&&!timerState.paused)setSession(null);
    var r=previousRenderTimer.apply(this,arguments);renderDock();return r;
  };

  var previousStartTimer=typeof startTimer==='function'?startTimer:null;
  if(previousStartTimer)startTimer=function(){
    if(session){
      var m=menuById(session.menuId),name=m&&m.name||'ルーティン';
      if(!confirm('「'+name+'」は一時停止中です。\n中止して最初から開始しますか？'))return;
      setSession(null);if(typeof stopTimer==='function')stopTimer();
    }
    return previousStartTimer.apply(this,arguments);
  };

  var previousStopTimer=typeof stopTimer==='function'?stopTimer:null;
  if(previousStopTimer)stopTimer=function(){
    if(session){session=null;writeSession();clearRuntimeSnapshot()}
    var r=previousStopTimer.apply(this,arguments);renderDock();return r;
  };

  document.addEventListener('click',function(){
    setTimeout(function(){if(session&&typeof currentScreen!=='undefined'&&currentScreen==='timer'&&timerState&&!timerState.paused)setSession(null)},0);
  },true);

  function restoreStoredSession(){
    if(!session){renderDock();return}
    var m=menuById(session.menuId);if(!m||!Array.isArray(m.items)||!m.items.length){setSession(null);return}
    currentMenuId=session.menuId;stopLiveInterval();
    timerState=Object.assign({},session.timer,{paused:true,interval:null});
    clearRuntimeSnapshot();renderDock();
  }

  window.__stretchTimerPausedSessionV97={resume:resumeSession,stop:stopSession,active:function(){return !!session}};
  restoreStoredSession();
})();
