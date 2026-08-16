(function(){
  function uid2(){return typeof uid==='function'?uid():(Date.now()+Math.random().toString(16).slice(2))}
  function currentMenu(){try{return typeof menu==='function'?menu():null}catch(e){return null}}

  var style=document.createElement('style');
  style.setAttribute('data-card-motion-reorder','');
  style.textContent='\
.menu-card.reorder-before,.item.reorder-before,.menu-card.reorder-after,.item.reorder-after{overflow:visible!important}\
.menu-card.reorder-before::before,.item.reorder-before::before,.menu-card.reorder-after::before,.item.reorder-after::before{content:"";position:absolute;left:8px;right:8px;height:3px;border-radius:3px;background:#27ae8b;z-index:80;pointer-events:none}\
.menu-card.reorder-before::after,.item.reorder-before::after,.menu-card.reorder-after::after,.item.reorder-after::after{content:"";position:absolute;left:3px;width:9px;height:9px;border-radius:50%;background:#27ae8b;z-index:81;pointer-events:none}\
.menu-card.reorder-before::before,.item.reorder-before::before{top:-8px}\
.menu-card.reorder-before::after,.item.reorder-before::after{top:-11px}\
.menu-card.reorder-after::before,.item.reorder-after::before{bottom:-8px}\
.menu-card.reorder-after::after,.item.reorder-after::after{bottom:-11px}\
.menu-card.reorder-held,.item.reorder-held{opacity:.72;transform:scale(.99)!important;transition:opacity .12s ease,transform .12s ease;z-index:70}\
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
    var id=uid2();state.menus.push({id:id,name:'ルーティン'+(state.menus.length+1),desc:'',rest:15,items:[]});
    if(typeof save==='function')save();if(typeof renderHome==='function')renderHome();reveal('.menu-card',id);
  }
  function addItem(){
    var m=currentMenu();if(!m||!Array.isArray(m.items))return;
    var id=uid2();m.items.push({id:id,name:'新しい種目',seconds:30,desc:'',photo:''});
    if(typeof save==='function')save();if(typeof renderItems==='function')renderItems();if(typeof updateDuration==='function')updateDuration();reveal('.item',id);
  }
  function deleteRoutineById(id){
    if(typeof state==='undefined'||!state||!Array.isArray(state.menus))return;var i=state.menus.findIndex(function(x){return x.id===id});if(i<0)return;
    state.menus.splice(i,1);if(typeof save==='function')save();if(typeof renderHome==='function')renderHome();
  }
  function deleteItemById(id){
    var m=currentMenu();if(!m||!Array.isArray(m.items))return;var i=m.items.findIndex(function(x){return x.id===id});if(i<0)return;
    m.items.splice(i,1);if(typeof save==='function')save();if(typeof renderItems==='function')renderItems();if(typeof updateDuration==='function')updateDuration();
  }
  function animateDelete(card,done){
    if(!card){done();return}var h=card.getBoundingClientRect().height;card.classList.add('card-removing');card.style.height=h+'px';card.style.opacity='1';
    requestAnimationFrame(function(){requestAnimationFrame(function(){card.style.height='0px';card.style.opacity='0';card.style.transform='scale(.985)';card.style.paddingTop='0';card.style.paddingBottom='0';card.style.marginTop='0';card.style.marginBottom='0'})});setTimeout(done,185);
  }
  function deleteCurrentRoutine(){if(typeof currentMenuId!=='undefined')deleteRoutineById(currentMenuId)}
  function deleteCurrentItem(){if(typeof currentItemId==='undefined')return;var id=currentItemId;deleteItemById(id);if(typeof openMenu==='function'&&typeof currentMenuId!=='undefined')openMenu(currentMenuId)}

  function clearTargets(){document.querySelectorAll('.reorder-before,.reorder-after').forEach(function(x){x.classList.remove('reorder-before','reorder-after')})}
  function settleCard(selector,id){setTimeout(function(){var el=document.querySelector(selector+'[data-id="'+id+'"]');if(!el)return;el.classList.remove('reorder-settle');void el.offsetWidth;el.classList.add('reorder-settle');setTimeout(function(){el.classList.remove('reorder-settle')},230)},30)}

  var savedHtmlOverflow='',savedBodyOverflow='';
  function lockScroll(){savedHtmlOverflow=document.documentElement.style.overflow;savedBodyOverflow=document.body.style.overflow;document.documentElement.style.overflow='hidden';document.body.style.overflow='hidden'}
  function unlockScroll(){document.documentElement.style.overflow=savedHtmlOverflow;document.body.style.overflow=savedBodyOverflow}

  function reorderDirect(type,id,targetId,before){
    var arr=type==='menu'?(typeof state!=='undefined'&&state?state.menus:null):(currentMenu()&&currentMenu().items);if(!arr)return;
    var from=arr.findIndex(function(x){return x.id===id}),to=arr.findIndex(function(x){return x.id===targetId});if(from<0||to<0||from===to)return;
    var moved=arr.splice(from,1)[0];to=arr.findIndex(function(x){return x.id===targetId});var insert=before?to:to+1;arr.splice(insert,0,moved);
    if(typeof save==='function')save();if(type==='menu'){if(typeof renderHome==='function')renderHome()}else{if(typeof renderItems==='function')renderItems();if(typeof updateDuration==='function')updateDuration()}
  }

  function installReorder(el,type){
    if(!el||el.dataset.reorderFixed==='1')return;el.dataset.reorderFixed='1';var id=el.dataset.id;if(!id)return;
    var hold=null,dragging=false,target=null,before=true,sx=0,sy=0;var selector=type==='menu'?'.menu-card':'.item';

    el.addEventListener('touchstart',function(e){
      if(e.touches.length!==1||e.target.closest('button'))return;sx=e.touches[0].clientX;sy=e.touches[0].clientY;target=null;clearTimeout(hold);
      hold=setTimeout(function(){dragging=true;el.classList.remove('swipe-open','swipe-copy-open');el.classList.add('reorder-held');lockScroll();if(navigator.vibrate)navigator.vibrate(25)},430);
    },{passive:true,capture:true});

    el.addEventListener('touchmove',function(e){
      if(e.touches.length!==1)return;var t=e.touches[0],dx=t.clientX-sx,dy=t.clientY-sy;
      if(!dragging){if(Math.hypot(dx,dy)>14)clearTimeout(hold);return}
      if(e.cancelable)e.preventDefault();e.stopImmediatePropagation();clearTargets();target=null;
      var cards=Array.prototype.slice.call(document.querySelectorAll(selector)).filter(function(x){return x!==el});
      if(!cards.length)return;
      var best=null,bestDist=Infinity,bestBefore=true;
      cards.forEach(function(card){var r=card.getBoundingClientRect(),mid=r.top+r.height/2,dist=Math.abs(t.clientY-mid);if(dist<bestDist){bestDist=dist;best=card;bestBefore=t.clientY<mid}});
      if(best){target=best;before=bestBefore;best.classList.add(before?'reorder-before':'reorder-after')}
    },{passive:false,capture:true});

    function finish(e,cancelled){
      clearTimeout(hold);if(!dragging)return;if(e&&e.stopImmediatePropagation)e.stopImmediatePropagation();var toId=target&&target.dataset.id;
      clearTargets();el.classList.remove('reorder-held');dragging=false;target=null;unlockScroll();
      if(!cancelled&&toId){reorderDirect(type,id,toId,before);settleCard(selector,id)}
    }
    el.addEventListener('touchend',function(e){finish(e,false)},{passive:true,capture:true});
    el.addEventListener('touchcancel',function(e){finish(e,true)},{passive:true,capture:true});
  }

  function installReorderAll(){document.querySelectorAll('.menu-card').forEach(function(el){installReorder(el,'menu')});document.querySelectorAll('.item').forEach(function(el){installReorder(el,'item')})}
  if(typeof renderHome==='function'){var prevHome=renderHome;renderHome=function(){var r=prevHome.apply(this,arguments);setTimeout(installReorderAll,0);return r}}
  if(typeof renderItems==='function'){var prevItems=renderItems;renderItems=function(){var r=prevItems.apply(this,arguments);setTimeout(installReorderAll,0);return r}}
  if(typeof show==='function'){var prevShow=show;show=function(){var r=prevShow.apply(this,arguments);setTimeout(installReorderAll,0);return r}}
  setTimeout(installReorderAll,0);

  document.addEventListener('click',function(e){
    var t=e.target&&e.target.closest?e.target.closest('button'):null;if(!t)return;
    if(t.id==='addMenuHome'){e.preventDefault();e.stopImmediatePropagation();addRoutine();return}
    if(t.id==='addItemBtn'){e.preventDefault();e.stopImmediatePropagation();addItem();return}
    if(t.classList.contains('swipe-delete')){var card=t.closest('.menu-card,.item');if(!card)return;e.preventDefault();e.stopImmediatePropagation();var id=card.dataset.id,isMenu=card.classList.contains('menu-card');animateDelete(card,function(){if(isMenu)deleteRoutineById(id);else deleteItemById(id)});return}
    if(t.id==='deleteMenuBtn'){e.preventDefault();e.stopImmediatePropagation();deleteCurrentRoutine();return}
    if(t.id==='deleteItemBtn'){e.preventDefault();e.stopImmediatePropagation();deleteCurrentItem();return}
  },true);
})();
