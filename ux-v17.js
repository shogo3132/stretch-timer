(function(){
  var CURRENT_BUILD='stretch-timer-v19';
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
@keyframes cardAdded{0%{opacity:0;transform:translateY(7px) scale(.99)}100%{opacity:1;transform:translateY(0) scale(1)}}\
.card-added{animation:cardAdded .22s ease-out both}\
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

  function revealNewCard(selector,id){
    setTimeout(function(){
      var card=document.querySelector(selector+'[data-id="'+id+'"]');
      if(!card)return;
      card.classList.remove('card-added');void card.offsetWidth;card.classList.add('card-added');
      if(card.scrollIntoView)card.scrollIntoView({behavior:'smooth',block:'nearest'});
      setTimeout(function(){card.classList.remove('card-added')},280);
    },50);
  }

  function installAddBehavior(){
    var addRoutine=document.getElementById('addMenuHome');
    if(addRoutine&&!addRoutine.dataset.stayHereReady){
      addRoutine.dataset.stayHereReady='1';
      addRoutine.onclick=function(e){
        e.preventDefault();e.stopPropagation();
        if(typeof state==='undefined'||!state||!Array.isArray(state.menus))return;
        var id=typeof uid==='function'?uid():(Date.now()+Math.random().toString(16).slice(2));
        var m={id:id,name:'ルーティン'+(state.menus.length+1),desc:'',rest:15,items:[]};
        state.menus.push(m);
        if(typeof save==='function')save();
        if(typeof renderHome==='function')renderHome();
        revealNewCard('.menu-card',id);
      };
    }

    var addItem=document.getElementById('addItemBtn');
    if(addItem&&!addItem.dataset.stayHereReady){
      addItem.dataset.stayHereReady='1';
      addItem.onclick=function(e){
        e.preventDefault();e.stopPropagation();
        var m=typeof menu==='function'?menu():null;if(!m)return;
        var id=typeof uid==='function'?uid():(Date.now()+Math.random().toString(16).slice(2));
        m.items.push({id:id,name:'新しい種目',seconds:30,desc:'',photo:''});
        if(typeof save==='function')save();
        if(typeof renderItems==='function')renderItems();
        if(typeof updateDuration==='function')updateDuration();
        revealNewCard('.item',id);
      };
    }
  }

  if(typeof show==='function'){
    var prevShow=show;
    show=function(){var r=prevShow.apply(this,arguments);setTimeout(installAddBehavior,0);return r};
  }
  if(typeof renderHome==='function'){
    var prevRenderHome=renderHome;
    renderHome=function(){var r=prevRenderHome.apply(this,arguments);setTimeout(installAddBehavior,0);return r};
  }
  setTimeout(installAddBehavior,0);
})();
