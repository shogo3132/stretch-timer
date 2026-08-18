(function(){
  if(window.__itemLayoutV62)return;
  window.__itemLayoutV62=true;

  var style=document.createElement('style');
  style.setAttribute('data-item-layout-v62','');
  style.textContent='\
#itemEdit .item-photo-field{position:relative}\
#itemEdit .item-photo-preview-wrap{position:relative}\
#itemEdit #photoPreview{display:block;width:100%}\
#itemPhotoDeleteX{position:absolute;top:10px;right:10px;z-index:5;width:42px;height:42px;border:0;border-radius:50%;background:rgba(20,24,28,.72);color:#fff;font-size:25px;font-weight:400;line-height:1;display:none;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 2px 10px rgba(0,0,0,.18);-webkit-tap-highlight-color:transparent}\
#itemPhotoDeleteX.show{display:flex}\
#photoRemoveRow{display:none!important}\
';
  document.head.appendChild(style);

  function currentItem(){try{return typeof item==='function'?item():null}catch(e){return null}}

  function photoField(){
    var input=document.getElementById('photoInput');
    return input&&input.closest('.field');
  }

  function updateDeleteX(){
    var btn=document.getElementById('itemPhotoDeleteX');
    if(!btn)return;
    var x=currentItem();
    btn.classList.toggle('show',!!(x&&x.photo));
  }

  function ensurePhotoOverlay(){
    var field=photoField();
    var preview=document.getElementById('photoPreview');
    if(!field||!preview)return;
    field.classList.add('item-photo-field');

    var wrap=preview.parentElement&&preview.parentElement.classList.contains('item-photo-preview-wrap')?preview.parentElement:null;
    if(!wrap){
      wrap=document.createElement('div');
      wrap.className='item-photo-preview-wrap';
      preview.parentNode.insertBefore(wrap,preview);
      wrap.appendChild(preview);
    }

    var btn=document.getElementById('itemPhotoDeleteX');
    if(!btn){
      btn=document.createElement('button');
      btn.type='button';
      btn.id='itemPhotoDeleteX';
      btn.textContent='×';
      btn.setAttribute('aria-label','画像を削除');
      btn.title='画像を削除';
      btn.onclick=function(e){
        e.preventDefault();e.stopPropagation();
        var old=document.getElementById('photoRemoveBtn');
        if(old&&!old.disabled){old.click();setTimeout(updateDeleteX,0);return}
        var x=currentItem();if(!x||!x.photo)return;
        x.photo='';
        var p=document.getElementById('photoPreview');
        if(p)p.src=typeof svgPlaceholder==='function'?svgPlaceholder():'';
        var input=document.getElementById('photoInput');if(input)input.value='';
        if(typeof save==='function')save();
        updateDeleteX();
      };
      wrap.appendChild(btn);
    }
    updateDeleteX();
  }

  function moveLayout(){
    var screen=document.getElementById('itemEdit');
    var stack=screen&&screen.querySelector('.stack');
    if(!stack)return;

    ensurePhotoOverlay();

    var photo=photoField();
    var name=document.getElementById('itemName');name=name&&name.closest('label');
    var desc=document.getElementById('itemDesc');desc=desc&&desc.closest('label');
    var times=document.getElementById('itemTimeFields');
    var deleteBtn=document.getElementById('deleteItemBtn');
    var deleteRow=deleteBtn&&deleteBtn.parentElement;
    var headline=stack.querySelector('.headline');

    var anchor=headline&&headline.parentNode===stack?headline.nextSibling:stack.firstChild;
    [photo,name,desc,times,deleteRow].forEach(function(el){
      if(!el||el.parentNode!==stack)return;
      stack.insertBefore(el,anchor);
      anchor=el.nextSibling;
    });

    var tip=stack.querySelector('.tip');
    if(tip)tip.style.display='none';
  }

  var previousOpenItem=typeof openItem==='function'?openItem:null;
  if(previousOpenItem){
    openItem=function(){
      var r=previousOpenItem.apply(this,arguments);
      setTimeout(moveLayout,30);
      return r;
    };
  }

  var input=document.getElementById('photoInput');
  if(input)input.addEventListener('change',function(){setTimeout(function(){ensurePhotoOverlay();updateDeleteX()},500)});

  setTimeout(function(){if(typeof currentScreen!=='undefined'&&currentScreen==='itemEdit')moveLayout()},80);
})();
