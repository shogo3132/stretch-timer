(function(){
  if(window.__focusCardV90)return;
  window.__focusCardV90=true;

  var MAX_LINES=10,MAX_LINE=180;
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
  style.setAttribute('data-focus-card-v90','');
  style.textContent='\
#focusVariants{display:block}\
.focus-card-head{display:flex;align-items:center;gap:10px;margin-bottom:12px}\
.focus-heading-text{font-size:14px;font-weight:900;letter-spacing:.14em;color:#168465;flex:1}\
.focus-edit{width:36px;height:36px;border:0;border-radius:11px;background:transparent;color:#6d7c76;font-size:19px;display:grid;place-items:center;cursor:pointer;-webkit-tap-highlight-color:transparent}\
.focus-edit:active{background:#dcefe8}\
.focus-card{border-radius:20px;background:#e9f7f2;border:1px solid #d9eee7;padding:18px;box-shadow:0 1px 2px rgba(0,0,0,.025);min-height:90px}\
.focus-empty{font-size:17px;color:#778a83;line-height:1.55}\
.focus-list{display:grid;gap:10px;margin:0;padding:0;list-style:none}\
.focus-list li{position:relative;padding-left:18px;font-size:18px;font-weight:650;line-height:1.45;overflow-wrap:anywhere}\
.focus-list li:before{content:"";position:absolute;left:1px;top:.65em;width:6px;height:6px;border-radius:50%;background:#27ae8b}\
#focusEditorOverlay{position:fixed;inset:0;z-index:20000;background:rgba(20,26,32,.42);display:flex;align-items:flex-end;justify-content:center;padding:18px 14px max(18px,env(safe-area-inset-bottom))}\
#focusEditorPanel{width:min(100%,620px);max-height:min(82dvh,720px);overflow:auto;background:#f7f8fa;border-radius:24px;padding:20px;box-shadow:0 18px 55px rgba(0,0,0,.22);display:grid;gap:16px}\
.focus-editor-head{display:flex;align-items:center;gap:12px}\
.focus-editor-head h2{font-size:22px;margin:0;flex:1}\
.focus-editor-close{width:40px;height:40px;border:0;border-radius:12px;background:#e9edf0;color:#5d6872;font-size:24px;line-height:1;cursor:pointer}\
#focusEditorPanel .field textarea{min-height:230px}\
.focus-editor-actions{display:grid;grid-template-columns:1fr 1.4fr;gap:10px}\
.focus-editor-help{font-size:13px;color:#78828c;line-height:1.5;margin-top:-7px}\
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
    return {lines:source.map(text).filter(Boolean).slice(0,MAX_LINES)};
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
      (focus.lines.length?'<ul class="focus-list">'+focus.lines.map(function(x){return '<li>'+escapeValue(x)+'</li>'}).join('')+'</ul>':'<div class="focus-empty">今取り組んでいることを設定</div>')+'</div>';
    host.querySelector('.focus-edit').onclick=openEditor;
  }

  function closeEditor(){var overlay=document.getElementById('focusEditorOverlay');if(overlay)overlay.remove();document.body.style.overflow=bodyScroll}
  function openEditor(){
    closeEditor();var focus=ensureFocus();bodyScroll=document.body.style.overflow;document.body.style.overflow='hidden';
    var overlay=document.createElement('div');overlay.id='focusEditorOverlay';
    overlay.innerHTML='<div id="focusEditorPanel" role="dialog" aria-modal="true" aria-labelledby="focusEditorTitle">'+
      '<div class="focus-editor-head"><h2 id="focusEditorTitle">FOCUSを編集</h2><button type="button" class="focus-editor-close" aria-label="閉じる">×</button></div>'+
      '<label class="field">内容<textarea id="focusLinesInput" placeholder="1行目\n2行目\n3行目"></textarea></label>'+
      '<div class="focus-editor-help">1行が1つの箇条書きになります。最大'+MAX_LINES+'項目。</div>'+
      '<div class="focus-editor-actions"><button type="button" class="btn sub" id="focusCancelBtn">キャンセル</button><button type="button" class="btn" id="focusSaveBtn">保存</button></div></div>';
    document.body.appendChild(overlay);
    var input=document.getElementById('focusLinesInput');input.value=focus.lines.join('\n');
    overlay.querySelector('.focus-editor-close').onclick=closeEditor;document.getElementById('focusCancelBtn').onclick=closeEditor;
    document.getElementById('focusSaveBtn').onclick=function(){state.focus=cleanFocus({lines:input.value.split(/\r?\n/)});if(typeof save==='function')save();renderFocus();closeEditor()};
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

  window.__stretchTimerFocusV90={clean:cleanFocus,render:renderFocus,openEditor:openEditor};
  ensureFocus();renderFocus();
})();
