(function(){
  var PULL_SCREENS=['home','menuEdit','itemEdit'];
  var sx=0,sy=0,candidate=false,ready=false;

  function activeScreenId(){
    var el=document.querySelector('.screen.active');
    return el?el.id:'';
  }

  function atTop(){
    var sc=document.scrollingElement||document.documentElement;
    return (!sc||sc.scrollTop<=2)&&window.scrollY<=2;
  }

  function indicator(){return document.getElementById('pullRefreshIndicator')}
  function resetPull(){
    candidate=false;ready=false;
    var ind=indicator();
    if(ind){
      ind.style.transform='translate(-50%,-70px)';
      ind.classList.remove('visible','ready');
    }
  }

  // Window capture runs before page/card handlers, making pull-to-refresh reliable on edit screens too.
  window.addEventListener('touchstart',function(e){
    if(PULL_SCREENS.indexOf(activeScreenId())<0||e.touches.length!==1||!atTop())return;
    sx=e.touches[0].clientX;sy=e.touches[0].clientY;candidate=true;ready=false;
  },{passive:true,capture:true});

  window.addEventListener('touchmove',function(e){
    if(!candidate||e.touches.length!==1)return;
    var dx=e.touches[0].clientX-sx,dy=e.touches[0].clientY-sy;
    if(dy<=0||Math.abs(dx)>Math.abs(dy)*.9){resetPull();return}
    var ind=indicator();
    if(dy>10&&ind){
      if(e.cancelable)e.preventDefault();
      ind.classList.add('visible');
      ind.style.transform='translate(-50%,'+Math.min(28,dy*.28-55)+'px)';
    }
    ready=dy>=85;
    if(ind)ind.classList.toggle('ready',ready);
  },{passive:false,capture:true});

  window.addEventListener('touchend',function(e){
    if(!candidate)return;
    var fire=ready;
    resetPull();
    if(fire&&typeof window.unifiedRefresh==='function'){
      if(e.cancelable)e.preventDefault();
      window.unifiedRefresh();
    }
  },{passive:false,capture:true});

  window.addEventListener('touchcancel',resetPull,{passive:true,capture:true});

  var style=document.createElement('style');
  style.setAttribute('data-v15-polish','');
  style.textContent='\
#home .subhead{display:none!important}\
#home .headline-row{justify-content:flex-end!important}\
#home #addMenuHome{margin-left:auto!important}\
.menu-card.swipe-open>*:not(.swipe-delete):not(.swipe-duplicate),\
.item.swipe-open>*:not(.swipe-delete):not(.swipe-duplicate),\
.menu-card.swipe-copy-open>*:not(.swipe-delete):not(.swipe-duplicate),\
.item.swipe-copy-open>*:not(.swipe-delete):not(.swipe-duplicate){transform:none!important}\
.swipe-delete,.swipe-duplicate{z-index:30!important}\
';
  document.head.appendChild(style);
})();
