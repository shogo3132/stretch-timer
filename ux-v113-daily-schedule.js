(function(){
  if(window.__dailyScheduleV113)return;
  window.__dailyScheduleV113=true;

  var SNAP=15,HOUR_PX=56,DEFAULT_START=9*60,DEFAULT_DURATION=60;
  var COLORS=[
    {bg:'#fde8e7',line:'#e16b64',text:'#8f3833'},
    {bg:'#e5f0fb',line:'#5b9bd5',text:'#315f88'},
    {bg:'#e3f4ec',line:'#45a980',text:'#276f58'},
    {bg:'#fff2cc',line:'#d5a928',text:'#806516'},
    {bg:'#eee8fb',line:'#8b72cf',text:'#59469a'},
    {bg:'#dff3f4',line:'#45aeb3',text:'#276f73'}
  ];
  var dragTaskId='',dragTouchActive=false,dragHold=null,dragHeld=null,dragTarget=null,dragBefore=true,dragStartX=0,dragStartY=0,dragPointerY=0,dragScrollSpeed=0,dragScrollFrame=null,dragLastScrollAt=0,dragSuppressClickUntil=0,dragDebugMoves=0,dragDebugStarted=0,editorId='',actionTaskId='',clockTimer=null,observer=null;

  var style=document.createElement('style');
  style.setAttribute('data-daily-schedule-v113','');
  style.textContent='\
.daily-schedule{display:grid;gap:12px}\
.daily-schedule-card{padding:13px 12px 12px;overflow:hidden}\
.daily-schedule-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px}\
.daily-schedule-title{font-size:16px;font-weight:850;color:#252b31}\
.daily-schedule-date{font-size:12px;font-weight:700;color:#7d8791}\
.daily-schedule-empty{padding:20px 10px;text-align:center;color:#87919a;font-size:13px;line-height:1.55}\
.daily-timeline-scroll{position:relative;overflow:hidden;border-radius:16px;background:#fbfcfc;border:1px solid #edf0f2}\
.daily-timeline{position:relative;min-height:504px}\
.daily-hour{position:absolute;left:0;right:0;height:1px;background:#e1e6e9}\
.daily-hour.half{background:#f0f2f4}\
.daily-hour-label{position:absolute;left:7px;top:-8px;width:39px;color:#8a949d;font-size:10px;text-align:right;font-variant-numeric:tabular-nums}\
.daily-events{position:absolute;left:53px;right:7px;top:0;bottom:0}\
.daily-event{position:absolute;min-height:22px;border:0;border-left:4px solid var(--event-line);border-radius:9px;background:var(--event-bg);color:var(--event-text);padding:5px 7px 4px;text-align:left;overflow:hidden;box-shadow:0 1px 3px rgba(29,39,48,.08);touch-action:none;cursor:grab}\
.daily-event:active{cursor:grabbing}\
.daily-event.completed{opacity:.54}\
.daily-event-title{display:block;font-size:11px;font-weight:800;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\
.daily-event-time{display:block;margin-top:2px;font-size:9px;font-weight:700;opacity:.78;font-variant-numeric:tabular-nums}\
.daily-event-handle{position:absolute;left:7px;right:7px;height:9px;z-index:2}\
.daily-event-handle.top{top:-2px;cursor:ns-resize}\
.daily-event-handle.bottom{bottom:-2px;cursor:ns-resize}\
.daily-event.moving{z-index:20;box-shadow:0 8px 20px rgba(29,39,48,.22)}\
.daily-now{position:absolute;left:45px;right:0;height:2px;background:#ef5a5a;z-index:25;pointer-events:none}\
.daily-now::before{content:"";position:absolute;left:-4px;top:-3px;width:8px;height:8px;border-radius:50%;background:#ef5a5a}\
.daily-pool{border:2px dashed #d9e0e4;border-radius:15px;padding:9px;transition:.18s ease;background:#fafbfc}\
.daily-pool.drop-active{border-color:#27ae8b;background:#eaf7f3;transform:scale(1.01)}\
.daily-pool-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:7px;color:#727c85;font-size:11px;font-weight:800}\
.daily-pool-hint{font-weight:600;color:#98a0a7}\
.daily-pool-list{display:flex;align-items:center;gap:7px;overflow-x:auto;padding:1px 1px 3px;scrollbar-width:none}\
.daily-pool-list::-webkit-scrollbar{display:none}\
.daily-pool-empty{width:100%;padding:7px 3px;color:#98a1a9;font-size:12px;text-align:center}\
.daily-chip{flex:0 0 auto;max-width:190px;min-height:34px;border:1px solid var(--event-line);border-radius:11px;background:var(--event-bg);color:var(--event-text);padding:6px 9px;text-align:left}\
.daily-chip-title{display:block;max-width:165px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:11px;font-weight:800}\
.daily-chip-time{display:block;margin-top:2px;font-size:9px;font-weight:700;opacity:.76}\
.task-row.schedule-dragging{opacity:.5;transform:scale(.98)}\
.task-row.in-daily-schedule::before{content:"";position:absolute;left:4px;top:11px;bottom:11px;width:3px;border-radius:4px;background:var(--schedule-line);z-index:2}\
.task-drag-debug{position:fixed;left:10px;right:10px;bottom:82px;z-index:12000;padding:9px 11px;border-radius:12px;background:rgba(24,30,36,.94);color:#fff;font:600 11px/1.45 ui-monospace,SFMono-Regular,Consolas,monospace;white-space:pre-wrap;pointer-events:none;box-shadow:0 6px 22px rgba(0,0,0,.24)}\
.schedule-time-overlay{position:fixed;inset:0;z-index:10100;display:grid;align-items:end;background:rgba(25,31,37,.38);padding:16px 12px max(16px,env(safe-area-inset-bottom))}\
.schedule-time-panel{width:min(430px,100%);margin:0 auto;padding:18px;border-radius:22px;background:#f7f8fa;box-shadow:0 18px 45px rgba(20,27,34,.22)}\
.schedule-time-title{font-size:16px;font-weight:850;color:#242a30;margin-bottom:4px}\
.schedule-time-sub{font-size:12px;color:#7a848e;margin-bottom:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\
.schedule-time-fields{display:grid;grid-template-columns:1fr auto 1fr;align-items:end;gap:9px}\
.schedule-time-field{display:grid;gap:6px;color:#727c85;font-size:11px;font-weight:700}\
.schedule-time-input{width:100%;height:48px;border:0;border-radius:13px;background:#fff;padding:0 10px;color:#22282e;font-size:20px;text-align:center;font-variant-numeric:tabular-nums;outline:1px solid #e2e7ea}\
.schedule-time-input:focus{outline:2px solid rgba(39,174,139,.45)}\
.schedule-time-sep{padding-bottom:14px;color:#8a939c;font-weight:800}\
.schedule-time-error{min-height:18px;margin-top:8px;color:#c34e56;font-size:12px}\
.schedule-time-actions{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:9px}\
.schedule-time-actions button{min-height:45px}\
.schedule-remove{width:100%;min-height:40px;margin-top:9px;border:0;border-radius:12px;background:transparent;color:#b94b54;font-weight:750}\
@media(min-width:780px){.schedule-time-overlay{align-items:center}.daily-schedule-card{padding:16px}.daily-timeline{min-height:560px}}\
';
  document.head.appendChild(style);

  function uid2(){return crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+Math.random().toString(36).slice(2)}
  function clamp(v,min,max){return Math.max(min,Math.min(max,v))}
  function snap(v){return Math.round(v/SNAP)*SNAP}
  function dayKey(time){
    var hour=Math.max(0,Math.min(23,Math.floor(+(state.taskSettings&&state.taskSettings.cutoffHour)||0)));
    var d=new Date((+time||Date.now())-hour*3600000);
    return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  }
  function timeText(mins){mins=clamp(Math.round(+mins||0),0,1440);if(mins===1440)return '24:00';return String(Math.floor(mins/60)).padStart(2,'0')+':'+String(mins%60).padStart(2,'0')}
  function parseTime(value){var m=String(value||'').trim().match(/^(\d{1,2}):?(\d{2})$/);if(!m)return null;var h=+m[1],n=+m[2];if(h===24&&n===0)return 1440;if(h>23||n>59)return null;return h*60+n}
  function formatDate(){var d=new Date(),week=['日','月','火','水','木','金','土'];return (d.getMonth()+1)+'月'+d.getDate()+'日（'+week[d.getDay()]+'）'}
  function taskById(id){return (state.tasks||[]).find(function(x){return x.id===id})}
  function cleanEntry(x,index){
    x=x&&typeof x==='object'?x:{};var start=x.start==null?null:clamp(snap(+x.start||0),0,1425),end=x.end==null?null:clamp(snap(+x.end||0),15,1440);
    if(start!=null&&end!=null&&end<=start)end=Math.min(1440,start+DEFAULT_DURATION);
    return {id:String(x.id||uid2()),taskId:String(x.taskId||''),color:Math.abs(Math.floor(+x.color||0))%COLORS.length,order:Math.max(0,Math.floor(+x.order||index||0)),start:start,end:end};
  }
  function cleanSchedule(source){
    source=source&&typeof source==='object'?source:{};var today=dayKey(Date.now()),same=String(source.day||today)===today;
    return {day:today,nextOrder:Math.max(0,Math.floor(+source.nextOrder||0)),entries:same&&Array.isArray(source.entries)?source.entries.map(cleanEntry).filter(function(x){return x.taskId}):[]};
  }
  function ensureData(saveReset){
    var old=state.taskSchedule,clean=cleanSchedule(old);state.taskSchedule=clean;
    var valid={};(state.tasks||[]).forEach(function(x){valid[x.id]=true});var before=clean.entries.length;clean.entries=clean.entries.filter(function(x){return valid[x.taskId]});
    if(saveReset&&(!old||old.day!==clean.day||before!==clean.entries.length)&&typeof save==='function')save();
    return clean;
  }
  function entryByTask(id){return ensureData(false).entries.find(function(x){return x.taskId===id})}
  function entryById(id){return ensureData(false).entries.find(function(x){return x.id===id})}
  function palette(entry){return COLORS[(entry&&entry.color)||0]}
  function applyPalette(el,entry){var c=palette(entry);el.style.setProperty('--event-bg',c.bg);el.style.setProperty('--event-line',c.line);el.style.setProperty('--event-text',c.text)}
  function saveAndRender(){if(typeof save==='function')save();renderSchedule()}
  function addTask(id,openEditorAfter){
    var task=taskById(id);if(!task||task.completedAt)return;var data=ensureData(true),existing=entryByTask(id);
    if(!existing){var order=data.nextOrder++;existing={id:uid2(),taskId:id,color:order%COLORS.length,order:order,start:null,end:null};data.entries.push(existing);saveAndRender()}
    else renderSchedule();
    if(openEditorAfter)openEditor(existing.id);
  }
  function removeEntry(id){var data=ensureData(false);data.entries=data.entries.filter(function(x){return x.id!==id});closeEditor();saveAndRender()}
  function scheduleRange(entries){var starts=entries.filter(function(x){return x.start!=null}).map(function(x){return x.start});var min=starts.length?Math.min.apply(Math,starts):360;return {start:min<360?0:360,end:1440}}
  function eventLayout(entries){
    var sorted=entries.slice().sort(function(a,b){return a.start-b.start||a.end-b.end}),groups=[],group=[];var groupEnd=-1;
    sorted.forEach(function(e){if(group.length&&e.start>=groupEnd){groups.push(group);group=[];groupEnd=-1}group.push(e);groupEnd=Math.max(groupEnd,e.end)});if(group.length)groups.push(group);
    var out={};groups.forEach(function(items){var active=[],maxCols=1;items.forEach(function(e){active=active.filter(function(a){return a.end>e.start});var used={};active.forEach(function(a){used[a.col]=true});var col=0;while(used[col])col++;active.push({end:e.end,col:col});maxCols=Math.max(maxCols,col+1);out[e.id]={col:col,cols:1}});items.forEach(function(e){out[e.id].cols=maxCols})});return out;
  }
  function ensureUi(){
    var page=document.querySelector('#tasks .task-page');if(!page)return null;var root=document.getElementById('dailySchedule');
    if(!root){root=document.createElement('section');root.id='dailySchedule';root.className='daily-schedule';root.innerHTML='<div class="card daily-schedule-card"><div class="daily-schedule-head"><div class="daily-schedule-title">今日のスケジュール</div><div id="dailyScheduleDate" class="daily-schedule-date"></div></div><div id="dailyTimelineScroll" class="daily-timeline-scroll"><div id="dailyTimeline" class="daily-timeline"><div id="dailyEvents" class="daily-events"></div><div id="dailyNow" class="daily-now" hidden></div></div></div><div id="dailyTimelineEmpty" class="daily-schedule-empty">下のタスクを長押しして、今日の予定へ追加できます</div></div><div id="dailyPool" class="daily-pool"><div class="daily-pool-head"><span>今日使うタスク</span><span class="daily-pool-hint">長押ししてここへ</span></div><div id="dailyPoolList" class="daily-pool-list"></div></div>';page.insertBefore(root,page.firstChild);wirePool(root.querySelector('#dailyPool'))}
    return root;
  }
  function renderSchedule(){
    var root=ensureUi();if(!root)return;var data=ensureData(true),entries=data.entries.slice().sort(function(a,b){return a.order-b.order}),scheduled=entries.filter(function(x){return x.start!=null&&x.end!=null}),range=scheduleRange(scheduled),height=(range.end-range.start)/60*HOUR_PX;
    document.getElementById('dailyScheduleDate').textContent=formatDate();var timeline=document.getElementById('dailyTimeline'),events=document.getElementById('dailyEvents'),empty=document.getElementById('dailyTimelineEmpty');timeline.style.height=height+'px';events.innerHTML='';
    timeline.querySelectorAll('.daily-hour').forEach(function(x){x.remove()});for(var minute=range.start;minute<=range.end;minute+=30){var line=document.createElement('div');line.className='daily-hour'+(minute%60?' half':'');line.style.top=((minute-range.start)/60*HOUR_PX)+'px';if(minute%60===0&&minute<range.end){var label=document.createElement('span');label.className='daily-hour-label';label.textContent=timeText(minute);line.appendChild(label)}timeline.insertBefore(line,events)}
    var layout=eventLayout(scheduled);scheduled.forEach(function(entry){var task=taskById(entry.taskId);if(!task)return;var pos=layout[entry.id]||{col:0,cols:1},event=document.createElement('button');event.type='button';event.className='daily-event'+(task.completedAt?' completed':'');event.dataset.entryId=entry.id;event.style.top=((entry.start-range.start)/60*HOUR_PX)+'px';event.style.height=Math.max(22,(entry.end-entry.start)/60*HOUR_PX-2)+'px';event.style.left='calc('+(pos.col/pos.cols*100)+'% + 2px)';event.style.width='calc('+(100/pos.cols)+'% - 4px)';applyPalette(event,entry);event.innerHTML='<span class="daily-event-handle top" data-resize="top"></span><span class="daily-event-title"></span><span class="daily-event-time"></span><span class="daily-event-handle bottom" data-resize="bottom"></span>';event.querySelector('.daily-event-title').textContent=(task.completedAt?'✓ ':'')+task.title;event.querySelector('.daily-event-time').textContent=timeText(entry.start)+'〜'+timeText(entry.end);event.onclick=function(e){if(event.dataset.moved==='1'){event.dataset.moved='';return}openEditor(entry.id)};wireEvent(event,entry,range);events.appendChild(event)});
    empty.style.display=scheduled.length?'none':'block';document.getElementById('dailyTimelineScroll').style.display=scheduled.length?'block':'none';renderNow(range);renderPool(entries);decorateRows(entries);
  }
  function renderPool(entries){var list=document.getElementById('dailyPoolList');if(!list)return;list.innerHTML='';if(!entries.length){list.innerHTML='<div class="daily-pool-empty">タスクを長押しして追加</div>';return}entries.forEach(function(entry){var task=taskById(entry.taskId);if(!task)return;var chip=document.createElement('button');chip.type='button';chip.className='daily-chip';applyPalette(chip,entry);chip.innerHTML='<span class="daily-chip-title"></span><span class="daily-chip-time"></span>';chip.querySelector('.daily-chip-title').textContent=task.title;chip.querySelector('.daily-chip-time').textContent=entry.start==null?'時間未設定':timeText(entry.start)+'〜'+timeText(entry.end);chip.onclick=function(){openEditor(entry.id)};list.appendChild(chip)})}
  function decorateRows(entries){var map={};entries.forEach(function(x){map[x.taskId]=x});document.querySelectorAll('#taskOpenList .task-row').forEach(function(row){var entry=map[row.dataset.id];row.classList.toggle('in-daily-schedule',!!entry);if(entry)row.style.setProperty('--schedule-line',palette(entry).line);else row.style.removeProperty('--schedule-line');wireTaskToPool(row)})}
  function renderNow(range){var now=document.getElementById('dailyNow');if(!now)return;var d=new Date(),mins=d.getHours()*60+d.getMinutes();if(mins<range.start||mins>range.end){now.hidden=true;return}now.hidden=false;now.style.top=((mins-range.start)/60*HOUR_PX)+'px'}
  function wirePool(pool){
    pool.addEventListener('dragover',function(e){e.preventDefault();pool.classList.add('drop-active')});pool.addEventListener('dragleave',function(){pool.classList.remove('drop-active')});pool.addEventListener('drop',function(e){e.preventDefault();pool.classList.remove('drop-active');var id=e.dataTransfer.getData('text/plain');if(id)addTask(id,false)});
  }
  function wireTaskToPool(row){if(row.dataset.scheduleBound)return;row.dataset.scheduleBound='1';
    row.addEventListener('dragstart',function(e){dragTaskId=row.dataset.id;e.dataTransfer.setData('text/plain',dragTaskId)});row.addEventListener('dragend',function(){dragTaskId='';document.getElementById('dailyPool')&&document.getElementById('dailyPool').classList.remove('drop-active')});
  }
  function clearTaskTargets(){document.querySelectorAll('#taskOpenList .task-drop-target').forEach(function(x){x.classList.remove('task-drop-target')});dragTarget=null}
  function pointInPool(y){var pool=document.getElementById('dailyPool');if(!pool)return false;var r=pool.getBoundingClientRect();return y>=r.top-8&&y<=r.bottom+8}
  function showTaskDragDebug(status,e){
    var panel=document.getElementById('taskDragDebug');if(!panel){panel=document.createElement('div');panel.id='taskDragDebug';panel.className='task-drag-debug';document.body.appendChild(panel)}
    var pool=document.getElementById('dailyPool'),r=pool&&pool.getBoundingClientRect(),scroller=document.scrollingElement||document.documentElement,elapsed=dragDebugStarted?Date.now()-dragDebugStarted:0;
    panel.textContent='診断 '+status+'  '+elapsed+'ms\nmove:'+dragDebugMoves+'  active:'+(dragTouchActive?'yes':'no')+'  cancelable:'+(e&&e.cancelable?'yes':'no')+'\ny:'+Math.round(dragPointerY)+'  speed:'+dragScrollSpeed+'  scroll:'+Math.round(scroller&&scroller.scrollTop||0)+'\npool:'+(r?Math.round(r.top)+'..'+Math.round(r.bottom):'なし')+'  hit:'+(pointInPool(dragPointerY)?'yes':'no')+'\ntouch-action:'+(dragHeld?getComputedStyle(dragHeld).touchAction:'-');
  }
  function updateTaskDropTarget(y){
    var pool=document.getElementById('dailyPool');clearTaskTargets();if(pool)pool.classList.toggle('drop-active',pointInPool(y));if(pointInPool(y))return;
    var rows=Array.prototype.slice.call(document.querySelectorAll('#taskOpenList .task-row:not(.completed)')).filter(function(x){return x!==dragHeld}),best=null,bestDist=Infinity,before=true;
    rows.forEach(function(row){var r=row.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight)return;var mid=r.top+r.height/2,dist=Math.abs(y-mid);if(dist<bestDist){bestDist=dist;best=row;before=y<mid}});if(best){dragTarget=best;dragBefore=before;best.classList.add('task-drop-target')}
  }
  function stopTaskAutoScroll(){dragScrollSpeed=0;dragLastScrollAt=0;if(dragScrollFrame!==null){cancelAnimationFrame(dragScrollFrame);dragScrollFrame=null}}
  function taskAutoScrollStep(now){
    if(!dragTouchActive||!dragHeld||!dragScrollSpeed){dragScrollFrame=null;return}var scroller=document.scrollingElement||document.documentElement,beforeY=scroller.scrollTop,maxY=Math.max(0,scroller.scrollHeight-scroller.clientHeight);
    if((dragScrollSpeed<0&&beforeY<=0)||(dragScrollSpeed>0&&beforeY>=maxY-.5)){stopTaskAutoScroll();return}if(!dragLastScrollAt)dragLastScrollAt=now;var elapsed=Math.max(0,Math.min(34,now-dragLastScrollAt));dragLastScrollAt=now;scroller.scrollTop=Math.max(0,Math.min(maxY,beforeY+dragScrollSpeed*elapsed/1000));updateTaskDropTarget(dragPointerY);dragScrollFrame=requestAnimationFrame(taskAutoScrollStep)
  }
  function updateTaskAutoScroll(y){
    var viewportHeight=window.visualViewport&&window.visualViewport.height||window.innerHeight,topEdge=Math.max(80,Math.min(120,viewportHeight/6)),bottomEdge=Math.max(110,Math.min(160,viewportHeight/6)),next=0,ratio=0;
    if(y<topEdge){ratio=clamp((topEdge-y)/topEdge,0,1);next=-Math.round(90+ratio*550)}else if(y>viewportHeight-bottomEdge){ratio=clamp((y-(viewportHeight-bottomEdge))/bottomEdge,0,1);next=Math.round(90+ratio*550)}if(!dragScrollSpeed&&next)dragLastScrollAt=0;dragScrollSpeed=next;if(next&&dragScrollFrame===null)dragScrollFrame=requestAnimationFrame(taskAutoScrollStep);if(!next)stopTaskAutoScroll();showTaskDragDebug(next?'自動スクロール判定':'移動中')
  }
  function reorderTaskDirect(id,targetId,before){
    if(!id||!targetId||id===targetId)return;var from=(state.tasks||[]).findIndex(function(x){return x.id===id}),to=(state.tasks||[]).findIndex(function(x){return x.id===targetId});if(from<0||to<0)return;var moved=state.tasks.splice(from,1)[0];to=state.tasks.findIndex(function(x){return x.id===targetId});state.tasks.splice(before?to:to+1,0,moved);if(typeof save==='function')save();var nav=document.querySelector('#modeNav [data-mode="tasks"]');if(nav)nav.click()
  }
  function resetTaskGesture(){
    clearTimeout(dragHold);dragHold=null;stopTaskAutoScroll();clearTaskTargets();var pool=document.getElementById('dailyPool');if(pool)pool.classList.remove('drop-active');document.querySelectorAll('#taskOpenList .task-row').forEach(function(x){x.classList.remove('schedule-dragging','task-dragging')});dragHeld=null;dragTarget=null;dragTouchActive=false;dragTaskId=''
  }
  function bindUnifiedTaskDrag(){
    window.addEventListener('touchstart',function(e){if(e.touches.length!==1)return;var row=e.target&&e.target.closest?e.target.closest('#taskOpenList .task-row:not(.completed)'):null;if(!row||e.target.closest('button,input,textarea,select,a'))return;resetTaskGesture();dragHeld=row;dragTaskId=row.dataset.id;dragStartX=e.touches[0].clientX;dragStartY=e.touches[0].clientY;dragPointerY=dragStartY;dragDebugMoves=0;dragDebugStarted=Date.now();showTaskDragDebug('touchstart',e);dragHold=setTimeout(function(){if(!dragHeld)return;dragTouchActive=true;dragHeld.classList.remove('swipe-open','swipe-copy-open');dragHeld.classList.add('schedule-dragging','task-dragging');updateTaskDropTarget(dragPointerY);updateTaskAutoScroll(dragPointerY);showTaskDragDebug('長押し成立');if(navigator.vibrate)navigator.vibrate(25)},420)},{passive:true,capture:true});
    window.addEventListener('touchmove',function(e){if(!dragHeld||e.touches.length!==1)return;dragDebugMoves++;var p=e.touches[0],dx=p.clientX-dragStartX,dy=p.clientY-dragStartY;dragPointerY=p.clientY;if(!dragTouchActive){showTaskDragDebug('成立前move',e);if(Math.hypot(dx,dy)>16)resetTaskGesture();return}if(e.cancelable)e.preventDefault();e.stopImmediatePropagation();updateTaskDropTarget(dragPointerY);updateTaskAutoScroll(dragPointerY);showTaskDragDebug('touchmove',e)},{passive:false,capture:true});
    function finish(e){if(!dragHeld)return;clearTimeout(dragHold);dragHold=null;if(!dragTouchActive){showTaskDragDebug(e&&e.type==='touchcancel'?'成立前cancel':'成立前end',e);resetTaskGesture();return}if(e&&e.stopImmediatePropagation)e.stopImmediatePropagation();if(e&&e.changedTouches&&e.changedTouches.length)dragPointerY=e.changedTouches[0].clientY;var id=dragTaskId,targetId=dragTarget&&dragTarget.dataset.id,before=dragBefore,inPool=pointInPool(dragPointerY),status=e&&e.type==='touchcancel'?'touchcancel':inPool?'pool内でend':targetId?'並べ替え位置でend':'対象外でend';showTaskDragDebug(status,e);dragSuppressClickUntil=Date.now()+600;resetTaskGesture();if(inPool)addTask(id,false);else if(targetId)reorderTaskDirect(id,targetId,before)}
    window.addEventListener('touchend',finish,{passive:true,capture:true});window.addEventListener('touchcancel',finish,{passive:true,capture:true});document.addEventListener('click',function(e){if(Date.now()<dragSuppressClickUntil&&e.target.closest('#taskOpenList .task-row')){e.preventDefault();e.stopImmediatePropagation()}},true)
  }
  function wireEvent(el,entry,range){el.addEventListener('pointerdown',function(e){if(e.button!=null&&e.button!==0)return;e.preventDefault();var mode=e.target.dataset.resize||'move',startY=e.clientY,initialStart=entry.start,initialEnd=entry.end,moved=false;el.setPointerCapture&&el.setPointerCapture(e.pointerId);el.classList.add('moving');
      function move(ev){var delta=snap((ev.clientY-startY)/HOUR_PX*60),nextStart=initialStart,nextEnd=initialEnd;if(Math.abs(ev.clientY-startY)>4)moved=true;if(mode==='top')nextStart=clamp(initialStart+delta,0,initialEnd-SNAP);else if(mode==='bottom')nextEnd=clamp(initialEnd+delta,initialStart+SNAP,1440);else{var duration=initialEnd-initialStart;nextStart=clamp(initialStart+delta,0,1440-duration);nextEnd=nextStart+duration}entry.start=nextStart;entry.end=nextEnd;el.style.top=((entry.start-range.start)/60*HOUR_PX)+'px';el.style.height=Math.max(22,(entry.end-entry.start)/60*HOUR_PX-2)+'px';el.querySelector('.daily-event-time').textContent=timeText(entry.start)+'〜'+timeText(entry.end)}
      function up(){el.removeEventListener('pointermove',move);el.removeEventListener('pointerup',up);el.removeEventListener('pointercancel',up);el.classList.remove('moving');if(moved){el.dataset.moved='1';saveAndRender()}}
      el.addEventListener('pointermove',move);el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up)
    })}
  function defaultTimes(entry){if(entry&&entry.start!=null)return [entry.start,entry.end];var entries=ensureData(false).entries.filter(function(x){return x.start!=null&&x.end!=null}),start=entries.length?Math.max.apply(Math,entries.map(function(x){return x.end})):DEFAULT_START;start=clamp(snap(start),0,1440-DEFAULT_DURATION);return [start,start+DEFAULT_DURATION]}
  function openEditor(id){var entry=entryById(id),task=entry&&taskById(entry.taskId);if(!entry||!task)return;closeEditor();editorId=id;var times=defaultTimes(entry),overlay=document.createElement('div');overlay.id='scheduleTimeOverlay';overlay.className='schedule-time-overlay';overlay.innerHTML='<div class="schedule-time-panel"><div class="schedule-time-title">予定時間</div><div class="schedule-time-sub"></div><div class="schedule-time-fields"><label class="schedule-time-field">開始<input id="scheduleStart" class="schedule-time-input" inputmode="numeric" maxlength="5" placeholder="09:00"></label><span class="schedule-time-sep">〜</span><label class="schedule-time-field">終了<input id="scheduleEnd" class="schedule-time-input" inputmode="numeric" maxlength="5" placeholder="10:00"></label></div><div id="scheduleTimeError" class="schedule-time-error"></div><div class="schedule-time-actions"><button type="button" class="btn sub" data-act="cancel">キャンセル</button><button type="button" class="btn" data-act="save">設定</button></div><button type="button" class="schedule-remove" data-act="remove">今日の予定から外す</button></div>';overlay.querySelector('.schedule-time-sub').textContent=task.title;overlay.querySelector('#scheduleStart').value=timeText(times[0]);overlay.querySelector('#scheduleEnd').value=timeText(times[1]);overlay.onclick=function(e){if(e.target===overlay)closeEditor();var b=e.target.closest('[data-act]');if(!b)return;var act=b.dataset.act;if(act==='cancel')closeEditor();else if(act==='remove')removeEntry(id);else if(act==='save')saveEditor(entry)};document.body.appendChild(overlay);setTimeout(function(){overlay.querySelector('#scheduleStart').focus()},30)}
  function saveEditor(entry){var start=parseTime(document.getElementById('scheduleStart').value),end=parseTime(document.getElementById('scheduleEnd').value),error=document.getElementById('scheduleTimeError');if(start==null||end==null){error.textContent='時刻は「09:00」の形式で入力してください';return}start=snap(start);end=snap(end);if(end<=start){error.textContent='終了時刻は開始時刻より後にしてください';return}entry.start=clamp(start,0,1425);entry.end=clamp(end,entry.start+SNAP,1440);closeEditor();saveAndRender()}
  function closeEditor(){var overlay=document.getElementById('scheduleTimeOverlay');if(overlay)overlay.remove();editorId=''}
  function enhanceActionMenu(){setTimeout(function(){var pop=document.getElementById('taskActionPop'),taskId=actionTaskId;if(!pop||!taskId||pop.querySelector('[data-act="schedule"]'))return;var button=document.createElement('button');button.type='button';button.dataset.act='schedule';button.textContent=entryByTask(taskId)?'予定時間を設定':'今日の予定に追加';button.onclick=function(e){e.stopPropagation();pop.remove();addTask(taskId,true)};pop.insertBefore(button,pop.firstChild)},0)}

  ensureData(false);ensureUi();
  var previousShow=typeof show==='function'?show:null;if(previousShow)show=function(id){var result=previousShow.apply(this,arguments);if(id==='tasks')setTimeout(renderSchedule,0);return result};
  var previousSyncPayload=typeof syncPayload==='function'?syncPayload:null;if(previousSyncPayload)syncPayload=function(){var payload=JSON.parse(previousSyncPayload());payload.taskSchedule=cleanSchedule(state.taskSchedule);return JSON.stringify(payload)};
  var previousApplyRemote=typeof applyRemote==='function'?applyRemote:null;if(previousApplyRemote)applyRemote=function(raw,remoteTime){var remote={};try{remote=JSON.parse(raw)||{}}catch(e){}var result=previousApplyRemote.apply(this,arguments);state.taskSchedule=cleanSchedule(remote.taskSchedule);if(typeof save==='function')save(false);if(typeof currentScreen!=='undefined'&&currentScreen==='tasks')renderSchedule();return result};
  bindUnifiedTaskDrag();
  document.addEventListener('click',function(e){var more=e.target.closest('#taskOpenList .task-more');if(more){var row=more.closest('.task-row');actionTaskId=row&&row.dataset.id||'';enhanceActionMenu()}},true);
  var openList=document.getElementById('taskOpenList'),doneList=document.getElementById('taskDoneList');if(window.MutationObserver&&openList){observer=new MutationObserver(function(){if(typeof currentScreen!=='undefined'&&currentScreen==='tasks')renderSchedule()});observer.observe(openList,{childList:true});if(doneList)observer.observe(doneList,{childList:true})}
  document.addEventListener('visibilitychange',function(){if(!document.hidden){ensureData(true);if(typeof currentScreen!=='undefined'&&currentScreen==='tasks')renderSchedule()}});
  clockTimer=setInterval(function(){if(typeof currentScreen!=='undefined'&&currentScreen==='tasks'){ensureData(true);renderNow(scheduleRange(ensureData(false).entries.filter(function(x){return x.start!=null}))) }},60000);
})();
