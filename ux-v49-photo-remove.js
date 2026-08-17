(function(){
  if(window.__photoRemoveV49)return;
  window.__photoRemoveV49=true;

  var style=document.createElement('style');
  style.setAttribute('data-photo-remove-v49','');
  style.textContent='\
#photoRemoveRow{display:flex;justify-content:flex-end;margin-top:8px}\
#photoRemoveBtn{min-height:38px;padding:7px 12px;border:0;border-radius:12px;background:#fcecef;color:#ae3742;font-size:13px;font-weight:700;cursor:pointer}\
#photoRemoveBtn[disabled]{opacity:.38;cursor:default}\
';
  document.head.appendChild(style);

  function currentItem(){try{return typeof item==='function'?item():null}catch(e){return null}}
  function refresh(){
    var btn=document.getElementById('photoRemoveBtn');if(!btn)return;
    var x=currentItem();btn.disabled=!(x&&x.photo);
  }
  function ensureButton(){
    var input=document.getElementById('photoInput');if(!input)return;
    var row=document.getElementById('photoRemoveRow');
    if(!row){
      row=document.createElement('div');row.id='photoRemoveRow';
      var btn=document.createElement('button');btn.type='button';btn.id='photoRemoveBtn';btn.textContent='画像を削除';btn.setAttribute('aria-label','登録画像を削除');
      btn.addEventListener('click',function(e){
        e.preventDefault();e.stopPropagation();
        var x=currentItem();if(!x||!x.photo)return;
        var old=x.photo;x.photo='';
        var preview=document.getElementById('photoPreview');if(preview)preview.src=typeof svgPlaceholder==='function'?svgPlaceholder():'';
        if(typeof save==='function'&&!save()){
          x.photo=old;if(preview)preview.src=old;return;
        }
        input.value='';refresh();
      });
      row.appendChild(btn);input.insertAdjacentElement('afterend',row);
    }
    refresh();
  }

  var prevOpen=typeof openItem==='function'?openItem:null;
  if(prevOpen){
    openItem=function(){var r=prevOpen.apply(this,arguments);setTimeout(function(){ensureButton();refresh()},0);return r;};
  }

  var input=document.getElementById('photoInput');
  if(input)input.addEventListener('change',function(){setTimeout(refresh,450)});
  setTimeout(ensureButton,80);
})();
