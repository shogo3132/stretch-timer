(function(){
  function isRoutineEdit(){
    var el=document.getElementById('menuEdit');
    return !!el && el.classList.contains('active');
  }

  function setupRoutineEditor(){
    var top=document.getElementById('topBar');
    var start=document.getElementById('startMenuBtn');
    var add=document.getElementById('addItemBtn');
    var duplicate=document.getElementById('duplicateMenuBtn');
    if(duplicate) duplicate.style.display='none';
    if(add){
      add.style.width='100%';
      add.style.minHeight='54px';
      add.style.fontSize='16px';
      add.style.fontWeight='700';
    }
    if(top&&start){
      if(start.parentElement!==top) top.appendChild(start);
      start.className='btn';
      start.style.flex='0 0 auto';
      start.style.minHeight='42px';
      start.style.padding='7px 14px';
      start.style.borderRadius='13px';
      start.style.display=isRoutineEdit()?'inline-block':'none';
      start.textContent='▶ 開始';
    }
  }

  function duplicateRoutineById(id){
    if(typeof state==='undefined'||!state||!Array.isArray(state.menus)) return;
    var i=state.menus.findIndex(function(x){return x.id===id});
    if(i<0) return;
    var src=state.menus[i];
    var copy=JSON.parse(JSON.stringify(src));
    copy.id=typeof uid==='function'?uid():(Date.now()+Math.random().toString(16).slice(2));
    copy.name=(src.name||'ルーティン')+' コピー';
    copy.items=Array.isArray(copy.items)?copy.items:[];
    copy.items.forEach(function(x){x.id=typeof uid==='function'?uid():(Date.now()+Math.random().toString(16).slice(2))});
    state.menus.splice(i+1,0,copy);
    if(typeof save==='function') save();
    if(typeof renderHome==='function') renderHome();
  }

  function decorateRoutineCard(el){
    if(!el||el.dataset.v12Ready==='1') return;
    var id=el.dataset.id;
    if(!id) return;
    el.dataset.v12Ready='1';

    var gear=el.querySelector('.edit');
    if(gear){
      gear.textContent='⚙';
      gear.title='設定';
      gear.setAttribute('aria-label','設定');
      gear.onclick=function(e){e.preventDefault();e.stopPropagation()};
    }

    var del=el.querySelector('.swipe-delete');
    if(del){
      var dup=document.createElement('button');
      dup.type='button';
      dup.className='swipe-duplicate';
      dup.textContent='複製';
      dup.addEventListener('click',function(e){
        e.preventDefault();e.stopPropagation();duplicateRoutineById(id);
      });
      el.appendChild(dup);
    }

    el.addEventListener('click',function(e){
      if(e.target.closest('button')) return;
      var t=Number(el.dataset.lastSwipe||0);
      if(Date.now()-t<550) return;
      if(el.classList.contains('swipe-open')){el.classList.remove('swipe-open');return}
      if(typeof openMenu==='function') openMenu(id);
    });

    var sx=0,sy=0;
    el.addEventListener('touchstart',function(e){
      if(e.touches.length!==1) return;
      sx=e.touches[0].clientX;sy=e.touches[0].clientY;
    },{passive:true});
    el.addEventListener('touchend',function(e){
      if(!e.changedTouches.length) return;
      var dx=e.changedTouches[0].clientX-sx,dy=e.changedTouches[0].clientY-sy;
      if(Math.abs(dx)>35&&Math.abs(dx)>Math.abs(dy)*1.25) el.dataset.lastSwipe=String(Date.now());
    },{passive:true});
  }

  function decorateRoutineCards(){
    document.querySelectorAll('.menu-card').forEach(decorateRoutineCard);
  }

  function updateScreenUi(){
    setupRoutineEditor();
    decorateRoutineCards();
  }

  var style=document.createElement('style');
  style.textContent='\
#menuEdit #duplicateMenuBtn{display:none!important}\
#menuEdit #addItemBtn{width:100%!important;min-height:54px!important;font-size:16px;font-weight:700}\
.menu-card.swipe-open>*:not(.swipe-delete):not(.swipe-duplicate){transform:translateX(-152px)!important}\
.swipe-duplicate{position:absolute;right:74px;top:0;bottom:0;width:78px;border:0;background:#78838f;color:#fff;font-weight:700;display:flex;align-items:center;justify-content:center;opacity:0;z-index:2;transition:opacity .08s ease}\
.menu-card.swipe-open>.swipe-duplicate{opacity:1}\
.menu-card .edit{cursor:default}\
';
  document.head.appendChild(style);

  if(typeof renderHome==='function'){
    var prevRenderHome=renderHome;
    renderHome=function(){var r=prevRenderHome.apply(this,arguments);setTimeout(decorateRoutineCards,0);return r};
  }
  if(typeof show==='function'){
    var prevShow=show;
    show=function(){var r=prevShow.apply(this,arguments);setTimeout(updateScreenUi,0);return r};
  }

  setTimeout(updateScreenUi,0);
})();
