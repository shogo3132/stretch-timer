(function(){
  if(window.__dailyScheduleV113)return;
  window.__dailyScheduleV113=true;

  var SNAP=15,HOUR_PX=28,DAY_END=30*60,DEFAULT_START=9*60,DEFAULT_DURATION=60,DEFAULT_VIEW_START=8*60,DEFAULT_VIEW_END=18*60;
  var COLORS=[
    {bg:'#fde8e7',line:'#e16b64',text:'#8f3833'},
    {bg:'#e5f0fb',line:'#5b9bd5',text:'#315f88'},
    {bg:'#e3f4ec',line:'#45a980',text:'#276f58'},
    {bg:'#fff2cc',line:'#d5a928',text:'#806516'},
    {bg:'#eee8fb',line:'#8b72cf',text:'#59469a'},
    {bg:'#dff3f4',line:'#45aeb3',text:'#276f73'}
  ];
  var editorId='',actionTaskId='',clockTimer=null,observer=null,selectedDayOffset=0,anchorToday='';

  var style=document.createElement('style');
  style.setAttribute('data-daily-schedule-v113','');
  style.textContent='\
.daily-schedule{display:grid;gap:12px}\
.daily-day-tabs{display:grid;grid-template-columns:repeat(3,1fr);gap:5px;padding:4px;border-radius:14px;background:#edf1f3}\
.daily-day-tab{min-height:34px;border:0;border-radius:10px;background:transparent;color:#7b858e;font-size:12px;font-weight:750}\
.daily-day-tab.active{background:#fff;color:#21886f;box-shadow:0 1px 3px rgba(25,35,43,.08)}\
.daily-schedule.day-enter-next{animation:dailyInNext .18s ease-out}.daily-schedule.day-enter-prev{animation:dailyInPrev .18s ease-out}\
@keyframes dailyInNext{from{opacity:.35;transform:translateX(22px)}to{opacity:1;transform:none}}@keyframes dailyInPrev{from{opacity:.35;transform:translateX(-22px)}to{opacity:1;transform:none}}\
.daily-schedule-card{padding:13px 12px 12px;overflow:hidden}\
.daily-schedule-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px}\
.daily-schedule-title{font-size:16px;font-weight:850;color:#252b31}\
.daily-schedule-date{font-size:16px;font-weight:850;color:#252b31}\
.daily-schedule-range{border:0;border-radius:10px;background:#f0f3f5;color:#69747d;padding:7px 9px;font-size:12px;font-weight:750;font-variant-numeric:tabular-nums}\
.daily-schedule-empty{padding:20px 10px;text-align:center;color:#87919a;font-size:13px;line-height:1.55}\
.daily-timeline-scroll{position:relative;overflow:hidden;border-radius:16px;background:#fbfcfc;border:1px solid #edf0f2;transition:.18s ease}\
.daily-timeline-scroll.drop-active{border-color:#27ae8b;background:#eaf7f3;box-shadow:0 0 0 4px rgba(39,174,139,.14)}\
.daily-timeline-scroll.add-confirmed{border-color:#27ae8b;background:#e1f6ef;box-shadow:0 0 0 4px rgba(39,174,139,.14)}\
.daily-timeline{position:relative;min-height:0}\
.daily-hour{position:absolute;left:0;right:0;height:1px;background:#e1e6e9}\
.daily-hour.half{background:#f0f2f4}\
.daily-hour-label{position:absolute;left:7px;top:-8px;width:39px;color:#8a949d;font-size:10px;text-align:right;font-variant-numeric:tabular-nums}\
.daily-events{position:absolute;left:53px;right:7px;top:0;bottom:0}\
.daily-event{position:absolute;min-height:22px;border:0;border-left:4px solid var(--event-line);border-radius:9px;background:var(--event-bg);color:var(--event-text);padding:5px 38px 4px 7px;text-align:left;overflow:hidden;box-shadow:0 1px 3px rgba(29,39,48,.08);touch-action:none;cursor:grab}\
.daily-event:active{cursor:grabbing}\
.daily-event.completed{opacity:.54}\
.daily-event-title{display:block;font-size:11px;font-weight:800;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\
.daily-event-time{display:block;margin-top:2px;font-size:9px;font-weight:700;opacity:.78;font-variant-numeric:tabular-nums}\
.daily-event-status{position:absolute;z-index:4;right:5px;top:5px;display:flex;align-items:center;gap:3px}\
.daily-event-repeat{display:grid;place-items:center;width:16px;height:16px;border-radius:999px;background:rgba(255,255,255,.62);font-size:10px;font-weight:900}\
.daily-event-check{display:grid;place-items:center;width:20px;height:20px;border:1.5px solid var(--event-line);border-radius:6px;background:rgba(255,255,255,.86);color:var(--event-text);padding:0;font-size:13px;font-weight:900;cursor:pointer}\
.daily-event-check.checked{background:var(--event-line);color:#fff}.daily-event-check:disabled{cursor:default;opacity:.7}\
.daily-event-handle{position:absolute;left:7px;right:7px;height:9px;z-index:2}\
.daily-event-handle.resize-top{top:-2px;cursor:ns-resize;background:transparent}\
.daily-event-handle.resize-bottom{bottom:-2px;cursor:ns-resize;background:transparent}\
.daily-event.moving{z-index:20;outline:2px solid var(--event-line);filter:saturate(1.16) brightness(.98);transform:scale(1.015);box-shadow:0 8px 20px rgba(29,39,48,.22)}\
.daily-now{position:absolute;left:45px;right:0;height:2px;background:#ef5a5a;z-index:25;pointer-events:none}\
.daily-now::before{content:"";position:absolute;left:-4px;top:-3px;width:8px;height:8px;border-radius:50%;background:#ef5a5a}\
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
.schedule-time-panel .item-time-input{-moz-appearance:textfield}.schedule-time-panel .item-time-input::-webkit-inner-spin-button,.schedule-time-panel .item-time-input::-webkit-outer-spin-button{-webkit-appearance:none;margin:0}\
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
  function timeText(mins){mins=clamp(Math.round(+mins||0),0,DAY_END);return String(Math.floor(mins/60)).padStart(2,'0')+':'+String(mins%60).padStart(2,'0')}
  function parseTime(value){var m=String(value||'').trim().match(/^(\d{1,2}):?(\d{2})$/);if(!m)return null;var h=+m[1],n=+m[2];if(h>DAY_END/60||n>59||(h===DAY_END/60&&n!==0))return null;return h*60+n}
  function shiftDay(key,amount){var p=String(key||'').split('-'),d=new Date(+p[0],+p[1]-1,+p[2],12);d.setDate(d.getDate()+amount);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
  function selectedDay(){var today=dayKey(Date.now());if(anchorToday!==today){anchorToday=today;selectedDayOffset=0}return shiftDay(today,selectedDayOffset)}
  function dayLabel(offset){return offset<0?'昨日':offset>0?'明日':'今日'}
  function formatDate(key){var p=String(key||selectedDay()).split('-'),d=new Date(+p[0],+p[1]-1,+p[2]),week=['日','月','火','水','木','金','土'];return (d.getMonth()+1)+'月'+d.getDate()+'日（'+week[d.getDay()]+'）'}
  function taskById(id){return (state.tasks||[]).find(function(x){return x.id===id})}
  function cleanEntry(x,index){
    x=x&&typeof x==='object'?x:{};var start=x.start==null?null:clamp(snap(+x.start||0),0,DAY_END-SNAP),end=x.end==null?null:clamp(snap(+x.end||0),SNAP,DAY_END);
    if(start!=null&&end!=null&&end<=start)end=Math.min(DAY_END,start+DEFAULT_DURATION);
    return {id:String(x.id||uid2()),taskId:String(x.taskId||''),title:String(x.title||''),color:Math.abs(Math.floor(+x.color||0))%COLORS.length,order:Math.max(0,Math.floor(+x.order||index||0)),start:start,end:end,completedAt:Math.max(0,+x.completedAt||0)};
  }
  function cleanDay(source,key){
    source=source&&typeof source==='object'?source:{};var viewStart=clamp(snap(source.viewStart==null?DEFAULT_VIEW_START:+source.viewStart),0,DAY_END-SNAP),viewEnd=clamp(snap(source.viewEnd==null?DEFAULT_VIEW_END:+source.viewEnd),SNAP,DAY_END);
    if(viewEnd<=viewStart)viewEnd=Math.min(DAY_END,viewStart+60);
    return {day:key,nextOrder:Math.max(0,Math.floor(+source.nextOrder||0)),viewStart:viewStart,viewEnd:viewEnd,entries:Array.isArray(source.entries)?source.entries.map(cleanEntry).filter(function(x){return x.taskId}):[]};
  }
  function cleanSchedule(source){
    source=source&&typeof source==='object'?source:{};var today=dayKey(Date.now()),allowed=[shiftDay(today,-1),today,shiftDay(today,1)],days={};
    if(source.days&&typeof source.days==='object')allowed.forEach(function(key){if(source.days[key])days[key]=cleanDay(source.days[key],key)});
    else if(Array.isArray(source.entries)){var legacyKey=String(source.day||today);if(allowed.indexOf(legacyKey)>=0)days[legacyKey]=cleanDay(source,legacyKey)}
    allowed.forEach(function(key){if(!days[key])days[key]=cleanDay({},key)});return {version:3,days:days};
  }
  function ensureData(saveReset){
    var old=state.taskSchedule,clean=cleanSchedule(old);state.taskSchedule=clean;var data=clean.days[selectedDay()]||cleanDay({},selectedDay());clean.days[data.day]=data;
    var valid={};(state.tasks||[]).forEach(function(x){valid[x.id]=true});data.entries.forEach(function(entry){var task=taskById(entry.taskId);if(task)entry.title=task.title});var before=data.entries.length;if(selectedDayOffset>=0)data.entries=data.entries.filter(function(x){return valid[x.taskId]});
    if(saveReset&&(!old||!old.days||before!==data.entries.length)&&typeof save==='function')save();return data;
  }
  function entryByTask(id){return ensureData(false).entries.find(function(x){return x.taskId===id})}
  function entryById(id){return ensureData(false).entries.find(function(x){return x.id===id})}
  function taskForEntry(entry){return taskById(entry&&entry.taskId)||{id:entry&&entry.taskId||'',title:entry&&entry.title||'削除済みのタスク',completedAt:0,historical:true}}
  function palette(entry){return COLORS[(entry&&entry.color)||0]}
  function applyPalette(el,entry){var c=palette(entry);el.style.setProperty('--event-bg',c.bg);el.style.setProperty('--event-line',c.line);el.style.setProperty('--event-text',c.text)}
  function saveAndRender(){if(typeof save==='function')save();renderSchedule()}
  function refreshTaskLists(){var api=window.__stretchTimerTasksV106;if(api&&api.renderLists)api.renderLists()}
  function syncDailyNext(entry){var task=taskForEntry(entry);if(!task.repeatDaily||selectedDayOffset>=1)return;var schedule=state.taskSchedule,from=ensureData(false),nextKey=shiftDay(from.day,1),next=schedule.days[nextKey];if(!next){next=cleanDay({},nextKey);schedule.days[nextKey]=next}var copy=next.entries.find(function(x){return x.taskId===entry.taskId});if(!copy){var order=next.nextOrder++;copy={id:uid2(),taskId:entry.taskId,title:task.title,color:entry.color,order:order,start:entry.start,end:entry.end,completedAt:0};next.entries.push(copy)}else{copy.start=entry.start;copy.end=entry.end;copy.title=task.title}}
  function assignMissingTimes(entries){var changed=false,cursor=entries.filter(function(x){return x.start!=null&&x.end!=null}).reduce(function(max,x){return Math.max(max,x.end)},DEFAULT_START);entries.slice().sort(function(a,b){return a.order-b.order}).forEach(function(entry){if(entry.start!=null&&entry.end!=null)return;var start=clamp(snap(cursor),0,DAY_END-DEFAULT_DURATION);entry.start=start;entry.end=start+DEFAULT_DURATION;cursor=entry.end;changed=true});return changed}
  function logSchedule(status,details){if(!window.__stretchDiagnostics||!window.__stretchDiagnostics.log)return;details=details||{};details.status=status;window.__stretchDiagnostics.log('task-schedule',details)}
  function confirmSchedule(message){var timeline=document.getElementById('dailyTimelineScroll');if(timeline){timeline.classList.remove('add-confirmed');void timeline.offsetWidth;timeline.classList.add('add-confirmed');setTimeout(function(){timeline.classList.remove('add-confirmed')},900)}var old=document.getElementById('scheduleToast');if(old)old.remove();var toast=document.createElement('div');toast.id='scheduleToast';toast.textContent=message;toast.style.cssText='position:fixed;left:50%;bottom:88px;transform:translateX(-50%);z-index:10030;background:#187e66;color:#fff;padding:9px 13px;border-radius:13px;font-size:13px;font-weight:750;box-shadow:0 5px 18px rgba(20,70,58,.24);white-space:nowrap';document.body.appendChild(toast);setTimeout(function(){toast.remove()},1500)}
  function addTask(id,openEditorAfter,requestedStart){
    var task=taskById(id);if(!task||task.completedAt){logSchedule('add-rejected',{taskId:id,reason:!task?'missing-task':'completed'});return}var data=ensureData(true),before=data.entries.length,existing=data.entries.find(function(x){return x.taskId===id});logSchedule('add-start',{taskId:id,before:before,existing:!!existing});
    var dropped=requestedStart!=null,start=dropped?clamp(snap(requestedStart),0,DAY_END-DEFAULT_DURATION):null;
    if(!existing){var order=data.nextOrder++;existing={id:uid2(),taskId:id,title:task.title,color:order%COLORS.length,order:order,start:start,end:start==null?null:start+DEFAULT_DURATION,completedAt:0};data.entries.push(existing);assignMissingTimes(data.entries);syncDailyNext(existing);saveAndRender();refreshTaskLists();logSchedule('add-saved',{taskId:id,entryId:existing.id,day:data.day,before:before,after:ensureData(false).entries.length,nextOrder:data.nextOrder,start:existing.start});confirmSchedule(dayLabel(selectedDayOffset)+'の予定に追加しました')}
    else{if(dropped){existing.start=start;existing.end=start+DEFAULT_DURATION}if(assignMissingTimes(data.entries)&&typeof save==='function')save();syncDailyNext(existing);saveAndRender();refreshTaskLists();logSchedule(dropped?'drop-time-moved':'add-existing',{taskId:id,entryId:existing.id,day:data.day,count:data.entries.length,start:existing.start});confirmSchedule(dropped?'予定時間を移動しました':'すでに'+dayLabel(selectedDayOffset)+'の予定に入っています')}
    if(openEditorAfter)openEditor(existing.id);
  }
  function removeEntry(id){var data=ensureData(false),before=data.entries.length,entry=data.entries.find(function(x){return x.id===id});data.entries=data.entries.filter(function(x){return x.id!==id});closeEditor();saveAndRender();refreshTaskLists();logSchedule('remove-saved',{entryId:id,taskId:entry&&entry.taskId||'',before:before,after:data.entries.length})}
  function toggleEntryComplete(entry){if(selectedDayOffset!==0)return;entry.completedAt=entry.completedAt?0:Date.now();if(typeof save==='function')save();renderSchedule();logSchedule(entry.completedAt?'schedule-checked':'schedule-unchecked',{entryId:entry.id,taskId:entry.taskId,day:selectedDay()})}
  function openEntryTask(entry){var api=window.__stretchTimerTasksV106,task=taskById(entry&&entry.taskId);if(task&&api&&api.openDetail)api.openDetail(task.id)}
  function scheduleRange(entries,data){data=data||ensureData(false);var start=data.viewStart,end=data.viewEnd;entries.forEach(function(entry){if(entry.start!=null)start=Math.min(start,entry.start);if(entry.end!=null)end=Math.max(end,entry.end)});return {start:clamp(Math.floor(start/30)*30,0,DAY_END-SNAP),end:clamp(Math.ceil(end/30)*30,30,DAY_END)}}
  function eventLayout(entries){
    var sorted=entries.slice().sort(function(a,b){return a.start-b.start||a.end-b.end}),groups=[],group=[];var groupEnd=-1;
    sorted.forEach(function(e){if(group.length&&e.start>=groupEnd){groups.push(group);group=[];groupEnd=-1}group.push(e);groupEnd=Math.max(groupEnd,e.end)});if(group.length)groups.push(group);
    var out={};groups.forEach(function(items){var active=[],maxCols=1;items.forEach(function(e){active=active.filter(function(a){return a.end>e.start});var used={};active.forEach(function(a){used[a.col]=true});var col=0;while(used[col])col++;active.push({end:e.end,col:col});maxCols=Math.max(maxCols,col+1);out[e.id]={col:col,cols:1}});items.forEach(function(e){out[e.id].cols=maxCols})});return out;
  }
  function ensureUi(){
    var page=document.querySelector('#tasks .task-page');if(!page)return null;var root=document.getElementById('dailySchedule');
    if(!root){root=document.createElement('section');root.id='dailySchedule';root.className='daily-schedule';root.innerHTML='<div class="daily-day-tabs"><button class="daily-day-tab" type="button" data-day-offset="-1">昨日</button><button class="daily-day-tab" type="button" data-day-offset="0">今日</button><button class="daily-day-tab" type="button" data-day-offset="1">明日</button></div><div class="card daily-schedule-card"><div class="daily-schedule-head"><div id="dailyScheduleDate" class="daily-schedule-date"></div><button id="dailyScheduleRange" class="daily-schedule-range" type="button"></button></div><div id="dailyTimelineScroll" class="daily-timeline-scroll"><div id="dailyTimeline" class="daily-timeline"><div id="dailyEvents" class="daily-events"></div><div id="dailyNow" class="daily-now" hidden></div></div></div><div id="dailyTimelineEmpty" class="daily-schedule-empty">全タスクをカレンダーへ長押しして追加できます</div></div>';page.insertBefore(root,page.firstChild);root.querySelector('#dailyScheduleRange').onclick=openRangeEditor;root.querySelectorAll('[data-day-offset]').forEach(function(button){button.onclick=function(){switchDay(+button.dataset.dayOffset)}});wireDaySwipe(root)}
    return root;
  }
  function switchDay(offset){offset=clamp(Math.round(offset),-1,1);if(offset===selectedDayOffset)return;var direction=offset>selectedDayOffset?'next':'prev';selectedDayOffset=offset;closeEditor();renderSchedule();var root=document.getElementById('dailySchedule');if(root){root.classList.remove('day-enter-next','day-enter-prev');void root.offsetWidth;root.classList.add(direction==='next'?'day-enter-next':'day-enter-prev')}}
  function wireDaySwipe(root){var startX=0,startY=0,tracking=false;root.addEventListener('pointerdown',function(e){if(e.pointerType==='mouse'&&e.button!==0)return;if(e.target.closest('input,textarea,select,.daily-event,button'))return;startX=e.clientX;startY=e.clientY;tracking=true});root.addEventListener('pointerup',function(e){if(!tracking)return;tracking=false;var dx=e.clientX-startX,dy=e.clientY-startY;if(Math.abs(dx)<55||Math.abs(dx)<Math.abs(dy)*1.25)return;if(dx<0&&selectedDayOffset<1)switchDay(selectedDayOffset+1);else if(dx>0&&selectedDayOffset>-1)switchDay(selectedDayOffset-1)});root.addEventListener('pointercancel',function(){tracking=false})}
  function renderSchedule(){
    var root=ensureUi();if(!root)return;var data=ensureData(true),assigned=assignMissingTimes(data.entries);if(assigned&&typeof save==='function')save();var entries=data.entries.slice().sort(function(a,b){return a.order-b.order}),scheduled=entries.filter(function(x){return x.start!=null&&x.end!=null}),range=scheduleRange(scheduled,data),height=(range.end-range.start)/60*HOUR_PX;
    document.getElementById('dailyScheduleDate').textContent=dayLabel(selectedDayOffset)+'：'+formatDate(data.day);root.querySelectorAll('[data-day-offset]').forEach(function(button){button.classList.toggle('active',+button.dataset.dayOffset===selectedDayOffset)});document.getElementById('dailyScheduleRange').textContent=Math.floor(data.viewStart/60)+'時〜'+Math.ceil(data.viewEnd/60)+'時';var timeline=document.getElementById('dailyTimeline'),events=document.getElementById('dailyEvents'),empty=document.getElementById('dailyTimelineEmpty');timeline.style.height=height+'px';timeline.dataset.rangeStart=range.start;events.innerHTML='';
    timeline.querySelectorAll('.daily-hour').forEach(function(x){x.remove()});for(var minute=range.start;minute<=range.end;minute+=30){var line=document.createElement('div');line.className='daily-hour'+(minute%60?' half':'');line.style.top=((minute-range.start)/60*HOUR_PX)+'px';if(minute%60===0&&minute<range.end){var label=document.createElement('span');label.className='daily-hour-label';label.textContent=timeText(minute);line.appendChild(label)}timeline.insertBefore(line,events)}
    var layout=eventLayout(scheduled);scheduled.forEach(function(entry){var task=taskForEntry(entry),done=!!entry.completedAt;var pos=layout[entry.id]||{col:0,cols:1},event=document.createElement('div');event.className='daily-event'+(done?' completed':'');event.setAttribute('role','button');event.tabIndex=0;event.dataset.entryId=entry.id;event.style.top=((entry.start-range.start)/60*HOUR_PX)+'px';event.style.height=Math.max(22,(entry.end-entry.start)/60*HOUR_PX-2)+'px';event.style.left='calc('+(pos.col/pos.cols*100)+'% + 2px)';event.style.width='calc('+(100/pos.cols)+'% - 4px)';applyPalette(event,entry);event.innerHTML='<span class="daily-event-handle resize-top" data-resize="top"></span><span class="daily-event-title"></span><span class="daily-event-time"></span><span class="daily-event-status"></span><span class="daily-event-handle resize-bottom" data-resize="bottom"></span>';event.querySelector('.daily-event-title').textContent=task.title;event.querySelector('.daily-event-time').textContent=timeText(entry.start)+'〜'+timeText(entry.end);var status=event.querySelector('.daily-event-status');if(task.repeatDaily){var repeat=document.createElement('span');repeat.className='daily-event-repeat';repeat.textContent='↻';repeat.title='毎日タスク';status.appendChild(repeat)}var check=document.createElement('button');check.type='button';check.className='daily-event-check'+(done?' checked':'');check.textContent=done?'✓':'';check.disabled=selectedDayOffset!==0;check.setAttribute('aria-label',done?'今日の完了を取り消す':'今日のタスクを完了');check.onclick=function(e){e.preventDefault();e.stopPropagation();toggleEntryComplete(entry)};status.appendChild(check);event.onclick=function(e){if(e.target.closest('.daily-event-check'))return;if(event.dataset.moved==='1'){event.dataset.moved='';return}openEntryTask(entry)};event.onkeydown=function(e){if((e.key==='Enter'||e.key===' ')&&!e.target.closest('.daily-event-check')){e.preventDefault();openEntryTask(entry)}};wireEvent(event,entry,range);events.appendChild(event)});
    empty.textContent=scheduled.length?dayLabel(selectedDayOffset)+'の予定をタップして開始・終了時間を調整できます':'全タスクをカレンダーへ長押しして追加できます';empty.style.display=scheduled.length?'none':'block';document.getElementById('dailyTimelineScroll').style.display='block';renderNow(range);decorateRows(entries);
  }
  function buildClockFields(container,minutes,maxHour){var builder=window.StretchUI&&window.StretchUI.buildTimeNumberInput;if(!builder)return null;var hour=Math.floor(minutes/60),h=builder(hour,maxHour,'時'),m=builder(minutes%60,59,'分');container.append(h.element,m.element);return {first:h.input,value:function(){var hv=h.value(),mv=m.value();return {minutes:hv*60+mv,invalidEnd:hv===maxHour&&mv!==0}}}}
  function keyboardFirstBackdrop(overlay){var dismissed=false;overlay.addEventListener('pointerdown',function(e){if(e.target!==overlay)return;var active=document.activeElement;if(active&&overlay.contains(active)&&/^(INPUT|TEXTAREA|SELECT)$/.test(active.tagName)){dismissed=true;active.blur();e.preventDefault()}});return function(){if(!dismissed)return false;dismissed=false;return true}}
  function openRangeEditor(){var data=ensureData(false);if(!window.StretchUI||!window.StretchUI.buildTimeNumberInput)return;var overlay=document.createElement('div');overlay.id='scheduleRangeOverlay';overlay.className='schedule-time-overlay';overlay.innerHTML='<div class="schedule-time-panel schedule-range-panel"><div class="schedule-time-title">表示時間</div><div class="schedule-time-sub"></div><div class="schedule-clock-groups"><div><div class="schedule-time-field">開始</div><div class="task-time-fields" data-range="start"></div></div><div><div class="schedule-time-field">終了</div><div class="task-time-fields" data-range="end"></div></div></div><div id="scheduleRangeError" class="schedule-time-error"></div><div class="schedule-time-actions"><button type="button" class="btn sub" data-act="cancel">キャンセル</button><button type="button" class="btn" data-act="save">設定</button></div></div>';overlay.querySelector('.schedule-time-sub').textContent=dayLabel(selectedDayOffset)+'のスケジュールに表示する基本範囲（翌6時まで）';var startFields=buildClockFields(overlay.querySelector('[data-range="start"]'),data.viewStart,29),endFields=buildClockFields(overlay.querySelector('[data-range="end"]'),data.viewEnd,30),keepOpen=keyboardFirstBackdrop(overlay);overlay.onclick=function(e){if(e.target===overlay){if(keepOpen())return;overlay.remove();return}if(e.target.closest('[data-act="cancel"]')){overlay.remove();return}var saveButton=e.target.closest('[data-act="save"]');if(!saveButton)return;var startValue=startFields.value(),endValue=endFields.value(),start=startValue.minutes,end=endValue.minutes,error=overlay.querySelector('#scheduleRangeError');if(endValue.invalidEnd){error.textContent='30時を指定する場合、分は00にしてください';return}if(end<=start){error.textContent='終了時刻は開始時刻より後にしてください';return}data.viewStart=clamp(snap(start),0,DAY_END-SNAP);data.viewEnd=clamp(snap(end),data.viewStart+SNAP,DAY_END);if(typeof save==='function')save();overlay.remove();renderSchedule()};document.body.appendChild(overlay);setTimeout(function(){try{startFields.first.focus();startFields.first.select()}catch(e){}},0)}
  function decorateRows(entries){var map={};entries.forEach(function(x){map[x.taskId]=x});document.querySelectorAll('#taskOpenList .task-row').forEach(function(row){var entry=map[row.dataset.id];row.classList.toggle('in-daily-schedule',!!entry);if(entry)row.style.setProperty('--schedule-line',palette(entry).line);else row.style.removeProperty('--schedule-line')})}
  function renderNow(range){var now=document.getElementById('dailyNow');if(!now)return;if(selectedDayOffset!==0){now.hidden=true;return}var d=new Date(),mins=d.getHours()*60+d.getMinutes();if(mins<range.start||mins>range.end){now.hidden=true;return}now.hidden=false;now.style.top=((mins-range.start)/60*HOUR_PX)+'px'}
  function pointInTimeline(x,y){var target=document.getElementById('dailyTimelineScroll');if(!target)return false;var r=target.getBoundingClientRect();return x>=r.left-8&&x<=r.right+8&&y>=r.top-8&&y<=r.bottom+8}
  function minuteAtTimelinePoint(y){var timeline=document.getElementById('dailyTimeline');if(!timeline)return DEFAULT_START;var r=timeline.getBoundingClientRect(),rangeStart=+timeline.dataset.rangeStart||DEFAULT_VIEW_START;return clamp(snap(rangeStart+(y-r.top)/HOUR_PX*60),0,DAY_END-DEFAULT_DURATION)}
  function reorderTaskDirect(id,targetId,before){if(!window.StretchUI||!StretchUI.reorderCollection||!StretchUI.reorderCollection(state.tasks||[],id,targetId,before))return;if(typeof save==='function')save();var nav=document.querySelector('#modeNav [data-mode="tasks"]');if(nav)nav.click()}
  function bindUnifiedTaskDrag(){
    if(window.StretchUI&&StretchUI.registerReorder){
      StretchUI.registerReorder({key:'task-cards',selector:'#taskOpenList .task-row:not(.completed)',ignore:'button,input,textarea,select,a',label:function(card){var title=card.querySelector('.task-title-text');return title?title.textContent:'タスク'},inDropZone:function(x,y){return pointInTimeline(x,y)},setDropActive:function(active){var timeline=document.getElementById('dailyTimelineScroll');if(timeline)timeline.classList.toggle('drop-active',active)},onDropZone:function(move){var start=minuteAtTimelinePoint(move.y);logSchedule('unified-drop-in-calendar',{taskId:move.id,start:start});addTask(move.id,false,start)},onReorder:function(move){reorderTaskDirect(move.id,move.targetId,move.before)}});
    }
  }
  function wireEvent(el,entry,range){el.addEventListener('pointerdown',function(e){if(e.target.closest('.daily-event-check')||(e.button!=null&&e.button!==0))return;e.preventDefault();var handle=e.target.closest('[data-resize]'),mode=handle&&handle.dataset.resize||'move',pointerId=e.pointerId,startX=e.clientX,startY=e.clientY,initialStart=entry.start,initialEnd=entry.end,moved=false,active=false,finished=false,timer=setTimeout(activate,420);el.setPointerCapture&&el.setPointerCapture(pointerId);
      function activate(){timer=null;if(finished)return;active=true;el.classList.add('moving');if(navigator.vibrate)navigator.vibrate(25)}
      function move(ev){if(ev.pointerId!==pointerId)return;if(!active){if(Math.hypot(ev.clientX-startX,ev.clientY-startY)>16){clearTimeout(timer);timer=null}return}var delta=snap((ev.clientY-startY)/HOUR_PX*60),nextStart=initialStart,nextEnd=initialEnd;if(Math.abs(ev.clientY-startY)>4)moved=true;if(mode==='top')nextStart=clamp(initialStart+delta,0,initialEnd-SNAP);else if(mode==='bottom')nextEnd=clamp(initialEnd+delta,initialStart+SNAP,DAY_END);else{var duration=initialEnd-initialStart;nextStart=clamp(initialStart+delta,0,DAY_END-duration);nextEnd=nextStart+duration}entry.start=nextStart;entry.end=nextEnd;el.style.top=((entry.start-range.start)/60*HOUR_PX)+'px';el.style.height=Math.max(22,(entry.end-entry.start)/60*HOUR_PX-2)+'px';el.querySelector('.daily-event-time').textContent=timeText(entry.start)+'〜'+timeText(entry.end);if(ev.cancelable)ev.preventDefault()}
      function finish(ev){if(finished||(ev&&ev.pointerId!=null&&ev.pointerId!==pointerId))return;var wasActive=active;if(wasActive&&ev&&ev.type==='pointerup')move(ev);finished=true;clearTimeout(timer);timer=null;document.removeEventListener('pointermove',move,true);document.removeEventListener('pointerup',finish,true);document.removeEventListener('pointercancel',finish,true);el.removeEventListener('lostpointercapture',finish);el.classList.remove('moving');if(wasActive)el.dataset.moved='1';if(moved){syncDailyNext(entry);logSchedule('time-drag-saved',{entryId:entry.id,day:selectedDay(),mode:mode,start:entry.start,end:entry.end});saveAndRender()}}
      document.addEventListener('pointermove',move,{passive:false,capture:true});document.addEventListener('pointerup',finish,true);document.addEventListener('pointercancel',finish,true);el.addEventListener('lostpointercapture',finish)
    })}
  function defaultTimes(entry){if(entry&&entry.start!=null)return [entry.start,entry.end];var entries=ensureData(false).entries.filter(function(x){return x.start!=null&&x.end!=null}),start=entries.length?Math.max.apply(Math,entries.map(function(x){return x.end})):DEFAULT_START;start=clamp(snap(start),0,DAY_END-DEFAULT_DURATION);return [start,start+DEFAULT_DURATION]}
  function openEditor(id){var entry=entryById(id),task=entry&&taskForEntry(entry);if(!entry||!task||!window.StretchUI||!window.StretchUI.buildTimeNumberInput)return;closeEditor();editorId=id;var times=defaultTimes(entry),overlay=document.createElement('div');overlay.id='scheduleTimeOverlay';overlay.className='schedule-time-overlay';overlay.innerHTML='<div class="schedule-time-panel"><div class="schedule-time-title">予定時間</div><div class="schedule-time-sub"></div><div class="schedule-clock-groups"><div><div class="schedule-time-field">開始</div><div class="task-time-fields" data-time="start"></div></div><div><div class="schedule-time-field">終了</div><div class="task-time-fields" data-time="end"></div></div></div><div id="scheduleTimeError" class="schedule-time-error"></div><div class="schedule-time-actions"><button type="button" class="btn sub" data-act="cancel">キャンセル</button><button type="button" class="btn" data-act="save">設定</button></div><button type="button" class="schedule-remove" data-act="remove"></button></div>';overlay.querySelector('.schedule-time-sub').textContent=task.title+'（翌6時まで）';overlay.querySelector('.schedule-remove').textContent=dayLabel(selectedDayOffset)+'の予定から外す';var startFields=buildClockFields(overlay.querySelector('[data-time="start"]'),times[0],29),endFields=buildClockFields(overlay.querySelector('[data-time="end"]'),times[1],30),keepOpen=keyboardFirstBackdrop(overlay);overlay.onclick=function(e){if(e.target===overlay){if(keepOpen())return;closeEditor();return}var b=e.target.closest('[data-act]');if(!b)return;var act=b.dataset.act;if(act==='cancel')closeEditor();else if(act==='remove')removeEntry(id);else if(act==='save')saveEditor(entry,startFields,endFields)};document.body.appendChild(overlay);setTimeout(function(){try{startFields.first.focus();startFields.first.select()}catch(e){}},30)}
  function saveEditor(entry,startFields,endFields){var startValue=startFields.value(),endValue=endFields.value(),start=startValue.minutes,end=endValue.minutes,error=document.getElementById('scheduleTimeError');if(endValue.invalidEnd){error.textContent='30時を指定する場合、分は00にしてください';return}start=snap(start);end=snap(end);if(end<=start){error.textContent='終了時刻は開始時刻より後にしてください';return}entry.start=clamp(start,0,DAY_END-SNAP);entry.end=clamp(end,entry.start+SNAP,DAY_END);syncDailyNext(entry);closeEditor();saveAndRender()}
  function closeEditor(){var overlay=document.getElementById('scheduleTimeOverlay');if(overlay)overlay.remove();editorId=''}
  function enhanceActionMenu(){setTimeout(function(){var pop=document.getElementById('taskActionPop'),taskId=actionTaskId;if(!pop||!taskId||pop.querySelector('[data-act="schedule"]'))return;var button=document.createElement('button');button.type='button';button.dataset.act='schedule';button.textContent=entryByTask(taskId)?'予定時間を設定':dayLabel(selectedDayOffset)+'の予定に追加';button.onclick=function(e){e.stopPropagation();pop.remove();addTask(taskId,true)};pop.insertBefore(button,pop.firstChild)},0)}

  ensureData(false);ensureUi();
  if(window.StretchUI&&StretchUI.registerScreenHook)StretchUI.registerScreenHook({key:'daily-schedule',after:function(id){if(id==='tasks')setTimeout(renderSchedule,0)}});
  if(window.StretchUI&&StretchUI.registerDataProvider)StretchUI.registerDataProvider({key:'task-schedule',write:function(payload){payload.taskSchedule=cleanSchedule(state.taskSchedule)},read:function(remote){state.taskSchedule=cleanSchedule(remote.taskSchedule);if(typeof save==='function')save(false);if(typeof currentScreen!=='undefined'&&currentScreen==='tasks')renderSchedule()}});
  bindUnifiedTaskDrag();
  document.addEventListener('click',function(e){var more=e.target.closest('#taskOpenList .task-more');if(more){var row=more.closest('.task-row');actionTaskId=row&&row.dataset.id||'';enhanceActionMenu()}},true);
  var openList=document.getElementById('taskOpenList'),doneList=document.getElementById('taskDoneList');if(window.MutationObserver&&openList){observer=new MutationObserver(function(){if(typeof currentScreen!=='undefined'&&currentScreen==='tasks')renderSchedule()});observer.observe(openList,{childList:true});if(doneList)observer.observe(doneList,{childList:true})}
  document.addEventListener('visibilitychange',function(){if(!document.hidden){ensureData(true);if(typeof currentScreen!=='undefined'&&currentScreen==='tasks')renderSchedule()}});
  clockTimer=setInterval(function(){if(typeof currentScreen!=='undefined'&&currentScreen==='tasks'){var before=anchorToday,data=ensureData(true);if(before&&before!==anchorToday)renderSchedule();else renderNow(scheduleRange(data.entries.filter(function(x){return x.start!=null}),data)) }},60000);
})();
