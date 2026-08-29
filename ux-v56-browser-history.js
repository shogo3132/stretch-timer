(function(){
  if(window.__browserHistoryV56)return;
  window.__browserHistoryV56=true;

  var fromPopstate=false;
  var suppressPush=false;
  var blockRootPop=false;
  var appUrl=location.href;

  function activeScreen(){
    var el=document.querySelector('.screen.active');
    return el?el.id:(typeof currentScreen!=='undefined'?currentScreen:'home');
  }

  function makeState(screen,depth){
    var base=(history.state&&typeof history.state==='object')?history.state:{};
    var next={};
    Object.keys(base).forEach(function(k){next[k]=base[k]});
    next.stretchTimerApp=true;
    next.stretchTimerScreen=screen||'home';
    next.stretchTimerDepth=Math.max(0,+depth||0);
    return next;
  }

  function currentDepth(){
    var s=history.state;
    return s&&s.stretchTimerApp?Math.max(0,+s.stretchTimerDepth||0):0;
  }
  function isTopLevel(screen){return ['home','tasks','recipes','settings'].indexOf(screen)>=0}

  function guardedState(screen){var next=makeState(screen,0);next.stretchTimerGuard=true;return next}
  function baseState(screen){var next=makeState(screen,0);next.stretchTimerGuard=false;return next}

  try{
    if(!(history.state&&history.state.stretchTimerApp&&history.state.stretchTimerGuard)){
      history.replaceState(baseState(activeScreen()),'',location.href);
      history.pushState(guardedState(activeScreen()),'',location.href);
    }
  }catch(e){}

  window.addEventListener('popstate',function(){
    fromPopstate=true;
    suppressPush=true;
    var screen=activeScreen();
    blockRootPop=isTopLevel(screen);
    if(blockRootPop){
      try{history.pushState(guardedState(screen),'',appUrl)}catch(err){}
    }
    setTimeout(function(){fromPopstate=false;suppressPush=false;blockRootPop=false},0);
  },true);

  var previousShow=typeof show==='function'?show:null;
  if(previousShow){
    show=function(id){
      var before=activeScreen();
      var r=previousShow.apply(this,arguments);
      if(!suppressPush&&id&&id!==before){
        try{
          if(isTopLevel(id))history.replaceState(makeState(id,0),'',location.href);
          else history.pushState(makeState(id,currentDepth()+1),'',location.href);
        }catch(e){}
      }
      return r;
    };
  }

  var previousGoBack=typeof goBack==='function'?goBack:null;
  if(previousGoBack){
    goBack=function(){
      if(blockRootPop)return;
      if(!fromPopstate){
        var s=history.state;
        if(s&&s.stretchTimerApp&&currentDepth()>0){
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
