(function(){
  if(window.__dailyScheduleV113)return;
  window.__dailyScheduleV113=true;

  var SNAP=15,HOUR_PX=28,DEFAULT_START=9*60,DEFAULT_DURATION=60,DEFAULT_VIEW_START=8*60,DEFAULT_VIEW_END=18*60;
  var COLORS=[
    {bg:'#fde8e7',line:'#e16b64',text:'#8f3833'},
    {bg:'#e5f0fb',line:'#5b9bd5',text:'#315f88'},
    {bg:'#e3f4ec',line:'#45a980',text:'#276f58'},
    {bg:'#fff2cc',line:'#d5a928',text:'#806516'},
    {bg:'#eee8fb',line:'#8b72cf',text:'#59469a'},
    {bg:'#dff3f4',line:'#45aeb3',text:'#276f73'}
  ];
  var editorId='',actionTaskId='',clockTimer=null,observer=null;

  var style=document.createElement('style');
  style.setAttribute('data-daily-schedule-v113','');
  style.textContent='\
.daily-schedule{display:grid;gap:12px}\
.daily-schedule-card{padding:13px 12px 12px;overflow:hidden}\
.daily-schedule-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px}\
.daily-schedule-title{font-size:16px;font-weight:850;color:#252b31}\
.daily-schedule-date{font-size:16px;font-weight:850;color:#252b31}\
.daily-schedule-range{border:0;border-radius:10px;background:#f0f3f5;color:#69747d;padding:7px 9px;font-size:12px;font-weight:750;font-variant-numeric:tabular-nums}\
.daily-schedule-empty{padding:20px 10px;text-align:center;color:#87919a;font-size:13px;line-height:1.55}\
.daily-timeline-scroll{position:relative;overflow:hidden;border-radius:16px;background:#fbfcfc;border:1px solid #edf0f2}\
.daily-timeline{position:relative;min-height:0}\
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
.daily-event-handle.resize-top{top:-2px;cursor:ns-resize;background:transparent}\
.daily-event-handle.resize-bottom{bottom:-2px;cursor:ns-resize;background:transparent}\
.daily-event.moving{z-index:20;box-shadow:0 8px 20px rgba(29,39,48,.22)}\
.daily-now{position:absolute;left:45px;right:0;height:2px;background:#ef5a5a;z-index:25;pointer-events:none}\
.daily-now::before{content:"";position:absolute;left:-4px;top:-3px;width:8px;height:8px;border-radius:50%;background:#ef5a5a}\
.daily-pool{border:2px dashed #d9e0e4;border-radius:15px;padding:9px;transition:.18s ease;background:#fafbfc}\
.daily-pool.drop-active{border-color:#27ae8b;background:#eaf7f3;transform:scale(1.01)}\
.daily-pool.add-confirmed{border-color:#27ae8b;background:#e1f6ef;box-shadow:0 0 0 4px rgba(39,174,139,.14)}\
.daily-pool-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:7px;color:#727c85;font-size:11px;font-weight:800}\
.daily-pool-hint{font-weight:600;color:#98a0a7}\
.daily-pool-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));align-items:stretch;gap:7px;padding:1px 1px 3px}\
.daily-pool-empty{grid-column:1/-1;width:100%;padding:7px 3px;color:#98a1a9;font-size:12px;text-align:center}\
.daily-chip{width:100%;min-width:0;min-height:48px;border:1px solid var(--event-line);border-radius:11px;background:var(--event-bg);color:var(--event-text);padding:7px 9px;text-align:left;touch-action:none;-webkit-touch-callout:none}\
.daily-chip.return-holding{transform:scale(.97);filter:saturate(.75);box-shadow:0 0 0 3px rgba(39,174,139,.2)}\
.daily-chip.return-dragging{opacity:.42}\
.daily-pool.return-outside{border-color:#82909a;background:#eef1f3}\
.daily-chip-title{display:block;max-width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:11px;font-weight:800}\
.daily-chip-time{display:block;margin-top:2px;font-size:9px;font-weight:700;opacity:.76}\
.task-row.schedule-dragging{opacity:.5;transform:scale(.98)}\
.task-row.in-daily-schedule::before{content:"";position:absolute;left:4px;top:11px;bottom:11px;width:3px;border-radius:4px;background:var(--schedule-line);z-index:2}\
.task-drag-ghost{position:fixed;z-index:12000;min-height:48px;display:flex;align-items:center;padding:10px 13px;border:2px solid #27ae8b;border-radius:15px;background:rgba(255,255,255,.96);color:#253039;font-size:14px;font-weight:800;line-height:1.35;box-shadow:0 12px 30px rgba(25,35,43,.22);pointer-events:none;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\
.schedule-time-overlay{position:fixed;inset:0;z-index:10100;display:grid;align-items:end;background:rgba(25,31,37,.38);padding:16px 12px max(16px,env(safe-area-inset-bottom))}\
.schedule-time-panel{box-sizing:border-box;width:100%;max-width:430px;margin:0 auto;padding:18px;border-radius:22px;background:#f7f8fa;box-shadow:0 18px 45px rgba(20,27,34,.22);overflow:hidden}\
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
.schedule-range-panel .schedule-time-fields{grid-template-columns:1fr auto 1fr}\
.schedule-clock-groups{display:grid;gap:12px}.schedule-clock-groups>.schedule-time-field{margin-bottom:6px}.schedule-clock-groups .task-time-fields{display:grid;grid-template-columns:1fr 1fr;gap:9px}.schedule-clock-groups .item-time-input-wrap{height:82px;padding:8px}.schedule-clock-groups .item-time-input{width:62px}\
@media(min-width:780px){.schedule-time-overlay{align-items:center}.daily-schedule-card{padding:16px}}\
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
    var viewStart=clamp(snap(source.viewStart==null?DEFAULT_VIEW_START:+source.viewStart),0,1425),viewEnd=clamp(snap(source.viewEnd==null?DEFAULT_VIEW_END:+source.viewEnd),15,1440);
    if(viewEnd<=viewStart)viewEnd=Math.min(1440,viewStart+60);
    return {day:today,nextOrder:Math.max(0,Math.floor(+source.nextOrder||0)),viewStart:viewStart,viewEnd:viewEnd,entries:same&&Array.isArray(source.entries)?source.entries.map(cleanEntry).filter(function(x){return x.taskId}):[]};
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
  function assignMissingTimes(entries){var changed=false,cursor=entries.filter(function(x){return x.start!=null&&x.end!=null}).reduce(function(max,x){return Math.max(max,x.end)},DEFAULT_START);entries.slice().sort(function(a,b){return a.order-b.order}).forEach(function(entry){if(entry.start!=null&&entry.end!=null)return;var start=clamp(snap(cursor),0,1440-DEFAULT_DURATION);entry.start=start;entry.end=start+DEFAULT_DURATION;cursor=entry.end;changed=true});return changed}
  function logSchedule(status,details){if(!window.__stretchDiagnostics||!window.__stretchDiagnostics.log)return;details=details||{};details.status=status;window.__stretchDiagnostics.log('task-schedule',details)}
  function confirmPool(message){var pool=document.getElementById('dailyPool');if(pool){pool.classList.remove('add-confirmed');void pool.offsetWidth;pool.classList.add('add-confirmed');setTimeout(function(){pool.classList.remove('add-confirmed')},900)}var old=document.getElementById('scheduleToast');if(old)old.remove();var toast=document.createElement('div');toast.id='scheduleToast';toast.textContent=message;toast.style.cssText='position:fixed;left:50%;bottom:88px;transform:translateX(-50%);z-index:10030;background:#187e66;color:#fff;padding:9px 13px;border-radius:13px;font-size:13px;font-weight:750;box-shadow:0 5px 18px rgba(20,70,58,.24);white-space:nowrap';document.body.appendChild(toast);setTimeout(function(){toast.remove()},1500)}
  function addTask(id,openEditorAfter){
    var task=taskById(id);if(!task||task.completedAt){logSchedule('add-rejected',{taskId:id,reason:!task?'missing-task':'completed'});return}var data=ensureData(true),before=data.entries.length,existing=data.entries.find(function(x){return x.taskId===id});logSchedule('add-start',{taskId:id,before:before,existing:!!existing});
    if(!existing){var order=data.nextOrder++;existing={id:uid2(),taskId:id,color:order%COLORS.length,order:order,start:null,end:null};data.entries.push(existing);assignMissingTimes(data.entries);saveAndRender();logSchedule('add-saved',{taskId:id,entryId:existing.id,before:before,after:ensureData(false).entries.length,nextOrder:data.nextOrder});confirmPool('今日のタスクに追加しました')}
    else{if(assignMissingTimes(data.entries)&&typeof save==='function')save();renderSchedule();logSchedule('add-existing',{taskId:id,entryId:existing.id,count:data.entries.length});confirmPool('すでに今日のタスクに入っています')}
    if(openEditorAfter)openEditor(existing.id);
  }
  function removeEntry(id){var data=ensureData(false),before=data.entries.length,entry=data.entries.find(function(x){return x.id===id});data.entries=data.entries.filter(function(x){return x.id!==id});closeEditor();saveAndRender();logSchedule('remove-saved',{entryId:id,taskId:entry&&entry.taskId||'',before:before,after:data.entries.length})}
  function scheduleRange(entries){var data=ensureData(false),start=data.viewStart,end=data.viewEnd;entries.forEach(function(entry){if(entry.start!=null)start=Math.min(start,entry.start);if(entry.end!=null)end=Math.max(end,entry.end)});return {start:clamp(Math.floor(start/30)*30,0,1410),end:clamp(Math.ceil(end/30)*30,30,1440)}}
  function eventLayout(entries){
    var sorted=entries.slice().sort(function(a,b){return a.start-b.start||a.end-b.end}),groups=[],group=[];var groupEnd=-1;
    sorted.forEach(function(e){if(group.length&&e.start>=groupEnd){groups.push(group);group=[];groupEnd=-1}group.push(e);groupEnd=Math.max(groupEnd,e.end)});if(group.length)groups.push(group);
    var out={};groups.forEach(function(items){var active=[],maxCols=1;items.forEach(function(e){active=active.filter(function(a){return a.end>e.start});var used={};active.forEach(function(a){used[a.col]=true});var col=0;while(used[col])col++;active.push({end:e.end,col:col});maxCols=Math.max(maxCols,col+1);out[e.id]={col:col,cols:1}});items.forEach(function(e){out[e.id].cols=maxCols})});return out;
  }
  function ensureUi(){
    var page=document.querySelector('#tasks .task-page');if(!page)return null;var root=document.getElementById('dailySchedule');
    if(!root){root=document.createElement('section');root.id='dailySchedule';root.className='daily-schedule';root.innerHTML='<div class="card daily-schedule-card"><div class="daily-schedule-head"><div id="dailyScheduleDate" class="daily-schedule-date"></div><button id="dailyScheduleRange" class="daily-schedule-range" type="button"></button></div><div id="dailyTimelineScroll" class="daily-timeline-scroll"><div id="dailyTimeline" class="daily-timeline"><div id="dailyEvents" class="daily-events"></div><div id="dailyNow" class="daily-now" hidden></div></div></div><div id="dailyTimelineEmpty" class="daily-schedule-empty">全タスクから長押しして追加できます</div></div><div id="dailyPool" class="daily-pool"><div class="daily-pool-head"><span>今日のタスク</span><span class="daily-pool-hint">タスクを長押し</span></div><div id="dailyPoolList" class="daily-pool-list"></div></div>';page.insertBefore(root,page.firstChild);root.querySelector('#dailyScheduleRange').onclick=openRangeEditor}
    return root;
  }
  function renderSchedule(){
    var root=ensureUi();if(!root)return;var data=ensureData(true),assigned=assignMissingTimes(data.entries);if(assigned&&typeof save==='function')save();var entries=data.entries.slice().sort(function(a,b){return a.order-b.order}),scheduled=entries.filter(function(x){return x.start!=null&&x.end!=null}),range=scheduleRange(scheduled),height=(range.end-range.start)/60*HOUR_PX;
    document.getElementById('dailyScheduleDate').textContent=formatDate();var dataView=ensureData(false);document.getElementById('dailyScheduleRange').textContent=Math.floor(dataView.viewStart/60)+'時〜'+Math.ceil(dataView.viewEnd/60)+'時';var timeline=document.getElementById('dailyTimeline'),events=document.getElementById('dailyEvents'),empty=document.getElementById('dailyTimelineEmpty');timeline.style.height=height+'px';events.innerHTML='';
    timeline.querySelectorAll('.daily-hour').forEach(function(x){x.remove()});for(var minute=range.start;minute<=range.end;minute+=30){var line=document.createElement('div');line.className='daily-hour'+(minute%60?' half':'');line.style.top=((minute-range.start)/60*HOUR_PX)+'px';if(minute%60===0&&minute<range.end){var label=document.createElement('span');label.className='daily-hour-label';label.textContent=timeText(minute);line.appendChild(label)}timeline.insertBefore(line,events)}
    var layout=eventLayout(scheduled);scheduled.forEach(function(entry){var task=taskById(entry.taskId);if(!task)return;var pos=layout[entry.id]||{col:0,cols:1},event=document.createElement('button');event.type='button';event.className='daily-event'+(task.completedAt?' completed':'');event.dataset.entryId=entry.id;event.style.top=((entry.start-range.start)/60*HOUR_PX)+'px';event.style.height=Math.max(22,(entry.end-entry.start)/60*HOUR_PX-2)+'px';event.style.left='calc('+(pos.col/pos.cols*100)+'% + 2px)';event.style.width='calc('+(100/pos.cols)+'% - 4px)';applyPalette(event,entry);event.innerHTML='<span class="daily-event-handle resize-top" data-resize="top"></span><span class="daily-event-title"></span><span class="daily-event-time"></span><span class="daily-event-handle resize-bottom" data-resize="bottom"></span>';event.querySelector('.daily-event-title').textContent=(task.completedAt?'✓ ':'')+task.title;event.querySelector('.daily-event-time').textContent=timeText(entry.start)+'〜'+timeText(entry.end);event.onclick=function(e){if(event.dataset.moved==='1'){event.dataset.moved='';return}openEditor(entry.id)};wireEvent(event,entry,range);events.appendChild(event)});
    empty.textContent=entries.length?'今日のタスクをタップして開始・終了時間を調整できます':'全タスクから長押しして追加できます';empty.style.display=scheduled.length?'none':'block';document.getElementById('dailyTimelineScroll').style.display=scheduled.length?'block':'none';renderNow(range);renderPool(entries);decorateRows(entries);
  }
  function renderPool(entries){var list=document.getElementById('dailyPoolList');if(!list)return;list.innerHTML='';if(!entries.length){list.innerHTML='<div class="daily-pool-empty">左のハンドルを長押しして追加</div>';return}entries.forEach(function(entry){var task=taskById(entry.taskId);if(!task)return;var chip=document.createElement('button');chip.type='button';chip.className='daily-chip';chip.dataset.entryId=entry.id;chip.title='タップで詳細・長押しして枠外へ戻す';applyPalette(chip,entry);chip.innerHTML='<span class="daily-chip-title"></span><span class="daily-chip-time"></span>';chip.querySelector('.daily-chip-title').textContent=task.title;chip.querySelector('.daily-chip-time').textContent=entry.start==null?'タップで詳細・長押しで戻す':timeText(entry.start)+'〜'+timeText(entry.end)+'・長押しで戻す';wireChipReturn(chip,entry);list.appendChild(chip)})}
  function wireChipReturn(chip,entry){
    var timer=null,startX=0,startY=0,currentX=0,currentY=0,suppress=false,active=false,ghost=null;
    function pool(){return document.getElementById('dailyPool')}
    function outside(){var p=pool(),r=p&&p.getBoundingClientRect();return !!r&&(currentY>r.bottom+14||currentY<r.top-14)}
    function moveGhost(){if(!ghost)return;ghost.style.left=clamp(currentX-ghost.offsetWidth/2,8,innerWidth-ghost.offsetWidth-8)+'px';ghost.style.top=clamp(currentY-25,8,innerHeight-60)+'px';var p=pool();if(p)p.classList.toggle('return-outside',outside())}
    function activate(){timer=null;active=true;suppress=true;chip.classList.remove('return-holding');chip.classList.add('return-dragging');ghost=document.createElement('div');ghost.className='task-drag-ghost';ghost.textContent=chip.querySelector('.daily-chip-title').textContent;ghost.style.width=Math.min(280,innerWidth-24)+'px';document.body.appendChild(ghost);moveGhost();logSchedule('return-drag-start',{entryId:entry.id,taskId:entry.taskId});if(navigator.vibrate)navigator.vibrate(25)}
    function clear(){clearTimeout(timer);timer=null;active=false;chip.classList.remove('return-holding','return-dragging');if(ghost){ghost.remove();ghost=null}var p=pool();if(p)p.classList.remove('return-outside')}
    function begin(x,y,e){clear();startX=currentX=x;startY=currentY=y;suppress=false;chip.classList.add('return-holding');timer=setTimeout(activate,360);if(e&&e.cancelable)e.preventDefault()}
    function move(x,y,e){currentX=x;currentY=y;if(e&&e.cancelable)e.preventDefault();if(active){moveGhost();return}if(timer&&Math.hypot(x-startX,y-startY)>12){clear();suppress=true}}
    function openTask(){if(window.__stretchTimerTasksV106&&window.__stretchTimerTasksV106.openDetail)window.__stretchTimerTasksV106.openDetail(entry.taskId)}
    function finish(e,allowTap){if(e&&e.cancelable)e.preventDefault();var shouldReturn=active&&outside(),wasTap=allowTap&&!active&&!!timer&&Math.hypot(currentX-startX,currentY-startY)<=12;if(active)logSchedule(shouldReturn?'return-drag-drop':'return-drag-cancel',{entryId:entry.id,taskId:entry.taskId,y:Math.round(currentY)});clear();if(shouldReturn){removeEntry(entry.id);confirmPool('全タスクへ戻しました')}else if(wasTap)openTask()}
    chip.addEventListener('touchstart',function(e){if(e.touches.length!==1)return;var t=e.touches[0];begin(t.clientX,t.clientY,e)},{passive:false});
    chip.addEventListener('touchmove',function(e){if(e.touches.length!==1)return;var t=e.touches[0];move(t.clientX,t.clientY,e)},{passive:false});
    chip.addEventListener('touchend',function(e){var t=e.changedTouches&&e.changedTouches[0];if(t){currentX=t.clientX;currentY=t.clientY}finish(e,true)},{passive:false});chip.addEventListener('touchcancel',function(e){clear();suppress=true;if(e.cancelable)e.preventDefault()},{passive:false});
    chip.addEventListener('pointerdown',function(e){if(e.pointerType==='touch'||(e.button!=null&&e.button!==0))return;begin(e.clientX,e.clientY,e);chip.setPointerCapture&&chip.setPointerCapture(e.pointerId)});
    chip.addEventListener('pointermove',function(e){if(e.pointerType==='touch')return;move(e.clientX,e.clientY,e)});chip.addEventListener('pointerup',function(e){if(e.pointerType!=='touch')finish(e,false)});chip.addEventListener('pointercancel',clear);
    chip.addEventListener('click',function(e){if(suppress){e.preventDefault();e.stopImmediatePropagation();return}openTask()})
  }

  function buildClockFields(container,minutes,allow24){var builder=window.StretchUI&&window.StretchUI.buildTimeNumberInput;if(!builder)return null;var hour=minutes===1440?24:Math.floor(minutes/60),h=builder(hour,allow24?24:23,'時'),m=builder(minutes===1440?0:minutes%60,59,'分');container.append(h.element,m.element);return {first:h.input,value:function(){var hv=h.value(),mv=m.value();return {minutes:hv*60+mv,invalid24:hv===24&&mv!==0}}}}
  function openRangeEditor(){var data=ensureData(false);if(!window.StretchUI||!window.StretchUI.buildTimeNumberInput)return;var overlay=document.createElement('div');overlay.id='scheduleRangeOverlay';overlay.className='schedule-time-overlay';overlay.innerHTML='<div class="schedule-time-panel schedule-range-panel"><div class="schedule-time-title">表示時間</div><div class="schedule-time-sub">今日のスケジュールに表示する基本範囲</div><div class="schedule-clock-groups"><div><div class="schedule-time-field">開始</div><div class="task-time-fields" data-range="start"></div></div><div><div class="schedule-time-field">終了</div><div class="task-time-fields" data-range="end"></div></div></div><div id="scheduleRangeError" class="schedule-time-error"></div><div class="schedule-time-actions"><button type="button" class="btn sub" data-act="cancel">キャンセル</button><button type="button" class="btn" data-act="save">設定</button></div></div>';var startFields=buildClockFields(overlay.querySelector('[data-range="start"]'),data.viewStart,false),endFields=buildClockFields(overlay.querySelector('[data-range="end"]'),data.viewEnd,true);overlay.onclick=function(e){if(e.target===overlay||e.target.closest('[data-act="cancel"]')){overlay.remove();return}var saveButton=e.target.closest('[data-act="save"]');if(!saveButton)return;var startValue=startFields.value(),endValue=endFields.value(),start=startValue.minutes,end=endValue.minutes,error=overlay.querySelector('#scheduleRangeError');if(endValue.invalid24){error.textContent='24時を指定する場合、分は00にしてください';return}if(end<=start){error.textContent='終了時刻は開始時刻より後にしてください';return}data.viewStart=clamp(snap(start),0,1425);data.viewEnd=clamp(snap(end),data.viewStart+SNAP,1440);if(typeof save==='function')save();overlay.remove();renderSchedule()};document.body.appendChild(overlay);setTimeout(function(){try{startFields.first.focus();startFields.first.select()}catch(e){}},0)}
  function decorateRows(entries){var map={};entries.forEach(function(x){map[x.taskId]=x});document.querySelectorAll('#taskOpenList .task-row').forEach(function(row){var entry=map[row.dataset.id];row.classList.toggle('in-daily-schedule',!!entry);if(entry)row.style.setProperty('--schedule-line',palette(entry).line);else row.style.removeProperty('--schedule-line')})}
  function renderNow(range){var now=document.getElementById('dailyNow');if(!now)return;var d=new Date(),mins=d.getHours()*60+d.getMinutes();if(mins<range.start||mins>range.end){now.hidden=true;return}now.hidden=false;now.style.top=((mins-range.start)/60*HOUR_PX)+'px'}
  function pointInPool(y){var pool=document.getElementById('dailyPool');if(!pool)return false;var r=pool.getBoundingClientRect();return y>=r.top-8&&y<=r.bottom+8}
  function reorderTaskDirect(id,targetId,before){if(!window.StretchUI||!StretchUI.reorderCollection||!StretchUI.reorderCollection(state.tasks||[],id,targetId,before))return;if(typeof save==='function')save();var nav=document.querySelector('#modeNav [data-mode="tasks"]');if(nav)nav.click()}
  function bindUnifiedTaskDrag(){
    if(window.StretchUI&&StretchUI.registerReorder){
      StretchUI.registerReorder({key:'task-cards',selector:'#taskOpenList .task-row:not(.completed)',ignore:'button,input,textarea,select,a',label:function(card){var title=card.querySelector('.task-title-text');return title?title.textContent:'タスク'},inDropZone:function(x,y){return pointInPool(y)},setDropActive:function(active){var pool=document.getElementById('dailyPool');if(pool)pool.classList.toggle('drop-active',active)},onDropZone:function(move){logSchedule('unified-drop-in-pool',{taskId:move.id});addTask(move.id,false)},onReorder:function(move){reorderTaskDirect(move.id,move.targetId,move.before)}});
    }
  }
  function wireEvent(el,entry,range){el.addEventListener('pointerdown',function(e){if(e.button!=null&&e.button!==0)return;e.preventDefault();var mode=e.target.dataset.resize||'move',startY=e.clientY,initialStart=entry.start,initialEnd=entry.end,moved=false;el.setPointerCapture&&el.setPointerCapture(e.pointerId);el.classList.add('moving');
      function move(ev){var delta=snap((ev.clientY-startY)/HOUR_PX*60),nextStart=initialStart,nextEnd=initialEnd;if(Math.abs(ev.clientY-startY)>4)moved=true;if(mode==='top')nextStart=clamp(initialStart+delta,0,initialEnd-SNAP);else if(mode==='bottom')nextEnd=clamp(initialEnd+delta,initialStart+SNAP,1440);else{var duration=initialEnd-initialStart;nextStart=clamp(initialStart+delta,0,1440-duration);nextEnd=nextStart+duration}entry.start=nextStart;entry.end=nextEnd;el.style.top=((entry.start-range.start)/60*HOUR_PX)+'px';el.style.height=Math.max(22,(entry.end-entry.start)/60*HOUR_PX-2)+'px';el.querySelector('.daily-event-time').textContent=timeText(entry.start)+'〜'+timeText(entry.end)}
      function up(){el.removeEventListener('pointermove',move);el.removeEventListener('pointerup',up);el.removeEventListener('pointercancel',up);el.classList.remove('moving');if(moved){el.dataset.moved='1';saveAndRender()}}
      el.addEventListener('pointermove',move);el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up)
    })}
  function defaultTimes(entry){if(entry&&entry.start!=null)return [entry.start,entry.end];var entries=ensureData(false).entries.filter(function(x){return x.start!=null&&x.end!=null}),start=entries.length?Math.max.apply(Math,entries.map(function(x){return x.end})):DEFAULT_START;start=clamp(snap(start),0,1440-DEFAULT_DURATION);return [start,start+DEFAULT_DURATION]}
  function openEditor(id){var entry=entryById(id),task=entry&&taskById(entry.taskId);if(!entry||!task||!window.StretchUI||!window.StretchUI.buildTimeNumberInput)return;closeEditor();editorId=id;var times=defaultTimes(entry),overlay=document.createElement('div');overlay.id='scheduleTimeOverlay';overlay.className='schedule-time-overlay';overlay.innerHTML='<div class="schedule-time-panel"><div class="schedule-time-title">予定時間</div><div class="schedule-time-sub"></div><div class="schedule-clock-groups"><div><div class="schedule-time-field">開始</div><div class="task-time-fields" data-time="start"></div></div><div><div class="schedule-time-field">終了</div><div class="task-time-fields" data-time="end"></div></div></div><div id="scheduleTimeError" class="schedule-time-error"></div><div class="schedule-time-actions"><button type="button" class="btn sub" data-act="cancel">キャンセル</button><button type="button" class="btn" data-act="save">設定</button></div><button type="button" class="schedule-remove" data-act="remove">今日のタスクから外す</button></div>';overlay.querySelector('.schedule-time-sub').textContent=task.title;var startFields=buildClockFields(overlay.querySelector('[data-time="start"]'),times[0],false),endFields=buildClockFields(overlay.querySelector('[data-time="end"]'),times[1],true);overlay.onclick=function(e){if(e.target===overlay){closeEditor();return}var b=e.target.closest('[data-act]');if(!b)return;var act=b.dataset.act;if(act==='cancel')closeEditor();else if(act==='remove')removeEntry(id);else if(act==='save')saveEditor(entry,startFields,endFields)};document.body.appendChild(overlay);setTimeout(function(){try{startFields.first.focus();startFields.first.select()}catch(e){}},30)}
  function saveEditor(entry,startFields,endFields){var startValue=startFields.value(),endValue=endFields.value(),start=startValue.minutes,end=endValue.minutes,error=document.getElementById('scheduleTimeError');if(endValue.invalid24){error.textContent='24時を指定する場合、分は00にしてください';return}start=snap(start);end=snap(end);if(end<=start){error.textContent='終了時刻は開始時刻より後にしてください';return}entry.start=clamp(start,0,1425);entry.end=clamp(end,entry.start+SNAP,1440);closeEditor();saveAndRender()}
  function closeEditor(){var overlay=document.getElementById('scheduleTimeOverlay');if(overlay)overlay.remove();editorId=''}
  function enhanceActionMenu(){setTimeout(function(){var pop=document.getElementById('taskActionPop'),taskId=actionTaskId;if(!pop||!taskId||pop.querySelector('[data-act="schedule"]'))return;var button=document.createElement('button');button.type='button';button.dataset.act='schedule';button.textContent=entryByTask(taskId)?'予定時間を設定':'今日のタスクに追加';button.onclick=function(e){e.stopPropagation();pop.remove();addTask(taskId,true)};pop.insertBefore(button,pop.firstChild)},0)}

  ensureData(false);ensureUi();
  if(window.StretchUI&&StretchUI.registerScreenHook)StretchUI.registerScreenHook({key:'daily-schedule',after:function(id){if(id==='tasks')setTimeout(renderSchedule,0)}});
  if(window.StretchUI&&StretchUI.registerDataProvider)StretchUI.registerDataProvider({key:'task-schedule',write:function(payload){payload.taskSchedule=cleanSchedule(state.taskSchedule)},read:function(remote){state.taskSchedule=cleanSchedule(remote.taskSchedule);if(typeof save==='function')save(false);if(typeof currentScreen!=='undefined'&&currentScreen==='tasks')renderSchedule()}});
  bindUnifiedTaskDrag();
  document.addEventListener('click',function(e){var more=e.target.closest('#taskOpenList .task-more');if(more){var row=more.closest('.task-row');actionTaskId=row&&row.dataset.id||'';enhanceActionMenu()}},true);
  var openList=document.getElementById('taskOpenList'),doneList=document.getElementById('taskDoneList');if(window.MutationObserver&&openList){observer=new MutationObserver(function(){if(typeof currentScreen!=='undefined'&&currentScreen==='tasks')renderSchedule()});observer.observe(openList,{childList:true});if(doneList)observer.observe(doneList,{childList:true})}
  document.addEventListener('visibilitychange',function(){if(!document.hidden){ensureData(true);if(typeof currentScreen!=='undefined'&&currentScreen==='tasks')renderSchedule()}});
  clockTimer=setInterval(function(){if(typeof currentScreen!=='undefined'&&currentScreen==='tasks'){ensureData(true);renderNow(scheduleRange(ensureData(false).entries.filter(function(x){return x.start!=null}))) }},60000);
})();
