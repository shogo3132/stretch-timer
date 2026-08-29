(function(){
  if(window.__timerBackToHomeV43)return;
  window.__timerBackToHomeV43=true;

  function timerBackToHome(){
    if(typeof currentScreen!=='undefined'&&currentScreen==='timer'){
      if(typeof stopTimer==='function')stopTimer();
      if(typeof renderHome==='function')renderHome();
      return true;
    }
    return false;
  }

  if(window.StretchUI&&StretchUI.registerBackHandler)StretchUI.registerBackHandler({key:'timer-fallback',priority:800,handle:timerBackToHome});

  var back=document.getElementById('backBtn');
  if(back)back.onclick=function(){goBack()};
})();
