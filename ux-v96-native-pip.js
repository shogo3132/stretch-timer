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
body.native-pip #timer{display:block!important;width:100%!important;height:100dvh!important;min-height:0!important;padding:8px 14px!important;background:#fff!important;color:#1b1f24!important;overflow:hidden!important}\
body.native-pip #timerContent{width:100%!important;height:100%!important;max-width:none!important;margin:0!important;display:grid!important;grid-template-rows:auto 1fr auto!important;align-content:center!important;justify-content:stretch!important;gap:2px!important;overflow:hidden!important;text-align:center!important}\
body.native-pip .timer-name{font-size:clamp(14px,7vh,22px)!important;line-height:1.1!important;margin:0!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;color:#1b1f24!important}\
body.native-pip .timer-img,body.native-pip .compact-skip,body.native-pip .compact-meta,body.native-pip .timer-edit-current,body.native-pip .timer-video-row{display:none!important}\
body.native-pip .compact-timer-core{display:grid!important;grid-template-columns:1fr!important;align-items:center!important;gap:0!important;margin:0!important;min-height:0!important}\
body.native-pip .compact-time{min-height:0!important;height:100%!important;padding:0!important;border-radius:10px!important;align-content:center!important;background:transparent!important}\
body.native-pip .compact-pause-label{height:auto!important;min-height:12px!important;margin:0!important;font-size:clamp(9px,4vh,12px)!important;line-height:1!important;color:#718078!important}\
body.native-pip .compact-seconds{font-size:clamp(38px,27vh,70px)!important;line-height:.9!important;color:#161b22!important}\
body.native-pip .compact-progress{height:5px!important;margin:0 5px!important;background:#dfe8e4!important}\
body.native-pip .compact-progress-fill{background:#27ae8b!important}\
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

  var previousStart=typeof startTimer==='function'?startTimer:null;
  if(previousStart)startTimer=function(){completed=false;var result=previousStart.apply(this,arguments);syncNative(true);return result};
  var previousRender=typeof renderTimer==='function'?renderTimer:null;
  if(previousRender)renderTimer=function(){var result=previousRender.apply(this,arguments);syncNative(false);return result};
  var previousFinish=typeof finishTimer==='function'?finishTimer:null;
  if(previousFinish)finishTimer=function(){var result=previousFinish.apply(this,arguments);completed=true;syncNative(true);return result};
  var previousStop=typeof stopTimer==='function'?stopTimer:null;
  if(previousStop)stopTimer=function(){completed=false;var result=previousStop.apply(this,arguments);syncNative(true);return result};
  var previousShow=typeof show==='function'?show:null;
  if(previousShow)show=function(){var screen=arguments[0],result=previousShow.apply(this,arguments);if(screen!=='timer'&&!timerState)completed=false;syncNative(false);return result};

  window.__stretchTimerSetPipModeV96=function(enabled){document.body.classList.toggle('native-pip',!!enabled);if(typeof renderTimer==='function'&&timerState)renderTimer();syncNative(true)};
  window.__stretchTimerPipActionV96=function(action){if(action==='toggle'&&timerState){timerState.paused=!timerState.paused;if(typeof renderTimer==='function')renderTimer();return true}return false};
  [0,100,500].forEach(function(delay){setTimeout(function(){syncNative(true)},delay)});
})();
