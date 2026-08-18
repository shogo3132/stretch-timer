(function(){
  if(window.__itemCommitV77)return;
  window.__itemCommitV77=true;

  var draft=null;
  var committed=false;
  var allowSave=false;
  var navigating=false;
  var originalSave=typeof save==='function'?save:null;

  var style=document.createElement('style');
  style.setAttribute('data-item-commit-v77','');
  style.textContent='\
#itemEdit > .stack{gap:20px}\
#itemCommitBtn{width:100%;margin-top:16px}\
#itemEdit .item-delete-row-spaced{margin-top:8px!important}\
';
  document.head.appendChild(style);

  function clone(x){return JSON.parse(JSON.stringify(x))}
  function currentItemSafe(){try{return typeof item==='function'?item():null}catch(e){return null}}
  function same(a,b){try{return JSON.stringify(a)===JSON.stringify(b)}catch(e){return false}}

  function beginDraft(){
    var x=currentItemSafe();
    if(!x)return;
    draft={menuId:currentMenuId,itemId:x.id,value:clone(x)};
    committed=false;
    navigating=false;
  }

  function restoreDraft(){
    if(!draft)return;
    try{
      var m=state&&Array.isArray(state.menus)?state.menus.find(function(v){return v.id===draft.menuId}):null;
      if(!m||!Array.isArray(m.items))return;
      var i=m.items.findIndex(function(v){return v.id===draft.itemId});
      if(i>=0)m.items[i]=clone(draft.value);
    }catch(e){console.error(e)}
  }

  function isDirty(){
    if(!draft)return false;
    var x=currentItemSafe();
    return !!x&&!same(x,draft.value);
  }

  function approveLeaving(){
    if(!draft||committed)return true;
    if(isDirty()&&!confirm('変更内容は反映されません。\nこのページを離れますか？'))return false;
    restoreDraft();
    draft=null;
    return true;
  }

  if(originalSave){
    save=function(){
      if(draft&&!allowSave&&typeof currentScreen!=='undefined'&&currentScreen==='itemEdit')return;
      return originalSave.apply(this,arguments);
    };
  }

  function commitAndBack(){
    if(!draft)return;
    allowSave=true;
    committed=true;
    try{if(originalSave)originalSave()}finally{allowSave=false}
    var menuId=draft.menuId;
    draft=null;
    if(typeof openMenu==='function')openMenu(menuId);
  }

  function ensureButton(){
    var screen=document.getElementById('itemEdit');
    var stack=screen&&screen.querySelector('.stack');
    if(!stack)return;
    var btn=document.getElementById('itemCommitBtn');
    if(!btn){
      btn=document.createElement('button');
      btn.id='itemCommitBtn';btn.type='button';btn.className='btn';btn.textContent='決定';
      btn.onclick=commitAndBack;
    }
    var del=document.getElementById('deleteItemBtn');
    var delRow=del&&del.parentElement;
    if(delRow&&delRow.parentNode===stack){
      stack.insertBefore(btn,delRow);
      delRow.classList.add('item-delete-row-spaced');
    }else if(btn.parentNode!==stack){stack.appendChild(btn)}
  }

  var previousOpenItem=typeof openItem==='function'?openItem:null;
  if(previousOpenItem){
    openItem=function(){
      var r=previousOpenItem.apply(this,arguments);
      setTimeout(function(){beginDraft();ensureButton()},0);
      setTimeout(ensureButton,40);
      return r;
    };
  }

  var previousShow=typeof show==='function'?show:null;
  if(previousShow){
    show=function(id){
      var leaving=!navigating&&typeof currentScreen!=='undefined'&&currentScreen==='itemEdit'&&id!=='itemEdit'&&draft&&!committed;
      if(leaving&&!approveLeaving())return;
      var r=previousShow.apply(this,arguments);
      if(id==='itemEdit')setTimeout(ensureButton,0);
      return r;
    };
  }

  function wireBackButton(){
    var back=document.getElementById('backBtn');
    if(!back||back.dataset.itemCommitConfirmV77==='1')return;
    back.dataset.itemCommitConfirmV77='1';
    back.addEventListener('click',function(e){
      if(typeof currentScreen==='undefined'||currentScreen!=='itemEdit'||!draft||committed||navigating)return;
      e.preventDefault();
      e.stopImmediatePropagation();
      if(!approveLeaving())return;
      navigating=true;
      try{if(typeof goBack==='function')goBack()}finally{setTimeout(function(){navigating=false},0)}
    },true);
  }

  var del=document.getElementById('deleteItemBtn');
  if(del){
    del.addEventListener('click',function(){
      if(!draft)return;
      restoreDraft();
      allowSave=true;
      committed=true;
      draft=null;
      setTimeout(function(){allowSave=false},0);
    },true);
  }

  wireBackButton();
  setTimeout(function(){
    wireBackButton();
    if(typeof currentScreen!=='undefined'&&currentScreen==='itemEdit'){beginDraft();ensureButton()}
  },80);
})();
