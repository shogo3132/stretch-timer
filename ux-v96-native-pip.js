(function(){
  if(window.__nativePipV96)return;
  window.__nativePipV96=true;
  var bridge=window.StretchTimerNative;
  if(!bridge||typeof bridge.updateTimerState!=='function')return;

  var completed=false;
  var lastPayload='';
  var style=document.createElement('style');
  style.setAttribute('data-native-pip-v96','');
  style.textContent='\
body.native-pip,body.native-pip .app{width:100%!important;height:100%!important;min-height:0!important;max-width:none!important;margin:0!important;overflow:hidden!important;background:#fff!important}\
body.native-pip #topBar{display:none!important}\
body.native-pip .screen{display:none!important}\
body.native-pip #timer{display:block!important;width:100%!important;height:100dvh!important;min-height:0!important;padding:8px 10px!important;background:#fff!important;color:#1b1f24!important;overflow:hidden!important}\
body.native-pip #timerContent{width:100%!important;height:100%!important;max-width:none!important;margin:0!important;display:grid!important;grid-template-rows:auto minmax(0,1fr) auto auto!important;align-content:stretch!important;justify-content:stretch!important;gap:4px!important;overflow:hidden!important;text-align:center!important}\
body.native-pip.native-pip-has-image #timerContent{grid-template-columns:minmax(82px,31%) minmax(0,1fr)!important;grid-template-rows:auto minmax(0,1fr) 6px auto!important;column-gap:10px!important;row-gap:4px!important}\
body.native-pip .timer-name{font-size:clamp(13px,5.8vh,18px)!important;line-height:1.15!important;margin:0!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;color:#1b1f24!important}\
body.native-pip.native-pip-has-image .timer-name{grid-column:2!important;grid-row:1!important}\
body.native-pip .compact-meta,body.native-pip .timer-edit-current,body.native-pip .timer-video-row{display:none!important}\
body.native-pip .timer-image-wrap{display:block!important;position:relative!important;width:100%!important;aspect-ratio:1/1!important;line-height:0!important;align-self:start!important}\
body.native-pip.native-pip-has-image .timer-image-wrap{grid-column:1!important;grid-row:1/4!important}\
body.native-pip .timer-img{display:block!important;width:100%!important;height:100%!important;min-height:0!important;object-fit:cover!important;border-radius:10px!important;margin:0!important;background:#e4e9ec!important}\
body.native-pip .timer-side-label{left:50%!important;bottom:6px!important;min-width:42px!important;min-height:21px!important;padding:3px 8px!important;font-size:11px!important;transform:translateX(-50%)!important}\
body.native-pip .compact-timer-core{display:grid!important;grid-template-columns:32px minmax(0,1fr) 32px!important;align-items:center!important;gap:2px!important;margin:0!important;min-height:0!important}\
body.native-pip.native-pip-has-image .compact-timer-core{grid-column:2!important;grid-row:2!important}\
body.native-pip .compact-skip{display:grid!important;width:32px!important;min-width:32px!important;min-height:42px!important;height:42px!important;padding:0!important;border-radius:9px!important;background:#f1f4f3!important;color:#68727c!important;font-size:31px!important;line-height:1!important;place-items:center!important;opacity:1!important}\
body.native-pip .compact-skip:active{background:#dde7e3!important;color:#276b57!important}\
body.native-pip .compact-time{min-height:0!important;height:100%!important;padding:0!important;border-radius:10px!important;align-content:center!important;background:transparent!important}\
body.native-pip .compact-pause-label{height:auto!important;min-height:12px!important;margin:0!important;font-size:clamp(9px,4vh,12px)!important;line-height:1!important;color:#718078!important}\
body.native-pip .compact-seconds{font-size:clamp(36px,22vh,58px)!important;line-height:.9!important;color:#161b22!important}\
body.native-pip .compact-progress{height:6px!important;margin:0!important;background:#dfe8e4!important}\
body.native-pip.native-pip-has-image .compact-progress{grid-column:2!important;grid-row:3!important}\
body.native-pip .compact-progress-fill{background:#27ae8b!important}\
body.native-pip .routine-total-progress{position:static!important;grid-column:1/-1!important;grid-row:4!important;display:grid!important;gap:2px!important;width:100%!important;padding:0!important;background:transparent!important}\
body.native-pip .routine-total-head{display:flex!important;align-items:center!important;justify-content:space-between!important;color:#69757a!important;font-size:9px!important;font-weight:750!important;line-height:1!important}\
body.native-pip .routine-total-track{height:5px!important;background:#ccd7d4!important}\
body.native-pip .routine-total-fill{background:#13755b!important}\
body.native-pip .prestart+.routine-total-progress{display:none!important}\
body.native-pip.timer-rest #timer,body.native-pip.timer-rest #timerContent{background:#d9f0e2!important}\
body.native-pip #timerContent>.prestart{grid-row:1/-1!important}\
body.native-pip .prestart{height:100%!important;padding:0!important;display:grid!important;place-content:center!important;gap:3px!important;color:#1b1f24!important}\
body.native-pip .prestart .muted{font-size:11px!important}\
body.native-pip .prestart .num{font-size:clamp(42px,25vh,72px)!important;line-height:1!important;margin:0!important}\
body.native-pip .prestart .first{font-size:clamp(13px,6vh,20px)!important;line-height:1.1!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}\
body.native-pip .prestart #doneBtn{display:none!important}\
';
  document.head.appendChild(style);

  function currentMenuSafe(){try{return typeof menu==='function'?menu():null}catch(e){return null}}
  function payload(){
    var m=currentMenuSafe();
    if(timerState){
      var name='開始まで';
      if(timerState.phase==='rest')name='休憩';
      else if(timerState.phase==='item'&&m&&Array.isArray(m.items)&&m.items[timerState.index])name=m.items[timerState.index].name||'種目';
      return {active:true,completed:false,paused:!!timerState.paused,phase:timerState.phase||'item',name:name,remaining:Math.max(0,+timerState.remaining||0)};
    }
    return {active:false,completed:completed,paused:false,phase:completed?'complete':'idle',name:completed?'おつかれさまでした':'',remaining:0};
  }
  function syncNative(force){
    try{var json=JSON.stringify(payload());if(!force&&json===lastPayload)return;lastPayload=json;bridge.updateTimerState(json)}catch(e){}
  }
  function syncPipImageLayout(){
    document.body.classList.toggle('native-pip-has-image',!!document.querySelector('#timerContent > .timer-image-wrap'));
  }

  var previousStart=typeof startTimer==='function'?startTimer:null;
  if(previousStart)startTimer=function(){completed=false;var result=previousStart.apply(this,arguments);syncNative(true);return result};
  var previousRender=typeof renderTimer==='function'?renderTimer:null;
  if(previousRender)renderTimer=function(){var result=previousRender.apply(this,arguments);syncPipImageLayout();syncNative(false);return result};
  var previousFinish=typeof finishTimer==='function'?finishTimer:null;
  if(previousFinish)finishTimer=function(){var result=previousFinish.apply(this,arguments);completed=true;syncNative(true);return result};
  var previousStop=typeof stopTimer==='function'?stopTimer:null;
  if(previousStop)stopTimer=function(){completed=false;var result=previousStop.apply(this,arguments);syncNative(true);return result};
  if(window.StretchUI&&StretchUI.registerScreenHook)StretchUI.registerScreenHook({key:'native-pip',after:function(screen){if(screen!=='timer'&&!timerState)completed=false;syncNative(false)}});

  window.__stretchTimerSetPipModeV96=function(enabled){document.body.classList.toggle('native-pip',!!enabled);if(typeof renderTimer==='function'&&timerState)renderTimer();else syncPipImageLayout();syncNative(true)};
  window.__stretchTimerPipActionV96=function(action){
    if(!timerState)return false;
    if(action==='toggle'){timerState.paused=!timerState.paused;if(typeof renderTimer==='function')renderTimer();return true}
    if(action==='previous'){if(typeof skip==='function'){skip(-1);return true}return false}
    if(action==='next'){if(typeof skip==='function'){skip(1);return true}return false}
    return false;
  };
  [0,100,500].forEach(function(delay){setTimeout(function(){syncNative(true)},delay)});
})();
