(function(){
  if(window.__itemEditorCoreV79)return;
  window.__itemEditorCoreV79=true;

  var DEFAULT_REST=20,MIN_REST=1,MAX_REST=60,MIN_WORK=1,DEFAULT_WORK_MAX=600,MAX_WORK=3600,ROW_H=40;
  var MAX_SIDE=960,TARGET_BYTES=110*1024,MIN_QUALITY=.58,START_QUALITY=.82;
  var MIGRATION_KEY='stretchTimer.imageCompressionV48';
  var draft=null,committed=false,navigating=false,editContext=null;
  var audioCtx=null,lastTickAt=0;

  var style=document.createElement('style');
  style.setAttribute('data-item-editor-core-v79','');
  style.textContent='\
#itemEdit>.stack{gap:20px}\
#itemEdit .item-photo-field{position:relative}\
#itemEdit .item-photo-preview-wrap{position:relative;cursor:pointer;-webkit-tap-highlight-color:transparent}\
#itemEdit #photoPreview{display:block;width:100%;cursor:pointer}\
#itemEdit #photoInput{display:none!important}\
#itemPhotoDeleteX{position:absolute;top:10px;right:10px;z-index:5;width:42px;height:42px;border:0;border-radius:50%;background:rgba(20,24,28,.72);color:#fff;font-size:25px;font-weight:400;line-height:1;display:none;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 2px 10px rgba(0,0,0,.18);-webkit-tap-highlight-color:transparent}\
#itemPhotoDeleteX.show{display:flex}\
#itemTimeFields{display:grid;grid-template-columns:1fr 1fr;gap:12px;align-items:start}\
.item-time-field{display:grid;gap:7px;min-width:0}\
.item-time-label-row{display:flex;align-items:center;justify-content:flex-start;gap:4px;min-height:22px}\
.item-time-label{color:#48505a;font-size:13px;text-align:left;white-space:nowrap}\
.item-time-mode{appearance:none;border:0;background:transparent;color:#7a838d;padding:2px 3px;margin:0;line-height:1;font-size:14px;cursor:pointer;border-radius:5px;min-width:0;min-height:0}\
.item-time-mode:active{background:#edf0f2}\
.item-time-wheel-wrap{position:relative;height:120px;border-radius:15px;background:#fff;outline:1px solid #edf0f2;overflow:hidden}\
.item-time-wheel-wrap:before,.item-time-wheel-wrap:after{content:"";position:absolute;left:10px;right:10px;height:1px;background:#e4e8eb;z-index:2;pointer-events:none}\
.item-time-wheel-wrap:before{top:40px}.item-time-wheel-wrap:after{bottom:40px}\
.item-time-wheel{height:120px;overflow-y:auto;scroll-snap-type:y mandatory;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;scrollbar-width:none;padding:40px 0;mask-image:linear-gradient(to bottom,transparent 0,#000 30%,#000 70%,transparent 100%);-webkit-mask-image:linear-gradient(to bottom,transparent 0,#000 30%,#000 70%,transparent 100%)}\
.item-time-wheel::-webkit-scrollbar{display:none}\
.item-time-option{height:40px;display:flex;align-items:center;justify-content:center;scroll-snap-align:center;font-size:17px;color:#9aa1a9;user-select:none;cursor:pointer;transition:font-size .1s ease,color .1s ease,font-weight .1s ease}\
.item-time-option.selected{font-size:22px;font-weight:800;color:#1b1f24}\
.item-time-unit{position:absolute;left:calc(50% + 23px);top:50%;transform:translateY(-50%);z-index:3;font-size:12px;color:#6e7680;pointer-events:none}\
.item-time-input-wrap{height:120px;border-radius:15px;background:#fff;outline:1px solid #edf0f2;display:flex;align-items:center;justify-content:center;gap:5px;padding:12px}\
.item-time-input{width:78px;border:0!important;outline:0!important;background:#f4f6f7!important;border-radius:12px!important;padding:12px 8px!important;text-align:center;font-size:22px!important;font-weight:800;color:#1b1f24}\
.item-time-input-unit{font-size:12px;color:#6e7680}\
.item-time-last{height:120px;display:flex;align-items:center;justify-content:center;text-align:center;padding:12px;border-radius:15px;background:#f1f3f5;color:#6e7680;font-size:12px;line-height:1.45}\
#itemCommitBtn{width:100%;margin-top:16px}\
#itemEdit .item-delete-row-spaced{margin-top:8px!important}\
body.timer-active .timer-edit-current{margin:2px auto 0;min-height:42px;padding:8px 18px;border-radius:14px;background:#f1f3f5;color:#47515c;border:0;font-weight:700}\
#timerResumeEditBar{display:none;position:sticky;top:0;z-index:8;margin:-6px 0 4px;padding:8px 0;background:#f7f8fa}\
#timerResumeEditBar.active{display:block}\
#timerResumeEditBar .btn{width:100%;min-height:50px;font-weight:800}\
#menuEdit .item{grid-template-columns:78px 1fr auto!important;gap:14px!important}\
#menuEdit .item-actions{display:flex;align-items:center;justify-content:flex-end;gap:2px;align-self:center;position:relative;z-index:40}\
#menuEdit .item-action-btn{width:38px;height:38px;min-width:38px;border:0;border-radius:11px;background:#fff;color:#69727d;display:grid;place-items:center;padding:0;box-shadow:none;cursor:pointer;-webkit-tap-highlight-color:transparent}\
#menuEdit .item-action-btn:active{background:#f4f6f7}\
#menuEdit .item-more{font-size:22px;line-height:1;padding-bottom:5px}\
#menuEdit .item-open svg{width:20px;height:20px;display:block;stroke:currentColor;stroke-width:2;fill:none;stroke-linecap:round;stroke-linejoin:round}\
.item-action-pop{position:fixed;z-index:10020;min-width:150px;background:#fff;border:1px solid #edf0f2;border-radius:14px;padding:5px;box-shadow:0 10px 30px rgba(20,28,36,.15)}\
.item-action-pop button{width:100%;border:0;background:transparent;border-radius:10px;padding:10px 12px;text-align:left;font-size:14px;color:#303841;cursor:pointer}\
.item-action-pop button:active,.item-action-pop button:hover{background:#f4f6f7}\
.item-action-pop .danger{color:#ae3742}\
.desktop-item-times{display:none}\
@media(min-width:700px){\
  #menuEdit .item{grid-template-columns:78px minmax(0,1fr) auto auto!important;gap:14px!important;min-height:102px}\
  #menuEdit .item .muted{display:none!important}\
  .desktop-item-times{display:flex;align-items:center;gap:12px;white-space:nowrap}\
  .desktop-item-time-field{display:flex;align-items:center;gap:5px;color:#66707b;font-size:12px}\
  .desktop-item-time-field input{width:58px;height:36px;border:1px solid #e2e7eb;border-radius:10px;background:#fff;color:#1b1f24;text-align:center;font-size:15px;font-weight:700;padding:4px 5px;outline:none}\
  .desktop-item-time-field input:focus{border-color:#27ae8b;box-shadow:0 0 0 2px rgba(39,174,139,.12)}\
  .desktop-item-time-unit{color:#7a838d;font-size:11px}\
}\
@media(max-width:380px){#itemTimeFields{gap:8px}.item-time-label{font-size:12px}.item-time-option.selected{font-size:21px}.item-time-mode{font-size:13px}}\
';
  document.head.appendChild(style);

  function clone(x){return JSON.parse(JSON.stringify(x))}
  function same(a,b){try{return JSON.stringify(a)===JSON.stringify(b)}catch(e){return false}}
  function clamp(v,min,max,fallback){v=Math.round(+v);if(!Number.isFinite(v)||!v)v=fallback;return Math.max(min,Math.min(max,v))}
  function clampRest(v){return clamp(v,MIN_REST,MAX_REST,DEFAULT_REST)}
  function clampWork(v){return clamp(v,MIN_WORK,MAX_WORK,30)}
  function currentMenuSafe(){try{return typeof menu==='function'?menu():null}catch(e){return null}}
  function currentItemSafe(){try{return typeof item==='function'?item():null}catch(e){return null}}
  function isYouTubeUrl(value){
    if(!value)return true;
    try{
      var u=new URL(value),host=u.hostname.toLowerCase().replace(/^www\./,'');
      return u.protocol==='https:'&&(host==='youtu.be'||host==='youtube.com'||host.endsWith('.youtube.com')||host==='youtube-nocookie.com'||host.endsWith('.youtube-nocookie.com'));
    }catch(e){return false}
  }

  function toast(text){
    var old=document.getElementById('storageToast');if(old)old.remove();
    var el=document.createElement('div');el.id='storageToast';el.textContent=text;
    el.style.cssText='position:fixed;left:50%;bottom:28px;transform:translateX(-50%);z-index:10001;background:#20252b;color:#fff;padding:10px 15px;border-radius:14px;font-size:14px;box-shadow:0 4px 18px rgba(0,0,0,.2);max-width:88vw;text-align:center';
    document.body.appendChild(el);setTimeout(function(){el.remove()},3200);
  }
  function isQuotaError(e){return !!e&&(e.name==='QuotaExceededError'||e.name==='NS_ERROR_DOM_QUOTA_REACHED'||e.code===22||e.code===1014)}

  var baseSave=typeof save==='function'?save:null;
  if(baseSave){
    save=function(mark){
      if(arguments.length===0)mark=true;
      var previousUpdated=state&&state.updatedAt;
      if(mark&&state)state.updatedAt=Date.now();
      try{
        localStorage.setItem(STORAGE,JSON.stringify(state));
        if(mark&&typeof queueSync==='function')queueSync();
        return true;
      }catch(e){
        if(state)state.updatedAt=previousUpdated;
        if(isQuotaError(e)){toast('保存容量がいっぱいです。画像を軽量化してから再度お試しください。');console.warn('Stretch Timer storage quota exceeded',e);return false}
        throw e;
      }
    };
  }

  var previousNormalize=typeof normalize==='function'?normalize:null;
  if(previousNormalize){
    normalize=function(s){
      var out=previousNormalize(s);
      if(out&&Array.isArray(out.menus))out.menus.forEach(function(m){(m.items||[]).forEach(function(x){x.seconds=clampWork(x.seconds);x.restSeconds=clampRest(x.restSeconds);x.videoUrl=typeof x.videoUrl==='string'?x.videoUrl.trim():''})});
      return out;
    };
  }
  function ensureData(){
    var changed=false;
    try{
      if(typeof state==='undefined'||!state||!Array.isArray(state.menus))return;
      state.menus.forEach(function(m){(m.items||[]).forEach(function(x){
        var w=clampWork(x.seconds),r=clampRest(x.restSeconds);
        if(+x.seconds!==w){x.seconds=w;changed=true}
        if(+x.restSeconds!==r){x.restSeconds=r;changed=true}
        if(typeof x.videoUrl!=='string'){x.videoUrl='';changed=true}
      })});
      if(changed&&typeof save==='function')save(false);
    }catch(e){console.error(e)}
  }

  if(typeof totalSeconds==='function')totalSeconds=function(m){
    if(!m||!Array.isArray(m.items))return 0;
    return m.items.reduce(function(sum,x,i){return sum+Math.max(1,+x.seconds||1)+(i<m.items.length-1?clampRest(x.restSeconds):0)},0);
  };
  if(typeof advance==='function')advance=function(){
    var m=currentMenuSafe();if(!m||!timerState)return;
    if(timerState.phase==='item'&&timerState.index<m.items.length-1){
      var current=m.items[timerState.index],rest=clampRest(current&&current.restSeconds);
      timerState.phase='rest';timerState.remaining=rest;timerState.total=rest;return;
    }
    timerState.index++;
    if(timerState.index>=m.items.length){if(typeof finishTimer==='function')finishTimer();return}
    timerState.phase='item';timerState.remaining=m.items[timerState.index].seconds;timerState.total=m.items[timerState.index].seconds;
  };
  if(typeof syncPayload==='function')syncPayload=function(){
    return JSON.stringify({schemaVersion:2,updatedAt:state.updatedAt||Date.now(),menus:state.menus.map(function(m){
      var copy={};Object.keys(m).forEach(function(k){if(k!=='items')copy[k]=m[k]});
      copy.items=(m.items||[]).map(function(x){return {id:x.id,name:x.name,seconds:clampWork(x.seconds),restSeconds:clampRest(x.restSeconds),desc:x.desc,videoUrl:x.videoUrl||'',photoData:x.photo||''}});
      return copy;
    })});
  };

  function buildStaticEditor(){
    var screen=document.getElementById('itemEdit');if(!screen)return;
    screen.innerHTML='<div class="stack">'+
      '<div id="timerResumeEditBar"><button type="button" class="btn" id="resumeEditedTimerBtn">▶ タイマーを再開</button></div>'+
      '<div class="headline">種目</div>'+
      '<label class="field">種目名<input id="itemName"></label>'+
      '<div class="field item-photo-field"><div class="item-photo-preview-wrap" role="button" tabindex="0" aria-label="写真を設定または変更"><img id="photoPreview" class="photo-preview" alt="写真プレビュー"><button type="button" id="itemPhotoDeleteX" aria-label="画像を削除" title="画像を削除">×</button></div><input id="photoInput" type="file" accept="image/*" capture="environment"></div>'+
      '<label class="field">説明・メモ<textarea id="itemDesc" placeholder="フォームや注意点など"></textarea></label>'+
      '<label class="field">参考動画URL<input id="itemVideoUrl" type="url" inputmode="url" autocomplete="off" placeholder="https://youtu.be/…?t=90"></label>'+
      '<div class="tip" style="margin-top:-13px">YouTubeの時間指定付きURLを入力できます。</div>'+
      '<div id="itemTimeFields"></div>'+
      '<button id="itemCommitBtn" type="button" class="btn">決定</button>'+
      '<div class="row item-delete-row-spaced"><button id="duplicateItemBtn" class="btn sub" type="button">複製</button><button id="deleteItemBtn" class="btn danger" type="button">削除</button></div>'+
    '</div>';

    var wrap=screen.querySelector('.item-photo-preview-wrap');
    wrap.addEventListener('click',function(e){if(e.target&&e.target.closest('#itemPhotoDeleteX'))return;e.preventDefault();openPhotoPicker()});
    wrap.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();openPhotoPicker()}});
    document.getElementById('itemPhotoDeleteX').onclick=function(e){e.preventDefault();e.stopPropagation();if(!draft||!draft.value.photo)return;draft.value.photo='';refreshPhoto()};
    document.getElementById('photoInput').onchange=handlePhotoChange;
    document.getElementById('itemName').oninput=function(e){if(draft)draft.value.name=e.target.value||'名称未設定'};
    document.getElementById('itemDesc').oninput=function(e){if(draft)draft.value.desc=e.target.value};
    document.getElementById('itemVideoUrl').oninput=function(e){if(draft)draft.value.videoUrl=e.target.value.trim()};
    document.getElementById('itemCommitBtn').onclick=commitAndBack;
    document.getElementById('deleteItemBtn').onclick=deleteCurrentItem;
    document.getElementById('duplicateItemBtn').onclick=duplicateCurrentItem;
    document.getElementById('resumeEditedTimerBtn').onclick=resumeFromEdit;
  }

  function openPhotoPicker(){var input=document.getElementById('photoInput');if(!input)return;try{input.value=''}catch(e){}input.click()}
  function refreshPhoto(){
    var p=document.getElementById('photoPreview'),b=document.getElementById('itemPhotoDeleteX');if(!draft)return;
    if(p)p.src=draft.value.photo||(typeof svgPlaceholder==='function'?svgPlaceholder():'');
    if(b)b.classList.toggle('show',!!draft.value.photo);
  }
  function dataUrlBytes(data){if(!data||typeof data!=='string')return 0;var comma=data.indexOf(',');if(comma<0)return data.length;return Math.ceil((data.length-comma-1)*3/4)}
  function loadBitmapFromFile(file){
    if(window.createImageBitmap)return createImageBitmap(file);
    return new Promise(function(resolve,reject){var r=new FileReader();r.onerror=reject;r.onload=function(){var img=new Image();img.onerror=reject;img.onload=function(){resolve(img)};img.src=r.result};r.readAsDataURL(file)});
  }
  function loadBitmapFromDataUrl(src){return new Promise(function(resolve,reject){var img=new Image();img.onerror=reject;img.onload=function(){resolve(img)};img.src=src})}
  function scaledSize(w,h){var scale=Math.min(1,MAX_SIDE/Math.max(w,h));return {w:Math.max(1,Math.round(w*scale)),h:Math.max(1,Math.round(h*scale))}}
  function compressBitmap(bitmap){
    var w=bitmap.naturalWidth||bitmap.width,h=bitmap.naturalHeight||bitmap.height,s=scaledSize(w,h),canvas=document.createElement('canvas');canvas.width=s.w;canvas.height=s.h;
    var ctx=canvas.getContext('2d',{alpha:false});ctx.fillStyle='#fff';ctx.fillRect(0,0,s.w,s.h);ctx.drawImage(bitmap,0,0,s.w,s.h);
    var q=START_QUALITY,data=canvas.toDataURL('image/jpeg',q);while(dataUrlBytes(data)>TARGET_BYTES&&q>MIN_QUALITY){q=Math.max(MIN_QUALITY,q-.08);data=canvas.toDataURL('image/jpeg',q)}
    if(bitmap&&typeof bitmap.close==='function')try{bitmap.close()}catch(e){}return data;
  }
  async function compressFile(file){return compressBitmap(await loadBitmapFromFile(file))}
  async function compressDataUrl(src){if(!src||src.indexOf('data:image/')!==0)return src;try{return compressBitmap(await loadBitmapFromDataUrl(src))}catch(e){return src}}
  async function handlePhotoChange(e){
    var input=e.target,f=input.files&&input.files[0];if(!f||!draft)return;
    var token=draft.itemId;input.disabled=true;
    try{
      var compressed=await compressFile(f);
      if(!draft||draft.itemId!==token)return;
      draft.value.photo=compressed;refreshPhoto();toast('画像を軽量化して保存しました');
    }catch(err){console.error(err);toast('画像の保存に失敗しました')}
    finally{input.disabled=false;input.value=''}
  }

  function ensureAudio(){try{if(!audioCtx)audioCtx=new (window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==='suspended')audioCtx.resume()}catch(e){}}
  function tick(){if(Date.now()-lastTickAt<24)return;lastTickAt=Date.now();try{ensureAudio();if(!audioCtx)return;var o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type='square';o.frequency.value=1250;g.gain.setValueAtTime(.012,audioCtx.currentTime);g.gain.exponentialRampToValueAtTime(.0001,audioCtx.currentTime+.018);o.connect(g);g.connect(audioCtx.destination);o.start();o.stop(audioCtx.currentTime+.02)}catch(e){}}
  function setSelected(wheel,value,withTick){var old=wheel.dataset.selected||'';wheel.dataset.selected=String(value);Array.prototype.forEach.call(wheel.children,function(el){el.classList.toggle('selected',+el.dataset.value===value)});if(withTick&&old&&old!==String(value))tick()}
  function updateDraftTime(kind,value){if(!draft)return;value=kind==='rest'?clampRest(value):clampWork(value);draft.value[kind==='rest'?'restSeconds':'seconds']=value}
  function buildWheel(kind,value,max){
    var wrap=document.createElement('div');wrap.className='item-time-wheel-wrap';
    var wheel=document.createElement('div');wheel.className='item-time-wheel';
    var unit=document.createElement('span');unit.className='item-time-unit';unit.textContent='秒';wrap.append(wheel,unit);
    var frag=document.createDocumentFragment();for(var n=1;n<=max;n++){var opt=document.createElement('div');opt.className='item-time-option';opt.dataset.value=String(n);opt.textContent=String(n);frag.appendChild(opt)}wheel.appendChild(frag);
    value=kind==='rest'?clampRest(value):clampWork(value);setSelected(wheel,value,false);wheel.dataset.initialValue=String(value);
    wheel.addEventListener('pointerdown',ensureAudio,{passive:true});wheel.addEventListener('touchstart',ensureAudio,{passive:true});
    wheel.addEventListener('click',function(e){var opt=e.target.closest('.item-time-option');if(!opt)return;var next=+opt.dataset.value;wheel.scrollTo({top:(next-1)*ROW_H,behavior:'smooth'})});
    return wrap;
  }
  function activateWheel(wrap,kind){
    var wheel=wrap&&wrap.querySelector('.item-time-wheel');if(!wheel)return;
    var value=+(wheel.dataset.initialValue||1);wheel.scrollTop=(value-1)*ROW_H;
    var onScroll=function(){var next=Math.round(wheel.scrollTop/ROW_H)+1;next=kind==='rest'?clampRest(next):clamp(next,1,+wheel.lastElementChild.dataset.value,value);setSelected(wheel,next,true);updateDraftTime(kind,next)};
    wheel.addEventListener('scroll',onScroll,{passive:true});
  }
  function buildInput(kind,value){
    var wrap=document.createElement('div');wrap.className='item-time-input-wrap';var input=document.createElement('input');input.className='item-time-input';input.type='number';input.inputMode='numeric';input.min='1';input.max=kind==='rest'?String(MAX_REST):String(MAX_WORK);input.value=String(kind==='rest'?clampRest(value):clampWork(value));var unit=document.createElement('span');unit.className='item-time-input-unit';unit.textContent='秒';wrap.append(input,unit);
    function commit(){var next=kind==='rest'?clampRest(input.value):clampWork(input.value);input.value=String(next);updateDraftTime(kind,next)}
    input.addEventListener('input',commit);input.addEventListener('change',commit);setTimeout(function(){try{input.focus();input.select()}catch(e){}},0);return wrap;
  }
  function makeTimeField(kind,labelText,value,max,last){
    var field=document.createElement('div');field.className='item-time-field';var row=document.createElement('div');row.className='item-time-label-row';var label=document.createElement('div');label.className='item-time-label';label.textContent=labelText;row.appendChild(label);field.appendChild(row);
    if(last){var box=document.createElement('div');box.className='item-time-last';box.textContent='最後の種目のため休憩なし';field.appendChild(box);return field}
    var mode=document.createElement('button');mode.type='button';mode.className='item-time-mode';mode.textContent='⌨';mode.title='キーボード入力に切り替え';mode.setAttribute('aria-label',labelText+'をキーボード入力');row.appendChild(mode);
    var body=buildWheel(kind,value,max);field.appendChild(body);var inputMode=false;
    mode.onclick=function(){if(!draft)return;inputMode=!inputMode;var current=kind==='rest'?draft.value.restSeconds:draft.value.seconds;var next=inputMode?buildInput(kind,current):buildWheel(kind,current,max);body.replaceWith(next);body=next;if(!inputMode)activateWheel(body,kind);mode.textContent=inputMode?'↕':'⌨';mode.title=inputMode?'ホイール入力に戻す':'キーボード入力に切り替え';mode.setAttribute('aria-label',inputMode?'ホイール入力に戻す':labelText+'をキーボード入力')};
    return field;
  }
  function renderTimeFields(){
    var host=document.getElementById('itemTimeFields');if(!host||!draft)return;host.innerHTML='';
    var m=currentMenuSafe(),idx=m&&Array.isArray(m.items)?m.items.findIndex(function(x){return x.id===draft.itemId}):-1,last=!!(m&&idx>=0&&idx===m.items.length-1);
    var workMax=Math.max(DEFAULT_WORK_MAX,Math.min(MAX_WORK,draft.value.seconds));
    var work=makeTimeField('work','運動時間',draft.value.seconds,workMax,false),rest=makeTimeField('rest','休憩時間',draft.value.restSeconds,MAX_REST,last);
    host.append(work,rest);
    activateWheel(work,'work');if(!last)activateWheel(rest,'rest');
  }

  function updateResumeBar(){var bar=document.getElementById('timerResumeEditBar');if(bar)bar.classList.toggle('active',!!editContext)}
  function beginDraft(id){
    currentItemId=id;var x=currentItemSafe();if(!x)return false;
    draft={menuId:currentMenuId,itemId:x.id,value:clone(x)};draft.value.seconds=clampWork(draft.value.seconds);draft.value.restSeconds=clampRest(draft.value.restSeconds);committed=false;navigating=false;
    draft.value.videoUrl=typeof draft.value.videoUrl==='string'?draft.value.videoUrl.trim():'';
    var name=document.getElementById('itemName'),desc=document.getElementById('itemDesc'),video=document.getElementById('itemVideoUrl');if(name)name.value=draft.value.name||'';if(desc)desc.value=draft.value.desc||'';if(video)video.value=draft.value.videoUrl;refreshPhoto();updateResumeBar();return true;
  }
  function isDirty(){if(!draft)return false;var x=currentItemSafe();return !!x&&!same(draft.value,x)}
  function discardDraft(){draft=null;committed=false}
  function approveLeaving(){if(!draft||committed)return true;if(isDirty()&&!confirm('変更内容は反映されません。\nこのページを離れますか？'))return false;discardDraft();return true}

  function openItemCore(id){
    if(!beginDraft(id))return;
    renderTimeFields();
    if(typeof show==='function')show('itemEdit','種目設定');
    document.querySelectorAll('#itemTimeFields .item-time-wheel').forEach(function(wheel){var v=+(wheel.dataset.initialValue||1);wheel.scrollTop=(v-1)*ROW_H});
  }
  openItem=openItemCore;

  function commitAndBack(){
    if(!draft)return;
    draft.value.videoUrl=typeof draft.value.videoUrl==='string'?draft.value.videoUrl.trim():'';
    if(!isYouTubeUrl(draft.value.videoUrl)){alert('参考動画URLにはYouTubeのURLを入力してください。');var video=document.getElementById('itemVideoUrl');if(video)video.focus();return}
    var m=state&&Array.isArray(state.menus)?state.menus.find(function(v){return v.id===draft.menuId}):null;if(!m)return;
    var i=(m.items||[]).findIndex(function(v){return v.id===draft.itemId});if(i<0)return;
    var before=clone(m.items[i]),next=clone(draft.value);next.seconds=clampWork(next.seconds);next.restSeconds=clampRest(next.restSeconds);m.items[i]=next;
    committed=true;
    var ok=typeof save==='function'?save():true;
    if(ok===false){m.items[i]=before;committed=false;return}
    var menuId=draft.menuId;draft=null;
    if(editContext){editContext=null;if(timerState){try{clearInterval(timerState.interval)}catch(e){}timerState=null;if(typeof releaseAwake==='function')releaseAwake()}updateResumeBar()}
    if(typeof openMenu==='function')openMenu(menuId);
  }
  function deleteCurrentItem(){
    if(!draft)return;if(!confirm('この種目を削除しますか？'))return;
    var m=state&&Array.isArray(state.menus)?state.menus.find(function(v){return v.id===draft.menuId}):null;if(!m)return;
    m.items=m.items.filter(function(x){return x.id!==draft.itemId});var menuId=draft.menuId;draft=null;committed=true;
    if(editContext){editContext=null;if(timerState){try{clearInterval(timerState.interval)}catch(e){}timerState=null;if(typeof releaseAwake==='function')releaseAwake()}updateResumeBar()}
    if(typeof save==='function')save();if(typeof openMenu==='function')openMenu(menuId);
  }
  function duplicateCurrentItem(){
    if(!draft)return;
    var m=state&&Array.isArray(state.menus)?state.menus.find(function(v){return v.id===draft.menuId}):null;if(!m)return;
    var i=m.items.findIndex(function(x){return x.id===draft.itemId});if(i<0)return;
    var copy=clone(draft.value);copy.id=typeof uid==='function'?uid():Date.now()+Math.random().toString(16).slice(2);copy.name=(copy.name||'種目')+' コピー';m.items.splice(i+1,0,copy);
    if(typeof save==='function')save();draft=null;committed=true;openItemCore(copy.id);
  }

  function makeId(){return typeof uid==='function'?uid():(Date.now()+Math.random().toString(16).slice(2))}
  function closeActionMenu(){var p=document.getElementById('itemActionPop');if(p)p.remove()}
  function duplicateById(id){var m=currentMenuSafe();if(!m||!Array.isArray(m.items))return;var i=m.items.findIndex(function(x){return x.id===id});if(i<0)return;var copy=clone(m.items[i]);copy.id=makeId();copy.name=(copy.name||'種目')+' コピー';m.items.splice(i+1,0,copy);if(typeof save==='function')save();renderItems();if(typeof updateDuration==='function')updateDuration()}
  function deleteById(id){var m=currentMenuSafe();if(!m||!Array.isArray(m.items))return;var i=m.items.findIndex(function(x){return x.id===id});if(i<0)return;m.items.splice(i,1);if(typeof save==='function')save();renderItems();if(typeof updateDuration==='function')updateDuration()}
  function openActionMenu(anchor,id){
    closeActionMenu();var pop=document.createElement('div');pop.id='itemActionPop';pop.className='item-action-pop';pop.innerHTML='<button type="button" data-act="edit">編集</button><button type="button" data-act="copy">複製</button><button type="button" data-act="delete" class="danger">削除</button>';document.body.appendChild(pop);
    var r=anchor.getBoundingClientRect(),pr=pop.getBoundingClientRect(),left=Math.min(innerWidth-pr.width-10,Math.max(10,r.right-pr.width)),top=r.bottom+6;if(top+pr.height>innerHeight-10)top=Math.max(10,r.top-pr.height-6);pop.style.left=left+'px';pop.style.top=top+'px';
    pop.onclick=function(e){var b=e.target.closest('button');if(!b)return;e.stopPropagation();var act=b.dataset.act;closeActionMenu();if(act==='edit')openItemCore(id);else if(act==='copy')duplicateById(id);else if(act==='delete')deleteById(id)};
  }
  document.addEventListener('pointerdown',function(e){var p=document.getElementById('itemActionPop');if(p&&!p.contains(e.target)&&!(e.target&&e.target.closest&&e.target.closest('.item-more')))closeActionMenu()},true);

  function commitDesktopInput(input,x,kind){var key=kind==='work'?'seconds':'restSeconds',next=kind==='work'?clampWork(input.value):clampRest(input.value);input.value=String(next);if(+x[key]===next)return;x[key]=next;if(typeof save==='function')save();if(typeof updateDuration==='function')updateDuration()}
  function makeDesktopField(x,kind){
    var field=document.createElement('label');field.className='desktop-item-time-field';var text=document.createElement('span');text.textContent=kind==='work'?'運動':'休憩';var input=document.createElement('input');input.type='number';input.inputMode='numeric';input.min=String(kind==='work'?MIN_WORK:MIN_REST);input.max=String(kind==='work'?MAX_WORK:MAX_REST);input.step='1';input.value=String(kind==='work'?clampWork(x.seconds):clampRest(x.restSeconds));input.setAttribute('aria-label',(kind==='work'?'運動時間':'休憩時間')+' 秒');var unit=document.createElement('span');unit.className='desktop-item-time-unit';unit.textContent='秒';field.append(text,input,unit);
    ['pointerdown','mousedown','touchstart','click'].forEach(function(name){field.addEventListener(name,function(e){e.stopPropagation()},{passive:name==='touchstart'})});input.addEventListener('change',function(){commitDesktopInput(input,x,kind)});input.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();commitDesktopInput(input,x,kind);input.blur()}});return field;
  }
  renderItems=function(){
    var m=currentMenuSafe(),box=document.getElementById('itemList');if(!m||!box)return;box.innerHTML='';closeActionMenu();
    if(!m.items.length){box.innerHTML='<div class="empty">種目がありません。</div>';return}
    var fine=window.matchMedia&&window.matchMedia('(hover:hover) and (pointer:fine)').matches;
    m.items.forEach(function(x,i){
      x.seconds=clampWork(x.seconds);x.restSeconds=clampRest(x.restSeconds);
      var el=document.createElement('div');el.className='card item'+(fine?' desktop-dnd-ready':'');el.draggable=true;el.dataset.id=x.id;
      var img=document.createElement('img');img.className='thumb';img.src=x.photo||(typeof svgPlaceholder==='function'?svgPlaceholder():'');
      var info=document.createElement('div'),title=document.createElement('div'),meta=document.createElement('div');title.className='item-title';title.textContent=(i+1)+'. '+x.name;meta.className='muted';meta.textContent=i===m.items.length-1?x.seconds+'秒':x.seconds+'秒 ・ 休憩'+x.restSeconds+'秒';info.append(title,meta);
      var times=document.createElement('div');times.className='desktop-item-times';times.appendChild(makeDesktopField(x,'work'));if(i<m.items.length-1)times.appendChild(makeDesktopField(x,'rest'));
      var actions=document.createElement('div');actions.className='item-actions';var more=document.createElement('button');more.type='button';more.className='item-action-btn item-more';more.textContent='…';more.setAttribute('aria-label','種目の操作');more.title='種目の操作';var open=document.createElement('button');open.type='button';open.className='item-action-btn item-open';open.setAttribute('aria-label','種目設定を開く');open.title='種目設定を開く';open.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>';
      more.onclick=function(e){e.preventDefault();e.stopPropagation();openActionMenu(more,x.id)};open.onclick=function(e){e.preventDefault();e.stopPropagation();closeActionMenu();openItemCore(x.id)};actions.append(more,open);
      el.append(img,info,times,actions);if(typeof wireReorder==='function')wireReorder(el,x.id,'item');box.appendChild(el);
    });
  };

  var add=document.getElementById('addItemBtn');if(add)add.onclick=function(){var m=currentMenuSafe();if(!m)return;var x={id:makeId(),name:'新しい種目',seconds:30,restSeconds:DEFAULT_REST,desc:'',videoUrl:'',photo:''};m.items.push(x);if(typeof save==='function')save();openItemCore(x.id)};

  function currentTimerItem(){if(!timerState||timerState.phase!=='item')return null;var m=currentMenuSafe();return m&&Array.isArray(m.items)?m.items[timerState.index]||null:null}
  function openCurrentEdit(){var x=currentTimerItem();if(!x||!timerState||!timerState.paused)return;editContext={menuId:currentMenuId,itemId:x.id,index:timerState.index};openItemCore(x.id)}
  function returnToPausedTimer(){if(!editContext||!timerState)return false;discardDraft();if(typeof show==='function')show('timer',(currentMenuSafe()?currentMenuSafe().name:'タイマー'));timerState.paused=true;if(typeof renderTimer==='function')renderTimer();updateResumeBar();return true}
  function resumeFromEdit(){
    if(!editContext||!timerState)return;if(draft&&!approveLeaving())return;
    var m=currentMenuSafe();if(!m||!Array.isArray(m.items)||!m.items.length){editContext=null;updateResumeBar();return}
    var idx=m.items.findIndex(function(x){return x.id===editContext.itemId});if(idx<0)idx=Math.max(0,Math.min(editContext.index,m.items.length-1));timerState.index=idx;timerState.phase='item';timerState.remaining=Math.max(1,+m.items[idx].seconds||1);timerState.total=timerState.remaining;timerState.paused=false;editContext=null;updateResumeBar();if(typeof show==='function')show('timer',m.name);if(typeof renderTimer==='function')renderTimer();if(typeof runTick==='function')runTick();
  }
  var previousRenderTimer=typeof renderTimer==='function'?renderTimer:null;
  if(previousRenderTimer)renderTimer=function(){var r=previousRenderTimer.apply(this,arguments);if(timerState&&timerState.phase==='item'&&timerState.paused){var box=document.getElementById('timerContent');if(box&&!box.querySelector('.timer-edit-current')){var btn=document.createElement('button');btn.type='button';btn.className='timer-edit-current';btn.textContent='編集';btn.onclick=openCurrentEdit;var meta=box.querySelector('.compact-meta');if(meta)meta.insertAdjacentElement('afterend',btn);else box.appendChild(btn)}}return r};

  var previousShow=typeof show==='function'?show:null;
  if(previousShow)show=function(id){
    var leaving=typeof currentScreen!=='undefined'&&currentScreen==='itemEdit'&&id!=='itemEdit'&&draft&&!committed&&!navigating;
    if(leaving&&!approveLeaving())return;
    closeActionMenu();return previousShow.apply(this,arguments);
  };
  var previousGoBack=typeof goBack==='function'?goBack:null;
  goBack=function(){
    if(typeof currentScreen!=='undefined'&&currentScreen==='itemEdit'){
      if(draft&&!approveLeaving())return;
      if(editContext&&returnToPausedTimer())return;
      if(typeof openMenu==='function'){openMenu(currentMenuId);return}
    }
    if(previousGoBack)return previousGoBack.apply(this,arguments);
  };
  var back=document.getElementById('backBtn');if(back)back.addEventListener('click',function(e){
    if(typeof currentScreen==='undefined'||currentScreen!=='itemEdit'||!draft||navigating)return;
    e.preventDefault();e.stopImmediatePropagation();if(!approveLeaving())return;navigating=true;
    try{if(editContext&&returnToPausedTimer())return;if(typeof goBack==='function')goBack()}finally{setTimeout(function(){navigating=false},0)}
  },true);

  async function migrateExisting(){
    try{
      if(localStorage.getItem(MIGRATION_KEY)==='1')return;if(typeof state==='undefined'||!state||!Array.isArray(state.menus))return;
      var list=[];state.menus.forEach(function(m){(m.items||[]).forEach(function(x){if(x.photo&&x.photo.indexOf('data:image/')===0)list.push(x)})});if(!list.length){localStorage.setItem(MIGRATION_KEY,'1');return}
      var changed=false;for(var i=0;i<list.length;i++){var x=list[i],before=x.photo;if(dataUrlBytes(before)<90*1024)continue;var after=await compressDataUrl(before);if(after&&after.length<before.length){x.photo=after;changed=true}await new Promise(function(r){setTimeout(r,35)})}
      if(changed){if(typeof save==='function'&&save(false)){localStorage.setItem(MIGRATION_KEY,'1');toast('既存画像を軽量化しました');if(typeof currentScreen!=='undefined'&&currentScreen==='menuEdit')renderItems()}}else localStorage.setItem(MIGRATION_KEY,'1');
    }catch(e){console.error(e)}
  }

  buildStaticEditor();ensureData();
  var oldRest=document.getElementById('restSeconds');if(oldRest){var oldLabel=oldRest.closest('label');if(oldLabel)oldLabel.style.display='none';else oldRest.style.display='none'}
  if('requestIdleCallback'in window)requestIdleCallback(function(){migrateExisting()},{timeout:2200});else setTimeout(migrateExisting,1200);
})();
