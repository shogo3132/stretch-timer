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

  var previousGoBack=typeof goBack==='function'?goBack:null;
  goBack=function(){
    if(timerBackToHome())return;
    if(previousGoBack)return previousGoBack.apply(this,arguments);
  };

  var back=document.getElementById('backBtn');
  if(back)back.onclick=function(){goBack()};
})();
