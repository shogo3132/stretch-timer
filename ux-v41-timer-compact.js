(function(){
  if(window.__compactTimerV42)return;
  window.__compactTimerV42=true;

  var style=document.createElement('style');
  style.setAttribute('data-compact-timer-v42','');
  style.textContent='\
body.timer-active,body.timer-active .app{background:#fff!important;color:#1b1f24!important}\
body.timer-active{overflow:hidden!important}\
body.timer-active #topBar{background:#fff!important;color:#1b1f24!important;border-bottom:1px solid #eef1f3!important}\
body.timer-active #topBar #backBtn{background:#f3f5f7!important;color:#4d5661!important;border:0!important;box-shadow:none!important}\
body.timer-active #timer{height:calc(100dvh - 74px)!important;min-height:0!important;overflow:hidden!important;background:#fff!important;color:#1b1f24!important;padding:10px 20px max(12px,env(safe-area-inset-bottom))!important}\
body.timer-active #timerContent{position:relative;height:100%!important;max-width:680px;margin:0 auto;padding-bottom:48px;display:grid!important;grid-template-rows:auto auto auto auto;align-content:start;gap:10px!important;overflow:hidden!important;text-align:center}\
body.timer-active .timer-name{font-size:25px!important;line-height:1.2!important;margin:0!important;color:#1b1f24!important}\
body.timer-active .timer-img{width:100%!important;height:clamp(190px,31vh,250px)!important;object-fit:cover!important;border-radius:20px!important;margin:0!important;background:#eef1f3!important;box-shadow:none!important}\
body.timer-active .compact-timer-core{display:grid;grid-template-columns:52px 1fr 52px;align-items:center;gap:10px;margin:0}\
body.timer-active .compact-skip{border:0;background:transparent;color:#a5adb6;font-size:38px;line-height:1;min-height:88px;padding:0;display:grid;place-items:center;opacity:.9}\
body.timer-active .compact-skip:active{color:#69737e;transform:scale(.96)}\
body.timer-active .compact-time{position:relative;text-align:center;min-height:104px;display:grid;place-items:center;align-content:center;border-radius:18px;transition:background .15s ease,color .15s ease;cursor:pointer;-webkit-tap-highlight-color:transparent}\
body.timer-active .compact-time.paused{background:#f1f3f5}\
body.timer-active .compact-pause-label{height:18px;font-size:12px;letter-spacing:.08em;color:#8a929c;margin-bottom:1px}\
body.timer-active .compact-seconds{font-size:64px;font-weight:800;line-height:.95;letter-spacing:-1px;color:#161b22}\
body.timer-active .compact-time.paused .compact-seconds{color:#6f7882}\
body.timer-active .compact-progress{height:7px;border-radius:999px;background:#e8ecef;overflow:hidden;margin:0 2px}\
body.timer-active .compact-progress-fill{height:100%;background:#27ae8b;border-radius:999px;transition:width .15s linear}\
body.timer-active .compact-meta{display:grid;gap:4px;min-height:0;align-content:start;text-align:center;margin-top:0}\
body.timer-active .timer-desc{font-size:15px!important;line-height:1.45!important;color:#5f6873!important;padding:0 8px!important;margin:2px 0 0!important;display:block!important;overflow:visible!important;white-space:pre-wrap!important}\
body.timer-active .timer-count{font-size:12px!important;color:#a0a7af!important;margin:2px 0 0!important;order:2}\
body.timer-active .compact-rest-next{font-size:20px;font-weight:800;line-height:1.35;color:#35404a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding:0 8px}\
body.timer-active .routine-total-progress{position:absolute;left:0;right:0;bottom:0;display:grid;gap:5px;width:100%;padding:5px 2px 0;background:#fff;text-align:left}\
body.timer-active .routine-total-head{display:flex;align-items:center;justify-content:space-between;color:#68727c;font-size:12px;font-weight:750;line-height:1}\
body.timer-active .routine-total-head span:last-child{font-variant-numeric:tabular-nums;font-feature-settings:"tnum" 1;white-space:nowrap}\
body.timer-active .routine-total-track{height:9px;border-radius:999px;background:#dde3e6;overflow:hidden}\
body.timer-active .routine-total-fill{height:100%;border-radius:999px;background:#168465;transition:width .2s linear}\
body.native-pip .routine-total-progress{display:none!important}\
body.timer-active .prestart{padding:44px 12px!important;color:#1b1f24!important}\
body.timer-active .prestart .num{color:#1b1f24!important}\
body.timer-active .prestart .first{color:#27ae8b!important}\
@media(max-height:760px){body.timer-active #timer{padding-top:7px!important}body.timer-active #timerContent{gap:7px!important}body.timer-active .timer-img{height:clamp(145px,23vh,175px)!important}body.timer-active .compact-time{min-height:84px!important}body.timer-active .compact-seconds{font-size:56px!important}body.timer-active .compact-skip{min-height:66px!important}body.timer-active .compact-rest-next{font-size:18px}}\
';
  document.head.appendChild(style);

  function esc(s){return typeof escapeHtml==='function'?escapeHtml(s):String(s||'')}
  function progressPct(){
    if(!timerState)return 0;
    var total=Math.max(1,+timerState.total||1),remain=Math.max(0,+timerState.remaining||0);
    return Math.max(0,Math.min(100,(1-remain/total)*100));
  }
  function itemWorkSeconds(x){return Math.max(1,Math.round(+x.seconds||1))}
  function itemRestSeconds(x){return Math.max(1,Math.min(60,Math.round(+x.restSeconds||20)))}
  function routineProgress(m){
    var items=m&&Array.isArray(m.items)?m.items:[],total=0,elapsed=0,idx=Math.max(0,Math.min(items.length-1,+timerState.index||0));
    items.forEach(function(x,i){total+=itemWorkSeconds(x);if(i<items.length-1)total+=itemRestSeconds(x)});
    if(!items.length||!total||timerState.phase==='pre')return {pct:0,total:total,elapsed:0};
    for(var i=0;i<idx;i++)elapsed+=itemWorkSeconds(items[i])+itemRestSeconds(items[i]);
    if(timerState.phase==='rest')elapsed+=itemWorkSeconds(items[idx])+Math.max(0,itemRestSeconds(items[idx])-Math.max(0,+timerState.remaining||0));
    else elapsed+=Math.max(0,itemWorkSeconds(items[idx])-Math.max(0,+timerState.remaining||0));
    elapsed=Math.max(0,Math.min(total,elapsed));return {pct:elapsed/total*100,total:total,elapsed:elapsed};
  }
  function routineTimeText(seconds){seconds=Math.max(0,Math.round(+seconds||0));return String(Math.floor(seconds/60)).padStart(2,'0')+'分'+String(seconds%60).padStart(2,'0')+'秒'}
  function routineProgressHtml(m){
    var p=routineProgress(m),pct=Math.max(0,Math.min(100,p.pct));
    var time=routineTimeText(p.elapsed)+' / '+routineTimeText(p.total);
    return '<div class="routine-total-progress" aria-label="ルーティン全体の進捗 '+time+'"><div class="routine-total-head"><span>ルーティン全体</span><span>'+time+'</span></div><div class="routine-total-track"><div class="routine-total-fill" style="width:'+pct.toFixed(2)+'%"></div></div></div>';
  }
  function compactCore(){
    var paused=!!timerState.paused;
    return '<div class="compact-timer-core">'+
      '<button class="compact-skip compact-prev" type="button" aria-label="前の種目">‹</button>'+
      '<div class="compact-time'+(paused?' paused':'')+'" role="button" tabindex="0" aria-label="'+(paused?'再開':'一時停止')+'">'+
        '<div class="compact-pause-label">'+(paused?'一時停止中':'')+'</div>'+
        '<div class="compact-seconds">'+timerState.remaining+'</div>'+
      '</div>'+
      '<button class="compact-skip compact-next" type="button" aria-label="次の種目">›</button>'+
    '</div><div class="compact-progress"><div class="compact-progress-fill" style="width:'+progressPct().toFixed(2)+'%"></div></div>';
  }
  function wireCompact(box){
    var t=box.querySelector('.compact-time');
    if(t){
      var toggle=function(){timerState.paused=!timerState.paused;renderTimer()};
      t.onclick=toggle;
      t.onkeydown=function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();toggle()}};
    }
    var p=box.querySelector('.compact-prev');if(p)p.onclick=function(){skip(-1)};
    var n=box.querySelector('.compact-next');if(n)n.onclick=function(){skip(1)};
  }
  function syncThemeColor(){
    var meta=document.querySelector('meta[name="theme-color"]');
    if(meta)meta.setAttribute('content',document.querySelector('.screen.active')&&document.querySelector('.screen.active').id==='timer'?'#ffffff':'#f7f8fa');
  }

  renderTimer=function(){
    if(!timerState)return;
    var m=menu(),box=document.getElementById('timerContent');
    if(timerState.phase==='pre'){
      box.innerHTML='<div class="prestart"><div class="muted">開始まで</div><div class="num">'+timerState.remaining+'</div><div class="first">'+esc(m.items[0].name)+'</div></div>'+routineProgressHtml(m);
      syncThemeColor();
      return;
    }
    if(timerState.phase==='rest'){
      var nextItem=timerState.restTarget==='next'?m.items[timerState.index]:m.items[timerState.index+1],reverseTarget=timerState.restTarget==='reverse',previewItem=reverseTarget?m.items[timerState.index]:nextItem;
      box.innerHTML='<div class="timer-name">休憩</div>'+
        (previewItem&&previewItem.photo?'<img class="timer-img timer-next-img'+(reverseTarget?' reverse-side-image':'')+'" src="'+previewItem.photo+'" alt="'+esc(reverseTarget?(previewItem.name||'種目')+'（逆側）':(previewItem.name||'次の種目'))+'">':'')+
        compactCore()+
        '<div class="compact-meta"><div class="compact-rest-next">次：'+esc(nextItem&&nextItem.name||'完了')+'</div><div class="timer-count">'+(timerState.index+1)+' / '+m.items.length+'</div></div>'+routineProgressHtml(m);
    }else{
      var x=m.items[timerState.index];
      box.innerHTML='<div class="timer-name">'+esc(x.name)+'</div>'+
        (x.photo?'<img class="timer-img" src="'+x.photo+'">':'')+
        compactCore()+
        '<div class="compact-meta">'+(x.desc?'<div class="timer-desc">'+esc(x.desc)+'</div>':'')+'<div class="timer-count">'+(timerState.index+1)+' / '+m.items.length+'</div></div>'+routineProgressHtml(m);
    }
    wireCompact(box);
    syncThemeColor();
  };

  if(window.StretchUI&&StretchUI.registerScreenHook)StretchUI.registerScreenHook({key:'timer-theme-color',after:function(){setTimeout(syncThemeColor,0)}});
})();
