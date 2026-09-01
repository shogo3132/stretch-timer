(function(){
  if(window.__itemCardSyncV79)return;
  window.__itemCardSyncV79=true;

  var suppressClickUntil=0;
  function currentMenu(){try{return typeof menu==='function'?menu():null}catch(e){return null}}
  function uid2(){return typeof uid==='function'?uid():(Date.now()+Math.random().toString(16).slice(2))}
  function duplicateById(id){
    var m=currentMenu();if(!m||!Array.isArray(m.items))return;
    var i=m.items.findIndex(function(x){return x.id===id});if(i<0)return;
    var copy=JSON.parse(JSON.stringify(m.items[i]));copy.id=uid2();copy.name=(copy.name||'項目')+' コピー';
    m.items.splice(i+1,0,copy);if(typeof save==='function')save();if(typeof renderItems==='function')renderItems();if(typeof updateDuration==='function')updateDuration();
  }
  function closeCard(el){if(el)el.classList.remove('swipe-open','swipe-copy-open')}
  function closeAll(except){document.querySelectorAll('.item.swipe-open,.item.swipe-copy-open').forEach(function(el){if(el!==except)closeCard(el)})}
  function handleSwipe(el,dx){
    var del=el.classList.contains('swipe-open'),copy=el.classList.contains('swipe-copy-open');
    if(del){if(dx>0)closeCard(el);return}if(copy){if(dx<0)closeCard(el);return}
    closeAll(el);if(dx<0)el.classList.add('swipe-open');else el.classList.add('swipe-copy-open');
  }
  function decorate(card){
    if(!card||card.dataset.unifiedReady==='1')return;
    var id=card.dataset.id;if(!id)return;
    card.dataset.unifiedReady='1';card.classList.remove('swipe-open','swipe-copy-open','dragging','over');
    var fine=window.matchMedia&&window.matchMedia('(hover:hover) and (pointer:fine)').matches;
    if(fine){card.classList.add('desktop-dnd-ready');card.draggable=true;card.setAttribute('draggable','true');card.style.webkitUserDrag='element'}
    else{card.draggable=false;card.removeAttribute('draggable');card.style.webkitUserDrag='none'}

    var del=document.createElement('button');del.type='button';del.className='swipe-delete';del.textContent='削除';
    var dup=document.createElement('button');dup.type='button';dup.className='swipe-duplicate';dup.textContent='複製';dup.onclick=function(e){e.preventDefault();e.stopPropagation();duplicateById(id)};
    card.append(del,dup);

    var x0=0,y0=0,moved=false;
    card.addEventListener('touchstart',function(e){if(e.touches.length!==1)return;x0=e.touches[0].clientX;y0=e.touches[0].clientY;moved=false},{passive:true});
    card.addEventListener('touchmove',function(e){if(e.touches.length!==1)return;var dx=e.touches[0].clientX-x0,dy=e.touches[0].clientY-y0;if(Math.abs(dx)>22&&Math.abs(dx)>Math.abs(dy)*1.25)moved=true},{passive:true});
    card.addEventListener('touchend',function(e){if(!moved||!e.changedTouches.length)return;var dx=e.changedTouches[0].clientX-x0,dy=e.changedTouches[0].clientY-y0;if(Math.abs(dx)<=45||Math.abs(dx)<=Math.abs(dy)*1.25)return;suppressClickUntil=Date.now()+550;handleSwipe(card,dx)},{passive:true});
    card.addEventListener('click',function(e){if(e.target.closest('button,input,label')||Date.now()<suppressClickUntil)return;if(card.classList.contains('swipe-open')||card.classList.contains('swipe-copy-open')){closeCard(card);return}e.preventDefault();e.stopPropagation()});
  }
  function decorateAll(){document.querySelectorAll('#menuEdit #itemList .item').forEach(decorate)}

  var coreRender=typeof renderItems==='function'?renderItems:null;
  if(coreRender){
    renderItems=function(){
      var oldWire=typeof wireReorder==='function'?wireReorder:null,r;
      if(oldWire)wireReorder=function(){};
      try{r=coreRender.apply(this,arguments)}finally{if(oldWire)wireReorder=oldWire}
      decorateAll();return r;
    };
  }
  document.addEventListener('pointerdown',function(e){if(!e.target.closest('.item'))closeAll()},true);
  decorateAll();
})();
