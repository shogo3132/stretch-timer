(function(){
  if(window.__itemRestV59)return;
  window.__itemRestV59=true;

  var DEFAULT_REST=20;
  var MIN_REST=1;
  var MAX_REST=60;
  var ROW_H=52;
  var saveTimer=null;

  var style=document.createElement('style');
  style.setAttribute('data-item-rest-v59','');
  style.textContent='\
#itemRestField{display:grid;gap:8px}\
#itemRestField .item-rest-label{color:#48505a;font-size:14px}\
.item-rest-wheel-wrap{position:relative;height:156px;border-radius:18px;background:#fff;outline:1px solid #edf0f2;overflow:hidden}\
.item-rest-wheel-wrap:before,.item-rest-wheel-wrap:after{content:"";position:absolute;left:12px;right:12px;height:1px;background:#e4e8eb;z-index:2;pointer-events:none}\
.item-rest-wheel-wrap:before{top:52px}.item-rest-wheel-wrap:after{bottom:52px}\
.item-rest-wheel{height:156px;overflow-y:auto;scroll-snap-type:y mandatory;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;scrollbar-width:none;padding:52px 0;mask-image:linear-gradient(to bottom,transparent 0,#000 28%,#000 72%,transparent 100%);-webkit-mask-image:linear-gradient(to bottom,transparent 0,#000 28%,#000 72%,transparent 100%)}\
.item-rest-wheel::-webkit-scrollbar{display:none}\
.item-rest-option{height:52px;display:flex;align-items:center;justify-content:center;scroll-snap-align:center;font-size:21px;color:#9aa1a9;user-select:none;cursor:pointer;transition:font-size .12s ease,color .12s ease,font-weight .12s ease}\
.item-rest-option.selected{font-size:27px;font-weight:800;color:#1b1f24}\
.item-rest-unit{position:absolute;left:calc(50% + 26px);top:50%;transform:translateY(-50%);z-index:3;font-size:14px;color:#6e7680;pointer-events:none}\
.item-rest-last{padding:14px 16px;border-radius:16px;background:#f1f3f5;color:#6e7680;font-size:14px}\
';
  document.head.appendChild(style);

  function clampRest(v){
    v=Math.round(+v||DEFAULT_REST);
    return Math.max(MIN_REST,Math.min(MAX_REST,v));
  }

  function ensureData(){
    var changed=false;
    try{
      if(typeof state==='undefined'||!state||!Array.isArray(state.menus))return;
      state.menus.forEach(function(m){
        if(!Array.isArray(m.items))return;
        m.items.forEach(function(x){
          if(!Number.isFinite(+x.restSeconds)){
            x.restSeconds=DEFAULT_REST;
            changed=true;
          }else{
            var next=clampRest(x.restSeconds);
            if(next!==+x.restSeconds){x.restSeconds=next;changed=true}
          }
        });
      });
      if(changed&&typeof save==='function')save(false);
    }catch(e){console.error(e)}
  }

  function currentIndex(){
    try{
      var m=typeof menu==='function'?menu():null;
      if(!m||!Array.isArray(m.items))return -1;
      return m.items.findIndex(function(x){return x.id===currentItemId});
    }catch(e){return -1}
  }

  function isLastItem(){
    try{
      var m=typeof menu==='function'?menu():null;
      var i=currentIndex();
      return !!(m&&i>=0&&i===m.items.length-1);
    }catch(e){return false}
  }

  function removeOldMenuRest(){
    var old=document.getElementById('restSeconds');
    if(old){
      var label=old.closest('label');
      if(label)label.style.display='none';else old.style.display='none';
    }
  }

  function setSelected(wheel,value){
    value=clampRest(value);
    Array.prototype.forEach.call(wheel.children,function(el){
      el.classList.toggle('selected',+el.dataset.value===value);
    });
  }

  function writeRest(value){
    try{
      var x=typeof item==='function'?item():null;
      if(!x)return;
      value=clampRest(value);
      if(x.restSeconds===value)return;
      x.restSeconds=value;
      if(typeof save==='function')save();
    }catch(e){console.error(e)}
  }

  function decorateItemRest(){
    removeOldMenuRest();
    var screen=document.getElementById('itemEdit');
    if(!screen)return;
    var stack=screen.querySelector('.stack');
    if(!stack)return;
    var old=document.getElementById('itemRestField');
    if(old)old.remove();

    var x=typeof item==='function'?item():null;
    if(!x)return;
    if(!Number.isFinite(+x.restSeconds))x.restSeconds=DEFAULT_REST;
    x.restSeconds=clampRest(x.restSeconds);

    var field=document.createElement('div');
    field.id='itemRestField';
    field.className='field';
    var secondsField=document.getElementById('itemSeconds');
    var secondsLabel=secondsField&&secondsField.closest('label');

    if(isLastItem()){
      field.innerHTML='<span class="item-rest-label">次の種目まで</span><div class="item-rest-last">最後の種目のため休憩は入りません</div>';
    }else{
      field.innerHTML='<span class="item-rest-label">次の種目まで</span><div class="item-rest-wheel-wrap"><div class="item-rest-wheel" id="itemRestWheel"></div><span class="item-rest-unit">秒</span></div>';
      var wheel=field.querySelector('.item-rest-wheel');
      var frag=document.createDocumentFragment();
      for(var n=MIN_REST;n<=MAX_REST;n++){
        var opt=document.createElement('div');
        opt.className='item-rest-option';
        opt.dataset.value=String(n);
        opt.textContent=String(n);
        frag.appendChild(opt);
      }
      wheel.appendChild(frag);
      var value=clampRest(x.restSeconds);
      setSelected(wheel,value);
      requestAnimationFrame(function(){wheel.scrollTop=(value-MIN_REST)*ROW_H});

      function syncFromScroll(){
        var next=clampRest(Math.round(wheel.scrollTop/ROW_H)+MIN_REST);
        setSelected(wheel,next);
        clearTimeout(saveTimer);
        saveTimer=setTimeout(function(){writeRest(next)},120);
      }
      wheel.addEventListener('scroll',syncFromScroll,{passive:true});
      wheel.addEventListener('click',function(e){
        var opt=e.target.closest('.item-rest-option');
        if(!opt)return;
        var next=clampRest(opt.dataset.value);
        wheel.scrollTo({top:(next-MIN_REST)*ROW_H,behavior:'smooth'});
      });
    }

    if(secondsLabel)secondsLabel.insertAdjacentElement('afterend',field);
    else stack.insertBefore(field,stack.children[2]||null);
  }

  ensureData();
  removeOldMenuRest();

  if(typeof totalSeconds==='function'){
    totalSeconds=function(m){
      if(!m||!Array.isArray(m.items))return 0;
      return m.items.reduce(function(sum,x,i){
        var work=Math.max(1,+x.seconds||1);
        var rest=i<m.items.length-1?clampRest(x.restSeconds):0;
        return sum+work+rest;
      },0);
    };
  }

  if(typeof advance==='function'){
    advance=function(){
      var m=typeof menu==='function'?menu():null;
      if(!m||!timerState)return;
      if(timerState.phase==='item'&&timerState.index<m.items.length-1){
        var current=m.items[timerState.index];
        var rest=clampRest(current&&current.restSeconds);
        timerState.phase='rest';
        timerState.remaining=rest;
        timerState.total=rest;
        return;
      }
      timerState.index++;
      if(timerState.index>=m.items.length){
        if(typeof finishTimer==='function')finishTimer();
        return;
      }
      timerState.phase='item';
      timerState.remaining=m.items[timerState.index].seconds;
      timerState.total=m.items[timerState.index].seconds;
    };
  }

  if(typeof syncPayload==='function'){
    syncPayload=function(){
      return JSON.stringify({
        schemaVersion:2,
        updatedAt:state.updatedAt||Date.now(),
        menus:state.menus.map(function(m){
          var copy={};Object.keys(m).forEach(function(k){if(k!=='items')copy[k]=m[k]});
          copy.items=(m.items||[]).map(function(x){
            return {id:x.id,name:x.name,seconds:x.seconds,restSeconds:clampRest(x.restSeconds),desc:x.desc,photoData:x.photo||''};
          });
          return copy;
        })
      });
    };
  }

  var previousOpenItem=typeof openItem==='function'?openItem:null;
  if(previousOpenItem){
    openItem=function(){
      var r=previousOpenItem.apply(this,arguments);
      var x=typeof item==='function'?item():null;
      if(x&&!Number.isFinite(+x.restSeconds)){x.restSeconds=DEFAULT_REST;if(typeof save==='function')save(false)}
      setTimeout(decorateItemRest,0);
      return r;
    };
  }

  var previousRenderItems=typeof renderItems==='function'?renderItems:null;
  if(previousRenderItems){
    renderItems=function(){
      var r=previousRenderItems.apply(this,arguments);
      try{
        var m=typeof menu==='function'?menu():null;
        if(m&&Array.isArray(m.items)){
          setTimeout(function(){
            document.querySelectorAll('#itemList .item').forEach(function(el,i){
              var meta=el.querySelector('.muted');
              var x=m.items[i];
              if(meta&&x)meta.textContent=i===m.items.length-1?x.seconds+'秒':x.seconds+'秒 ・ 次まで'+clampRest(x.restSeconds)+'秒';
            });
          },0);
        }
      }catch(e){}
      return r;
    };
  }

  setTimeout(function(){removeOldMenuRest();if(typeof currentScreen!=='undefined'&&currentScreen==='itemEdit')decorateItemRest()},0);
})();
