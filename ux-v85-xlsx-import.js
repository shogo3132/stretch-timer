(function(){
  if(window.__xlsxItemImportV85)return;
  window.__xlsxItemImportV85=true;

  var MAX_FILE_BYTES=5*1024*1024;
  var MAX_ITEMS=500;

  var style=document.createElement('style');
  style.setAttribute('data-xlsx-item-import-v85','');
  style.textContent='\
.xlsx-import-row{display:grid;gap:7px}\
.xlsx-import-row .btn{width:100%}\
.xlsx-import-row .tip{margin:-1px 2px 0}\
';
  document.head.appendChild(style);

  function textValue(value){
    if(value===null||value===undefined)return '';
    return String(value).trim();
  }

  function numberValue(value,min,max,label,rowNumber,errors,blankDefault){
    if(value===null||value===undefined||String(value).trim()===''){
      if(blankDefault!==undefined)return blankDefault;
      errors.push(rowNumber+'行目：'+label+'を入力してください');
      return null;
    }
    var number=Number(value);
    if(!Number.isInteger(number)||number<min||number>max){
      errors.push(rowNumber+'行目：'+label+'は'+min+'～'+max+'の整数で入力してください');
      return null;
    }
    return number;
  }

  function isYouTubeUrl(value){
    if(!value)return true;
    try{
      var u=new URL(value),host=u.hostname.toLowerCase().replace(/^www\./,'');
      return u.protocol==='https:'&&(host==='youtu.be'||host==='youtube.com'||host.endsWith('.youtube.com')||host==='youtube-nocookie.com'||host.endsWith('.youtube-nocookie.com'));
    }catch(e){return false}
  }

  function parseRows(rows){
    var items=[];
    var errors=[];
    (rows||[]).forEach(function(row,index){
      row=Array.isArray(row)?row:[];
      var cells=[row[0],row[1],row[2],row[3],row[4]];
      if(cells.every(function(value){return textValue(value)===''}))return;

      var rowNumber=index+1;
      var before=errors.length;
      var name=textValue(row[0]);
      var desc=textValue(row[1]);
      var videoUrl=textValue(row[4]);
      if(!name)errors.push(rowNumber+'行目：A列に種目名を入力してください');
      var seconds=numberValue(row[2],1,3600,'C列の運動時間（秒）',rowNumber,errors);
      var restSeconds=numberValue(row[3],1,60,'D列の休憩時間（秒）',rowNumber,errors,20);
      if(videoUrl&&!isYouTubeUrl(videoUrl))errors.push(rowNumber+'行目：E列にはYouTubeのURLを入力してください');
      if(errors.length===before){
        items.push({name:name,desc:desc,seconds:seconds,restSeconds:restSeconds,videoUrl:videoUrl});
      }
    });

    if(errors.length){
      var shown=errors.slice(0,8);
      if(errors.length>shown.length)shown.push('ほか'+(errors.length-shown.length)+'件');
      throw new Error(shown.join('\n'));
    }
    if(!items.length)throw new Error('読み込める種目がありません。A～E列の1行目から入力してください。');
    if(items.length>MAX_ITEMS)throw new Error('一度に追加できる種目は'+MAX_ITEMS+'件までです。');
    return items;
  }

  function importMessage(items,routine){
    var lines=items.slice(0,12).map(function(item,index){
      return (index+1)+'. '+item.name+'（'+item.seconds+'秒・休憩'+item.restSeconds+'秒）';
    });
    if(items.length>lines.length)lines.push('ほか'+(items.length-lines.length)+'件');
    return 'ルーティン「'+(routine.name||'名称未設定')+'」の末尾に'+items.length+'種目を追加します。\n\n'+lines.join('\n')+'\n\n追加してよろしいですか？';
  }

  function appendItems(routine,items){
    if(!routine||!Array.isArray(routine.items))throw new Error('追加先のルーティンが見つかりません。');
    items.forEach(function(source){
      routine.items.push({
        id:typeof uid==='function'?uid():Date.now()+Math.random().toString(16).slice(2),
        name:source.name,
        seconds:source.seconds,
        restSeconds:source.restSeconds,
        desc:source.desc,
        videoUrl:source.videoUrl||'',
        photo:''
      });
    });
    return items.length;
  }

  async function readItems(file){
    if(!file)throw new Error('ファイルが選択されていません。');
    if(!/\.xlsx$/i.test(file.name||''))throw new Error('.xlsx形式のファイルを選択してください。');
    if(file.size>MAX_FILE_BYTES)throw new Error('ファイルサイズは5MB以下にしてください。');
    if(!window.XLSX)throw new Error('Excel読み込み機能を準備できませんでした。アプリを更新して再試行してください。');
    var workbook=XLSX.read(await file.arrayBuffer(),{type:'array',cellDates:false});
    var firstName=workbook.SheetNames&&workbook.SheetNames[0];
    if(!firstName)throw new Error('シートが見つかりません。');
    var rows=XLSX.utils.sheet_to_json(workbook.Sheets[firstName],{
      header:1,
      raw:true,
      defval:'',
      blankrows:true
    });
    return parseRows(rows);
  }

  async function handleFile(file,button,input){
    var oldText=button.textContent;
    button.disabled=true;
    button.textContent='読み込み中…';
    try{
      var routine=typeof menu==='function'?menu():null;
      if(!routine)throw new Error('追加先のルーティンを開いてから読み込んでください。');
      var items=await readItems(file);
      if(!confirm(importMessage(items,routine)))return;
      appendItems(routine,items);
      if(typeof save==='function')save();
      if(typeof renderItems==='function')renderItems();
      if(typeof updateDuration==='function')updateDuration();
      alert(items.length+'種目を追加しました。');
    }catch(error){
      console.error(error);
      alert(error&&error.message?error.message:'ファイルを読み込めませんでした。');
    }finally{
      button.disabled=false;
      button.textContent=oldText;
      input.value='';
    }
  }

  function ensureImportControl(){
    if(document.getElementById('xlsxImportBtn'))return;
    var addButton=document.getElementById('addItemBtn');
    if(!addButton)return;
    var actions=addButton.closest('.row');
    if(!actions)return;

    var wrap=document.createElement('div');
    wrap.className='xlsx-import-row';
    var button=document.createElement('button');
    button.id='xlsxImportBtn';
    button.type='button';
    button.className='btn sub';
    button.textContent='ファイルから種目を追加';
    var input=document.createElement('input');
    input.id='xlsxImportInput';
    input.type='file';
    input.accept='.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    input.hidden=true;
    var tip=document.createElement('div');
    tip.className='tip';
    tip.textContent='A列：種目名　B列：説明　C列：運動秒数　D列：休憩秒数　E列：参考動画URL';
    button.onclick=function(){input.click()};
    input.onchange=function(){var file=input.files&&input.files[0];if(file)handleFile(file,button,input)};
    wrap.append(button,input,tip);
    actions.insertAdjacentElement('afterend',wrap);
  }

  window.__stretchTimerParseImportRowsV85=parseRows;
  window.__stretchTimerAppendImportItemsV85=appendItems;
  ensureImportControl();
  setTimeout(ensureImportControl,0);
})();
