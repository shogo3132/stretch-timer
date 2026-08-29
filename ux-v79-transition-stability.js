(function(){
  if(window.__transitionStabilityV79)return;
  window.__transitionStabilityV79=true;

  function totalCount(){
    try{
      if(typeof state==='undefined'||!state||!Array.isArray(state.menus)||typeof currentMenuId==='undefined')return 0;
      var m=state.menus.find(function(x){return x.id===currentMenuId});
      return m&&Array.isArray(m.completions)?m.completions.length:0;
    }catch(e){return 0}
  }
  function stabilize(id){
    var active=id||(document.querySelector('.screen.active')&&document.querySelector('.screen.active').id)||'';
    var headerTools=['home','tasks','recipes','settings'].indexOf(active)>=0;
    var version=document.getElementById('appVersion');if(version)version.style.display=headerTools?'inline':'none';
    var refresh=document.getElementById('refreshBtn');if(refresh)refresh.style.display=headerTools?'inline-block':'none';
    var total=document.getElementById('detailHeaderTotal');
    if(total){
      if(active==='routineDetail'){total.textContent='トータル回数：'+totalCount();total.style.display='inline'}
      else total.style.display='none';
    }
  }
  var oldShow=typeof show==='function'?show:null;
  if(oldShow)show=function(id){var r=oldShow.apply(this,arguments);stabilize(id);return r};
  stabilize();
})();
