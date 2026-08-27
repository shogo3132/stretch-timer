(function(){
  if(window.__timerExitConfirmV107)return;
  window.__timerExitConfirmV107=true;

  var dialogOpen=false;
  var style=document.createElement('style');
  style.setAttribute('data-timer-exit-confirm-v107','');
  style.textContent='\
#timerExitConfirm{position:fixed;inset:0;z-index:12000;display:grid;place-items:center;padding:22px;background:rgba(10,14,19,.58);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px)}\
#timerExitConfirm[hidden]{display:none!important}\
.timer-exit-card{width:min(420px,100%);padding:22px;border-radius:22px;background:#fff;color:#1b1f24;box-shadow:0 24px 70px rgba(0,0,0,.28);display:grid;gap:14px}\
.timer-exit-title{margin:0;font-size:21px;font-weight:850}\
.timer-exit-message{margin:0;color:#68727c;font-size:14px;line-height:1.55}\
.timer-exit-actions{display:grid;gap:9px;margin-top:3px}\
.timer-exit-actions button{width:100%;min-height:48px;border:0;border-radius:14px;padding:10px 14px;font-weight:800;cursor:pointer}\
.timer-exit-pause{background:#27ae8b;color:#fff}\
.timer-exit-continue{background:#edf0f2;color:#343b42}\
.timer-exit-stop{min-height:40px!important;background:#fcecef!important;color:#ae3742}\
body.timer-exit-dialog-open{overflow:hidden}\
';
  document.head.appendChild(style);

  function ensureDialog(){
    var root=document.getElementById('timerExitConfirm');
    if(root)return root;
    root=document.createElement('div');
    root.id='timerExitConfirm';root.hidden=true;
    root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');root.setAttribute('aria-labelledby','timerExitTitle');
    root.innerHTML='<div class="timer-exit-card"><h2 class="timer-exit-title" id="timerExitTitle">ルーティンをどうしますか？</h2><p class="timer-exit-message">ホームに戻る場合は、現在位置を保存して一時停止します。</p><div class="timer-exit-actions"><button type="button" class="timer-exit-pause">一時停止してホームへ</button><button type="button" class="timer-exit-continue">このまま続ける</button><button type="button" class="timer-exit-stop">終了する</button></div></div>';
    document.body.appendChild(root);
    root.querySelector('.timer-exit-pause').onclick=function(){
      closeDialog(false,false);
      var api=window.__stretchTimerPausedSessionV97;
      if(api&&typeof api.pauseAndLeaveHome==='function'&&api.pauseAndLeaveHome())return;
      if(timerState)timerState.paused=false;
      if(typeof renderTimer==='function')renderTimer();
      alert('一時停止状態を保存できませんでした。ルーティンを続けます。');
    };
    root.querySelector('.timer-exit-continue').onclick=function(){closeDialog(true,true)};
    root.querySelector('.timer-exit-stop').onclick=function(){
      closeDialog(false,false);
      if(typeof stopTimer==='function')stopTimer();
      if(typeof renderHome==='function')renderHome();
    };
    root.addEventListener('click',function(e){if(e.target===root)closeDialog(true,true)});
    return root;
  }

  function restoreTimerHistory(){
    try{
      var s=history.state;
      if(s&&s.stretchTimerApp&&s.stretchTimerScreen==='timer')return;
      var depth=s&&s.stretchTimerApp?Math.max(0,+s.stretchTimerDepth||0)+1:1;
      var next={};
      if(s&&typeof s==='object')Object.keys(s).forEach(function(k){next[k]=s[k]});
      next.stretchTimerApp=true;next.stretchTimerScreen='timer';next.stretchTimerDepth=depth;
      history.pushState(next,'',location.href);
    }catch(e){}
  }

  function closeDialog(restoreHistory,resumeTimer){
    if(!dialogOpen)return;
    dialogOpen=false;
    var root=ensureDialog();root.hidden=true;
    document.body.classList.remove('timer-exit-dialog-open');
    if(restoreHistory)restoreTimerHistory();
    if(resumeTimer&&timerState){
      timerState.paused=false;
      if(typeof renderTimer==='function')renderTimer();
      if(timerState.phase==='pre'&&typeof runPreStart==='function')runPreStart();
      else if(typeof runTick==='function')runTick();
    }
  }

  function requestExit(){
    if(dialogOpen)return true;
    if(timerState){
      timerState.paused=true;
      try{if(timerState.interval)clearInterval(timerState.interval)}catch(e){}
      timerState.interval=null;
      if(typeof renderTimer==='function')renderTimer();
    }
    var root=ensureDialog();dialogOpen=true;root.hidden=false;
    document.body.classList.add('timer-exit-dialog-open');
    setTimeout(function(){var b=root.querySelector('.timer-exit-continue');if(b)b.focus()},0);
    return true;
  }

  var previousGoBack=typeof goBack==='function'?goBack:null;
  goBack=function(){
    if(typeof currentScreen!=='undefined'&&currentScreen==='timer'&&timerState)return requestExit();
    if(previousGoBack)return previousGoBack.apply(this,arguments);
  };

  var back=document.getElementById('backBtn');
  if(back)back.onclick=function(){goBack()};
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&dialogOpen){e.preventDefault();closeDialog(true,true)}});
})();
