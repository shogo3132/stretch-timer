(function(){
  if(window.__scrollRestoreV79)return;
  window.__scrollRestoreV79=true;

  var menuScroll={};
  var pendingRestore=null;

  function rememberMenuScroll(){
    if(typeof currentMenuId==='undefined'||!currentMenuId)return;
    if(typeof currentScreen!=='undefined'&&currentScreen!=='menuEdit')return;
    menuScroll[currentMenuId]=window.scrollY||document.documentElement.scrollTop||0;
  }

  function restoreMenuScroll(menuId){
    var y=menuScroll[menuId];
    if(typeof y!=='number')return;
    pendingRestore={menuId:menuId,y:y};
    requestAnimationFrame(function(){
      requestAnimationFrame(function(){
        if(!pendingRestore||pendingRestore.menuId!==menuId)return;
        window.scrollTo(0,pendingRestore.y);
        setTimeout(function(){
          if(pendingRestore&&pendingRestore.menuId===menuId){
            window.scrollTo(0,pendingRestore.y);
            pendingRestore=null;
          }
        },80);
      });
    });
  }

  var previousOpenItem=typeof openItem==='function'?openItem:null;
  if(previousOpenItem){
    openItem=function(){
      rememberMenuScroll();
      return previousOpenItem.apply(this,arguments);
    };
  }

  document.addEventListener('click',function(e){
    if(typeof currentScreen==='undefined'||currentScreen!=='menuEdit')return;
    var target=e.target&&e.target.closest?e.target.closest('.item-open,.item-action-pop [data-act="edit"]'):null;
    if(target)rememberMenuScroll();
  },true);

  var previousOpenMenu=typeof openMenu==='function'?openMenu:null;
  if(previousOpenMenu){
    openMenu=function(id){
      var returningFromItem=typeof currentScreen!=='undefined'&&currentScreen==='itemEdit'&&menuScroll[id]!==undefined;
      var r=previousOpenMenu.apply(this,arguments);
      if(returningFromItem)restoreMenuScroll(id);
      return r;
    };
  }

  if(window.StretchUI&&StretchUI.registerBackEffect)StretchUI.registerBackEffect({key:'menu-scroll-restore',before:function(){return {fromItem:typeof currentScreen!=='undefined'&&currentScreen==='itemEdit',menuId:typeof currentMenuId!=='undefined'?currentMenuId:null}},after:function(context){if(context&&context.fromItem&&context.menuId)restoreMenuScroll(context.menuId)}});

  var back=document.getElementById('backBtn');
  if(back)back.onclick=function(){goBack()};
})();
