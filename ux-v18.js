(function(){
  function uid2(){return typeof uid==='function'?uid():(Date.now()+Math.random().toString(16).slice(2))}
  function currentMenu(){try{return typeof menu==='function'?menu():null}catch(e){return null}}

  var style=document.createElement('style');
  style.setAttribute('data-card-motion-reorder-v31','');
  style.textContent='\
.menu-card,.item{-webkit-user-select:none!important;user-select:none!important;-webkit-touch-callout:none!important;-webkit-tap-highlight-color:transparent!important}\
.menu-card.reorder-held,.item.reorder-held{opacity:.94!important;transform:translateY(-3px) scale(1.015)!important;box-shadow:0 10px 24px rgba(20,28,36,.16),0 2px 7px rgba(20,28,36,.10)!important;outline:2px solid rgba(39,174,139,.16);transition:opacity .12s ease,transform .12s ease,box-shadow .12s ease,outline-color .12s ease;z-index:70}\
@keyframes reorderSettle{0%{opacity:.9;transform:translateY(4px) scale(1.008);box-shadow:0 7px 18px rgba(20,28,36,.12)}100%{opacity:1;transform:translateY(0) scale(1);box-shadow:0 1px 2px rgba(0,0,0,.04)}}\
.reorder-settle{animation:reorderSettle .20s ease-out both}\
.card-removing{overflow:hidden!important;transition:height .18s ease,opacity .15s ease,transform .18s ease,padding .18s ease,margin .18s ease!important}\
.card-removing>*{pointer-events:none}\
';
  document.head.appendChild(style);

  function reveal(selector,id){setTimeout(function(){var card=document.querySelector(selector+'[data-id="'+id+'"]');if(!card)return;card.classList.remove('card-added');void card.offsetWidth;card.classList.add('card-added');if(card.scrollIntoView)card.scrollIntoView({behavior:'smooth',block:'nearest'});setTimeout(function(){card.classList.remove('card-added')},280)},50)}
  function addRoutine(){if(typeof state==='undefined'||!state||!Array.isArray(state.menus))return;var id=uid2();state.menus.push({id:id,name:'メニュー'+(state.menus.length+1),desc:'',rest:15,items:[]});if(typeof save==='function')save();if(typeof renderHome==='function')renderHome();reveal('.menu-card',id)}
  function addItem(){var m=currentMenu();if(!m||!Array.isArray(m.items))return;var id=uid2();m.items.push({id:id,name:'新しい項目',seconds:30,desc:'',photo:''});if(typeof save==='function')save();if(typeof renderItems==='function')renderItems();if(typeof updateDuration==='function')updateDuration();reveal('.item',id)}
  function confirmRoutineDelete(id){
    if(typeof state==='undefined'||!state||!Array.isArray(state.menus))return false;
    var routine=state.menus.find(function(x){return x.id===id});if(!routine)return false;
    return confirm('ルーティン「'+(routine.name||'名称未設定')+'」を削除しますか？\nこの操作は元に戻せません。');
  }
  function deleteRoutineById(id,confirmed){if(typeof state==='undefined'||!state||!Array.isArray(state.menus))return false;var i=state.menus.findIndex(function(x){return x.id===id});if(i<0)return false;if(!confirmed&&!confirmRoutineDelete(id))return false;state.menus.splice(i,1);if(typeof save==='function')save();if(typeof renderHome==='function')renderHome();return true}
  function deleteItemById(id){var m=currentMenu();if(!m||!Array.isArray(m.items))return;var i=m.items.findIndex(function(x){return x.id===id});if(i<0)return;m.items.splice(i,1);if(typeof save==='function')save();if(typeof renderItems==='function')renderItems();if(typeof updateDuration==='function')updateDuration()}
  function animateDelete(card,done){if(!card){done();return}var h=card.getBoundingClientRect().height;card.classList.add('card-removing');card.style.height=h+'px';card.style.opacity='1';requestAnimationFrame(function(){requestAnimationFrame(function(){card.style.height='0px';card.style.opacity='0';card.style.transform='scale(.985)';card.style.paddingTop='0';card.style.paddingBottom='0';card.style.marginTop='0';card.style.marginBottom='0'})});setTimeout(done,185)}
  function deleteCurrentRoutine(){if(typeof currentMenuId!=='undefined')deleteRoutineById(currentMenuId)}
  function deleteCurrentItem(){if(typeof currentItemId==='undefined')return;var id=currentItemId;deleteItemById(id);if(typeof openMenu==='function'&&typeof currentMenuId!=='undefined')openMenu(currentMenuId)}

  function settleCard(selector,id){setTimeout(function(){var el=document.querySelector(selector+'[data-id="'+id+'"]');if(!el)return;el.classList.remove('reorder-settle');void el.offsetWidth;el.classList.add('reorder-settle');setTimeout(function(){el.classList.remove('reorder-settle')},230)},30)}
  function reorderDirect(type,id,targetId,before){var m=currentMenu(),arr=type==='menu'?(typeof state!=='undefined'&&state?state.menus:null):(m&&m.items);if(!arr||!window.StretchUI||!StretchUI.reorderCollection||!StretchUI.reorderCollection(arr,id,targetId,before))return;if(typeof save==='function')save();if(type==='menu'){if(typeof renderHome==='function')renderHome()}else{if(typeof renderItems==='function')renderItems();if(typeof updateDuration==='function')updateDuration()}}

  if(window.StretchUI&&StretchUI.registerReorder){
    StretchUI.registerReorder({key:'routine-cards',selector:'.menu-card',ignore:'button,input,textarea,select,a',label:function(card){var title=card.querySelector('.menu-title');return title?title.textContent:'ルーティン'},onReorder:function(move){reorderDirect('menu',move.id,move.targetId,move.before);settleCard('.menu-card',move.id)}});
    StretchUI.registerReorder({key:'item-cards',selector:'.item',ignore:'button,input,textarea,select,a',label:function(card){var title=card.querySelector('.item-title');return title?title.textContent:'項目'},onReorder:function(move){reorderDirect('item',move.id,move.targetId,move.before);settleCard('.item',move.id)}});
  }

  document.addEventListener('click',function(e){var t=e.target&&e.target.closest?e.target.closest('button'):null;if(!t)return;if(t.id==='addMenuHome'){e.preventDefault();e.stopImmediatePropagation();addRoutine();return}if(t.id==='addItemBtn'){e.preventDefault();e.stopImmediatePropagation();addItem();return}if(t.classList.contains('swipe-delete')){var card=t.closest('.menu-card,.item');if(!card)return;e.preventDefault();e.stopImmediatePropagation();var id=card.dataset.id,isMenu=card.classList.contains('menu-card');if(isMenu&&!confirmRoutineDelete(id)){card.classList.remove('swipe-open');return}animateDelete(card,function(){if(isMenu)deleteRoutineById(id,true);else deleteItemById(id)});return}if(t.id==='deleteMenuBtn'){e.preventDefault();e.stopImmediatePropagation();deleteCurrentRoutine();return}if(t.id==='deleteItemBtn'){e.preventDefault();e.stopImmediatePropagation();deleteCurrentItem();return}},true);
})();
