(function(){
  function uid2(){return typeof uid==='function'?uid():(Date.now()+Math.random().toString(16).slice(2))}
  function currentMenu(){try{return typeof menu==='function'?menu():null}catch(e){return null}}

  var style=document.createElement('style');
  style.setAttribute('data-card-motion-reorder-v30','');
  style.textContent='\
.menu-card,.item{-webkit-user-select:none!important;user-select:none!important;-webkit-touch-callout:none!important;-webkit-tap-highlight-color:transparent!important}\
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

  function reveal(selector,id){setTimeout(function(){var card=document.querySelector(selector+'[data-id="'+id+'"]');if(!card)return;card.classList.remove('card-added');void card.offsetWidth;card.classList.add('card-added');if(card.scrollIntoView)card.scrollIntoView({behavior:'smooth',block:'nearest'});setTimeout(function(){card.classList.remove('card-added')},280)},50)}
  function addRoutine(){if(typeof state==='undefined'||!state||!Array.isArray(state.menus))return;var id=uid2();state.menus.push({id:id,name:'ルーティン'+(state.menus.length+1),desc:'',rest:15,items:[]});if(typeof save==='function')save();if(typeof renderHome==='function')renderHome();reveal('.menu-card',id)}
  function addItem(){var m=currentMenu();if(!m||!Array.isArray(m.items))return;var id=uid2();m.items.push({id:id,name:'新しい種目',seconds:30,desc:'',photo:''});if(typeof save==='function')save();if(typeof renderItems==='function')renderItems();if(typeof updateDuration==='function')updateDuration();reveal('.item',id)}
  function deleteRoutineById(id){if(typeof state==='undefined'||!state||!Array.isArray(state.menus))return;var i=state.menus.findIndex(function(x){return x.id===id});if(i<0)return;state.menus.splice(i,1);if(typeof save==='function')save();if(typeof renderHome==='function')renderHome()}
  function deleteItemById(id){var m=currentMenu();if(!m||!Array.isArray(m.items))return;var i=m.items.findIndex(function(x){return x.id===id});if(i<0)return;m.items.splice(i,1);if(typeof save==='function')save();if(typeof renderItems==='function')renderItems();if(typeof updateDuration==='function')updateDuration()}
  function animateDelete(card,done){if(!card){done();return}var h=card.getBoundingClientRect().height;card.classList.add('card-removing');card.style.height=h+'px';card.style.opacity='1';requestAnimationFrame(function(){requestAnimationFrame(function(){card.style.height='0px';card.style.opacity='0';card.style.transform='scale(.985)';card.style.paddingTop='0';card.style.paddingBottom='0';card.style.marginTop='0';card.style.marginBottom='0'})});setTimeout(done,185)}
  function deleteCurrentRoutine(){if(typeof currentMenuId!=='undefined')deleteRoutineById(currentMenuId)}
  function deleteCurrentItem(){if(typeof currentItemId==='undefined')return;var id=currentItemId;deleteItemById(id);if(typeof openMenu==='function'&&typeof currentMenuId!=='undefined')openMenu(currentMenuId)}

  function clearTargets(){document.querySelectorAll('.reorder-before,.reorder-after').forEach(function(x){x.classList.remove('reorder-before','reorder-after')})}
  function settleCard(selector,id){setTimeout(function(){var el=document.querySelector(selector+'[data-id="'+id+'"]');if(!el)return;el.classList.remove('reorder-settle');void el.offsetWidth;el.classList.add('reorder-settle');setTimeout(function(){el.classList.remove('reorder-settle')},230)},30)}
  function reorderDirect(type,id,targetId,before){var m=currentMenu();var arr=type==='menu'?(typeof state!=='undefined'&&state?state.menus:null):(m&&m.items);if(!arr)return;var from=arr.findIndex(function(x){return x.id===id}),to=arr.findIndex(function(x){return x.id===targetId});if(from<0||to<0||from===to)return;var moved=arr.splice(from,1)[0];to=arr.findIndex(function(x){return x.id===targetId});arr.splice(before?to:to+1,0,moved);if(typeof save==='function')save();if(type==='menu'){if(typeof renderHome==='function')renderHome()}else{if(typeof renderItems==='function')renderItems();if(typeof updateDuration==='function')updateDuration()}}

  var held=null,holdTimer=null,dragging=false,target=null,before=true,startX=0,startY=0,type='',selector='';
  function resetGesture(){clearTimeout(holdTimer);holdTimer=null;clearTargets();if(held)held.classList.remove('reorder-held');held=null;target=null;dragging=false;type='';selector=''}

  document.addEventListener('dragstart',function(e){if(e.target&&e.target.closest&&e.target.closest('.menu-card,.item'))e.preventDefault()},true);
  document.addEventListener('selectstart',function(e){if(e.target&&e.target.closest&&e.target.closest('.menu-card,.item'))e.preventDefault()},true);

  document.addEventListener('touchstart',function(e){
    if(e.touches.length!==1)return;
    var card=e.target&&e.target.closest?e.target.closest('.menu-card,.item'):null;
    if(!card||e.target.closest('button'))return;
    card.draggable=false;card.removeAttribute('draggable');
    resetGesture();held=card;type=card.classList.contains('menu-card')?'menu':'item';selector=type==='menu'?'.menu-card':'.item';startX=e.touches[0].clientX;startY=e.touches[0].clientY;
    holdTimer=setTimeout(function(){if(!held)return;dragging=true;held.classList.remove('swipe-open','swipe-copy-open');held.classList.add('reorder-held');if(navigator.vibrate)navigator.vibrate(25)},420);
  },{passive:true,capture:true});

  document.addEventListener('touchmove',function(e){
    if(!held||e.touches.length!==1)return;
    var t=e.touches[0],dx=t.clientX-startX,dy=t.clientY-startY;
    if(!dragging){if(Math.hypot(dx,dy)>16){clearTimeout(holdTimer);holdTimer=null;held=null}return}
    if(e.cancelable)e.preventDefault();e.stopImmediatePropagation();clearTargets();target=null;
    var cards=Array.prototype.slice.call(document.querySelectorAll(selector)).filter(function(x){return x!==held});if(!cards.length)return;
    var best=null,bestDist=Infinity,bestBefore=true;
    cards.forEach(function(card){var r=card.getBoundingClientRect(),mid=r.top+r.height/2,dist=Math.abs(t.clientY-mid);if(dist<bestDist){bestDist=dist;best=card;bestBefore=t.clientY<mid}});
    if(best){target=best;before=bestBefore;best.classList.add(before?'reorder-before':'reorder-after')}
  },{passive:false,capture:true});

  function finishGesture(e){
    if(!held)return;clearTimeout(holdTimer);holdTimer=null;
    if(!dragging){held=null;return}
    if(e&&e.stopImmediatePropagation)e.stopImmediatePropagation();var id=held.dataset.id,toId=target&&target.dataset.id,sel=selector,tp=type,bf=before;
    clearTargets();held.classList.remove('reorder-held');held=null;target=null;dragging=false;type='';selector='';
    if(toId){reorderDirect(tp,id,toId,bf);settleCard(sel,id)}
  }
  document.addEventListener('touchend',finishGesture,{passive:true,capture:true});
  document.addEventListener('touchcancel',finishGesture,{passive:true,capture:true});

  document.addEventListener('click',function(e){var t=e.target&&e.target.closest?e.target.closest('button'):null;if(!t)return;if(t.id==='addMenuHome'){e.preventDefault();e.stopImmediatePropagation();addRoutine();return}if(t.id==='addItemBtn'){e.preventDefault();e.stopImmediatePropagation();addItem();return}if(t.classList.contains('swipe-delete')){var card=t.closest('.menu-card,.item');if(!card)return;e.preventDefault();e.stopImmediatePropagation();var id=card.dataset.id,isMenu=card.classList.contains('menu-card');animateDelete(card,function(){if(isMenu)deleteRoutineById(id);else deleteItemById(id)});return}if(t.id==='deleteMenuBtn'){e.preventDefault();e.stopImmediatePropagation();deleteCurrentRoutine();return}if(t.id==='deleteItemBtn'){e.preventDefault();e.stopImmediatePropagation();deleteCurrentItem();return}},true);
})();
