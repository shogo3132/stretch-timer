(function(){
  if(window.__refreshMotionV54)return;
  window.__refreshMotionV54=true;

  var style=document.createElement('style');
  style.setAttribute('data-refresh-motion-v54','');
  style.textContent='\
#refreshBtn.refreshing{animation:none!important;transform:none!important}\
#refreshBtn .refresh-icon{display:inline-block;line-height:1;transform-origin:50% 50%}\
#refreshBtn.refreshing .refresh-icon{animation:spinRefreshIcon .7s linear infinite}\
@keyframes spinRefreshIcon{to{transform:rotate(360deg)}}\
';
  document.head.appendChild(style);

  function polish(){
    var btn=document.getElementById('refreshBtn');
    if(!btn)return;
    var icon=btn.querySelector('.refresh-icon');
    if(!icon){
      btn.textContent='';
      icon=document.createElement('span');
      icon.className='refresh-icon';
      icon.textContent='↻';
      icon.setAttribute('aria-hidden','true');
      btn.appendChild(icon);
    }
  }

  if(window.StretchUI&&StretchUI.registerScreenHook)StretchUI.registerScreenHook({key:'refresh-icon',after:function(){setTimeout(polish,0)}});
  polish();
  setTimeout(polish,100);
})();
