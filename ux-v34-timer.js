(function(){
  var style=document.createElement('style');
  style.setAttribute('data-timer-polish-v34','');
  style.textContent='\
body.timer-active,.app.timer-active{background:#11161e!important}\
body.timer-active{min-height:100dvh}\
body.timer-active .app{min-height:100dvh;background:#11161e!important}\
body.timer-active #topBar{background:#11161e!important;color:#fff!important;border-bottom:1px solid rgba(255,255,255,.04)}\
body.timer-active #topBar #backBtn{background:#1c2430!important;color:#f4f7fa!important;box-shadow:none!important;border:1px solid rgba(255,255,255,.05);min-width:50px;min-height:50px;border-radius:16px}\
body.timer-active #appVersion{color:#747e8c!important}\
body.timer-active #timer{background:#11161e!important;min-height:calc(100dvh - 74px)!important;padding:18px 20px max(26px,env(safe-area-inset-bottom))!important;color:#fff}\
body.timer-active #timerContent{max-width:680px;margin:0 auto;gap:18px!important}\
body.timer-active .timer-name{font-size:26px!important;line-height:1.3;margin:2px 0 0}\
body.timer-active .timer-img{height:min(31vh,250px)!important;border-radius:20px!important;background:#1b222c!important;box-shadow:0 8px 24px rgba(0,0,0,.18)}\
body.timer-active .circle{width:min(68vw,286px)!important;height:min(68vw,286px)!important;margin:8px auto 2px!important}\
body.timer-active .circle circle{stroke-width:13!important}\
body.timer-active .circle .track{stroke:#303945!important}\
body.timer-active .circle .progress{stroke:#27ae8b!important}\
body.timer-active .circle-text{font-size:64px!important;font-weight:800!important;letter-spacing:-1px}\
body.timer-active .circle-sub{font-size:14px!important;color:#8e99a8!important;margin-top:8px!important}\
body.timer-active .timer-count{color:#8994a3!important;font-size:14px!important;margin-top:0!important}\
body.timer-active .timer-desc{color:#d0d6dd!important;font-size:16px!important;line-height:1.6!important;padding:0 12px!important;margin:0!important}\
body.timer-active .timer-controls{grid-template-columns:1fr 1.25fr 1fr!important;gap:10px!important;margin-top:4px!important}\
body.timer-active .timer-controls .btn{min-height:54px!important;border-radius:17px!important;background:#1d2530!important;color:#f4f7fa!important;font-weight:700!important;padding:9px 10px!important;box-shadow:none!important}\
body.timer-active .timer-controls .main{background:#27ae8b!important;color:#fff!important}\
body.timer-active .prestart{padding:56px 12px!important}\
body.timer-active .prestart .num{font-size:84px!important}\
body.timer-active .prestart .first{color:#54d0b0!important}\
@media(max-height:760px){body.timer-active #timer{padding-top:12px!important}body.timer-active #timerContent{gap:12px!important}body.timer-active .timer-img{height:180px!important}body.timer-active .circle{width:230px!important;height:230px!important}body.timer-active .circle-text{font-size:56px!important}body.timer-active .timer-controls .btn{min-height:50px!important}}\
';
  document.head.appendChild(style);

  function syncTimerTheme(){
    var active=document.querySelector('.screen.active');
    var on=!!(active&&active.id==='timer');
    document.body.classList.toggle('timer-active',on);
    var app=document.querySelector('.app');if(app)app.classList.toggle('timer-active',on);
  }

  var prevShow=typeof show==='function'?show:null;
  if(prevShow){
    show=function(){var r=prevShow.apply(this,arguments);syncTimerTheme();return r};
  }
  document.addEventListener('visibilitychange',syncTimerTheme);
  setTimeout(syncTimerTheme,0);
})();
