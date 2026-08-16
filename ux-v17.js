(function(){
  function activeScreenId(){var el=document.querySelector('.screen.active');return el?el.id:''}
  var PULL_SCREENS=['home','menuEdit','itemEdit'];

  var style=document.createElement('style');
  style.setAttribute('data-v17-swipe-refresh-fix','');
  style.textContent='\
.menu-card>*:not(.swipe-delete):not(.swipe-duplicate),.item>*:not(.swipe-delete):not(.swipe-duplicate){transition:transform .18s ease!important}\
.menu-card.swipe-open>*:not(.swipe-delete):not(.swipe-duplicate),.item.swipe-open>*:not(.swipe-delete):not(.swipe-duplicate){transform:translateX(-76px)!important}\
.menu-card.swipe-copy-open>*:not(.swipe-delete):not(.swipe-duplicate),.item.swipe-copy-open>*:not(.swipe-delete):not(.swipe-duplicate){transform:translateX(76px)!important}\
.swipe-delete{border-radius:0 20px 20px 0!important}\
.swipe-duplicate{border-radius:20px 0 0 20px!important}\
';
  document.head.appendChild(style);

  var startX=0,startY=0,candidate=false,ready=false;
  function atTop(){var sc=document.scrollingElement||document.documentElement;return (!sc||sc.scrollTop<=3)&&window.scrollY<=3}
  function ind(){return document.getElementById('pullRefreshIndicator')}
  function reset(){candidate=false;ready=false;var i=ind();if(i){i.style.transform='translate(-50%,-70px)';i.classList.remove('visible','ready')}}
  function fire(){var should=ready;reset();if(should&&typeof window.unifiedRefresh==='function')window.unifiedRefresh()}

  document.addEventListener('touchstart',function(e){
    if(PULL_SCREENS.indexOf(activeScreenId())<0||e.touches.length!==1||!atTop())return;
    startX=e.touches[0].clientX;startY=e.touches[0].clientY;candidate=true;ready=false;
  },{passive:true,capture:true});

  document.addEventListener('touchmove',function(e){
    if(!candidate||e.touches.length!==1)return;
    var dx=e.touches[0].clientX-startX,dy=e.touches[0].clientY-startY;
    if(dy<=0||Math.abs(dx)>Math.abs(dy)*.9){reset();return}
    var i=ind();
    if(dy>10&&i){if(e.cancelable)e.preventDefault();i.classList.add('visible');i.style.transform='translate(-50%,'+Math.min(28,dy*.28-55)+'px)'}
    ready=dy>=78;if(i)i.classList.toggle('ready',ready);
  },{passive:false,capture:true});

  document.addEventListener('touchend',function(e){if(!candidate)return;if(e.cancelable&&ready)e.preventDefault();fire()},{passive:false,capture:true});
  document.addEventListener('touchcancel',function(){if(!candidate)return;fire()},{passive:true,capture:true});
})();
