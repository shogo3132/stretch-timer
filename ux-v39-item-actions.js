(function(){
  if(window.__itemActionsV39)return;
  window.__itemActionsV39=true;

  var style=document.createElement('style');
  style.setAttribute('data-item-actions-v39','');
  style.textContent='\
#menuEdit .item{grid-template-columns:78px 1fr auto!important;gap:14px!important}\
#menuEdit .item-more{width:38px;height:38px;min-width:38px;border:0;border-radius:11px;background:#fff;color:#5f6873;font-size:22px;line-height:1;display:grid;place-items:center;padding:0;align-self:center;box-shadow:none}\
';
  document.head.appendChild(style);

  function addButtons(){
    document.querySelectorAll('#menuEdit .item').forEach(function(card){
      if(card.querySelector('.item-more'))return;
      var id=card.dataset.id;
      if(!id)return;
      var btn=document.createElement('button');
      btn.type='button';
      btn.className='item-more';
      btn.textContent='…';
      btn.setAttribute('aria-label','種目設定');
      btn.title='種目設定';
      btn.addEventListener('click',function(e){
        e.preventDefault();
        e.stopPropagation();
        if(typeof openItem==='function')openItem(id);
      });
      card.appendChild(btn);
    });
  }

  var prevItems=typeof renderItems==='function'?renderItems:null;
  if(prevItems){
    renderItems=function(){
      var r=prevItems.apply(this,arguments);
      setTimeout(addButtons,0);
      return r;
    };
  }

  var prevShow=typeof show==='function'?show:null;
  if(prevShow){
    show=function(){
      var r=prevShow.apply(this,arguments);
      if(arguments[0]==='menuEdit')setTimeout(addButtons,0);
      return r;
    };
  }

  setTimeout(addButtons,80);
})();
