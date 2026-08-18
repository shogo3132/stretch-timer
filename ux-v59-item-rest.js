(function(){
  if(window.__itemRestV61)return;
  window.__itemRestV61=true;

  var DEFAULT_REST=20;
  var MIN_REST=1;
  var MAX_REST=60;
  var MIN_WORK=1;
  var DEFAULT_WORK_MAX=600;
  var MAX_WORK=3600;
  var ROW_H=40;
  var saveTimer=null;
  var audioCtx=null;
  var lastTickAt=0;

  var style=document.createElement('style');
  style.setAttribute('data-item-rest-v61','');
  style.textContent='\
#itemTimeFields{display:grid;grid-template-columns:1fr 1fr;gap:12px;align-items:start}\
.item-time-field{display:grid;gap:7px;min-width:0}\
.item-time-label-row{display:flex;align-items:center;justify-content:center;gap:4px;min-height:22px}\
.item-time-label{color:#48505a;font-size:13px;text-align:center;white-space:nowrap}\
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
@media(max-width:380px){#itemTimeFields{gap:8px}.item-time-label{font-size:12px}.item-time-option.selected{font-size:21px}.item-time-mode{font-size:13px}}\
';
  document.head.appendChild(style);

  function clamp(v,min,max,fallback){v=Math.round(+v||fallback);return Math.max(min,Math.min(max,v))}
  function clampRest(v){return clamp(v,MIN_REST,MAX_REST,DEFAULT_REST)}
  function clampWork(v){return clamp(v,MIN_WORK,MAX_WORK,30)}

  function ensureAudio(){try{if(!audioCtx)audioCtx=new (window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==='suspended')audioCtx.resume()}catch(e){}}
  function tick(){if(Date.now()-lastTickAt<24)return;lastTickAt=Date.now();try{ensureAudio();if(!audioCtx)return;var o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type='square';o.frequency.value=1250;g.gain.setValueAtTime(.012,audioCtx.currentTime);g.gain.exponentialRampToValueAtTime(.0001,audioCtx.currentTime+.018);o.connect(g);g.connect(audioCtx.destination);o.start();o.stop(audioCtx.currentTime+.02)}catch(e){}}

  function ensureData(){var changed=false;try{if(typeof state==='undefined'||!state||!Array.isArray(state.menus))return;state.menus.forEach(function(m){if(!Array.isArray(m.items))return;m.items.forEach(function(x){if(!Number.isFinite(+x.restSeconds)){x.restSeconds=DEFAULT_REST;changed=true}else{var next=clampRest(x.restSeconds);if(next!==+x.restSeconds){x.restSeconds=next;changed=true}}if(!Number.isFinite(+x.seconds)){x.seconds=30;changed=true}else{var work=clampWork(x.seconds);if(work!==+x.seconds){x.seconds=work;changed=true}}})});if(changed&&typeof save==='function')save(false)}catch(e){console.error(e)}}
  function currentIndex(){try{var m=typeof menu==='function'?menu():null;if(!m||!Array.isArray(m.items))return -1;return m.items.findIndex(function(x){return x.id===currentItemId})}catch(e){return -1}}
  function isLastItem(){try{var m=typeof menu==='function'?menu():null,i=currentIndex();return !!(m&&i>=0&&i===m.items.length-1)}catch(e){return false}}

  function removeOldFields(){var oldRest=document.getElementById('restSeconds');if(oldRest){var restLabel=oldRest.closest('label');if(restLabel)restLabel.style.display='none';else oldRest.style.display='none'}var oldWork=document.getElementById('itemSeconds');if(oldWork){var workLabel=oldWork.closest('label');if(workLabel)workLabel.style.display='none';else oldWork.style.display='none'}}
  function setSelected(wheel,value,withTick){var old=wheel.dataset.selected||'';wheel.dataset.selected=String(value);Array.prototype.forEach.call(wheel.children,function(el){el.classList.toggle('selected',+el.dataset.value===value)});if(withTick&&old&&old!==String(value))tick()}
  function writeValue(kind,value){try{var x=typeof item==='function'?item():null;if(!x)return;if(kind==='rest')value=clampRest(value);else value=clampWork(value);var key=kind==='rest'?'restSeconds':'seconds';if(+x[key]===value)return;x[key]=value;if(typeof save==='function')save();if(kind==='work'&&typeof updateDuration==='function')updateDuration()}catch(e){console.error(e)}}

  function buildWheel(kind,value,max){var wrap=document.createElement('div');wrap.className='item-time-wheel-wrap';var wheel=document.createElement('div');wheel.className='item-time-wheel';var unit=document.createElement('span');unit.className='item-time-unit';unit.textContent='秒';wrap.append(wheel,unit);var min=1,frag=document.createDocumentFragment();for(var n=min;n<=max;n++){var opt=document.createElement('div');opt.className='item-time-option';opt.dataset.value=String(n);opt.textContent=String(n);frag.appendChild(opt)}wheel.appendChild(frag);value=kind==='rest'?clampRest(value):clampWork(value);setSelected(wheel,value,false);requestAnimationFrame(function(){wheel.scrollTop=(value-min)*ROW_H});wheel.addEventListener('pointerdown',ensureAudio,{passive:true});wheel.addEventListener('touchstart',ensureAudio,{passive:true});wheel.addEventListener('scroll',function(){var next=Math.round(wheel.scrollTop/ROW_H)+min;next=kind==='rest'?clampRest(next):clamp(next,min,max,value);setSelected(wheel,next,true);clearTimeout(saveTimer);saveTimer=setTimeout(function(){writeValue(kind,next)},90)},{passive:true});wheel.addEventListener('click',function(e){var opt=e.target.closest('.item-time-option');if(!opt)return;var next=+opt.dataset.value;wheel.scrollTo({top:(next-min)*ROW_H,behavior:'smooth'})});return wrap}

  function buildInput(kind,value){var wrap=document.createElement('div');wrap.className='item-time-input-wrap';var input=document.createElement('input');input.className='item-time-input';input.type='number';input.inputMode='numeric';input.min='1';input.max=kind==='rest'?String(MAX_REST):String(MAX_WORK);input.value=String(kind==='rest'?clampRest(value):clampWork(value));var unit=document.createElement('span');unit.className='item-time-input-unit';unit.textContent='秒';wrap.append(input,unit);function commit(){var next=kind==='rest'?clampRest(input.value):clampWork(input.value);input.value=String(next);writeValue(kind,next)}input.addEventListener('input',function(){clearTimeout(saveTimer);saveTimer=setTimeout(commit,180)});input.addEventListener('change',commit);setTimeout(function(){try{input.focus();input.select()}catch(e){}},0);return wrap}

  function makeField(kind,labelText,value,max,last){var field=document.createElement('div');field.className='item-time-field';var labelRow=document.createElement('div');labelRow.className='item-time-label-row';var label=document.createElement('div');label.className='item-time-label';label.textContent=labelText;labelRow.appendChild(label);field.appendChild(labelRow);if(last){var lastBox=document.createElement('div');lastBox.className='item-time-last';lastBox.textContent='最後の種目のため休憩なし';field.appendChild(lastBox);return field}var mode=document.createElement('button');mode.type='button';mode.className='item-time-mode';mode.textContent='⌨';mode.title='キーボード入力に切り替え';mode.setAttribute('aria-label',labelText+'をキーボード入力');labelRow.appendChild(mode);var body=buildWheel(kind,value,max);field.appendChild(body);var inputMode=false;mode.onclick=function(){var x=typeof item==='function'?item():null;if(!x)return;inputMode=!inputMode;var current=kind==='rest'?x.restSeconds:x.seconds;var next=inputMode?buildInput(kind,current):buildWheel(kind,current,max);body.replaceWith(next);body=next;mode.textContent=inputMode?'↕':'⌨';mode.title=inputMode?'ホイール入力に戻す':'キーボード入力に切り替え';mode.setAttribute('aria-label',inputMode?'ホイール入力に戻す':labelText+'をキーボード入力')};return field}

  function decorateItemTimes(){removeOldFields();var screen=document.getElementById('itemEdit');if(!screen)return;var stack=screen.querySelector('.stack');if(!stack)return;var old=document.getElementById('itemTimeFields');if(old)old.remove();var x=typeof item==='function'?item():null;if(!x)return;if(!Number.isFinite(+x.restSeconds))x.restSeconds=DEFAULT_REST;if(!Number.isFinite(+x.seconds))x.seconds=30;x.restSeconds=clampRest(x.restSeconds);x.seconds=clampWork(x.seconds);var row=document.createElement('div');row.id='itemTimeFields';var workMax=Math.max(DEFAULT_WORK_MAX,Math.min(MAX_WORK,x.seconds));row.append(makeField('work','運動時間',x.seconds,workMax,false),makeField('rest','休憩時間',x.restSeconds,MAX_REST,isLastItem()));var seconds=document.getElementById('itemSeconds'),secondsLabel=seconds&&seconds.closest('label');if(secondsLabel)secondsLabel.insertAdjacentElement('afterend',row);else stack.insertBefore(row,stack.children[2]||null)}

  ensureData();removeOldFields();
  if(typeof totalSeconds==='function'){totalSeconds=function(m){if(!m||!Array.isArray(m.items))return 0;return m.items.reduce(function(sum,x,i){return sum+Math.max(1,+x.seconds||1)+(i<m.items.length-1?clampRest(x.restSeconds):0)},0)}}
  if(typeof advance==='function'){advance=function(){var m=typeof menu==='function'?menu():null;if(!m||!timerState)return;if(timerState.phase==='item'&&timerState.index<m.items.length-1){var current=m.items[timerState.index],rest=clampRest(current&&current.restSeconds);timerState.phase='rest';timerState.remaining=rest;timerState.total=rest;return}timerState.index++;if(timerState.index>=m.items.length){if(typeof finishTimer==='function')finishTimer();return}timerState.phase='item';timerState.remaining=m.items[timerState.index].seconds;timerState.total=m.items[timerState.index].seconds}}
  if(typeof syncPayload==='function'){syncPayload=function(){return JSON.stringify({schemaVersion:2,updatedAt:state.updatedAt||Date.now(),menus:state.menus.map(function(m){var copy={};Object.keys(m).forEach(function(k){if(k!=='items')copy[k]=m[k]});copy.items=(m.items||[]).map(function(x){return {id:x.id,name:x.name,seconds:clampWork(x.seconds),restSeconds:clampRest(x.restSeconds),desc:x.desc,photoData:x.photo||''}});return copy})})}}

  var previousOpenItem=typeof openItem==='function'?openItem:null;if(previousOpenItem){openItem=function(){var r=previousOpenItem.apply(this,arguments);var x=typeof item==='function'?item():null;if(x&&!Number.isFinite(+x.restSeconds)){x.restSeconds=DEFAULT_REST;if(typeof save==='function')save(false)}setTimeout(decorateItemTimes,0);return r}};
  var previousRenderItems=typeof renderItems==='function'?renderItems:null;if(previousRenderItems){renderItems=function(){var r=previousRenderItems.apply(this,arguments);try{var m=typeof menu==='function'?menu():null;if(m&&Array.isArray(m.items))setTimeout(function(){document.querySelectorAll('#itemList .item').forEach(function(el,i){var meta=el.querySelector('.muted'),x=m.items[i];if(meta&&x)meta.textContent=i===m.items.length-1?x.seconds+'秒':x.seconds+'秒 ・ 休憩'+clampRest(x.restSeconds)+'秒'})},0)}catch(e){}return r}};
  setTimeout(function(){removeOldFields();if(typeof currentScreen!=='undefined'&&currentScreen==='itemEdit')decorateItemTimes()},0);
})();
