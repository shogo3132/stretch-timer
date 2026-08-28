(function(){
  if(window.__deviceLockV116)return;
  window.__deviceLockV116=true;

  var LOCK_PATH='/active-device.json',HEARTBEAT_MS=20000,LEASE_MS=60000;
  var SESSION_KEY='stretchTimer.deviceSession',DEVICE_KEY='stretchTimer.deviceId',sessionId=sessionStorage.getItem(SESSION_KEY)||makeId(),deviceId=localStorage.getItem(DEVICE_KEY)||makeId(),owner=false,readOnly=false,checking=false,syncPermit=false,heartbeatTimer=null,lastOwnerLabel='',originalSyncNow=typeof syncNow==='function'?syncNow:null;
  sessionStorage.setItem(SESSION_KEY,sessionId);
  localStorage.setItem(DEVICE_KEY,deviceId);

  var style=document.createElement('style');
  style.setAttribute('data-device-lock-v116','');
  style.textContent='\
#deviceGate{position:fixed;inset:0;z-index:12000;display:grid;place-items:center;padding:18px;background:rgba(245,247,248,.94);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}\
#deviceGate[hidden]{display:none!important}\
.device-gate-card{width:min(430px,100%);padding:23px 20px;border-radius:24px;background:#fff;box-shadow:0 18px 50px rgba(28,36,44,.16);text-align:center}\
.device-gate-spinner{width:34px;height:34px;margin:0 auto 16px;border:3px solid #dfe9e6;border-top-color:#27ae8b;border-radius:50%;animation:deviceSpin .8s linear infinite}\
.device-gate-icon{width:42px;height:42px;margin:0 auto 13px;border-radius:14px;display:grid;place-items:center;background:#fff0df;color:#a86612;font-size:22px;font-weight:850}\
.device-gate-title{font-size:18px;font-weight:850;color:#242a30;line-height:1.4}\
.device-gate-text{margin-top:9px;color:#6f7982;font-size:13px;line-height:1.65;white-space:pre-line}\
.device-gate-actions{display:grid;gap:9px;margin-top:18px}\
.device-gate-actions button{min-height:47px}\
.device-readonly-banner{position:fixed;left:50%;top:72px;z-index:9500;width:min(720px,calc(100% - 24px));transform:translateX(-50%);display:flex;align-items:center;justify-content:space-between;gap:10px;padding:9px 10px 9px 13px;border-radius:14px;background:#fff4df;color:#805a18;box-shadow:0 6px 20px rgba(35,41,47,.13);font-size:12px;font-weight:750}\
.device-readonly-banner button{min-height:32px;border:0;border-radius:10px;background:#fff;color:#805a18;padding:6px 10px;font-size:11px;font-weight:800}\
body.device-readonly .task-check,body.device-readonly .task-more,body.device-readonly .recipe-more,body.device-readonly .swipe-delete,body.device-readonly .swipe-copy,body.device-readonly .task-swipe-delete,body.device-readonly .task-swipe-duplicate{opacity:.38}\
@keyframes deviceSpin{to{transform:rotate(360deg)}}\
@media(min-width:780px){.device-readonly-banner{top:86px}}\
';
  document.head.appendChild(style);

  function makeId(){return (crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+Math.random().toString(36).slice(2))}
  function deviceLabel(){var ua=navigator.userAgent||'',android=/Android/i.test(ua),appShell=/StretchTimerApp/i.test(ua),standalone=window.matchMedia&&window.matchMedia('(display-mode: standalone)').matches;return android?(appShell||standalone?'Androidアプリ':'Androidブラウザ'):'PCブラウザ'}
  function lockRecord(expiresAt){return {sessionId:sessionId,deviceId:deviceId,label:deviceLabel(),updatedAt:Date.now(),expiresAt:expiresAt}}
  function isSameDevice(lock){return !!(lock&&lock.deviceId&&lock.deviceId===deviceId)}
  function isActiveOther(lock){return !!(lock&&lock.sessionId&&lock.sessionId!==sessionId&&!isSameDevice(lock)&&+lock.expiresAt>Date.now())}
  function ensureGate(){var gate=document.getElementById('deviceGate');if(gate)return gate;gate=document.createElement('div');gate.id='deviceGate';gate.hidden=true;gate.innerHTML='<div class="device-gate-card"><div id="deviceGateStatus"></div><div id="deviceGateTitle" class="device-gate-title"></div><div id="deviceGateText" class="device-gate-text"></div><div id="deviceGateActions" class="device-gate-actions"></div></div>';document.body.appendChild(gate);return gate}
  function setGate(kind,title,text,actions){var gate=ensureGate(),status=gate.querySelector('#deviceGateStatus'),box=gate.querySelector('#deviceGateActions');gate.hidden=false;document.body.classList.add('device-gated');status.className=kind==='loading'?'device-gate-spinner':'device-gate-icon';status.textContent=kind==='loading'?'':'!';gate.querySelector('#deviceGateTitle').textContent=title;gate.querySelector('#deviceGateText').textContent=text||'';box.innerHTML='';(actions||[]).forEach(function(action){var b=document.createElement('button');b.type='button';b.className='btn'+(action.sub?' sub':'');b.textContent=action.label;b.onclick=action.fn;box.appendChild(b)})}
  function hideGate(){var gate=ensureGate();gate.hidden=true;document.body.classList.remove('device-gated')}
  function showChecking(text){setGate('loading','最新データを確認しています',text||'Dropboxとの同期が完了するまでお待ちください。',[])}
  function showBlocked(label){owner=false;stopHeartbeat();lastOwnerLabel=label||'別のデバイス';setGate('blocked','別のデバイスで使用中です',lastOwnerLabel+'でアプリが開かれています。\nデータの競合を防ぐため、そちらを閉じてから再確認してください。',[{label:'再確認',fn:beginCheck},{label:'閲覧・実行のみで開く',sub:true,fn:enterReadOnly}])}
  function showFailure(){owner=false;stopHeartbeat();setGate('blocked','Dropboxを確認できませんでした','通信状態を確認して、もう一度お試しください。\n編集せずにルーティンの確認・実行だけ行うこともできます。',[{label:'再試行',fn:beginCheck},{label:'閲覧・実行のみで開く',sub:true,fn:enterReadOnly}])}
  function showReadOnlyBanner(){var old=document.getElementById('deviceReadonlyBanner');if(old)old.remove();var bar=document.createElement('div');bar.id='deviceReadonlyBanner';bar.className='device-readonly-banner';bar.innerHTML='<span>閲覧・実行のみ</span><button type="button">編集を再確認</button>';bar.querySelector('button').onclick=beginCheck;document.body.appendChild(bar)}
  function enterReadOnly(){readOnly=true;owner=false;stopHeartbeat();document.body.classList.add('device-readonly');hideGate();showReadOnlyBanner()}
  function leaveReadOnly(){readOnly=false;document.body.classList.remove('device-readonly');var bar=document.getElementById('deviceReadonlyBanner');if(bar)bar.remove()}
  async function token(){if(typeof accessToken!=='function')throw new Error('Dropbox token unavailable');return accessToken()}
  async function downloadLock(){var t=await token(),r=await fetch('https://content.dropboxapi.com/2/files/download',{method:'POST',headers:{Authorization:'Bearer '+t,'Dropbox-API-Arg':JSON.stringify({path:LOCK_PATH})}});if(r.status===409)return null;if(!r.ok)throw new Error('lock download failed');try{return JSON.parse(await r.text())}catch(e){return null}}
  async function uploadLock(record,keepalive){var t=await token(),r=await fetch('https://content.dropboxapi.com/2/files/upload',{method:'POST',headers:{Authorization:'Bearer '+t,'Dropbox-API-Arg':JSON.stringify({path:LOCK_PATH,mode:'overwrite',autorename:false,mute:true}),'Content-Type':'application/octet-stream'},body:JSON.stringify(record),keepalive:!!keepalive});if(!r.ok)throw new Error('lock upload failed');return true}
  function sleep(ms){return new Promise(function(resolve){setTimeout(resolve,ms)})}
  async function waitSyncIdle(){var started=Date.now();while(typeof syncing!=='undefined'&&syncing&&Date.now()-started<12000)await sleep(100)}
  async function syncAndVerify(){
    await waitSyncIdle();if(!originalSyncNow)throw new Error('sync unavailable');syncPermit=true;try{await originalSyncNow(false);await waitSyncIdle();var raw=await dropboxDownload();if(!raw)throw new Error('data unavailable');var remote=JSON.parse(raw),remoteTime=+remote.updatedAt||0,localTime=+state.updatedAt||0;if(remoteTime!==localTime){await originalSyncNow(false);await waitSyncIdle();raw=await dropboxDownload();remote=JSON.parse(raw);remoteTime=+remote.updatedAt||0;localTime=+state.updatedAt||0}if(remoteTime!==localTime)throw new Error('sync mismatch')}finally{syncPermit=false}
  }
  async function acquire(){
    var current=await downloadLock();if(isActiveOther(current))return {ok:false,label:current.label};await uploadLock(lockRecord(Date.now()+LEASE_MS));await sleep(220);var verified=await downloadLock();if(!verified||verified.sessionId!==sessionId)return {ok:false,label:verified&&verified.label};return {ok:true}
  }
  async function beginCheck(){
    if(checking)return;checking=true;leaveReadOnly();showChecking();try{if(typeof hasDropboxAuth!=='function'||!hasDropboxAuth()){owner=false;hideGate();return}var result=await acquire();if(!result.ok){showBlocked(result.label);return}owner=true;showChecking('編集を始める前に、Dropboxの最新データを反映しています。');await syncAndVerify();startHeartbeat();hideGate()}catch(e){console.error(e);showFailure()}finally{checking=false}
  }
  async function heartbeat(){
    if(!owner||document.hidden||typeof hasDropboxAuth!=='function'||!hasDropboxAuth())return;try{var current=await downloadLock();if(isActiveOther(current)){showBlocked(current.label);return}await uploadLock(lockRecord(Date.now()+LEASE_MS))}catch(e){console.error(e);showFailure()}
  }
  function startHeartbeat(){stopHeartbeat();heartbeatTimer=setInterval(heartbeat,HEARTBEAT_MS)}
  function stopHeartbeat(){if(heartbeatTimer){clearInterval(heartbeatTimer);heartbeatTimer=null}}
  function release(){if(!owner||typeof hasDropboxAuth!=='function'||!hasDropboxAuth())return;owner=false;stopHeartbeat();uploadLock(lockRecord(0),true).catch(function(){})}
  function allowedInReadOnly(target){return !!target.closest('#deviceGate,#deviceReadonlyBanner,#modeNav,#backBtn,#topAction,#refreshBtn,.start,.timer-controls,#doneBtn,#pausedResumeBar,a,[data-video-reference]')}
  function blockMutation(e){if(!readOnly||allowedInReadOnly(e.target))return;var mutation=e.target.closest('input,textarea,select,form,button,[contenteditable="true"],.menu-card,.item,.task-row,.recipe-row,.daily-chip,.daily-event');if(mutation){e.preventDefault();e.stopImmediatePropagation();if(e.type==='click'&&typeof window.__stretchToast==='function')window.__stretchToast('閲覧・実行のみです')}}

  ['click','submit','change','input','dragstart','touchstart'].forEach(function(type){document.addEventListener(type,blockMutation,{capture:true,passive:false})});
  if(originalSyncNow)syncNow=async function(userInitiated){if(owner||syncPermit)return originalSyncNow.apply(this,arguments);if(userInitiated)beginCheck();return false};
  document.addEventListener('visibilitychange',function(){if(!document.hidden)beginCheck()});
  window.addEventListener('pagehide',release);
  ensureGate();
  if(typeof hasDropboxAuth==='function'&&hasDropboxAuth()){showChecking();setTimeout(beginCheck,0)}
})();
