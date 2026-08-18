(function(){
  if(window.__itemRestV60)return;
  window.__itemRestV60=true;

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
  style.setAttribute('data-item-rest-v60','');
  style.textContent='\
#itemTimeFields{display:grid;grid-template-columns:1fr 1fr;gap:12px;align-items:start}\
.item-time-field{display:grid;gap:7px;min-width:0}\
.item-time-label{color:#48505a;font-size:13px;text-align:center;white-space:nowrap}\
.item-time-wheel-wrap{position:relative;height:120px;border-radius:15px;background:#fff;outline:1px solid #edf0f2;overflow:hidden}\
.item-time-wheel-wrap:before,.item-time-wheel-wrap:after{content:"";position:absolute;left:10px;right:10px;height:1px;background:#e4e8eb;z-index:2;pointer-events:none}\
.item-time-wheel-wrap:before{top:40px}.item-time-wheel-wrap:after{bottom:40px}\
.item-time-wheel{height:120px;overflow-y:auto;scroll-snap-type:y mandatory;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;scrollbar-width:none;padding:40px 0;mask-image:linear-gradient(to bottom,transparent 0,#000 30%,#000 70%,transparent 100%);-webkit-mask-image:linear-gradient(to bottom,transparent 0,#000 30%,#000 70%,transparent 100%)}\
.item-time-wheel::-webkit-scrollbar{display:none}\
.item-time-option{height:40px;display:flex;align-items:center;justify-content:center;scroll-snap-align:center;font-size:17px;color:#9aa1a9;user-select:none;cursor:pointer;transition:font-size .1s ease,color .1s ease,font-weight .1s ease}\
.item-time-option.selected{font-size:22px;font-weight:800;color:#1b1f24}\
.item-time-unit{position:absolute;left:calc(50% + 23px);top:50%;transform:translateY(-50%);z-index:3;font-size:12px;color:#6e7680;pointer-events:none}\
.item-time-last{height:120px;display:flex;align-items:center;justify-content:center;text-align:center;padding:12px;border-radius:15px;background:#f1f3f5;color:#6e7680;font-size:12px;line-height:1.45}\
@media(max-width:380px){#itemTimeFields{gap:8px}.item-time-label{font-size:12px}.item-time-option.selected{font-size:21px}}\
';
  document.head.appendChild(style);

  function clamp(v,min,max,fallback){
    v=Math.round(+v||fallback);
    return Math.max(min,Math.min(max,v));
  }
  function clampRest(v){return clamp(v,MIN_REST,MAX_REST,DEFAULT_REST)}
  function clampWork(v){return clamp(v,MIN_WORK,MAX_WORK,30)}

  function ensureAudio(){
    try{
      if(!audioCtx)audioCtx=new (window.AudioContext||window.webkitAudioContext)();
      if(audioCtx.state==='suspended')audioCtx.resume();
    }catch(e){}
  }

  function tick(){
    if(Date.now()-lastTickAt<24)return;
    lastTickAt=Date.now();
    try{
      ensureAudio();
      if(!audioCtx)return;
      var o=audioCtx.createOscillator(),g=audioCtx.createGain();
      o.type='square';
      o.frequency.value=1250;
      g.gain.setValueAtTime(.012,audioCtx.currentTime);
      g.gain.exponentialRampToValueAtTime(.0001,audioCtx.currentTime+.018);
      o.connect(g);g.connect(audioCtx.destination);
      o.start();o.stop(audioCtx.currentTime+.02);
    }catch(e){}
  }

  function ensureData(){
    var changed=false;
    try{
      if(typeof state==='undefined'||!state||!Array.isArray(state.menus))return;
      state.menus.forEach(function(m){
        if(!Array.isArray(m.items))return;
        m.items.forEach(function(x){
          if(!Number.isFinite(+x.restSeconds)){x.restSeconds=DEFAULT_REST;changed=true}
          else{var next=clampRest(x.restSeconds);if(next!==+x.restSeconds){x.restSeconds=next;changed=true}}
          if(!Number.isFinite(+x.seconds)){x.seconds=30;changed=true}
          else{var work=clampWork(x.seconds);if(work!==+x.seconds){x.seconds=work;changed=true}}
        });
      });
      if(changed&&typeof save==='function')save(false);
    }catch(e){console.error(e)}
  }

  function currentIndex(){
    try{var m=typeof menu==='function'?menu():null;if(!m||!Array.isArray(m.items))return -1;return m.items.findIndex(function(x){return x.id===currentItemId})}catch(e){return -1}
  }
  function isLastItem(){try{var m=typeof menu==='function'?menu():null,i=currentIndex();return !!(m&&i>=0&&i===m.items.length-1)}catch(e){return false}}

  function removeOldFields(){
    var oldRest=document.getElementById('restSeconds');
    if(oldRest){var restLabel=oldRest.closest('label');if(restLabel)restLabel.style.display='none';else oldRest.style.display='none'}
    var oldWork=document.getElementById('itemSeconds');
    if(oldWork){var workLabel=oldWork.closest('label');if(workLabel)workLabel.style.display='none';else oldWork.style.display='none'}
  }

  function setSelected(wheel,value,withTick){
    var old=wheel.dataset.selected||'';
    wheel.dataset.selected=String(value);
    Array.prototype.forEach.call(wheel.children,function(el){el.classList.toggle('selected',+el.dataset.value===value)});
    if(withTick&&old&&old!==String(value))tick();
  }

  function writeValue(kind,value){
    try{
      var x=typeof item==='function'?item():null;if(!x)return;
      if(kind==='rest')value=clampRest(value);else value=clampWork(value);
      var key=kind==='rest'?'restSeconds':'seconds';
      if(+x[key]===value)return;
      x[key]=value;
      if(typeof save==='function')save();
      if(kind==='work'&&typeof updateDuration==='function')updateDuration();
    }catch(e){console.error(e)}
  }

  function buildWheel(kind,value,max){
    var wrap=document.createElement('div');
    wrap.className='item-time-wheel-wrap';
    var wheel=document.createElement('div');
    wheel.className='item-time-wheel';
    var unit=document.createElement('span');unit.className='item-time-unit';unit.textContent='秒';
    wrap.append(wheel,unit);
    var min=1,frag=document.createDocumentFragment();
    for(var n=min;n<=max;n++){
      var opt=document.createElement('div');opt.className='item-time-option';opt.dataset.value=String(n);opt.textContent=String(n);frag.appendChild(opt);
    }
    wheel.appendChild(frag);
    value=kind==='rest'?clampRest(value):clampWork(value);
    setSelected(wheel,value,false);
    requestAnimationFrame(function(){wheel.scrollTop=(value-min)*ROW_H});

    wheel.addEventListener('pointerdown',ensureAudio,{passive:true});
    wheel.addEventListener('touchstart',ensureAudio,{passive:true});
    wheel.addEventListener('scroll',function(){
      var next=Math.round(wheel.scrollTop/ROW_H)+min;
      next=kind==='rest'?clampRest(next):clamp(next,min,max,value);
      setSelected(wheel,next,true);
      clearTimeout(saveTimer);
      saveTimer=setTimeout(function(){writeValue(kind,next)},90);
    },{passive:true});
    wheel.addEventListener('click',function(e){
      var opt=e.target.closest('.item-time-option');if(!opt)return;
      var next=+opt.dataset.value;
      wheel.scrollTo({top:(next-min)*ROW_H,behavior:'smooth'});
    });
    return wrap;
  }

  function decorateItemTimes(){
    removeOldFields();
    var screen=document.getElementById('itemEdit');if(!screen)return;
    var stack=screen.querySelector('.stack');if(!stack)return;
    var old=document.getElementById('itemTimeFields');if(old)old.remove();
    var x=typeof item==='function'?item():null;if(!x)return;
    if(!Number.isFinite(+x.restSeconds))x.restSeconds=DEFAULT_REST;
    if(!Number.isFinite(+x.seconds))x.seconds=30;
    x.restSeconds=clampRest(x.restSeconds);x.seconds=clampWork(x.seconds);

    var row=document.createElement('div');row.id='itemTimeFields';
    var workField=document.createElement('div');workField.className='item-time-field';
    var workLabel=document.createElement('div');workLabel.className='item-time-label';workLabel.textContent='運動時間';
    var workMax=Math.max(DEFAULT_WORK_MAX,Math.min(MAX_WORK,x.seconds));
    workField.append(workLabel,buildWheel('work',x.seconds,workMax));

    var restField=document.createElement('div');restField.className='item-time-field';
    var restLabel=document.createElement('div');restLabel.className='item-time-label';restLabel.textContent='休憩時間';
    restField.appendChild(restLabel);
    if(isLastItem()){
      var last=document.createElement('div');last.className='item-time-last';last.textContent='最後の種目のため休憩なし';restField.appendChild(last);
    }else restField.appendChild(buildWheel('rest',x.restSeconds,MAX_REST));
    row.append(workField,restField);

    var seconds=document.getElementById('itemSeconds'),secondsLabel=seconds&&seconds.closest('label');
    if(secondsLabel)secondsLabel.insertAdjacentElement('afterend',row);else stack.insertBefore(row,stack.children[2]||null);
  }

  ensureData();removeOldFields();

  if(typeof totalSeconds==='function'){
    totalSeconds=function(m){
      if(!m||!Array.isArray(m.items))return 0;
      return m.items.reduce(function(sum,x,i){return sum+Math.max(1,+x.seconds||1)+(i<m.items.length-1?clampRest(x.restSeconds):0)},0);
    };
  }

  if(typeof advance==='function'){
    advance=function(){
      var m=typeof menu==='function'?menu():null;if(!m||!timerState)return;
      if(timerState.phase==='item'&&timerState.index<m.items.length-1){
        var current=m.items[timerState.index],rest=clampRest(current&&current.restSeconds);
        timerState.phase='rest';timerState.remaining=rest;timerState.total=rest;return;
      }
      timerState.index++;
      if(timerState.index>=m.items.length){if(typeof finishTimer==='function')finishTimer();return}
      timerState.phase='item';timerState.remaining=m.items[timerState.index].seconds;timerState.total=m.items[timerState.index].seconds;
    };
  }

  if(typeof syncPayload==='function'){
    syncPayload=function(){
      return JSON.stringify({schemaVersion:2,updatedAt:state.updatedAt||Date.now(),menus:state.menus.map(function(m){
        var copy={};Object.keys(m).forEach(function(k){if(k!=='items')copy[k]=m[k]});
        copy.items=(m.items||[]).map(function(x){return {id:x.id,name:x.name,seconds:clampWork(x.seconds),restSeconds:clampRest(x.restSeconds),desc:x.desc,photoData:x.photo||''}});return copy;
      })});
    };
  }

  var previousOpenItem=typeof openItem==='function'?openItem:null;
  if(previousOpenItem){openItem=function(){var r=previousOpenItem.apply(this,arguments);var x=typeof item==='function'?item():null;if(x&&!Number.isFinite(+x.restSeconds)){x.restSeconds=DEFAULT_REST;if(typeof save==='function')save(false)}setTimeout(decorateItemTimes,0);return r}};

  var previousRenderItems=typeof renderItems==='function'?renderItems:null;
  if(previousRenderItems){
    renderItems=function(){
      var r=previousRenderItems.apply(this,arguments);
      try{var m=typeof menu==='function'?menu():null;if(m&&Array.isArray(m.items))setTimeout(function(){
        document.querySelectorAll('#itemList .item').forEach(function(el,i){var meta=el.querySelector('.muted'),x=m.items[i];if(meta&&x)meta.textContent=i===m.items.length-1?x.seconds+'秒':x.seconds+'秒 ・ 休憩'+clampRest(x.restSeconds)+'秒'});
      },0)}catch(e){}return r;
    };
  }

  setTimeout(function(){removeOldFields();if(typeof currentScreen!=='undefined'&&currentScreen==='itemEdit')decorateItemTimes()},0);
})();
