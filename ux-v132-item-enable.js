(function(){
  if(window.__itemEnableV132)return;
  window.__itemEnableV132=true;

  var style=document.createElement('style');
  style.setAttribute('data-item-enable-v132','');
  style.textContent='\
#menuEdit .item.item-disabled{opacity:1!important;background:#edf0f2!important;border-color:#e1e5e8!important}\
#menuEdit .item.item-disabled .item-title,#menuEdit .item.item-disabled .muted{color:#889199!important}\
#menuEdit .item.item-disabled .thumb{filter:grayscale(1);opacity:.58}\
#itemEdit .item-enabled-setting{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:13px 14px;border:1px solid #e2e7eb;border-radius:14px;background:#fff;cursor:pointer}\
#itemEdit .item-enabled-setting span{display:grid;gap:3px;min-width:0}\
#itemEdit .item-enabled-setting strong{font-size:15px;color:#26313a}\
#itemEdit .item-enabled-setting small{font-size:12px;color:#77818a;line-height:1.35}\
#itemEdit .item-enabled-setting input{appearance:none;position:relative;flex:0 0 auto;width:42px;height:24px;margin:0;border-radius:999px;background:#c8d0d6;transition:background .16s ease;cursor:pointer}\
#itemEdit .item-enabled-setting input:after{content:"";position:absolute;top:3px;left:3px;width:18px;height:18px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.2);transition:transform .16s ease}\
#itemEdit .item-enabled-setting input:checked{background:#27ae8b}\
#itemEdit .item-enabled-setting input:checked:after{transform:translateX(18px)}\
';
  document.head.appendChild(style);

  function enabled(x){return !x||x.enabled!==false}
  function activeItems(m){return m&&Array.isArray(m.items)?m.items.filter(enabled):[]}
  function activeMenu(m){if(!m||!Array.isArray(m.items))return m;var copy=Object.create(m);copy.items=activeItems(m);return copy}
  function rawMenu(){try{return typeof menu==='function'?menu():null}catch(e){return null}}

  if(typeof normalize==='function'){
    var oldNormalize=normalize;
    normalize=function(s){var out=oldNormalize.apply(this,arguments);(out&&out.menus||[]).forEach(function(m){(m.items||[]).forEach(function(x){if(typeof x.enabled!=='boolean')x.enabled=true})});return out};
  }
  try{if(typeof state!=='undefined'&&state&&Array.isArray(state.menus)){var changed=false;state.menus.forEach(function(m){(m.items||[]).forEach(function(x){if(typeof x.enabled!=='boolean'){x.enabled=true;changed=true}})});if(changed&&typeof save==='function')save(false)}}catch(e){}

  var baseMenu=typeof menu==='function'?menu:null;
  if(baseMenu)menu=function(){var m=baseMenu.apply(this,arguments);return timerState&&typeof currentScreen!=='undefined'&&currentScreen==='timer'?activeMenu(m):m};

  if(typeof totalSeconds==='function'){
    var oldTotalSeconds=totalSeconds;
    totalSeconds=function(m){return oldTotalSeconds.call(this,activeMenu(m))};
  }
  if(typeof startTimer==='function'){
    var oldStart=startTimer;
    startTimer=function(menuId){var m=typeof state!=='undefined'&&state&&Array.isArray(state.menus)?state.menus.find(function(x){return x.id===menuId}):null;if(m&&!activeItems(m).length){alert('実行する項目を1つ以上ONにしてください');return}return oldStart.apply(this,arguments)};
  }

  function addSettingToggle(){
    var reverse=document.getElementById('itemReverseSide');if(!reverse||document.getElementById('itemEnabled'))return;
    var m=rawMenu(),id=typeof currentItemId!=='undefined'?currentItemId:'';
    window.__itemEnableDraftV132=m&&m.items.find(function(x){return x.id===id})||null;
    var label=document.createElement('label');label.className='item-enabled-setting';label.innerHTML='<span><strong>この項目を実行する</strong><small>OFFの項目は実行と合計時間から外れます</small></span><input id="itemEnabled" type="checkbox" checked aria-label="この項目を実行する">';
    reverse.closest('label').insertAdjacentElement('beforebegin',label);
    var input=label.querySelector('input');
    input.checked=!(window.__itemEnableDraftV132&&window.__itemEnableDraftV132.enabled===false);
    var commit=document.getElementById('itemCommitBtn');
    if(commit){
      if(commit.__itemEnableSaveV132)commit.removeEventListener('click',commit.__itemEnableSaveV132,true);
      commit.__itemEnableSaveV132=function(){
        var value=!!input.checked,id=typeof currentItemId!=='undefined'?currentItemId:'';
        setTimeout(function(){
          var m=rawMenu(),x=m&&m.items.find(function(v){return v.id===id});
          if(!x||x.enabled===value)return;
          x.enabled=value;
          if(typeof save==='function')save();
          if(typeof updateDuration==='function')updateDuration();
        },0);
      };
      commit.addEventListener('click',commit.__itemEnableSaveV132,true);
    }
  }
  var oldOpenItem=typeof openItem==='function'?openItem:null;
  if(oldOpenItem)openItem=function(){var r=oldOpenItem.apply(this,arguments);try{var m=rawMenu(),id=typeof currentItemId!=='undefined'?currentItemId:'';window.__itemEnableDraftV132=m&&m.items.find(function(x){return x.id===id})||null;addSettingToggle()}catch(e){}return r};

  if(window.StretchUI&&StretchUI.registerDataProvider)window.StretchUI.registerDataProvider({
    key:'item-enable',
    write:function(payload){
      payload.itemEnable={};
      (state.menus||[]).forEach(function(m){(m.items||[]).forEach(function(x){if(x.enabled===false)payload.itemEnable[x.id]=false})});
    },
    read:function(remote){
      var values=remote&&remote.itemEnable||{};
      (state.menus||[]).forEach(function(m){(m.items||[]).forEach(function(x){x.enabled=values[x.id]!==false})});
    }
  });

  function decorateListState(card){
    var m=rawMenu(),x=card&&m&&m.items.find(function(v){return v.id===card.dataset.id});if(!x)return;
    var off=!enabled(x),title=card.querySelector('.item-title'),meta=card.querySelector('.muted'),thumb=card.querySelector('.thumb');
    card.classList.toggle('item-disabled',off);
    card.style.backgroundColor=off?'#edf0f2':'';
    card.style.borderColor=off?'#e1e5e8':'';
    if(title)title.style.color=off?'#889199':'';
    if(meta)meta.style.color=off?'#889199':'';
    if(thumb){thumb.style.filter=off?'grayscale(1)':'';thumb.style.opacity=off?'.58':''}
  }
  var oldRender=typeof renderItems==='function'?renderItems:null;
  if(oldRender)renderItems=function(){var r=oldRender.apply(this,arguments);document.querySelectorAll('#menuEdit #itemList .item').forEach(decorateListState);return r};
  function syncVisibleItemUi(){
    var editor=document.getElementById('itemEdit');
    if(editor&&editor.classList.contains('active'))addSettingToggle();
    document.querySelectorAll('#menuEdit #itemList .item').forEach(decorateListState);
  }
  new MutationObserver(function(){syncVisibleItemUi()}).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
  setTimeout(syncVisibleItemUi,0);
})();
