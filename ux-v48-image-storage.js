(function(){
  if(window.__imageStorageV48)return;
  window.__imageStorageV48=true;

  var MAX_SIDE=960;
  var TARGET_BYTES=110*1024;
  var MIN_QUALITY=.58;
  var START_QUALITY=.82;
  var MIGRATION_KEY='stretchTimer.imageCompressionV48';

  function isQuotaError(e){
    return !!e && (e.name==='QuotaExceededError'||e.name==='NS_ERROR_DOM_QUOTA_REACHED'||e.code===22||e.code===1014);
  }

  function toast(text){
    var old=document.getElementById('storageToast');if(old)old.remove();
    var el=document.createElement('div');el.id='storageToast';el.textContent=text;
    el.style.cssText='position:fixed;left:50%;bottom:28px;transform:translateX(-50%);z-index:10001;background:#20252b;color:#fff;padding:10px 15px;border-radius:14px;font-size:14px;box-shadow:0 4px 18px rgba(0,0,0,.2);max-width:88vw;text-align:center';
    document.body.appendChild(el);setTimeout(function(){el.remove()},3200);
  }

  var rawSave=typeof save==='function'?save:null;
  if(rawSave){
    save=function(mark){
      if(arguments.length===0)mark=true;
      var previousUpdated=state&&state.updatedAt;
      if(mark&&state)state.updatedAt=Date.now();
      try{
        localStorage.setItem(STORAGE,JSON.stringify(state));
        if(mark&&typeof queueSync==='function')queueSync();
        return true;
      }catch(e){
        if(state)state.updatedAt=previousUpdated;
        if(isQuotaError(e)){
          toast('保存容量がいっぱいです。画像を軽量化してから再度お試しください。');
          console.warn('Stretch Timer storage quota exceeded',e);
          return false;
        }
        throw e;
      }
    };
  }

  function dataUrlBytes(data){
    if(!data||typeof data!=='string')return 0;
    var comma=data.indexOf(',');if(comma<0)return data.length;
    return Math.ceil((data.length-comma-1)*3/4);
  }

  function loadBitmapFromFile(file){
    if(window.createImageBitmap)return createImageBitmap(file);
    return new Promise(function(resolve,reject){
      var r=new FileReader();r.onerror=reject;r.onload=function(){
        var img=new Image();img.onerror=reject;img.onload=function(){resolve(img)};img.src=r.result;
      };r.readAsDataURL(file);
    });
  }

  function loadBitmapFromDataUrl(src){
    return new Promise(function(resolve,reject){
      var img=new Image();img.onerror=reject;img.onload=function(){resolve(img)};img.src=src;
    });
  }

  function scaledSize(w,h){
    var scale=Math.min(1,MAX_SIDE/Math.max(w,h));
    return {w:Math.max(1,Math.round(w*scale)),h:Math.max(1,Math.round(h*scale))};
  }

  function compressBitmap(bitmap){
    var w=bitmap.naturalWidth||bitmap.width,h=bitmap.naturalHeight||bitmap.height;
    var s=scaledSize(w,h),canvas=document.createElement('canvas');canvas.width=s.w;canvas.height=s.h;
    var ctx=canvas.getContext('2d',{alpha:false});ctx.fillStyle='#fff';ctx.fillRect(0,0,s.w,s.h);ctx.drawImage(bitmap,0,0,s.w,s.h);
    var q=START_QUALITY,data=canvas.toDataURL('image/jpeg',q);
    while(dataUrlBytes(data)>TARGET_BYTES&&q>MIN_QUALITY){q=Math.max(MIN_QUALITY,q-.08);data=canvas.toDataURL('image/jpeg',q)}
    if(bitmap&&typeof bitmap.close==='function')try{bitmap.close()}catch(e){}
    return data;
  }

  async function compressFile(file){
    return compressBitmap(await loadBitmapFromFile(file));
  }

  async function compressDataUrl(src){
    if(!src||src.indexOf('data:image/')!==0)return src;
    try{return compressBitmap(await loadBitmapFromDataUrl(src))}catch(e){return src}
  }

  var input=document.getElementById('photoInput');
  if(input){
    input.onchange=async function(e){
      var f=e.target.files&&e.target.files[0];if(!f)return;
      var x=typeof item==='function'?item():null;if(!x)return;
      var old=x.photo||'';
      input.disabled=true;
      try{
        var compressed=await compressFile(f);
        x.photo=compressed;
        var preview=document.getElementById('photoPreview');if(preview)preview.src=compressed;
        if(typeof save==='function'&&!save()){
          x.photo=old;
          if(preview)preview.src=old||(typeof svgPlaceholder==='function'?svgPlaceholder():'');
          return;
        }
        toast('画像を軽量化して保存しました');
      }catch(err){
        console.error(err);toast('画像の保存に失敗しました');
      }finally{input.disabled=false;input.value=''}
    };
  }

  async function migrateExisting(){
    if(localStorage.getItem(MIGRATION_KEY)==='1')return;
    if(typeof state==='undefined'||!state||!Array.isArray(state.menus))return;
    var list=[];
    state.menus.forEach(function(m){(m.items||[]).forEach(function(x){if(x.photo&&x.photo.indexOf('data:image/')===0)list.push(x)})});
    if(!list.length){localStorage.setItem(MIGRATION_KEY,'1');return}
    var changed=false;
    for(var i=0;i<list.length;i++){
      var x=list[i],before=x.photo,beforeBytes=dataUrlBytes(before);
      if(beforeBytes<90*1024)continue;
      var after=await compressDataUrl(before);
      if(after&&after.length<before.length){x.photo=after;changed=true}
      await new Promise(function(r){setTimeout(r,35)});
    }
    if(changed){
      if(typeof save==='function'&&save(false)){
        localStorage.setItem(MIGRATION_KEY,'1');toast('既存画像を軽量化しました');
        if(typeof renderItems==='function'&&document.querySelector('#menuEdit.screen.active'))renderItems();
      }
    }else localStorage.setItem(MIGRATION_KEY,'1');
  }

  setTimeout(function(){
    if('requestIdleCallback'in window)requestIdleCallback(function(){migrateExisting()},{timeout:2200});
    else migrateExisting();
  },1200);
})();
