(function(){
  if(window.__focusCardV93)return;
  window.__focusCardV93=true;

  var MAX_LINES=10,MAX_LINE=180,MAX_IMAGES=5,IMAGE_MAX_SIDE=960,IMAGE_TARGET_BYTES=120000;
  var bodyScroll='';
  var sampleSaveQueued=false;
  var SAMPLE_LINES=[
    '下半身の土台を整え、左右差の少ない動きを身につける',
    '股関節から動き、膝とつま先の向きを揃える',
    '右足だけで踏ん張らず、かかと・母趾球・小趾球で均等に支える',
    '痛みが出る動きは避け、伸びや筋肉の働きを目安にする',
    '週4回を目安に続け、2週間ごとに立ち姿勢と動きやすさを確認する'
  ];

  var style=document.createElement('style');
  style.setAttribute('data-focus-card-v93','');
  style.textContent='\
#focusVariants{display:block;width:100%;max-width:100%;min-width:0;box-sizing:border-box}\
.focus-card-head{display:flex;align-items:center;gap:10px;margin-bottom:12px}\
.focus-heading-text{font-size:14px;font-weight:900;letter-spacing:.14em;color:#168465;flex:1}\
.focus-edit{width:36px;height:36px;border:0;border-radius:11px;background:transparent;color:#6d7c76;font-size:19px;display:grid;place-items:center;cursor:pointer;-webkit-tap-highlight-color:transparent}\
.focus-edit:active{background:#dcefe8}\
.focus-card{width:100%;max-width:100%;min-width:0;box-sizing:border-box;overflow:hidden;border-radius:20px;background:#e9f7f2;border:1px solid #d9eee7;padding:18px;box-shadow:0 1px 2px rgba(0,0,0,.025);min-height:90px}\
.focus-empty{font-size:17px;color:#778a83;line-height:1.55}\
.focus-list{display:grid;gap:10px;margin:0;padding:0;list-style:none}\
.focus-list li{position:relative;padding-left:18px;font-size:18px;font-weight:650;line-height:1.45;overflow-wrap:anywhere}\
.focus-list li:before{content:"";position:absolute;left:1px;top:.65em;width:6px;height:6px;border-radius:50%;background:#27ae8b}\
.focus-gallery{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px;width:100%;max-width:100%;min-width:0;overflow:hidden;margin-top:16px;padding:1px;box-sizing:border-box}\
.focus-gallery-item{width:100%;min-width:0;aspect-ratio:1;box-sizing:border-box;padding:0;border:0;border-radius:10px;overflow:hidden;background:#dcebe6;cursor:pointer;-webkit-tap-highlight-color:transparent}\
.focus-gallery-item img{width:100%;height:100%;display:block;object-fit:cover}\
#focusImageViewer{position:fixed;inset:0;z-index:21000;background:rgba(20,26,32,.42);display:grid;place-items:center;padding:20px 14px}\
.focus-viewer-card{position:relative;width:min(100%,620px);max-height:min(72dvh,620px);box-sizing:border-box;padding:18px;border:1px solid #d9eee7;border-radius:20px;background:#e9f7f2;box-shadow:0 18px 55px rgba(0,0,0,.22);display:grid;grid-template-rows:minmax(0,1fr) auto;gap:12px;overflow:hidden}\
.focus-viewer-stage{width:100%;min-width:0;display:grid;place-items:center;overflow:hidden;touch-action:pan-y;user-select:none;-webkit-user-select:none}\
#focusImageViewer img{max-width:100%;max-height:calc(min(72dvh,620px) - 66px);display:block;object-fit:contain;border-radius:12px;transition:transform .14s ease,opacity .14s ease;will-change:transform,opacity;pointer-events:none}\
.focus-viewer-dots{display:flex;justify-content:center;gap:6px;min-height:7px}\
.focus-viewer-dot{width:6px;height:6px;border-radius:50%;background:#a9c9bd;transition:width .16s ease,background .16s ease}\
.focus-viewer-dot.active{width:16px;border-radius:99px;background:#168465}\
.focus-viewer-close{position:absolute;z-index:1;top:8px;right:8px;width:36px;height:36px;border:0;border-radius:50%;background:rgba(36,50,45,.72);color:#fff;font-size:24px;line-height:1;cursor:pointer}\
#focusEditorOverlay{position:fixed;inset:0;z-index:20000;background:rgba(20,26,32,.42);display:flex;align-items:flex-end;justify-content:center;padding:18px 14px max(18px,env(safe-area-inset-bottom))}\
#focusEditorPanel{width:min(100%,620px);max-height:min(82dvh,720px);overflow:auto;background:#f7f8fa;border-radius:24px;padding:20px;box-shadow:0 18px 55px rgba(0,0,0,.22);display:grid;gap:16px}\
.focus-editor-head{display:flex;align-items:center;gap:12px}\
.focus-editor-head h2{font-size:22px;margin:0;flex:1}\
.focus-editor-close{width:40px;height:40px;border:0;border-radius:12px;background:#e9edf0;color:#5d6872;font-size:24px;line-height:1;cursor:pointer}\
#focusEditorPanel .field textarea{min-height:230px}\
.focus-editor-actions{display:grid;grid-template-columns:1fr 1.4fr;gap:10px}\
.focus-editor-help{font-size:13px;color:#78828c;line-height:1.5;margin-top:-7px}\
.focus-image-editor{display:grid;gap:10px;padding-top:2px}\
.focus-image-title{font-size:15px;font-weight:800;color:#26332f}\
.focus-image-drafts{display:flex;gap:9px;overflow-x:auto;padding:1px 1px 5px;min-height:74px;scrollbar-width:none}\
.focus-image-drafts::-webkit-scrollbar{display:none}\
.focus-image-draft{position:relative;flex:0 0 70px;width:70px;height:70px}\
.focus-image-draft img{width:100%;height:100%;display:block;object-fit:cover;border-radius:12px}\
.focus-image-remove{position:absolute;top:-5px;right:-5px;width:25px;height:25px;border:2px solid #f7f8fa;border-radius:50%;background:#46514d;color:#fff;font-size:17px;line-height:19px;padding:0;cursor:pointer}\
.focus-image-empty{font-size:14px;color:#84908b;align-self:center}\
.focus-image-add{justify-self:start;min-height:40px;padding:8px 14px;border:1px solid #b7d9cd;border-radius:12px;background:#edf8f4;color:#168465;font-weight:800;cursor:pointer}\
.focus-image-add:disabled{opacity:.48;cursor:default}\
@media(min-width:700px){#focusEditorOverlay{align-items:center}.focus-card{padding:20px}}\
';
  document.head.appendChild(style);

  function text(value){return String(value==null?'':value).trim().slice(0,MAX_LINE)}
  function cleanFocus(value){
    value=value&&typeof value==='object'?value:{};
    var source=[];
    if(value.goal)source.push(value.goal);
    if(Array.isArray(value.lines))source=source.concat(value.lines);
    else if(Array.isArray(value.points))source=source.concat(value.points);
    else if(value.points)source=source.concat(String(value.points).split(/\r?\n/));
    var images=Array.isArray(value.images)?value.images.filter(function(src){return typeof src==='string'&&/^data:image\/(?:jpeg|png|webp);base64,/i.test(src)}).slice(0,MAX_IMAGES):[];
    return {lines:source.map(text).filter(Boolean).slice(0,MAX_LINES),images:images};
  }
  function hasFocus(value){return !!value&&Object.prototype.hasOwnProperty.call(value,'focus')}
  function ensureFocus(){
    if(typeof state==='undefined'||!state)return cleanFocus({lines:SAMPLE_LINES});
    var missing=!hasFocus(state);state.focus=cleanFocus(missing?{lines:SAMPLE_LINES}:state.focus);
    if(missing&&!sampleSaveQueued){sampleSaveQueued=true;setTimeout(function(){if(typeof save==='function')save()},0)}
    return state.focus;
  }
  function escapeValue(value){return String(value).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]})}

  function ensureHost(){
    var home=document.getElementById('home'),stack=home&&home.querySelector(':scope > .stack');if(!stack)return null;
    var host=document.getElementById('focusVariants');
    if(!host){host=document.createElement('section');host.id='focusVariants';host.setAttribute('aria-label','FOCUS');stack.insertBefore(host,stack.firstElementChild)}
    return host;
  }
  function renderFocus(){
    var host=ensureHost();if(!host)return;var focus=ensureFocus();
    host.innerHTML='<div class="focus-card"><div class="focus-card-head"><div class="focus-heading-text">FOCUS</div><button type="button" class="focus-edit" aria-label="FOCUSを編集" title="編集">✎</button></div>'+
      (focus.lines.length?'<ul class="focus-list">'+focus.lines.map(function(x){return '<li>'+escapeValue(x)+'</li>'}).join('')+'</ul>':'<div class="focus-empty">今取り組んでいることを設定</div>')+
      (focus.images.length?'<div class="focus-gallery" aria-label="理想のイメージ">'+focus.images.map(function(src,i){return '<button type="button" class="focus-gallery-item" data-focus-image="'+i+'" aria-label="画像'+(i+1)+'を拡大"><img src="'+escapeValue(src)+'" alt=""></button>'}).join('')+'</div>':'')+'</div>';
    host.querySelector('.focus-edit').onclick=openEditor;
    Array.prototype.forEach.call(host.querySelectorAll('[data-focus-image]'),function(button){button.onclick=function(){openImageViewer(focus.images,+button.getAttribute('data-focus-image'))}});
  }

  function closeImageViewer(){var viewer=document.getElementById('focusImageViewer');if(viewer)viewer.remove()}
  function openImageViewer(images,startIndex){
    images=Array.isArray(images)?images:[];if(!images.length)return;var index=Math.max(0,Math.min(images.length-1,+startIndex||0));closeImageViewer();
    var viewer=document.createElement('div');viewer.id='focusImageViewer';viewer.tabIndex=-1;viewer.setAttribute('role','dialog');viewer.setAttribute('aria-label','画像を拡大表示');
    viewer.innerHTML='<div class="focus-viewer-card"><button type="button" class="focus-viewer-close" aria-label="閉じる">×</button><div class="focus-viewer-stage"><img src="'+escapeValue(images[index])+'" alt="理想のイメージ '+(index+1)+'"></div><div class="focus-viewer-dots" aria-hidden="true"></div></div>';
    var stage=viewer.querySelector('.focus-viewer-stage'),image=stage.querySelector('img'),dots=viewer.querySelector('.focus-viewer-dots'),animating=false,startX=0,startAt=0,tracking=false;
    function renderDots(){dots.innerHTML=images.map(function(_,i){return '<span class="focus-viewer-dot'+(i===index?' active':'')+'"></span>'}).join('')}
    function move(next,direction){
      if(animating||next<0||next>=images.length||next===index)return;animating=true;image.style.transform='translateX('+(direction>0?-18:18)+'px)';image.style.opacity='.2';
      setTimeout(function(){index=next;image.src=images[index];image.alt='理想のイメージ '+(index+1);renderDots();image.style.transition='none';image.style.transform='translateX('+(direction>0?18:-18)+'px)';image.style.opacity='.2';image.offsetWidth;image.style.transition='transform .14s ease,opacity .14s ease';image.style.transform='translateX(0)';image.style.opacity='1';setTimeout(function(){animating=false},150)},140);
    }
    stage.onpointerdown=function(e){if(e.pointerType==='mouse'&&e.button!==0)return;tracking=true;startX=e.clientX;startAt=Date.now();try{stage.setPointerCapture(e.pointerId)}catch(err){}};
    stage.onpointerup=function(e){if(!tracking)return;tracking=false;var dx=e.clientX-startX,elapsed=Math.max(1,Date.now()-startAt),flick=Math.abs(dx)/elapsed>.45;if(Math.abs(dx)>42||(flick&&Math.abs(dx)>24))move(index+(dx<0?1:-1),dx<0?1:-1)};
    stage.onpointercancel=function(){tracking=false};
    viewer.onkeydown=function(e){if(e.key==='ArrowLeft'){e.preventDefault();move(index-1,-1)}else if(e.key==='ArrowRight'){e.preventDefault();move(index+1,1)}else if(e.key==='Escape')closeImageViewer()};
    viewer.onclick=function(e){if(e.target===viewer||e.target.classList.contains('focus-viewer-close'))closeImageViewer()};renderDots();document.body.appendChild(viewer);try{viewer.focus({preventScroll:true})}catch(e){viewer.focus()}
  }

  function readFile(file){return new Promise(function(resolve,reject){var reader=new FileReader();reader.onload=function(){resolve(reader.result)};reader.onerror=reject;reader.readAsDataURL(file)})}
  function loadImage(src){return new Promise(function(resolve,reject){var image=new Image();image.onload=function(){resolve(image)};image.onerror=reject;image.src=src})}
  function dataBytes(src){var comma=src.indexOf(',');return comma<0?src.length:Math.ceil((src.length-comma-1)*3/4)}
  async function compressImage(file){
    if(!file||!/^image\//i.test(file.type||''))throw new Error('画像ファイルを選んでください');
    var source=await readFile(file),image=await loadImage(source),scale=Math.min(1,IMAGE_MAX_SIDE/Math.max(image.naturalWidth,image.naturalHeight));
    var canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(image.naturalWidth*scale));canvas.height=Math.max(1,Math.round(image.naturalHeight*scale));
    var ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(image,0,0,canvas.width,canvas.height);
    var quality=.84,result=canvas.toDataURL('image/jpeg',quality);while(dataBytes(result)>IMAGE_TARGET_BYTES&&quality>.56){quality-=.07;result=canvas.toDataURL('image/jpeg',quality)}
    return result;
  }

  function closeEditor(){var overlay=document.getElementById('focusEditorOverlay');if(overlay)overlay.remove();document.body.style.overflow=bodyScroll}
  function openEditor(){
    closeEditor();var focus=ensureFocus(),draftImages=focus.images.slice();bodyScroll=document.body.style.overflow;document.body.style.overflow='hidden';
    var overlay=document.createElement('div');overlay.id='focusEditorOverlay';
    overlay.innerHTML='<div id="focusEditorPanel" role="dialog" aria-modal="true" aria-labelledby="focusEditorTitle">'+
      '<div class="focus-editor-head"><h2 id="focusEditorTitle">FOCUSを編集</h2><button type="button" class="focus-editor-close" aria-label="閉じる">×</button></div>'+
      '<label class="field">内容<textarea id="focusLinesInput" placeholder="1行目\n2行目\n3行目"></textarea></label>'+
      '<div class="focus-editor-help">1行が1つの箇条書きになります。最大'+MAX_LINES+'項目。</div>'+
      '<div class="focus-image-editor"><div class="focus-image-title">理想のイメージ写真</div><div class="focus-image-drafts" id="focusImageDrafts"></div><button type="button" class="focus-image-add" id="focusImageAddBtn">＋ 画像を追加</button><input type="file" id="focusImageInput" accept="image/*" hidden><div class="focus-editor-help">最大'+MAX_IMAGES+'枚。画像は保存時の負担を抑えるため自動で圧縮されます。</div></div>'+
      '<div class="focus-editor-actions"><button type="button" class="btn sub" id="focusCancelBtn">キャンセル</button><button type="button" class="btn" id="focusSaveBtn">保存</button></div></div>';
    document.body.appendChild(overlay);
    var input=document.getElementById('focusLinesInput');input.value=focus.lines.join('\n');
    var imageInput=document.getElementById('focusImageInput'),addButton=document.getElementById('focusImageAddBtn');
    function renderDrafts(){var drafts=document.getElementById('focusImageDrafts');drafts.innerHTML=draftImages.length?draftImages.map(function(src,i){return '<div class="focus-image-draft"><img src="'+escapeValue(src)+'" alt="画像'+(i+1)+'"><button type="button" class="focus-image-remove" data-remove-focus-image="'+i+'" aria-label="画像'+(i+1)+'を削除">×</button></div>'}).join(''):'<div class="focus-image-empty">画像はまだありません</div>';addButton.textContent='＋ 画像を追加（'+draftImages.length+'/'+MAX_IMAGES+'）';addButton.disabled=draftImages.length>=MAX_IMAGES;Array.prototype.forEach.call(drafts.querySelectorAll('[data-remove-focus-image]'),function(button){button.onclick=function(){draftImages.splice(+button.getAttribute('data-remove-focus-image'),1);renderDrafts()}})}
    renderDrafts();addButton.onclick=function(){if(draftImages.length<MAX_IMAGES)imageInput.click()};
    imageInput.onchange=async function(){var file=imageInput.files&&imageInput.files[0];imageInput.value='';if(!file)return;addButton.disabled=true;addButton.textContent='画像を処理中…';try{draftImages.push(await compressImage(file));renderDrafts()}catch(e){renderDrafts();alert(e&&e.message?e.message:'画像を追加できませんでした')}};
    overlay.querySelector('.focus-editor-close').onclick=closeEditor;document.getElementById('focusCancelBtn').onclick=closeEditor;
    document.getElementById('focusSaveBtn').onclick=function(){var previous=state.focus;state.focus=cleanFocus({lines:input.value.split(/\r?\n/),images:draftImages});var saved=typeof save==='function'?save():true;if(saved===false){state.focus=previous;alert('保存容量が不足しているため、画像を保存できませんでした。画像を減らしてもう一度お試しください。');return}renderFocus();closeEditor()};
    setTimeout(function(){try{input.focus()}catch(e){}},30);
  }

  var previousNormalize=typeof normalize==='function'?normalize:null;
  if(previousNormalize)normalize=function(s){var out=previousNormalize(s);out.focus=cleanFocus(hasFocus(s)?s.focus:{lines:SAMPLE_LINES});return out};
  var previousSyncPayload=typeof syncPayload==='function'?syncPayload:null;
  if(previousSyncPayload)syncPayload=function(){var payload=JSON.parse(previousSyncPayload());payload.focus=cleanFocus(state&&state.focus);return JSON.stringify(payload)};
  var previousApplyRemote=typeof applyRemote==='function'?applyRemote:null;
  if(previousApplyRemote)applyRemote=function(raw,remoteTime){var remote={};try{remote=JSON.parse(raw)||{}}catch(e){}var result=previousApplyRemote.apply(this,arguments);state.focus=cleanFocus(hasFocus(remote)?remote.focus:{lines:SAMPLE_LINES});if(typeof save==='function')save(false);renderFocus();return result};
  var previousRenderHome=typeof renderHome==='function'?renderHome:null;
  if(previousRenderHome)renderHome=function(){var result=previousRenderHome.apply(this,arguments);renderFocus();return result};

  window.__stretchTimerFocusV93={clean:cleanFocus,render:renderFocus,openEditor:openEditor};
  ensureFocus();renderFocus();
})();
