(function(){
  if(window.__timeWheelInitFixV74)return;
  window.__timeWheelInitFixV74=true;

  function currentItemSafe(){
    try{return typeof item==='function'?item():null}catch(e){return null}
  }

  function desiredValue(wheel,index,x){
    var field=wheel.closest('.item-time-field');
    var label=field&&field.querySelector('.item-time-label');
    var text=String(label&&label.textContent||'');
    if(text.indexOf('休憩')>=0)return Math.max(1,Math.min(60,Math.round(+x.restSeconds||20)));
    if(text.indexOf('運動')>=0)return Math.max(1,Math.min(3600,Math.round(+x.seconds||30)));
    return index===0?Math.max(1,Math.min(3600,Math.round(+x.seconds||30))):Math.max(1,Math.min(60,Math.round(+x.restSeconds||20)));
  }

  function patchWheel(wheel,index,x){
    if(!wheel||wheel.dataset.initValueFix==='1')return;
    wheel.dataset.initValueFix='1';
    var value=desiredValue(wheel,index,x),rowH=40;
    var blocking=true;
    function blockInitialScroll(e){if(blocking)e.stopImmediatePropagation()}
    wheel.addEventListener('scroll',blockInitialScroll,true);

    function place(){
      wheel.dataset.selected=String(value);
      Array.prototype.forEach.call(wheel.children,function(el){
        el.classList.toggle('selected',+el.dataset.value===value);
      });
      wheel.scrollTop=(value-1)*rowH;
    }

    place();
    requestAnimationFrame(function(){
      place();
      requestAnimationFrame(function(){
        place();
        setTimeout(function(){
          place();
          blocking=false;
          wheel.removeEventListener('scroll',blockInitialScroll,true);
        },80);
      });
    });
  }

  function fixCurrent(){
    var row=document.getElementById('itemTimeFields');
    var x=currentItemSafe();
    if(!row||!x)return;
    var wheels=row.querySelectorAll('.item-time-wheel');
    wheels.forEach(function(wheel,index){patchWheel(wheel,index,x)});
  }

  var screen=document.getElementById('itemEdit');
  if(screen){
    new MutationObserver(function(){fixCurrent()}).observe(screen,{childList:true,subtree:true});
  }

  var previousOpenItem=typeof openItem==='function'?openItem:null;
  if(previousOpenItem){
    openItem=function(){
      var r=previousOpenItem.apply(this,arguments);
      setTimeout(fixCurrent,0);
      setTimeout(fixCurrent,40);
      return r;
    };
  }

  setTimeout(fixCurrent,0);
})();
