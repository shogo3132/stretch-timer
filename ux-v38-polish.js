(function(){
  if(window.__uiPolishV38)return;
  window.__uiPolishV38=true;

  var style=document.createElement('style');
  style.setAttribute('data-ui-polish-v38','');
  style.textContent='\
#detailCompleteCount{display:none!important}\
#detailHeaderTotal{font-size:14px;font-weight:600;color:#5f6873;white-space:nowrap;margin-left:auto}\
.detail-time-axis{font-size:18px!important;font-weight:400!important}\
';
  document.head.appendChild(style);

  function totalCount(){
    try{
      if(typeof state==='undefined'||!state||!Array.isArray(state.menus)||typeof currentMenuId==='undefined')return 0;
      var m=state.menus.find(function(x){return x.id===currentMenuId});
      return m&&Array.isArray(m.completions)?m.completions.length:0;
    }catch(e){return 0}
  }

  function ensureHeaderTotal(){
    var el=document.getElementById('detailHeaderTotal');
    if(el)return el;
    var title=document.getElementById('title');
    if(!title||!title.parentNode)return null;
    el=document.createElement('span');
    el.id='detailHeaderTotal';
    el.style.display='none';
    title.insertAdjacentElement('afterend',el);
    return el;
  }

  function syncHeader(){
    var active=document.querySelector('.screen.active');
    var id=active?active.id:'';
    var version=document.getElementById('appVersion');
    var total=ensureHeaderTotal();

    if(version)version.style.display=id==='home'||id==='tasks'?'inline':'none';
    if(total){
      if(id==='routineDetail'){
        total.textContent='トータル回数：'+totalCount();
        total.style.display='inline';
      }else total.style.display='none';
    }
  }

  var oldShow=typeof show==='function'?show:null;
  if(oldShow){
    show=function(){
      var r=oldShow.apply(this,arguments);
      setTimeout(syncHeader,0);
      return r;
    };
  }

  var oldOpen=window.openRoutineDetail;
  if(typeof oldOpen==='function'){
    window.openRoutineDetail=function(){
      var r=oldOpen.apply(this,arguments);
      setTimeout(syncHeader,0);
      return r;
    };
  }

  setTimeout(syncHeader,0);
})();
