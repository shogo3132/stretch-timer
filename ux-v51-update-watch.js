(function(){
  if(window.__updateWatchV51)return;
  window.__updateWatchV51=true;

  var CURRENT_BUILD='stretch-timer-v51';
  var POLL_MS=10000;
  var timer=null;
  var checking=false;
  var foundBuild='';

  var style=document.createElement('style');
  style.setAttribute('data-update-watch-v51','');
  style.textContent='\
#updateAvailableBtn{display:none;border:0;border-radius:999px;background:#e9f7f2;color:#168465;font-size:12px;font-weight:800;line-height:1;min-height:30px;padding:7px 10px;white-space:nowrap;cursor:pointer;box-shadow:none}\
#updateAvailableBtn.show{display:inline-flex;align-items:center;gap:5px}\
#updateAvailableBtn .dot{width:7px;height:7px;border-radius:50%;background:#27ae8b;display:inline-block}\
#updateAvailableBtn.updating{opacity:.65;pointer-events:none}\
';
  document.head.appendChild(style);

  function ensureBadge(){
    var badge=document.getElementById('updateAvailableBtn');
    if(badge)return badge;
    var version=document.getElementById('appVersion');
    var title=document.getElementById('title');
    if(!version&&!title)return null;
    badge=document.createElement('button');
    badge.id='updateAvailableBtn';
    badge.type='button';
    badge.innerHTML='<span class="dot"></span><span>更新あり</span>';
    badge.setAttribute('aria-label','新しいバージョンに更新');
    badge.title='新しいバージョンがあります';
    badge.onclick=applyUpdate;
    (version||title).insertAdjacentElement('afterend',badge);
    return badge;
  }

  function showBadge(build){
    foundBuild=build||foundBuild;
    var badge=ensureBadge();
    if(!badge)return;
    badge.classList.add('show');
    if(foundBuild)badge.title='新しいバージョン '+foundBuild.replace('stretch-timer-','')+' があります';
    stop();
  }

  async function remoteBuild(){
    try{
      var r=await fetch('./sw.js?watch='+Date.now(),{cache:'no-store'});
      if(!r.ok)return '';
      var t=await r.text();
      var m=t.match(/const CACHE='([^']+)'/);
      return m?m[1]:'';
    }catch(e){return ''}
  }

  async function check(){
    if(checking||document.hidden)return;
    checking=true;
    try{
      var build=await remoteBuild();
      if(build&&build!==CURRENT_BUILD)showBadge(build);
    }finally{checking=false}
  }

  async function applyUpdate(){
    var badge=ensureBadge();
    if(badge){badge.classList.add('updating');badge.querySelector('span:last-child').textContent='更新中…'}
    try{
      if('serviceWorker'in navigator){
        var reg=await navigator.serviceWorker.getRegistration();
        if(reg)await reg.update();
      }
      try{localStorage.setItem('stretchTimer.pendingNotice','アプリを最新版に更新しました')}catch(e){}
      location.replace(location.pathname+'?r='+Date.now());
    }catch(e){
      if(badge){badge.classList.remove('updating');badge.querySelector('span:last-child').textContent='更新あり'}
    }
  }

  function start(){
    if(timer||foundBuild)return;
    timer=setInterval(check,POLL_MS);
  }
  function stop(){if(timer){clearInterval(timer);timer=null}}

  document.addEventListener('visibilitychange',function(){
    if(document.hidden)return;
    check();
    start();
  });

  ensureBadge();
  setTimeout(check,1200);
  start();
})();
