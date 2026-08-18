(function(){
  if(window.__itemCommitV75)return;
  window.__itemCommitV75=true;

  var draft=null;
  var committed=false;
  var allowSave=false;
  var originalSave=typeof save==='function'?save:null;

  var style=document.createElement('style');
  style.setAttribute('data-item-commit-v75','');
  style.textContent='\
#itemCommitBtn{width:100%;margin-top:4px}\
#itemEdit .item-delete-row-spaced{margin-top:20px!important}\
';
  document.head.appendChild(style);

  function clone(x){return JSON.parse(JSON.stringify(x))}
  function currentMenuSafe(){try{return typeof menu==='function'?menu():null}catch(e){return null}}
  function currentItemSafe(){try{return typeof item==='function'?item():null}catch(e){return null}}
  function same(a,b){try{return JSON.stringify(a)===JSON.stringify(b)}catch(e){return false}}

  function beginDraft(){
    var x=currentItemSafe();
    if(!x)return;
    draft={menuId:currentMenuId,itemId:x.id,value:clone(x)};
    committed=false;
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
      var leaving=typeof currentScreen!=='undefined'&&currentScreen==='itemEdit'&&id!=='itemEdit'&&draft&&!committed;
      if(leaving){
        var dirty=isDirty();
        restoreDraft();
        draft=null;
        if(dirty)alert('変更があります。「決定」を押していないため、変更内容は反映されません。');
      }
      var r=previousShow.apply(this,arguments);
      if(id==='itemEdit')setTimeout(ensureButton,0);
      return r;
    };
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

  setTimeout(function(){
    if(typeof currentScreen!=='undefined'&&currentScreen==='itemEdit'){beginDraft();ensureButton()}
  },80);
})();
