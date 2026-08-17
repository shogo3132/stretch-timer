(function(){
  if(window.__compactTimerV41)return;
  window.__compactTimerV41=true;

  var style=document.createElement('style');
  style.setAttribute('data-compact-timer-v41','');
  style.textContent='\
body.timer-active{overflow:hidden!important}\
body.timer-active #timer{height:calc(100dvh - 74px)!important;min-height:0!important;overflow:hidden!important;padding:12px 20px max(14px,env(safe-area-inset-bottom))!important}\
body.timer-active #timerContent{height:100%!important;max-width:680px;margin:0 auto;display:grid!important;grid-template-rows:auto auto auto minmax(0,1fr);align-content:start;gap:10px!important;overflow:hidden!important}\
body.timer-active .timer-name{font-size:26px!important;line-height:1.2!important;margin:0!important}\
body.timer-active .timer-img{width:100%!important;height:clamp(190px,31vh,250px)!important;object-fit:cover!important;border-radius:20px!important;margin:0!important}\
body.timer-active .compact-timer-core{display:grid;grid-template-columns:54px 1fr 54px;align-items:center;gap:12px;margin-top:2px}\
body.timer-active .compact-skip{border:0;background:transparent;color:#7f8997;font-size:34px;line-height:1;min-height:70px;padding:0;display:grid;place-items:center;opacity:.72}\
body.timer-active .compact-skip:active{opacity:1;transform:scale(.96)}\
body.timer-active .compact-time{position:relative;text-align:center;min-height:92px;display:grid;place-items:center;align-content:center;border-radius:18px;transition:background .15s ease,opacity .15s ease;cursor:pointer;-webkit-tap-highlight-color:transparent}\
body.timer-active .compact-time.paused{background:#0c1016;opacity:.68}\
body.timer-active .compact-pause-label{height:18px;font-size:12px;letter-spacing:.08em;color:#8e99a8;margin-bottom:1px}\
body.timer-active .compact-seconds{font-size:64px;font-weight:800;line-height:.95;letter-spacing:-1px;color:#fff}\
body.timer-active .compact-unit{font-size:13px;color:#8e99a8;margin-top:4px}\
body.timer-active .compact-progress{height:7px;border-radius:999px;background:#2a333f;overflow:hidden;margin:0 2px}\
body.timer-active .compact-progress-fill{height:100%;background:#27ae8b;border-radius:999px;transition:width .15s linear}\
body.timer-active .compact-meta{display:grid;gap:6px;min-height:0;align-content:start;text-align:center}\
body.timer-active .timer-count{font-size:13px!important;color:#8994a3!important;margin:0!important}\
body.timer-active .timer-desc{font-size:15px!important;line-height:1.45!important;color:#c7ced7!important;padding:0 8px!important;margin:0!important;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}\
body.timer-active .compact-rest-next{font-size:15px;color:#c7ced7;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding:0 8px}\
@media(max-height:760px){body.timer-active #timer{padding-top:8px!important}body.timer-active #timerContent{gap:7px!important}body.timer-active .timer-img{height:clamp(160px,27vh,190px)!important}body.timer-active .compact-time{min-height:78px!important}body.timer-active .compact-seconds{font-size:56px!important}body.timer-active .compact-skip{min-height:60px!important}}\
';
  document.head.appendChild(style);

  function esc(s){return typeof escapeHtml==='function'?escapeHtml(s):String(s||'')}
  function progressPct(){
    if(!timerState)return 0;
    var total=Math.max(1,+timerState.total||1),remain=Math.max(0,+timerState.remaining||0);
    return Math.max(0,Math.min(100,(1-remain/total)*100));
  }
  function compactCore(label){
    var paused=!!timerState.paused;
    return '<div class="compact-timer-core">'+
      '<button class="compact-skip compact-prev" type="button" aria-label="前の種目">‹</button>'+
      '<div class="compact-time'+(paused?' paused':'')+'" role="button" tabindex="0" aria-label="'+(paused?'再開':'一時停止')+'">'+
        '<div class="compact-pause-label">'+(paused?'PAUSED':'')+'</div>'+
        '<div class="compact-seconds">'+timerState.remaining+'</div>'+
        '<div class="compact-unit">'+label+'</div>'+
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

  renderTimer=function(){
    if(!timerState)return;
    var m=menu(),box=document.getElementById('timerContent');
    if(timerState.phase==='pre'){
      box.innerHTML='<div class="prestart"><div class="muted">開始まで</div><div class="num">'+timerState.remaining+'</div><div class="first">'+esc(m.items[0].name)+'</div></div>';
      return;
    }
    if(timerState.phase==='rest'){
      box.innerHTML='<div class="timer-name">休憩</div>'+compactCore('秒')+
        '<div class="compact-meta"><div class="timer-count">'+(timerState.index+1)+' / '+m.items.length+'</div><div class="compact-rest-next">次：'+esc(m.items[timerState.index+1]&&m.items[timerState.index+1].name||'完了')+'</div></div>';
    }else{
      var x=m.items[timerState.index];
      box.innerHTML='<div class="timer-name">'+esc(x.name)+'</div>'+
        (x.photo?'<img class="timer-img" src="'+x.photo+'">':'')+
        compactCore('秒')+
        '<div class="compact-meta"><div class="timer-count">'+(timerState.index+1)+' / '+m.items.length+'</div>'+(x.desc?'<div class="timer-desc">'+esc(x.desc)+'</div>':'')+'</div>';
    }
    wireCompact(box);
  };
})();
