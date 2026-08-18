(function(){
  if(window.__focusVariantsV88)return;
  window.__focusVariantsV88=true;

  var MAX_POINTS=8,MAX_GOAL=100,MAX_POINT=140;
  var bodyScroll='';

  var style=document.createElement('style');
  style.setAttribute('data-focus-variants-v88','');
  style.textContent='\
#focusVariants{display:grid;gap:18px}\
.focus-variant{display:grid;gap:7px}\
.focus-variant-label{font-size:18px;font-weight:850;color:#3f4852;padding-left:3px;line-height:1}\
.focus-card{position:relative;border-radius:20px;background:#fff;border:1px solid #e7ebee;padding:18px 48px 18px 18px;box-shadow:0 1px 2px rgba(0,0,0,.035);min-height:108px}\
.focus-edit{position:absolute;top:10px;right:10px;width:36px;height:36px;border:0;border-radius:11px;background:transparent;color:#79838d;font-size:19px;display:grid;place-items:center;cursor:pointer;-webkit-tap-highlight-color:transparent}\
.focus-edit:active{background:rgba(0,0,0,.05)}\
.focus-card-title{font-size:15px;font-weight:800;color:#65707b;margin-bottom:11px}\
.focus-empty{font-size:17px;color:#9098a1;line-height:1.55}\
.focus-list{display:grid;gap:10px;margin:0;padding:0;list-style:none}\
.focus-list li{position:relative;padding-left:18px;font-size:18px;font-weight:650;line-height:1.45;overflow-wrap:anywhere}\
.focus-list li:before{content:"";position:absolute;left:1px;top:.65em;width:6px;height:6px;border-radius:50%;background:#27ae8b}\
.focus-b{background:#e9f7f2;border-color:#d9eee7;border-left:6px solid #27ae8b;padding-left:17px}\
.focus-b .focus-kicker{font-size:12px;font-weight:900;letter-spacing:.14em;color:#168465;margin-bottom:12px}\
.focus-b .focus-goal{font-size:23px;font-weight:850;line-height:1.4;margin-bottom:11px;overflow-wrap:anywhere}\
.focus-b .focus-points{display:grid;gap:6px;font-size:16px;line-height:1.45;color:#47545e}\
.focus-c .focus-rows{display:grid;gap:8px}\
.focus-c .focus-row{position:relative;border-radius:12px;background:#f3f5f6;padding:10px 12px 10px 31px;font-size:17px;font-weight:650;line-height:1.4;overflow-wrap:anywhere}\
.focus-c .focus-row:before{content:"";position:absolute;left:13px;top:17px;width:7px;height:7px;border-radius:50%;background:#27ae8b}\
.focus-d .focus-caption{font-size:12px;font-weight:850;letter-spacing:.07em;color:#7b858f;margin-bottom:7px}\
.focus-d .focus-goal{font-size:24px;font-weight:850;line-height:1.38;overflow-wrap:anywhere}\
.focus-d .focus-divider{height:1px;background:#e8ecef;margin:15px 0 13px}\
.focus-d .focus-note-list{display:grid;gap:7px;font-size:16px;line-height:1.45;color:#4e5964}\
#focusEditorOverlay{position:fixed;inset:0;z-index:20000;background:rgba(20,26,32,.42);display:flex;align-items:flex-end;justify-content:center;padding:18px 14px max(18px,env(safe-area-inset-bottom))}\
#focusEditorPanel{width:min(100%,620px);max-height:min(82dvh,720px);overflow:auto;background:#f7f8fa;border-radius:24px;padding:20px;box-shadow:0 18px 55px rgba(0,0,0,.22);display:grid;gap:16px}\
.focus-editor-head{display:flex;align-items:center;gap:12px}\
.focus-editor-head h2{font-size:22px;margin:0;flex:1}\
.focus-editor-close{width:40px;height:40px;border:0;border-radius:12px;background:#e9edf0;color:#5d6872;font-size:24px;line-height:1;cursor:pointer}\
#focusEditorPanel .field textarea{min-height:160px}\
.focus-editor-actions{display:grid;grid-template-columns:1fr 1.4fr;gap:10px}\
.focus-editor-help{font-size:13px;color:#78828c;line-height:1.5;margin-top:-7px}\
@media(min-width:700px){#focusEditorOverlay{align-items:center}.focus-card{padding-top:20px;padding-bottom:20px}}\
';
  document.head.appendChild(style);

  function text(value,max){return String(value==null?'':value).trim().slice(0,max)}
  function cleanFocus(value){
    value=value&&typeof value==='object'?value:{};
    var source=Array.isArray(value.points)?value.points:String(value.points||'').split(/\r?\n/);
    return {goal:text(value.goal,MAX_GOAL),points:source.map(function(x){return text(x,MAX_POINT)}).filter(Boolean).slice(0,MAX_POINTS)};
  }
  function ensureFocus(){if(typeof state==='undefined'||!state)return cleanFocus(null);state.focus=cleanFocus(state.focus);return state.focus}
  function displayLines(focus){var lines=[];if(focus.goal)lines.push(focus.goal);return lines.concat(focus.points)}
  function emptyHtml(){return '<div class="focus-empty">今取り組んでいることを設定</div>'}
  function editButton(){return '<button type="button" class="focus-edit" aria-label="今のテーマを編集" title="編集">✎</button>'}

  function cardA(focus){
    var lines=displayLines(focus);
    return '<div class="focus-card focus-a">'+editButton()+'<div class="focus-card-title">今のテーマ</div>'+
      (lines.length?'<ul class="focus-list">'+lines.map(function(x){return '<li>'+escapeValue(x)+'</li>'}).join('')+'</ul>':emptyHtml())+'</div>';
  }
  function cardB(focus){
    return '<div class="focus-card focus-b">'+editButton()+'<div class="focus-kicker">FOCUS</div>'+
      (focus.goal?'<div class="focus-goal">'+escapeValue(focus.goal)+'</div>':emptyHtml())+
      (focus.points.length?'<div class="focus-points">'+focus.points.map(function(x){return '<div>・'+escapeValue(x)+'</div>'}).join('')+'</div>':'')+'</div>';
  }
  function cardC(focus){
    var lines=displayLines(focus);
    return '<div class="focus-card focus-c">'+editButton()+'<div class="focus-card-title">今のテーマ</div>'+
      (lines.length?'<div class="focus-rows">'+lines.map(function(x){return '<div class="focus-row">'+escapeValue(x)+'</div>'}).join('')+'</div>':emptyHtml())+'</div>';
  }
  function cardD(focus){
    return '<div class="focus-card focus-d">'+editButton()+'<div class="focus-caption">現在の目標</div>'+
      (focus.goal?'<div class="focus-goal">'+escapeValue(focus.goal)+'</div>':emptyHtml())+
      (focus.points.length?'<div class="focus-divider"></div><div class="focus-caption">意識すること</div><div class="focus-note-list">'+focus.points.map(function(x){return '<div>'+escapeValue(x)+'</div>'}).join('')+'</div>':'')+'</div>';
  }
  function escapeValue(value){return String(value).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]})}

  function ensureHost(){
    var home=document.getElementById('home'),stack=home&&home.querySelector(':scope > .stack');if(!stack)return null;
    var host=document.getElementById('focusVariants');
    if(!host){host=document.createElement('section');host.id='focusVariants';host.setAttribute('aria-label','今のテーマ 表示案の比較');stack.insertBefore(host,stack.firstElementChild)}
    return host;
  }
  function renderVariants(){
    var host=ensureHost();if(!host)return;var focus=ensureFocus();
    host.innerHTML=[['A',cardA(focus)],['B',cardB(focus)],['C',cardC(focus)],['D',cardD(focus)]].map(function(v){return '<div class="focus-variant"><div class="focus-variant-label">'+v[0]+'</div>'+v[1]+'</div>'}).join('');
    host.querySelectorAll('.focus-edit').forEach(function(btn){btn.onclick=openEditor});
  }

  function closeEditor(){var overlay=document.getElementById('focusEditorOverlay');if(overlay)overlay.remove();document.body.style.overflow=bodyScroll}
  function openEditor(){
    closeEditor();var focus=ensureFocus();bodyScroll=document.body.style.overflow;document.body.style.overflow='hidden';
    var overlay=document.createElement('div');overlay.id='focusEditorOverlay';
    overlay.innerHTML='<div id="focusEditorPanel" role="dialog" aria-modal="true" aria-labelledby="focusEditorTitle">'+
      '<div class="focus-editor-head"><h2 id="focusEditorTitle">今のテーマを編集</h2><button type="button" class="focus-editor-close" aria-label="閉じる">×</button></div>'+
      '<label class="field">主目標<input id="focusGoalInput" maxlength="'+MAX_GOAL+'" placeholder="例：身体の土台を整える"></label>'+
      '<label class="field">意識すること<textarea id="focusPointsInput" placeholder="例：股関節から動く\n右足に力を入れすぎない"></textarea></label>'+
      '<div class="focus-editor-help">1行が1つの箇条書きになります。最大'+MAX_POINTS+'項目。</div>'+
      '<div class="focus-editor-actions"><button type="button" class="btn sub" id="focusCancelBtn">キャンセル</button><button type="button" class="btn" id="focusSaveBtn">保存</button></div></div>';
    document.body.appendChild(overlay);
    var goal=document.getElementById('focusGoalInput'),points=document.getElementById('focusPointsInput');goal.value=focus.goal;points.value=focus.points.join('\n');
    overlay.querySelector('.focus-editor-close').onclick=closeEditor;document.getElementById('focusCancelBtn').onclick=closeEditor;
    document.getElementById('focusSaveBtn').onclick=function(){
      state.focus=cleanFocus({goal:goal.value,points:points.value});
      if(typeof save==='function')save();renderVariants();closeEditor();
    };
    setTimeout(function(){try{goal.focus()}catch(e){}},30);
  }

  var previousNormalize=typeof normalize==='function'?normalize:null;
  if(previousNormalize)normalize=function(s){var out=previousNormalize(s);out.focus=cleanFocus(s&&s.focus);return out};

  var previousSyncPayload=typeof syncPayload==='function'?syncPayload:null;
  if(previousSyncPayload)syncPayload=function(){var payload=JSON.parse(previousSyncPayload());payload.focus=cleanFocus(state&&state.focus);return JSON.stringify(payload)};

  var previousApplyRemote=typeof applyRemote==='function'?applyRemote:null;
  if(previousApplyRemote)applyRemote=function(raw,remoteTime){var remote={};try{remote=JSON.parse(raw)||{}}catch(e){}var result=previousApplyRemote.apply(this,arguments);state.focus=cleanFocus(remote.focus);if(typeof save==='function')save(false);renderVariants();return result};

  var previousRenderHome=typeof renderHome==='function'?renderHome:null;
  if(previousRenderHome)renderHome=function(){var result=previousRenderHome.apply(this,arguments);renderVariants();return result};

  window.__stretchTimerFocusV88={clean:cleanFocus,lines:displayLines,render:renderVariants,openEditor:openEditor};
  ensureFocus();renderVariants();
})();
