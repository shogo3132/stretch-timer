(function(){
  if(window.__focusCardV94)return;
  window.__focusCardV94=true;

  var MAX_LINES=10,MAX_LINE=180,MAX_MEDIA=5,MAX_VIDEOS=2,MAX_VIDEO_BYTES=8*1024*1024,MAX_VIDEO_SECONDS=10,IMAGE_MAX_SIDE=960,IMAGE_TARGET_BYTES=120000;
  var VIDEO_DELETE_KEY='stretchTimer.focusVideoDeletes';
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
  style.setAttribute('data-focus-card-v94','');
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
.focus-gallery-item.video{position:relative;background:linear-gradient(145deg,#cfe7df,#9fc9bb)}\
.focus-gallery-play{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:28px;height:28px;border-radius:50%;background:rgba(18,35,29,.72);color:#fff;display:grid;place-items:center;font-size:13px;padding-left:2px;box-shadow:0 2px 7px rgba(0,0,0,.2)}\
#focusImageViewer{position:fixed;inset:0;z-index:21000;background:rgba(20,26,32,.42);display:grid;place-items:center;padding:20px 14px}\
.focus-viewer-card{position:relative;width:min(100%,620px);max-height:min(72dvh,620px);box-sizing:border-box;padding:18px;border:1px solid #d9eee7;border-radius:20px;background:#e9f7f2;box-shadow:0 18px 55px rgba(0,0,0,.22);display:grid;grid-template-rows:minmax(0,1fr) auto;gap:12px;overflow:hidden}\
.focus-viewer-stage{width:100%;min-width:0;display:grid;place-items:center;overflow:hidden;touch-action:pan-y;user-select:none;-webkit-user-select:none}\
.focus-viewer-media-shell{width:100%;min-height:140px;display:grid;place-items:center;transition:transform .14s ease,opacity .14s ease;will-change:transform,opacity}\
#focusImageViewer img,#focusImageViewer video{max-width:100%;max-height:calc(min(72dvh,620px) - 66px);display:block;object-fit:contain;border-radius:12px}\
#focusImageViewer img{pointer-events:none}\
.focus-viewer-loading{font-size:14px;color:#667a72;padding:48px 12px}\
.focus-viewer-error{font-size:14px;color:#6e7773;line-height:1.6;text-align:center;padding:42px 14px}\
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
.focus-media-adds{display:flex;flex-wrap:wrap;gap:8px}\
.focus-image-add{min-height:40px;padding:8px 14px;border:1px solid #b7d9cd;border-radius:12px;background:#edf8f4;color:#168465;font-weight:800;cursor:pointer}\
.focus-image-add:disabled{opacity:.48;cursor:default}\
@media(min-width:700px){#focusEditorOverlay{align-items:center}.focus-card{padding:20px}}\
';
  document.head.appendChild(style);

  function text(value){return String(value==null?'':value).trim().slice(0,MAX_LINE)}
  function isImageMedia(value){return typeof value==='string'&&/^data:image\/(?:jpeg|png|webp);base64,/i.test(value)}
  function cleanVideo(value){
    if(!value||typeof value!=='object'||value.type!=='video'||typeof value.path!=='string'||!/^\/focus-media\/[a-z0-9._-]+$/i.test(value.path))return null;
    var mime=value.mime==='video/webm'?'video/webm':'video/mp4',poster=isImageMedia(value.poster)?value.poster:'';
    return {type:'video',path:value.path,name:text(value.name||'動画'),mime:mime,size:Math.max(0,Math.min(MAX_VIDEO_BYTES,Math.round(+value.size||0))),duration:Math.max(0,Math.min(MAX_VIDEO_SECONDS,Math.round((+value.duration||0)*10)/10)),poster:poster};
  }
  function isVideoMedia(value){return !!cleanVideo(value)}
  function videoCount(list){return (list||[]).reduce(function(n,x){return n+(x&&typeof x==='object'&&x.type==='video'?1:0)},0)}
  function cleanFocus(value){
    value=value&&typeof value==='object'?value:{};
    var source=[];
    if(value.goal)source.push(value.goal);
    if(Array.isArray(value.lines))source=source.concat(value.lines);
    else if(Array.isArray(value.points))source=source.concat(value.points);
    else if(value.points)source=source.concat(String(value.points).split(/\r?\n/));
    var images=[];
    (Array.isArray(value.images)?value.images:[]).forEach(function(entry){if(images.length>=MAX_MEDIA)return;if(isImageMedia(entry))images.push(entry);else{var video=cleanVideo(entry);if(video&&videoCount(images)<MAX_VIDEOS)images.push(video)}});
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
      (focus.images.length?'<div class="focus-gallery" aria-label="理想のイメージ">'+focus.images.map(function(entry,i){var video=isVideoMedia(entry);return '<button type="button" class="focus-gallery-item'+(video?' video':'')+'" data-focus-image="'+i+'" aria-label="'+(video?'動画':'画像')+(i+1)+'を表示">'+(video?(entry.poster?'<img src="'+escapeValue(entry.poster)+'" alt="">':'')+'<span class="focus-gallery-play">▶</span>':'<img src="'+escapeValue(entry)+'" alt="">')+'</button>'}).join('')+'</div>':'')+'</div>';
    host.querySelector('.focus-edit').onclick=openEditor;
    Array.prototype.forEach.call(host.querySelectorAll('[data-focus-image]'),function(button){button.onclick=function(){openImageViewer(focus.images,+button.getAttribute('data-focus-image'))}});
  }

  function closeImageViewer(){var viewer=document.getElementById('focusImageViewer');if(viewer)viewer.remove()}
  var videoLinkCache={};
  async function focusVideoLink(path){
    var cached=videoLinkCache[path];if(cached&&Date.now()<cached.expires)return cached.url;
    if(typeof accessToken!=='function'||typeof hasDropboxAuth!=='function'||!hasDropboxAuth())throw new Error('Dropboxに接続すると動画を再生できます');
    var token=await accessToken(),response=await fetch('https://api.dropboxapi.com/2/files/get_temporary_link',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({path:path})});
    if(!response.ok)throw new Error('動画を読み込めませんでした');var data=await response.json();videoLinkCache[path]={url:data.link,expires:Date.now()+3*60*60*1000};return data.link;
  }
  function openImageViewer(images,startIndex){
    images=Array.isArray(images)?images:[];if(!images.length)return;var index=Math.max(0,Math.min(images.length-1,+startIndex||0));closeImageViewer();
    var viewer=document.createElement('div');viewer.id='focusImageViewer';viewer.tabIndex=-1;viewer.setAttribute('role','dialog');viewer.setAttribute('aria-label','画像を拡大表示');
    viewer.innerHTML='<div class="focus-viewer-card"><button type="button" class="focus-viewer-close" aria-label="閉じる">×</button><div class="focus-viewer-stage"></div><div class="focus-viewer-dots" aria-hidden="true"></div></div>';
    var stage=viewer.querySelector('.focus-viewer-stage'),dots=viewer.querySelector('.focus-viewer-dots'),animating=false,startX=0,startAt=0,tracking=false,renderToken=0;
    function renderDots(){dots.innerHTML=images.map(function(_,i){return '<span class="focus-viewer-dot'+(i===index?' active':'')+'"></span>'}).join('')}
    function renderMedia(direction){
      var token=++renderToken,entry=images[index],video=isVideoMedia(entry),shell=document.createElement('div');shell.className='focus-viewer-media-shell';stage.innerHTML='';stage.appendChild(shell);
      if(video){shell.innerHTML='<div class="focus-viewer-loading">動画を読み込み中…</div>';focusVideoLink(entry.path).then(function(url){if(token!==renderToken||!shell.isConnected)return;shell.innerHTML='<video controls playsinline preload="metadata" src="'+escapeValue(url)+'"></video>'}).catch(function(error){if(token!==renderToken||!shell.isConnected)return;shell.innerHTML='<div class="focus-viewer-error">'+escapeValue(error&&error.message?error.message:'動画を読み込めませんでした')+'</div>'})}
      else shell.innerHTML='<img src="'+escapeValue(entry)+'" alt="理想のイメージ '+(index+1)+'">';
      if(direction){shell.style.transition='none';shell.style.transform='translateX('+(direction>0?18:-18)+'px)';shell.style.opacity='.2';shell.offsetWidth;shell.style.transition='transform .14s ease,opacity .14s ease';shell.style.transform='translateX(0)';shell.style.opacity='1'}
    }
    function move(next,direction){
      if(animating||next<0||next>=images.length||next===index)return;animating=true;var shell=stage.firstElementChild;if(shell){shell.style.transform='translateX('+(direction>0?-18:18)+'px)';shell.style.opacity='.2'}
      setTimeout(function(){index=next;renderDots();renderMedia(direction);setTimeout(function(){animating=false},150)},140);
    }
    stage.onpointerdown=function(e){if(e.pointerType==='mouse'&&e.button!==0)return;tracking=true;startX=e.clientX;startAt=Date.now();try{stage.setPointerCapture(e.pointerId)}catch(err){}};
    stage.onpointerup=function(e){if(!tracking)return;tracking=false;var dx=e.clientX-startX,elapsed=Math.max(1,Date.now()-startAt),flick=Math.abs(dx)/elapsed>.45;if(Math.abs(dx)>42||(flick&&Math.abs(dx)>24))move(index+(dx<0?1:-1),dx<0?1:-1)};
    stage.onpointercancel=function(){tracking=false};
    viewer.onkeydown=function(e){if(e.key==='ArrowLeft'){e.preventDefault();move(index-1,-1)}else if(e.key==='ArrowRight'){e.preventDefault();move(index+1,1)}else if(e.key==='Escape')closeImageViewer()};
    viewer.onclick=function(e){if(e.target===viewer||e.target.classList.contains('focus-viewer-close'))closeImageViewer()};renderDots();renderMedia(0);document.body.appendChild(viewer);try{viewer.focus({preventScroll:true})}catch(e){viewer.focus()}
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
  function waitForMedia(element,event,timeout){return new Promise(function(resolve,reject){var timer=setTimeout(function(){cleanup();reject(new Error('動画を読み込めませんでした'))},timeout||6000);function cleanup(){clearTimeout(timer);element.removeEventListener(event,done);element.removeEventListener('error',fail)}function done(){cleanup();resolve()}function fail(){cleanup();reject(new Error('動画を読み込めませんでした'))}element.addEventListener(event,done,{once:true});element.addEventListener('error',fail,{once:true})})}
  async function inspectVideo(file){
    var mime=(file&&file.type||'').toLowerCase(),name=(file&&file.name||'').toLowerCase();
    if(!file||!((mime==='video/mp4'||mime==='video/webm')||(mime===''&&/\.(mp4|webm)$/.test(name))))throw new Error('MP4またはWebMの動画を選んでください');
    if(file.size>MAX_VIDEO_BYTES)throw new Error('動画は8MB以内にしてください');
    var url=URL.createObjectURL(file),video=document.createElement('video');video.preload='metadata';video.muted=true;video.playsInline=true;var metadataReady=waitForMedia(video,'loadedmetadata',7000);video.src=url;video.load();
    try{
      await metadataReady;var duration=+video.duration||0;if(!duration||duration>MAX_VIDEO_SECONDS+.05)throw new Error('動画は10秒以内にしてください');
      var poster='';try{var seekReady=waitForMedia(video,'seeked',4500);video.currentTime=Math.min(.2,Math.max(.01,duration/3));await seekReady;if(video.videoWidth&&video.videoHeight){var scale=Math.min(1,360/Math.max(video.videoWidth,video.videoHeight)),canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(video.videoWidth*scale));canvas.height=Math.max(1,Math.round(video.videoHeight*scale));canvas.getContext('2d').drawImage(video,0,0,canvas.width,canvas.height);poster=canvas.toDataURL('image/jpeg',.72)}}catch(e){}
      return {type:'video',name:text(file.name||'動画'),mime:mime==='video/webm'?'video/webm':'video/mp4',size:file.size,duration:Math.round(duration*10)/10,poster:poster,_file:file,_id:Date.now().toString(36)+Math.random().toString(36).slice(2,9)};
    }finally{URL.revokeObjectURL(url);video.removeAttribute('src');try{video.load()}catch(e){}}
  }
  async function uploadFocusVideo(entry){
    if(typeof accessToken!=='function'||typeof hasDropboxAuth!=='function'||!hasDropboxAuth())throw new Error('動画の保存にはDropbox接続が必要です');
    var extension=entry.mime==='video/webm'?'.webm':'.mp4',path='/focus-media/'+entry._id+extension,token=await accessToken();
    var response=await fetch('https://content.dropboxapi.com/2/files/upload',{method:'POST',headers:{Authorization:'Bearer '+token,'Dropbox-API-Arg':JSON.stringify({path:path,mode:'overwrite',autorename:false,mute:true}),'Content-Type':'application/octet-stream'},body:entry._file});
    if(!response.ok)throw new Error('動画をDropboxへ保存できませんでした');return cleanVideo({type:'video',path:path,name:entry.name,mime:entry.mime,size:entry.size,duration:entry.duration,poster:entry.poster});
  }
  async function deleteFocusVideo(path){
    if(!path||typeof accessToken!=='function'||typeof hasDropboxAuth!=='function'||!hasDropboxAuth())return false;var token=await accessToken(),response=await fetch('https://api.dropboxapi.com/2/files/delete_v2',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({path:path})});return response.ok||response.status===409;
  }
  function queuedVideoDeletes(){try{var value=JSON.parse(localStorage.getItem(VIDEO_DELETE_KEY)||'[]');return Array.isArray(value)?value.filter(function(path){return typeof path==='string'&&/^\/focus-media\//.test(path)}):[]}catch(e){return []}}
  function queueVideoDeletes(paths){var merged=queuedVideoDeletes();(paths||[]).forEach(function(path){if(merged.indexOf(path)<0)merged.push(path)});try{localStorage.setItem(VIDEO_DELETE_KEY,JSON.stringify(merged))}catch(e){}}
  async function flushVideoDeletes(){var paths=queuedVideoDeletes();if(!paths.length)return;var active=cleanFocus(state&&state.focus).images.map(cleanVideo).filter(Boolean).map(function(x){return x.path}),remaining=[];for(var i=0;i<paths.length;i++){if(active.indexOf(paths[i])>=0)continue;try{if(!await deleteFocusVideo(paths[i]))remaining.push(paths[i])}catch(e){remaining.push(paths[i])}}try{if(remaining.length)localStorage.setItem(VIDEO_DELETE_KEY,JSON.stringify(remaining));else localStorage.removeItem(VIDEO_DELETE_KEY)}catch(e){}}

  function closeEditor(){var overlay=document.getElementById('focusEditorOverlay');if(overlay)overlay.remove();document.body.style.overflow=bodyScroll}
  function openEditor(){
    closeEditor();var focus=ensureFocus(),draftImages=focus.images.slice();bodyScroll=document.body.style.overflow;document.body.style.overflow='hidden';
    var overlay=document.createElement('div');overlay.id='focusEditorOverlay';
    overlay.innerHTML='<div id="focusEditorPanel" role="dialog" aria-modal="true" aria-labelledby="focusEditorTitle">'+
      '<div class="focus-editor-head"><h2 id="focusEditorTitle">FOCUSを編集</h2><button type="button" class="focus-editor-close" aria-label="閉じる">×</button></div>'+
      '<label class="field">内容<textarea id="focusLinesInput" placeholder="1行目\n2行目\n3行目"></textarea></label>'+
      '<div class="focus-editor-help">1行が1つの箇条書きになります。最大'+MAX_LINES+'項目。</div>'+
      '<div class="focus-image-editor"><div class="focus-image-title">理想のイメージ</div><div class="focus-image-drafts" id="focusImageDrafts"></div><div class="focus-media-adds"><button type="button" class="focus-image-add" id="focusImageAddBtn">＋ 画像</button><button type="button" class="focus-image-add" id="focusVideoAddBtn">＋ 動画</button></div><input type="file" id="focusImageInput" accept="image/*" hidden><input type="file" id="focusVideoInput" accept="video/mp4,video/webm,.mp4,.webm" hidden><div class="focus-editor-help">画像・動画合わせて最大'+MAX_MEDIA+'個、動画は最大'+MAX_VIDEOS+'本。動画は10秒・8MB以内でDropboxに保存されます。</div></div>'+
      '<div class="focus-editor-actions"><button type="button" class="btn sub" id="focusCancelBtn">キャンセル</button><button type="button" class="btn" id="focusSaveBtn">保存</button></div></div>';
    document.body.appendChild(overlay);
    var input=document.getElementById('focusLinesInput');input.value=focus.lines.join('\n');
    var imageInput=document.getElementById('focusImageInput'),videoInput=document.getElementById('focusVideoInput'),addButton=document.getElementById('focusImageAddBtn'),videoButton=document.getElementById('focusVideoAddBtn');
    function draftThumb(entry,i){var video=entry&&typeof entry==='object'&&entry.type==='video';return '<div class="focus-image-draft">'+(video?(entry.poster?'<img src="'+escapeValue(entry.poster)+'" alt="動画'+(i+1)+'">':'')+'<span class="focus-gallery-play">▶</span>':'<img src="'+escapeValue(entry)+'" alt="画像'+(i+1)+'">')+'<button type="button" class="focus-image-remove" data-remove-focus-image="'+i+'" aria-label="'+(video?'動画':'画像')+(i+1)+'を削除">×</button></div>'}
    function renderDrafts(){var drafts=document.getElementById('focusImageDrafts'),full=draftImages.length>=MAX_MEDIA,videos=videoCount(draftImages);drafts.innerHTML=draftImages.length?draftImages.map(draftThumb).join(''):'<div class="focus-image-empty">画像・動画はまだありません</div>';addButton.textContent='＋ 画像（'+draftImages.length+'/'+MAX_MEDIA+'）';videoButton.textContent='＋ 動画（'+videos+'/'+MAX_VIDEOS+'）';addButton.disabled=full;videoButton.disabled=full||videos>=MAX_VIDEOS;Array.prototype.forEach.call(drafts.querySelectorAll('[data-remove-focus-image]'),function(button){button.onclick=function(){draftImages.splice(+button.getAttribute('data-remove-focus-image'),1);renderDrafts()}})}
    renderDrafts();addButton.onclick=function(){if(draftImages.length<MAX_MEDIA)imageInput.click()};videoButton.onclick=function(){if(draftImages.length>=MAX_MEDIA||videoCount(draftImages)>=MAX_VIDEOS)return;if(typeof hasDropboxAuth!=='function'||!hasDropboxAuth()){alert('動画の保存にはDropbox接続が必要です。設定からDropboxに接続してください。');return}videoInput.click()};
    imageInput.onchange=async function(){var file=imageInput.files&&imageInput.files[0];imageInput.value='';if(!file)return;addButton.disabled=true;addButton.textContent='画像を処理中…';try{draftImages.push(await compressImage(file));renderDrafts()}catch(e){renderDrafts();alert(e&&e.message?e.message:'画像を追加できませんでした')}};
    videoInput.onchange=async function(){var file=videoInput.files&&videoInput.files[0];videoInput.value='';if(!file)return;videoButton.disabled=true;videoButton.textContent='動画を確認中…';try{draftImages.push(await inspectVideo(file));renderDrafts()}catch(e){renderDrafts();alert(e&&e.message?e.message:'動画を追加できませんでした')}};
    overlay.querySelector('.focus-editor-close').onclick=closeEditor;document.getElementById('focusCancelBtn').onclick=closeEditor;
    document.getElementById('focusSaveBtn').onclick=async function(){
      var saveButton=this,closeButton=overlay.querySelector('.focus-editor-close'),cancelButton=document.getElementById('focusCancelBtn'),previous=state.focus,uploaded=[],resolved=[];saveButton.disabled=true;closeButton.disabled=true;cancelButton.disabled=true;saveButton.textContent=draftImages.some(function(x){return x&&x._file})?'動画を保存中…':'保存中…';
      try{
        for(var i=0;i<draftImages.length;i++){var entry=draftImages[i];if(entry&&entry.type==='video'&&entry._file){entry=await uploadFocusVideo(entry);uploaded.push(entry.path)}resolved.push(entry)}
        var next=cleanFocus({lines:input.value.split(/\r?\n/),images:resolved}),oldPaths=(previous.images||[]).map(cleanVideo).filter(Boolean).map(function(x){return x.path}),newPaths=next.images.map(cleanVideo).filter(Boolean).map(function(x){return x.path});state.focus=next;
        var saved=typeof save==='function'?save():true;if(saved===false){state.focus=previous;for(var u=0;u<uploaded.length;u++)try{await deleteFocusVideo(uploaded[u])}catch(e){}throw new Error('保存容量が不足しています。画像を減らしてもう一度お試しください')}
        queueVideoDeletes(oldPaths.filter(function(path){return newPaths.indexOf(path)<0}));renderFocus();closeEditor();
      }catch(error){state.focus=previous;for(var j=0;j<uploaded.length;j++)try{await deleteFocusVideo(uploaded[j])}catch(e){}saveButton.disabled=false;closeButton.disabled=false;cancelButton.disabled=false;saveButton.textContent='保存';alert(error&&error.message?error.message:'保存できませんでした')}
    };
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
  var previousDropboxUpload=typeof dropboxUpload==='function'?dropboxUpload:null;
  if(previousDropboxUpload)dropboxUpload=async function(){var result=await previousDropboxUpload.apply(this,arguments);try{await flushVideoDeletes()}catch(e){console.error(e)}return result};

  window.__stretchTimerFocusV94={clean:cleanFocus,render:renderFocus,openEditor:openEditor};
  ensureFocus();renderFocus();
})();
