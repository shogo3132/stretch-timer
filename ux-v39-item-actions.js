(function(){
  if(window.__itemActionsV45)return;
  window.__itemActionsV45=true;

  var style=document.createElement('style');
  style.setAttribute('data-item-actions-v45','');
  style.textContent='\
#menuEdit .item{grid-template-columns:78px 1fr auto!important;gap:14px!important}\
#menuEdit .item-actions{display:flex;align-items:center;justify-content:flex-end;gap:2px;align-self:center;position:relative;z-index:40}\
#menuEdit .item-action-btn{width:38px;height:38px;min-width:38px;border:0;border-radius:11px;background:#fff;color:#69727d;display:grid;place-items:center;padding:0;box-shadow:none;cursor:pointer;-webkit-tap-highlight-color:transparent}\
#menuEdit .item-action-btn:active{background:#f4f6f7}\
#menuEdit .item-more{font-size:22px;line-height:1;padding-bottom:5px}\
#menuEdit .item-open svg{width:20px;height:20px;display:block;stroke:currentColor;stroke-width:2;fill:none;stroke-linecap:round;stroke-linejoin:round}\
.item-action-pop{position:fixed;z-index:10020;min-width:150px;background:#fff;border:1px solid #edf0f2;border-radius:14px;padding:5px;box-shadow:0 10px 30px rgba(20,28,36,.15)}\
.item-action-pop button{width:100%;border:0;background:transparent;border-radius:10px;padding:10px 12px;text-align:left;font-size:14px;color:#303841;cursor:pointer}\
.item-action-pop button:active,.item-action-pop button:hover{background:#f4f6f7}\
.item-action-pop .danger{color:#ae3742}\
';
  document.head.appendChild(style);

  function closeMenu(){var p=document.getElementById('itemActionPop');if(p)p.remove()}
  function currentMenu(){try{return typeof menu==='function'?menu():null}catch(e){return null}}
  function makeId(){return typeof uid==='function'?uid():(Date.now()+Math.random().toString(16).slice(2))}

  function duplicateById(id){
    var m=currentMenu();if(!m||!Array.isArray(m.items))return;
    var i=m.items.findIndex(function(x){return x.id===id});if(i<0)return;
    var copy=JSON.parse(JSON.stringify(m.items[i]));
    copy.id=makeId();copy.name=(copy.name||'種目')+' コピー';
    m.items.splice(i+1,0,copy);
    if(typeof save==='function')save();
    if(typeof renderItems==='function')renderItems();
    if(typeof updateDuration==='function')updateDuration();
  }

  function deleteById(id){
    var m=currentMenu();if(!m||!Array.isArray(m.items))return;
    var i=m.items.findIndex(function(x){return x.id===id});if(i<0)return;
    m.items.splice(i,1);
    if(typeof save==='function')save();
    if(typeof renderItems==='function')renderItems();
    if(typeof updateDuration==='function')updateDuration();
  }

  function openActionMenu(anchor,id){
    closeMenu();
    var pop=document.createElement('div');pop.id='itemActionPop';pop.className='item-action-pop';
    pop.innerHTML='<button type="button" data-act="edit">編集</button><button type="button" data-act="copy">複製</button><button type="button" data-act="delete" class="danger">削除</button>';
    document.body.appendChild(pop);
    var r=anchor.getBoundingClientRect(),pr=pop.getBoundingClientRect();
    var left=Math.min(innerWidth-pr.width-10,Math.max(10,r.right-pr.width));
    var top=r.bottom+6;
    if(top+pr.height>innerHeight-10)top=Math.max(10,r.top-pr.height-6);
    pop.style.left=left+'px';pop.style.top=top+'px';
    pop.onclick=function(e){
      var b=e.target.closest('button');if(!b)return;e.stopPropagation();
      var act=b.dataset.act;closeMenu();
      if(act==='edit'){if(typeof openItem==='function')openItem(id)}
      else if(act==='copy')duplicateById(id);
      else if(act==='delete')deleteById(id);
    };
    setTimeout(function(){document.addEventListener('pointerdown',function outside(e){var p=document.getElementById('itemActionPop');if(!p){document.removeEventListener('pointerdown',outside,true);return}if(!p.contains(e.target)&&e.target!==anchor){closeMenu();document.removeEventListener('pointerdown',outside,true)}},true)},0);
  }

  function addButtons(){
    document.querySelectorAll('#menuEdit .item').forEach(function(card){
      if(card.querySelector('.item-actions'))return;
      var id=card.dataset.id;if(!id)return;
      var wrap=document.createElement('div');wrap.className='item-actions';
      var more=document.createElement('button');more.type='button';more.className='item-action-btn item-more';more.textContent='…';more.setAttribute('aria-label','種目の操作');more.title='種目の操作';
      var open=document.createElement('button');open.type='button';open.className='item-action-btn item-open';open.setAttribute('aria-label','種目設定を開く');open.title='種目設定を開く';
      open.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>';
      more.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();openActionMenu(more,id)});
      open.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();closeMenu();if(typeof openItem==='function')openItem(id)});
      wrap.appendChild(more);wrap.appendChild(open);card.appendChild(wrap);
    });
  }

  var prevItems=typeof renderItems==='function'?renderItems:null;
  if(prevItems){renderItems=function(){var r=prevItems.apply(this,arguments);setTimeout(addButtons,0);return r}}
  var prevShow=typeof show==='function'?show:null;
  if(prevShow){show=function(){closeMenu();var r=prevShow.apply(this,arguments);if(arguments[0]==='menuEdit')setTimeout(addButtons,0);return r}}
  setTimeout(addButtons,80);
})();
