(function(){
  if(window.__desktopItemTimesV78)return;
  window.__desktopItemTimesV78=true;

  var MIN_WORK=1,MAX_WORK=3600,MIN_REST=1,MAX_REST=60;

  var style=document.createElement('style');
  style.setAttribute('data-desktop-item-times-v78','');
  style.textContent='\
.desktop-item-times{display:none}\
@media(min-width:700px){\
  #menuEdit .item{grid-template-columns:78px minmax(0,1fr) auto auto!important;gap:14px!important;min-height:102px}\
  #menuEdit .item>.muted{display:none!important}\
  #menuEdit .item .muted{display:none!important}\
  .desktop-item-times{display:flex;align-items:center;gap:12px;white-space:nowrap}\
  .desktop-item-time-field{display:flex;align-items:center;gap:5px;color:#66707b;font-size:12px}\
  .desktop-item-time-field input{width:58px;height:36px;border:1px solid #e2e7eb;border-radius:10px;background:#fff;color:#1b1f24;text-align:center;font-size:15px;font-weight:700;padding:4px 5px;outline:none}\
  .desktop-item-time-field input:focus{border-color:#27ae8b;box-shadow:0 0 0 2px rgba(39,174,139,.12)}\
  .desktop-item-time-unit{color:#7a838d;font-size:11px}\
}\
';
  document.head.appendChild(style);

  function clamp(v,min,max,fallback){
    v=Math.round(+v);
    if(!Number.isFinite(v))v=fallback;
    return Math.max(min,Math.min(max,v));
  }
  function currentMenu(){try{return typeof menu==='function'?menu():null}catch(e){return null}}

  function commitInput(input,item,kind){
    var key=kind==='work'?'seconds':'restSeconds';
    var next=kind==='work'?clamp(input.value,MIN_WORK,MAX_WORK,item.seconds||30):clamp(input.value,MIN_REST,MAX_REST,item.restSeconds||20);
    input.value=String(next);
    if(+item[key]===next)return;
    item[key]=next;
    if(typeof save==='function')save();
    if(typeof updateDuration==='function')updateDuration();
  }

  function makeField(item,kind){
    var field=document.createElement('label');
    field.className='desktop-item-time-field';
    var text=document.createElement('span');
    text.textContent=kind==='work'?'運動':'休憩';
    var input=document.createElement('input');
    input.type='number';
    input.inputMode='numeric';
    input.min=String(kind==='work'?MIN_WORK:MIN_REST);
    input.max=String(kind==='work'?MAX_WORK:MAX_REST);
    input.step='1';
    input.value=String(kind==='work'?clamp(item.seconds,MIN_WORK,MAX_WORK,30):clamp(item.restSeconds,MIN_REST,MAX_REST,20));
    input.setAttribute('aria-label',(kind==='work'?'運動時間':'休憩時間')+' 秒');
    var unit=document.createElement('span');unit.className='desktop-item-time-unit';unit.textContent='秒';
    field.append(text,input,unit);
    ['pointerdown','mousedown','touchstart','click'].forEach(function(name){field.addEventListener(name,function(e){e.stopPropagation()},{passive:name==='touchstart'})});
    input.addEventListener('change',function(){commitInput(input,item,kind)});
    input.addEventListener('keydown',function(e){
      if(e.key==='Enter'){e.preventDefault();commitInput(input,item,kind);input.blur()}
    });
    return field;
  }

  function enhance(){
    var m=currentMenu();
    if(!m||!Array.isArray(m.items))return;
    var cards=document.querySelectorAll('#menuEdit #itemList .item');
    cards.forEach(function(card,index){
      var item=m.items.find(function(x){return x.id===card.dataset.id})||m.items[index];
      if(!item)return;
      var old=card.querySelector('.desktop-item-times');
      if(old)old.remove();
      var controls=document.createElement('div');
      controls.className='desktop-item-times';
      controls.appendChild(makeField(item,'work'));
      if(index<m.items.length-1)controls.appendChild(makeField(item,'rest'));
      var actions=card.querySelector('.item-actions');
      if(actions)card.insertBefore(controls,actions);else card.appendChild(controls);
    });
  }

  var previousRenderItems=typeof renderItems==='function'?renderItems:null;
  if(previousRenderItems){
    renderItems=function(){
      var r=previousRenderItems.apply(this,arguments);
      setTimeout(enhance,0);
      return r;
    };
  }

  var previousShow=typeof show==='function'?show:null;
  if(previousShow){
    show=function(){
      var r=previousShow.apply(this,arguments);
      if(arguments[0]==='menuEdit')setTimeout(enhance,0);
      return r;
    };
  }

  window.addEventListener('resize',function(){if(innerWidth>=700)setTimeout(enhance,0)});
  setTimeout(enhance,100);
})();
