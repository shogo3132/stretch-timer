(function(){
  if(window.__liveEditTimerV50)return;
  window.__liveEditTimerV50=true;

  var editContext=null;

  var style=document.createElement('style');
  style.setAttribute('data-live-edit-v50','');
  style.textContent='\
body.timer-active .timer-edit-current{margin:2px auto 0;min-height:42px;padding:8px 18px;border-radius:14px;background:#f1f3f5;color:#47515c;border:0;font-weight:700}\
#timerResumeEditBar{display:none;position:sticky;top:0;z-index:8;margin:-6px 0 4px;padding:8px 0;background:#f7f8fa}\
#timerResumeEditBar.active{display:block}\
#timerResumeEditBar .btn{width:100%;min-height:50px;font-weight:800}\
';
  document.head.appendChild(style);

  function currentTimerItem(){
    if(!timerState||timerState.phase!=='item')return null;
    var m=typeof menu==='function'?menu():null;
    if(!m||!Array.isArray(m.items))return null;
    return m.items[timerState.index]||null;
  }

  function ensureResumeBar(){
    var screen=document.getElementById('itemEdit');
    if(!screen)return null;
    var stack=screen.querySelector('.stack');
    if(!stack)return null;
    var bar=document.getElementById('timerResumeEditBar');
    if(!bar){
      bar=document.createElement('div');
      bar.id='timerResumeEditBar';
      bar.innerHTML='<button type="button" class="btn" id="resumeEditedTimerBtn">▶ タイマーを再開</button>';
      stack.insertBefore(bar,stack.firstChild);
      var btn=bar.querySelector('#resumeEditedTimerBtn');
      btn.onclick=function(){resumeFromEdit()};
    }
    bar.classList.toggle('active',!!editContext);
    return bar;
  }

  function openCurrentEdit(){
    var x=currentTimerItem();
    if(!x||!timerState||!timerState.paused)return;
    editContext={menuId:currentMenuId,itemId:x.id,index:timerState.index};
    if(typeof openItem==='function')openItem(x.id);
    ensureResumeBar();
  }

  function returnToPausedTimer(){
    if(!editContext||!timerState)return false;
    if(typeof show==='function')show('timer',(typeof menu==='function'&&menu()?menu().name:'タイマー'));
    timerState.paused=true;
    if(typeof renderTimer==='function')renderTimer();
    ensureResumeBar();
    return true;
  }

  function resumeFromEdit(){
    if(!editContext||!timerState)return;
    var m=typeof menu==='function'?menu():null;
    if(!m||!Array.isArray(m.items)||!m.items.length){editContext=null;return}
    var idx=m.items.findIndex(function(x){return x.id===editContext.itemId});
    if(idx<0)idx=Math.max(0,Math.min(editContext.index,m.items.length-1));
    timerState.index=idx;
    timerState.phase='item';
    timerState.remaining=Math.max(1,+m.items[idx].seconds||1);
    timerState.total=timerState.remaining;
    timerState.paused=false;
    editContext=null;
    ensureResumeBar();
    if(typeof show==='function')show('timer',m.name);
    if(typeof renderTimer==='function')renderTimer();
    if(typeof runTick==='function')runTick();
  }

  var previousRender=typeof renderTimer==='function'?renderTimer:null;
  if(previousRender){
    renderTimer=function(){
      var r=previousRender.apply(this,arguments);
      if(timerState&&timerState.phase==='item'&&timerState.paused){
        var box=document.getElementById('timerContent');
        if(box&&!box.querySelector('.timer-edit-current')){
          var btn=document.createElement('button');
          btn.type='button';
          btn.className='timer-edit-current';
          btn.textContent='編集';
          btn.onclick=openCurrentEdit;
          var meta=box.querySelector('.compact-meta');
          if(meta)meta.insertAdjacentElement('afterend',btn);else box.appendChild(btn);
        }
      }
      return r;
    };
  }

  var previousOpenItem=typeof openItem==='function'?openItem:null;
  if(previousOpenItem){
    openItem=function(){
      var r=previousOpenItem.apply(this,arguments);
      setTimeout(ensureResumeBar,0);
      return r;
    };
  }

  var previousGoBack=typeof goBack==='function'?goBack:null;
  goBack=function(){
    if(editContext&&typeof currentScreen!=='undefined'&&currentScreen==='itemEdit'){
      returnToPausedTimer();
      return;
    }
    if(previousGoBack)return previousGoBack.apply(this,arguments);
  };
  var back=document.getElementById('backBtn');
  if(back)back.onclick=function(){goBack()};

  document.addEventListener('click',function(e){
    if(!editContext)return;
    var t=e.target&&e.target.closest?e.target.closest('#deleteItemBtn'):null;
    if(!t)return;
    editContext=null;
    ensureResumeBar();
    if(timerState){clearInterval(timerState.interval);timerState=null;if(typeof releaseAwake==='function')releaseAwake()}
  },true);
})();
