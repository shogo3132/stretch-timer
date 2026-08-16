(function(){
  function uid2(){return typeof uid==='function'?uid():(Date.now()+Math.random().toString(16).slice(2))}
  function currentMenu(){try{return typeof menu==='function'?menu():null}catch(e){return null}}

  var style=document.createElement('style');
  style.setAttribute('data-v21-card-motion','');
  style.textContent='\
.menu-card.reorder-target,.item.reorder-target{overflow:visible!important}\
.menu-card.reorder-target::before,.item.reorder-target::before{content:"";position:absolute;left:8px;right:8px;top:-8px;height:3px;border-radius:3px;background:#27ae8b;z-index:80;pointer-events:none}\
.menu-card.reorder-target::after,.item.reorder-target::after{content:"";position:absolute;left:3px;top:-11px;width:9px;height:9px;border-radius:50%;background:#27ae8b;z-index:81;pointer-events:none}\
.menu-card.reorder-held,.item.reorder-held{opacity:.72;transform:scale(.99);transition:opacity .12s ease,transform .12s ease}\
@keyframes reorderSettle{0%{opacity:.72;transform:translateY(5px) scale(.995)}100%{opacity:1;transform:translateY(0) scale(1)}}\
.reorder-settle{animation:reorderSettle .20s ease-out both}\
.card-removing{overflow:hidden!important;transition:height .18s ease,opacity .15s ease,transform .18s ease,padding .18s ease,margin .18s ease!important}\
.card-removing>*{pointer-events:none}\
';
  document.head.appendChild(style);

  function reveal(selector,id){
    setTimeout(function(){
      var card=document.querySelector(selector+'[data-id="'+id+'"]');
      if(!card)return;
      card.classList.remove('card-added');void card.offsetWidth;card.classList.add('card-added');
      if(card.scrollIntoView)card.scrollIntoView({behavior:'smooth',block:'nearest'});
      setTimeout(function(){card.classList.remove('card-added')},280);
    },50);
  }

  function addRoutine(){
    if(typeof state==='undefined'||!state||!Array.isArray(state.menus))return;
    var id=uid2();
    state.menus.push({id:id,name:'ルーティン'+(state.menus.length+1),desc:'',rest:15,items:[]});
    if(typeof save==='function')save();
    if(typeof renderHome==='function')renderHome();
    reveal('.menu-card',id);
  }

  function addItem(){
    var m=currentMenu();if(!m||!Array.isArray(m.items))return;
    var id=uid2();
    m.items.push({id:id,name:'新しい種目',seconds:30,desc:'',photo:''});
    if(typeof save==='function')save();
    if(typeof renderItems==='function')renderItems();
    if(typeof updateDuration==='function')updateDuration();
    reveal('.item',id);
  }

  function deleteRoutineById(id){
    if(typeof state==='undefined'||!state||!Array.isArray(state.menus))return;
    var i=state.menus.findIndex(function(x){return x.id===id});if(i<0)return;
    state.menus.splice(i,1);
    if(typeof save==='function')save();
    if(typeof renderHome==='function')renderHome();
  }

  function deleteItemById(id){
    var m=currentMenu();if(!m||!Array.isArray(m.items))return;
    var i=m.items.findIndex(function(x){return x.id===id});if(i<0)return;
    m.items.splice(i,1);
    if(typeof save==='function')save();
    if(typeof renderItems==='function')renderItems();
    if(typeof updateDuration==='function')updateDuration();
  }

  function animateDelete(card,done){
    if(!card){done();return}
    var h=card.getBoundingClientRect().height;
    card.classList.add('card-removing');
    card.style.height=h+'px';
    card.style.opacity='1';
    requestAnimationFrame(function(){requestAnimationFrame(function(){
      card.style.height='0px';card.style.opacity='0';card.style.transform='scale(.985)';card.style.paddingTop='0';card.style.paddingBottom='0';card.style.marginTop='0';card.style.marginBottom='0';
    })});
    setTimeout(done,185);
  }

  function deleteCurrentRoutine(){
    if(typeof currentMenuId==='undefined')return;
    deleteRoutineById(currentMenuId);
  }

  function deleteCurrentItem(){
    if(typeof currentItemId==='undefined')return;
    var id=currentItemId;
    deleteItemById(id);
    if(typeof openMenu==='function'&&typeof currentMenuId!=='undefined')openMenu(currentMenuId);
  }

  function clearTargets(){document.querySelectorAll('.reorder-target').forEach(function(x){x.classList.remove('reorder-target')})}
  function settleCard(selector,id){
    setTimeout(function(){
      var el=document.querySelector(selector+'[data-id="'+id+'"]');if(!el)return;
      el.classList.remove('reorder-settle');void el.offsetWidth;el.classList.add('reorder-settle');
      setTimeout(function(){el.classList.remove('reorder-settle')},230);
    },30);
  }

  function installReorder(el,type){
    if(!el||el.dataset.reorderV21==='1')return;
    el.dataset.reorderV21='1';
    var id=el.dataset.id;if(!id)return;
    var hold=null,dragging=false,target=null,sx=0,sy=0;
    var selector=type==='menu'?'.menu-card':'.item';

    el.addEventListener('touchstart',function(e){
      if(e.touches.length!==1||e.target.closest('button'))return;
      sx=e.touches[0].clientX;sy=e.touches[0].clientY;target=null;
      clearTimeout(hold);
      hold=setTimeout(function(){
        dragging=true;el.classList.add('reorder-held');
        if(navigator.vibrate)navigator.vibrate(25);
      },430);
    },{passive:true,capture:true});

    el.addEventListener('touchmove',function(e){
      if(e.touches.length!==1)return;
      var t=e.touches[0],dx=t.clientX-sx,dy=t.clientY-sy;
      if(!dragging){if(Math.hypot(dx,dy)>14)clearTimeout(hold);return}
      if(e.cancelable)e.preventDefault();
      e.stopImmediatePropagation();
      var hit=document.elementFromPoint(t.clientX,t.clientY);hit=hit&&hit.closest(selector);
      clearTargets();target=null;
      if(hit&&hit!==el){hit.classList.add('reorder-target');target=hit}
    },{passive:false,capture:true});

    el.addEventListener('touchend',function(e){
      clearTimeout(hold);
      if(!dragging)return;
      e.stopImmediatePropagation();
      var toId=target&&target.dataset.id;
      clearTargets();el.classList.remove('reorder-held');dragging=false;target=null;
      if(toId&&typeof moveByIds==='function'){
        moveByIds(type,id,toId);
        settleCard(selector,id);
      }
    },{passive:true,capture:true});

    el.addEventListener('touchcancel',function(e){
      clearTimeout(hold);
      if(dragging)e.stopImmediatePropagation();
      clearTargets();el.classList.remove('reorder-held');dragging=false;target=null;
    },{passive:true,capture:true});
  }

  function installReorderAll(){
    document.querySelectorAll('.menu-card').forEach(function(el){installReorder(el,'menu')});
    document.querySelectorAll('.item').forEach(function(el){installReorder(el,'item')});
  }

  if(typeof renderHome==='function'){
    var prevHome=renderHome;
    renderHome=function(){var r=prevHome.apply(this,arguments);setTimeout(installReorderAll,0);return r};
  }
  if(typeof renderItems==='function'){
    var prevItems=renderItems;
    renderItems=function(){var r=prevItems.apply(this,arguments);setTimeout(installReorderAll,0);return r};
  }
  if(typeof show==='function'){
    var prevShow=show;
    show=function(){var r=prevShow.apply(this,arguments);setTimeout(installReorderAll,0);return r};
  }
  setTimeout(installReorderAll,0);

  document.addEventListener('click',function(e){
    var t=e.target&&e.target.closest?e.target.closest('button'):null;
    if(!t)return;

    if(t.id==='addMenuHome'){
      e.preventDefault();e.stopImmediatePropagation();addRoutine();return;
    }
    if(t.id==='addItemBtn'){
      e.preventDefault();e.stopImmediatePropagation();addItem();return;
    }
    if(t.classList.contains('swipe-delete')){
      var card=t.closest('.menu-card,.item');if(!card)return;
      e.preventDefault();e.stopImmediatePropagation();
      var id=card.dataset.id,isMenu=card.classList.contains('menu-card');
      animateDelete(card,function(){if(isMenu)deleteRoutineById(id);else deleteItemById(id)});
      return;
    }
    if(t.id==='deleteMenuBtn'){
      e.preventDefault();e.stopImmediatePropagation();deleteCurrentRoutine();return;
    }
    if(t.id==='deleteItemBtn'){
      e.preventDefault();e.stopImmediatePropagation();deleteCurrentItem();return;
    }
  },true);
})();
