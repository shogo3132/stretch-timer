(function(){
  if(window.__timerEditSaveV81)return;
  window.__timerEditSaveV81=true;

  var session=null;
  var restoringEditor=false;
  var coreOpenItem=typeof openItem==='function'?openItem:null;

  function currentMenuSafe(){try{return typeof menu==='function'?menu():null}catch(e){return null}}
  function currentItemSafe(){try{return typeof item==='function'?item():null}catch(e){return null}}
  function resumeBar(){return document.getElementById('timerResumeEditBar')}
  function commitButton(){return document.getElementById('itemCommitBtn')}

  function showResumeBar(){
    var bar=resumeBar();
    if(bar)bar.classList.toggle('active',!!session);
  }

  function capturePausedTimer(itemId){
    if(typeof currentScreen==='undefined'||currentScreen!=='timer'||!timerState||!timerState.paused)return null;
    return {
      menuId:currentMenuId,
      itemId:itemId,
      index:+timerState.index||0,
      timer:Object.assign({},timerState)
    };
  }

  if(coreOpenItem){
    openItem=function(id){
      if(!restoringEditor){
        var next=capturePausedTimer(id);
        session=next;
      }
      var r=coreOpenItem.apply(this,arguments);
      showResumeBar();
      return r;
    };
  }

  function restorePausedEditor(){
    if(!session)return;
    var s=session;
    timerState=Object.assign({},s.timer,{paused:true,interval:null});
    currentMenuId=s.menuId;
    restoringEditor=true;
    try{
      if(typeof openItem==='function')openItem(s.itemId);
    }finally{
      restoringEditor=false;
    }
    session=s;
    showResumeBar();
  }

  function saveThroughCore(){
    var btn=commitButton();
    if(!btn||typeof btn.onclick!=='function')return false;
    btn.onclick();
    return typeof currentScreen!=='undefined'&&currentScreen!=='itemEdit';
  }

  function saveAndStay(){
    if(!session)return;
    var saved=saveThroughCore();
    if(!saved)return;
    restorePausedEditor();
  }

  function saveAndResume(){
    if(!session)return;
    var s=session;
    var saved=saveThroughCore();
    if(!saved)return;

    currentMenuId=s.menuId;
    var m=currentMenuSafe();
    if(!m||!Array.isArray(m.items)||!m.items.length){session=null;return}
    var idx=m.items.findIndex(function(x){return x.id===s.itemId});
    if(idx<0)idx=Math.max(0,Math.min(s.index,m.items.length-1));
    var x=m.items[idx];

    timerState=Object.assign({},s.timer,{
      index:idx,
      phase:'item',
      remaining:Math.max(1,+x.seconds||1),
      total:Math.max(1,+x.seconds||1),
      paused:false,
      interval:null
    });
    session=null;
    showResumeBar();
    if(typeof show==='function')show('timer',m.name);
    if(typeof renderTimer==='function')renderTimer();
    if(typeof runTick==='function')runTick();
  }

  document.addEventListener('click',function(e){
    if(!session||typeof currentScreen==='undefined'||currentScreen!=='itemEdit')return;
    var commit=e.target&&e.target.closest?e.target.closest('#itemCommitBtn'):null;
    if(commit){
      e.preventDefault();
      e.stopImmediatePropagation();
      saveAndStay();
      return;
    }
    var resume=e.target&&e.target.closest?e.target.closest('#resumeEditedTimerBtn'):null;
    if(resume){
      e.preventDefault();
      e.stopImmediatePropagation();
      saveAndResume();
    }
  },true);

  setTimeout(showResumeBar,0);
})();
