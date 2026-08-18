(function(){
  if(window.__updateWatchV75)return;
  window.__updateWatchV75=true;

  var CURRENT_BUILD='stretch-timer-v75';
  var POLL_MS=10000;
  var UPDATE_TARGET_KEY='stretchTimer.updateTarget';
  var UPDATE_ATTEMPTS_KEY='stretchTimer.updateAttempts';
  var timer=null;
  var checking=false;
  var updating=false;
  var foundBuild='';
  var pingedBuild='';

  var style=document.createElement('style');
  style.setAttribute('data-update-watch-v75','');
  style.textContent='\
#updateAvailableBtn{display:none;border:0;border-radius:999px;background:#e9f7f2;color:#168465;font-size:12px;font-weight:800;line-height:1;min-height:30px;padding:7px 10px;white-space:nowrap;cursor:pointer;box-shadow:none}\
#updateAvailableBtn.show{display:inline-flex;align-items:center;gap:5px}\
#updateAvailableBtn .dot{width:7px;height:7px;border-radius:50%;background:#27ae8b;display:inline-block}\
#updateAvailableBtn.updating{opacity:.65;pointer-events:none}\
';
  document.head.appendChild(style);

  function ensureBadge(){var badge=document.getElementById('updateAvailableBtn');if(badge)return badge;var version=document.getElementById('appVersion');var title=document.getElementById('title');if(!version&&!title)return null;badge=document.createElement('button');badge.id='updateAvailableBtn';badge.type='button';badge.innerHTML='<span class="dot"></span><span>更新あり</span>';badge.setAttribute('aria-label','新しいバージョンに更新');badge.title='新しいバージョンがあります';badge.onclick=applyUpdate;(version||title).insertAdjacentElement('afterend',badge);return badge}
  function setBadgeText(text){var badge=ensureBadge();if(badge){var s=badge.querySelector('span:last-child');if(s)s.textContent=text}}
  function playUpdatePing(build){if(document.hidden||!build||pingedBuild===build)return;pingedBuild=build;try{if(typeof beep==='function'){beep(1120,.07);setTimeout(function(){try{beep(1480,.055)}catch(e){}},85)}}catch(e){}}
  function showBadge(build){var first=!!(build&&build!==foundBuild);foundBuild=build||foundBuild;var badge=ensureBadge();if(!badge)return;badge.classList.add('show');badge.onclick=applyUpdate;if(foundBuild)badge.title='新しいバージョン '+foundBuild.replace('stretch-timer-','')+' があります';if(first)playUpdatePing(foundBuild);stop()}
  async function remoteBuild(){try{var r=await fetch('./sw.js?watch='+Date.now(),{cache:'no-store'});if(!r.ok)return '';var t=await r.text();var m=t.match(/const CACHE='([^']+)'/);return m?m[1]:''}catch(e){return ''}}
  async function check(){if(checking||updating||document.hidden)return;checking=true;try{var build=await remoteBuild();if(build&&build!==CURRENT_BUILD)showBadge(build)}finally{checking=false}}
  function controllerBuild(){return new Promise(function(resolve){try{var c=navigator.serviceWorker&&navigator.serviceWorker.controller;if(!c){resolve('');return}var ch=new MessageChannel(),done=false;var finish=function(v){if(done)return;done=true;resolve(v||'')};ch.port1.onmessage=function(e){finish(e.data&&e.data.build)};c.postMessage({type:'GET_BUILD'},[ch.port2]);setTimeout(function(){finish('')},700)}catch(e){resolve('')}})}
  async function waitUntilControlled(target){var deadline=Date.now()+30000,lastUpdate=0;while(Date.now()<deadline){var current=await controllerBuild();if(current===target)return true;if(Date.now()-lastUpdate>1800){lastUpdate=Date.now();try{var reg=await navigator.serviceWorker.getRegistration();if(reg)await reg.update()}catch(e){}}await new Promise(function(r){setTimeout(r,220)})}return false}
  function clearPendingUpdate(){try{localStorage.removeItem(UPDATE_TARGET_KEY);localStorage.removeItem(UPDATE_ATTEMPTS_KEY)}catch(e){}}
  async function navigateAfterUpdate(target,automatic){if(!target)return;try{localStorage.setItem(UPDATE_TARGET_KEY,target);var attempts=+(localStorage.getItem(UPDATE_ATTEMPTS_KEY)||0);localStorage.setItem(UPDATE_ATTEMPTS_KEY,String(attempts+1));localStorage.setItem('stretchTimer.pendingNotice','アプリを最新版に更新しました')}catch(e){}var suffix='?r='+Date.now()+(automatic?'&auto=1':'&update=1');location.replace(location.pathname+suffix)}
  async function applyUpdate(){if(updating)return;updating=true;stop();var badge=ensureBadge();if(badge){badge.classList.add('updating');badge.classList.add('show')}setBadgeText('更新中…');try{var target=foundBuild||await remoteBuild();if(!target||target===CURRENT_BUILD){clearPendingUpdate();if(badge)badge.classList.remove('show','updating');foundBuild='';updating=false;start();return}if(!('serviceWorker'in navigator))throw new Error('service worker unavailable');try{localStorage.setItem(UPDATE_TARGET_KEY,target);localStorage.setItem(UPDATE_ATTEMPTS_KEY,'0')}catch(e){}var reg=await navigator.serviceWorker.getRegistration();if(reg)await reg.update();var ready=await waitUntilControlled(target);if(!ready)throw new Error('new service worker did not activate');await new Promise(function(r){setTimeout(r,350)});await navigateAfterUpdate(target,false)}catch(e){console.error(e);updating=false;if(badge){badge.classList.remove('updating');badge.classList.add('show')}setBadgeText('更新を再試行')}}
  async function continuePendingUpdate(){var target='';var attempts=0;try{target=localStorage.getItem(UPDATE_TARGET_KEY)||'';attempts=+(localStorage.getItem(UPDATE_ATTEMPTS_KEY)||0)}catch(e){}if(!target)return false;if(target===CURRENT_BUILD){clearPendingUpdate();return false}if(attempts>=3){clearPendingUpdate();foundBuild=target;showBadge(target);setBadgeText('更新を再試行');return false}updating=true;stop();var badge=ensureBadge();if(badge)badge.classList.add('show','updating');setBadgeText('更新中…');try{var reg=await navigator.serviceWorker.getRegistration();if(reg)await reg.update();var ready=await waitUntilControlled(target);if(ready)await new Promise(function(r){setTimeout(r,400)});await navigateAfterUpdate(target,true);return true}catch(e){console.error(e);updating=false;foundBuild=target;showBadge(target);setBadgeText('更新を再試行');return false}}
  async function manualRefresh(){if(updating||checking)return;var btn=document.getElementById('refreshBtn');if(btn)btn.classList.add('refreshing');checking=true;try{var build=await remoteBuild();if(build&&build!==CURRENT_BUILD){foundBuild=build;showBadge(build);checking=false;if(btn)btn.classList.remove('refreshing');await applyUpdate();return}if(typeof hasDropboxAuth==='function'&&hasDropboxAuth()&&typeof syncNow==='function'){try{await syncNow(false)}catch(e){console.error(e)}}}finally{checking=false;if(btn)btn.classList.remove('refreshing')}}
  function bindRefresh(){var btn=document.getElementById('refreshBtn');if(btn)btn.onclick=manualRefresh}
  var prevShow=typeof show==='function'?show:null;if(prevShow)show=function(){var r=prevShow.apply(this,arguments);setTimeout(bindRefresh,0);return r};
  function start(){if(timer||foundBuild||updating)return;timer=setInterval(check,POLL_MS)}
  function stop(){if(timer){clearInterval(timer);timer=null}}
  document.addEventListener('visibilitychange',function(){if(document.hidden)return;check();start();bindRefresh()});
  ensureBadge();bindRefresh();setTimeout(async function(){var continued=await continuePendingUpdate();if(!continued){check();start()}},500);
})();
