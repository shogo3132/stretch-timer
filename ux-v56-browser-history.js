(function(){
  if(window.__browserHistoryV57)return;
  window.__browserHistoryV57=true;

  var restoring=false;

  function activeScreen(){
    var el=document.querySelector('.screen.active');
    return el?el.id:(typeof currentScreen!=='undefined'?currentScreen:'home');
  }

  function currentMenu(){
    return typeof currentMenuId!=='undefined'?currentMenuId:null;
  }

  function currentItem(){
    return typeof currentItemId!=='undefined'?currentItemId:null;
  }

  function cloneBase(){
    var base=(history.state&&typeof history.state==='object')?history.state:{};
    var next={};
    Object.keys(base).forEach(function(k){next[k]=base[k]});
    return next;
  }

  function makeState(screen,depth){
    var next=cloneBase();
    next.stretchTimerApp=true;
    next.stretchTimerScreen=screen||'home';
    next.stretchTimerDepth=Math.max(0,+depth||0);
    next.stretchTimerMenuId=currentMenu();
    next.stretchTimerItemId=currentItem();
    next.stretchTimerScrollY=window.scrollY||document.documentElement.scrollTop||0;
    return next;
  }

  function currentDepth(){
    var s=history.state;
    return s&&s.stretchTimerApp?Math.max(0,+s.stretchTimerDepth||0):0;
  }

  function saveCurrentEntry(){
    try{
      var s=history.state;
      if(!s||!s.stretchTimerApp)return;
      var next={};Object.keys(s).forEach(function(k){next[k]=s[k]});
      next.stretchTimerScreen=activeScreen();
      next.stretchTimerMenuId=currentMenu();
      next.stretchTimerItemId=currentItem();
      next.stretchTimerScrollY=window.scrollY||document.documentElement.scrollTop||0;
      history.replaceState(next,'',location.href);
    }catch(e){}
  }

  function restoreScroll(y){
    if(typeof y!=='number')return;
    requestAnimationFrame(function(){
      requestAnimationFrame(function(){
        window.scrollTo(0,y);
        setTimeout(function(){window.scrollTo(0,y)},70);
      });
    });
  }

  function restoreState(s){
    if(!s||!s.stretchTimerApp)return;
    restoring=true;
    try{
      var screen=s.stretchTimerScreen||'home';
      var menuId=s.stretchTimerMenuId||null;
      var itemId=s.stretchTimerItemId||null;

      if(screen==='home'){
        if(typeof renderHome==='function')renderHome();
        else if(typeof show==='function')show('home','ホーム');
      }else if(screen==='menuEdit'){
        if(typeof currentMenuId!=='undefined')currentMenuId=menuId;
        if(menuId&&typeof openMenu==='function')openMenu(menuId);
        else if(typeof show==='function')show('menuEdit','ルーティン設定');
      }else if(screen==='itemEdit'){
        if(typeof currentMenuId!=='undefined')currentMenuId=menuId;
        if(typeof currentItemId!=='undefined')currentItemId=itemId;
        if(itemId&&typeof openItem==='function')openItem(itemId);
        else if(typeof show==='function')show('itemEdit','種目設定');
      }else if(screen==='routineDetail'){
        if(typeof currentMenuId!=='undefined')currentMenuId=menuId;
        if(menuId&&typeof openRoutineDetail==='function')openRoutineDetail(menuId);
        else if(typeof show==='function')show('routineDetail','記録');
      }else if(screen==='timer'){
        if(typeof currentMenuId!=='undefined')currentMenuId=menuId;
        if(typeof timerState!=='undefined'&&timerState&&typeof show==='function'){
          var m=typeof menu==='function'?menu():null;
          show('timer',m&&m.name?m.name:'タイマー');
          if(typeof renderTimer==='function')renderTimer();
        }else if(typeof renderHome==='function')renderHome();
      }else if(typeof show==='function'){
        show(screen,screen);
      }
      restoreScroll(+s.stretchTimerScrollY||0);
    }finally{
      setTimeout(function(){restoring=false},0);
    }
  }

  try{
    if(!(history.state&&history.state.stretchTimerApp)){
      history.replaceState(makeState(activeScreen(),0),'',location.href);
    }else{
      saveCurrentEntry();
    }
  }catch(e){}

  window.addEventListener('popstate',function(e){
    if(e.state&&e.state.stretchTimerApp){
      restoreState(e.state);
    }
  },true);

  var previousShow=typeof show==='function'?show:null;
  if(previousShow){
    show=function(id){
      var before=activeScreen();
      if(!restoring&&id&&id!==before)saveCurrentEntry();
      var r=previousShow.apply(this,arguments);
      if(!restoring&&id&&id!==before){
        try{history.pushState(makeState(id,currentDepth()+1),'',location.href)}catch(e){}
      }
      return r;
    };
  }

  var previousGoBack=typeof goBack==='function'?goBack:null;
  if(previousGoBack){
    goBack=function(){
      if(!restoring){
        var s=history.state;
        if(s&&s.stretchTimerApp&&currentDepth()>0){
          saveCurrentEntry();
          history.back();
          return;
        }
      }
      return previousGoBack.apply(this,arguments);
    };
  }

  var back=document.getElementById('backBtn');
  if(back)back.onclick=function(){goBack()};
})();
