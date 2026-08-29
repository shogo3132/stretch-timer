(function(){
  if(window.StretchUI&&StretchUI.registerReorder)return;
  if(window.__desktopCardDndV46)return;
  window.__desktopCardDndV46=true;

  var fine=window.matchMedia&&window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  if(!fine)return;

  var style=document.createElement('style');
  style.setAttribute('data-desktop-dnd-v46','');
  style.textContent='\
@media (hover:hover) and (pointer:fine){\
  .menu-card.desktop-dnd-ready,.item.desktop-dnd-ready{cursor:grab!important}\
  .menu-card.desktop-dnd-ready:active,.item.desktop-dnd-ready:active{cursor:grabbing!important}\
  .desktop-dnd-ready.desktop-dragging{opacity:.72!important;transform:scale(.995)!important}\
}\
';
  document.head.appendChild(style);

  var dragging=null,type='',target=null,before=true;
  function arrFor(tp){
    if(tp==='menu')return typeof state!=='undefined'&&state&&Array.isArray(state.menus)?state.menus:null;
    try{var m=typeof menu==='function'?menu():null;return m&&Array.isArray(m.items)?m.items:null}catch(e){return null}
  }
  function clearTarget(){document.querySelectorAll('.reorder-before,.reorder-after').forEach(function(x){x.classList.remove('reorder-before','reorder-after')});target=null}
  function reorder(tp,id,targetId,bf){
    var arr=arrFor(tp);if(!arr)return;
    var from=arr.findIndex(function(x){return x.id===id}),to=arr.findIndex(function(x){return x.id===targetId});
    if(from<0||to<0||from===to)return;
    var moved=arr.splice(from,1)[0];
    to=arr.findIndex(function(x){return x.id===targetId});
    arr.splice(bf?to:to+1,0,moved);
    if(typeof save==='function')save();
    if(tp==='menu'){if(typeof renderHome==='function')renderHome()}
    else{if(typeof renderItems==='function')renderItems();if(typeof updateDuration==='function')updateDuration()}
  }
  function arm(){
    document.querySelectorAll('.menu-card,.item').forEach(function(card){
      card.classList.add('desktop-dnd-ready');
      card.draggable=true;
      card.setAttribute('draggable','true');
      card.style.webkitUserDrag='element';
    });
  }

  document.addEventListener('dragstart',function(e){
    var card=e.target&&e.target.closest?e.target.closest('.menu-card,.item'):null;
    if(!card||!card.classList.contains('desktop-dnd-ready'))return;
    if(e.target.closest('button')){e.preventDefault();return}
    dragging=card;type=card.classList.contains('menu-card')?'menu':'item';
    card.classList.add('desktop-dragging','reorder-held');
    if(e.dataTransfer){e.dataTransfer.effectAllowed='move';try{e.dataTransfer.setData('text/plain',card.dataset.id||'')}catch(_){}}
  },true);

  document.addEventListener('dragover',function(e){
    if(!dragging)return;
    var card=e.target&&e.target.closest?e.target.closest(type==='menu'?'.menu-card':'.item'):null;
    if(!card||card===dragging)return;
    e.preventDefault();if(e.dataTransfer)e.dataTransfer.dropEffect='move';
    clearTarget();var r=card.getBoundingClientRect();before=e.clientY<r.top+r.height/2;target=card;card.classList.add(before?'reorder-before':'reorder-after');
  },true);

  document.addEventListener('drop',function(e){
    if(!dragging)return;e.preventDefault();
    var id=dragging.dataset.id,toId=target&&target.dataset.id,tp=type,bf=before;
    clearTarget();dragging.classList.remove('desktop-dragging','reorder-held');dragging=null;type='';
    if(id&&toId)reorder(tp,id,toId,bf);
  },true);

  document.addEventListener('dragend',function(){
    clearTarget();if(dragging)dragging.classList.remove('desktop-dragging','reorder-held');dragging=null;type='';
  },true);

  var oldHome=typeof renderHome==='function'?renderHome:null;
  if(oldHome)renderHome=function(){var r=oldHome.apply(this,arguments);setTimeout(arm,0);return r};
  var oldItems=typeof renderItems==='function'?renderItems:null;
  if(oldItems)renderItems=function(){var r=oldItems.apply(this,arguments);setTimeout(arm,0);return r};
  var oldShow=typeof show==='function'?show:null;
  if(oldShow)show=function(){var r=oldShow.apply(this,arguments);setTimeout(arm,0);return r};
  setTimeout(arm,60);
})();
