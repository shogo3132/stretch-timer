(function(){
  if(window.__scrollRestoreV52)return;
  window.__scrollRestoreV52=true;

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

  var previousOpenMenu=typeof openMenu==='function'?openMenu:null;
  if(previousOpenMenu){
    openMenu=function(id){
      var returningFromItem=typeof currentScreen!=='undefined'&&currentScreen==='itemEdit'&&menuScroll[id]!==undefined;
      var r=previousOpenMenu.apply(this,arguments);
      if(returningFromItem)restoreMenuScroll(id);
      return r;
    };
  }

  var previousGoBack=typeof goBack==='function'?goBack:null;
  goBack=function(){
    var fromItem=typeof currentScreen!=='undefined'&&currentScreen==='itemEdit';
    var menuId=typeof currentMenuId!=='undefined'?currentMenuId:null;
    var r=previousGoBack?previousGoBack.apply(this,arguments):undefined;
    if(fromItem&&menuId)restoreMenuScroll(menuId);
    return r;
  };

  var back=document.getElementById('backBtn');
  if(back)back.onclick=function(){goBack()};
})();
