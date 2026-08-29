(function(){
  if(window.__tasksV106)return;
  window.__tasksV106=true;

  var addDaily=false;
  var addDueDay='';
  var addDueTime='';
  var settingsReturn='home';
  var rolloverTimer=null;
  var detailTaskId='';
  var detailDueDay='';
  var detailDueTime='';
  var detailDaily=false;
  var detailViewDate=new Date();
  var taskSwipeClickUntil=0;

  var style=document.createElement('style');
  style.setAttribute('data-tasks-v106','');
  style.textContent='\
body.mode-nav-visible .screen.active{padding-bottom:108px!important}\
body.mode-nav-visible #appToast{bottom:88px!important}\
#modeNav{position:fixed;left:50%;bottom:0;z-index:9000;width:min(760px,100%);transform:translateX(-50%);display:grid;grid-template-columns:1fr 1fr;padding:6px 14px;background:rgba(255,255,255,.96);border-top:1px solid #e5e9ec;box-shadow:0 -6px 20px rgba(29,38,46,.06);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px)}\
#modeNav[hidden]{display:none!important}\
.mode-nav-btn{min-height:44px;border:0;border-radius:14px;background:transparent;color:#7a838d;font-size:13px;font-weight:700;display:flex;align-items:center;justify-content:center;gap:7px;cursor:pointer}\
.mode-nav-btn.active{background:#eaf7f3;color:#168465}\
.mode-nav-icon{font-size:18px;line-height:1}\
body.paused-routine-away #modeNav{bottom:143px}\
body.mode-nav-visible.paused-routine-away .screen.active{padding-bottom:245px!important}\
body.mode-nav-visible.paused-routine-away #appToast{bottom:218px!important}\
.task-page{display:grid;gap:18px}\
.task-add-card{padding:12px}\
.task-add-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:9px}\
.task-add-input{width:100%;min-width:0;height:48px;border:0;border-radius:14px;background:#f2f4f6;padding:0 14px;color:#1b1f24;font-size:16px;outline:none}\
.task-add-input:focus{box-shadow:0 0 0 2px rgba(39,174,139,.28)}\
.task-add-btn{min-width:64px;min-height:48px;border-radius:14px;padding:8px 14px;font-weight:800}\
.task-add-options{display:flex;align-items:center;gap:7px;margin-top:9px}\
.task-daily-chip{min-height:30px;border:0;border-radius:999px;padding:5px 11px;background:#eef1f3;color:#69737d;font-size:12px;font-weight:700;cursor:pointer}\
.task-daily-chip.on{background:#ddf3ec;color:#168465}\
.task-due-wrap{position:relative;display:flex;align-items:center;gap:3px}\
.task-due-chip{min-height:30px;border:0;border-radius:999px;padding:5px 11px;background:#eef1f3;color:#69737d;font-size:12px;font-weight:700;cursor:pointer}\
.task-due-chip.on{background:#e8f0f8;color:#39729f}\
.task-time-chip{min-height:30px;border:0;border-radius:999px;padding:5px 11px;background:#edf1f3;color:#69737d;font-size:12px;font-weight:700;cursor:pointer}\
.task-time-chip.on{background:#e8f0f8;color:#39729f}\
.task-due-clear{width:27px;height:27px;border:0;border-radius:999px;background:transparent;color:#89939c;font-size:17px;line-height:1;cursor:pointer}\
.task-due-input{position:absolute;width:1px;height:1px;opacity:0;pointer-events:none}\
.task-time-overlay{position:fixed;inset:0;z-index:10050;display:grid;align-items:end;background:rgba(25,31,37,.34);padding:16px 12px max(16px,env(safe-area-inset-bottom))}\
.task-time-panel{width:min(430px,100%);margin:0 auto;padding:18px;border-radius:22px;background:#f7f8fa;box-shadow:0 18px 45px rgba(20,27,34,.2)}\
.task-time-title{font-size:16px;font-weight:800;color:#242a30;margin-bottom:14px}\
.task-time-fields{display:grid;grid-template-columns:1fr 1fr;gap:12px}\
.task-time-actions{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:16px}\
.task-time-actions button{min-height:45px}\
.task-section{display:grid;gap:9px}\
.task-section-head{display:flex;align-items:center;justify-content:space-between;color:#717b85;font-size:13px;font-weight:700;padding:0 3px}\
.task-list{display:grid;gap:8px}\
.task-row{position:relative;display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:10px;min-height:54px;padding:8px 9px 8px 12px;border-radius:16px;background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.04);touch-action:pan-y;overflow:hidden;-webkit-touch-callout:none}\
.task-row.task-dragging{opacity:.55}\
.task-row.task-drop-target{outline:2px solid #27ae8b}\
.task-check{width:25px;height:25px;border:2px solid #aeb7bf;border-radius:8px;background:#fff;color:#fff;padding:0;display:grid;place-items:center;font-size:16px;font-weight:900;cursor:pointer}\
.task-check.checked{border-color:#27ae8b;background:#27ae8b}\
.task-main{min-width:0;display:grid;gap:3px}\
.task-title-text{min-width:0;color:#20262c;font-size:14px;line-height:1.4;padding:3px 0;white-space:pre-wrap;overflow:hidden;overflow-wrap:anywhere;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:3;line-clamp:3}\
.task-title-editor{width:100%;min-width:0;max-height:68px;border:0;border-radius:8px;background:#f3f6f5;outline:none;color:#20262c;font-size:14px;line-height:1.4;padding:5px 7px;margin:-2px -7px;resize:none;overflow-y:auto}\
.task-row.completed .task-title-text{text-decoration:line-through;color:#929aa2}\
.task-meta{display:flex;align-items:center;flex-wrap:wrap;gap:6px;min-height:0}\
.task-tag{font-size:10px;line-height:1;border-radius:999px;padding:4px 6px;background:#edf1f3;color:#717b84}\
.task-tag.daily{background:#e7f6f1;color:#168465}\
.task-tag.due{background:#e8f0f8;color:#39729f}\
.task-tag.due.soon{background:#fde8ef;color:#b33f63}\
.task-tag.due.today{background:#fff0d8;color:#a15d00}\
.task-tag.due.overdue{background:#fde8e7;color:#b4453d}\
.task-more{width:34px;height:34px;border:0;border-radius:10px;background:transparent;color:#7f8992;font-size:22px;line-height:1;letter-spacing:1px;cursor:pointer}\
.task-action-pop{position:fixed;z-index:10020;display:grid;min-width:132px;padding:6px;border-radius:14px;background:#fff;box-shadow:0 10px 30px rgba(25,32,39,.2)}\
.task-action-pop button{min-height:40px;border:0;border-radius:9px;background:transparent;color:#31383f;text-align:left;padding:8px 11px;font-size:14px;font-weight:700}\
.task-action-pop button.danger{color:#bf4653}\
.task-row>*:not(.task-swipe-delete):not(.task-swipe-duplicate){transition:transform .18s ease}\
.task-row.swipe-open>*:not(.task-swipe-delete):not(.task-swipe-duplicate){transform:translateX(-76px)}\
.task-row.swipe-copy-open>*:not(.task-swipe-delete):not(.task-swipe-duplicate){transform:translateX(76px)}\
.task-swipe-delete,.task-swipe-duplicate{position:absolute;top:0;bottom:0;width:76px;border:0;color:#fff;font-weight:700;display:flex;align-items:center;justify-content:center;opacity:0;z-index:30;transition:transform .18s ease,opacity .08s ease}\
.task-swipe-delete{right:0;background:#d9535f;transform:translateX(100%)}\
.task-swipe-duplicate{left:0;background:#7f8a96;transform:translateX(-100%)}\
.task-row.swipe-open>.task-swipe-delete,.task-row.swipe-copy-open>.task-swipe-duplicate{transform:translateX(0);opacity:1}\
.task-detail-wrap{display:grid;gap:16px}\
.task-detail-edit{display:grid;gap:12px;padding:15px}\
.task-detail-name{width:100%;min-height:48px;border:0;border-radius:13px;background:#f2f4f6;padding:12px 13px;color:#20262c;font-size:16px;line-height:1.45;outline:none;resize:none;overflow:hidden}\
.task-detail-options{display:flex;align-items:center;flex-wrap:wrap;gap:7px}\
.task-detail-save{width:100%;min-height:46px}\
.task-calendar-card{background:#fff;border-radius:20px;padding:15px;box-shadow:0 1px 2px rgba(0,0,0,.04);touch-action:pan-y;overflow:hidden}\
.task-cal-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}\
.task-cal-title{font-size:17px;font-weight:800}\
.task-cal-nav{border:0;background:#f2f4f6;border-radius:11px;width:36px;height:34px;font-size:18px;color:#4e5863}\
.task-cal-week,.task-cal-days{display:grid;grid-template-columns:repeat(7,1fr);gap:5px}\
.task-cal-week{margin-bottom:5px;color:#8a929c;font-size:11px;text-align:center}\
.task-cal-day{aspect-ratio:1;border:0;border-radius:8px;background:#eef0f2;color:#737c86;font-size:13px;padding:0;display:grid;place-items:center;position:relative}\
.task-cal-day.blank{visibility:hidden}\
.task-cal-day.today{box-shadow:inset 0 0 0 2px #27ae8b;color:#14785f;font-weight:800}\
.task-cal-day.deadline{background:#ef7698;color:#fff;font-weight:800;box-shadow:none}\
.task-cal-day.today.deadline{box-shadow:inset 0 0 0 2px #168465}\
.task-cal-legend{display:flex;gap:14px;color:#6f7881;font-size:12px;padding:0 4px}\
.task-cal-key{display:inline-flex;align-items:center;gap:5px}.task-cal-key::before{content:"";width:9px;height:9px;border-radius:3px;box-shadow:inset 0 0 0 2px #27ae8b}.task-cal-key.deadline::before{background:#ef7698;box-shadow:none}\
.task-empty{padding:48px 14px;text-align:center;color:#8a929a;font-size:14px}\
.task-completed-wrap{margin-top:4px}\
.task-settings-card{display:grid;gap:12px}\
.task-settings-link{width:100%;min-height:48px;border:0;border-radius:14px;padding:11px 13px;background:#f1f3f5;color:#242a30;display:flex;align-items:center;justify-content:space-between;text-align:left;cursor:pointer}\
.task-settings-link span:last-child{color:#8b949c;font-size:13px}\
.task-cutoff-row{display:grid;grid-template-columns:1fr auto;align-items:center;gap:12px;min-height:48px}\
.task-cutoff-select{border:0;border-radius:12px;background:#f1f3f5;color:#242a30;padding:10px 12px;outline:none}\
.task-history-page,.daily-task-page{display:grid;gap:18px}\
.task-history-group{display:grid;gap:8px}\
.task-history-date{font-size:14px;font-weight:800;color:#626c75;padding:0 3px}\
.task-history-card{padding:6px 15px}\
.task-history-item{display:flex;align-items:center;gap:10px;min-height:43px;border-bottom:1px solid #eef1f3;color:#414950;font-size:15px}\
.task-history-item:last-child{border-bottom:0}\
.task-history-check{color:#27ae8b;font-weight:900}\
.daily-manage-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;align-items:center;padding:13px 14px;border-radius:16px;background:#fff}\
.daily-manage-title{min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\
.daily-disable{min-height:36px;border:0;border-radius:11px;background:#eef1f3;color:#646e78;padding:7px 11px;font-size:12px;font-weight:700;cursor:pointer}\
@media(min-width:780px){#modeNav{bottom:14px;border:1px solid #e4e8eb;border-radius:20px;box-shadow:0 9px 30px rgba(28,36,44,.12);padding-bottom:6px}body.paused-routine-away #modeNav{bottom:178px}body.mode-nav-visible.paused-routine-away .screen.active{padding-bottom:275px!important}}\
@media(min-width:780px){.task-time-overlay{align-items:center}.task-time-panel{border-radius:22px}}\
';
  document.head.appendChild(style);

  function clampHour(value){value=Math.floor(+value||0);return Math.max(0,Math.min(23,value))}
  function dayKey(time,hour){
    var d=new Date((+time||Date.now())-clampHour(hour)*3600000);
    return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  }
  function currentDay(){return dayKey(Date.now(),state.taskSettings&&state.taskSettings.cutoffHour)}
  function calendarDay(){return dayKey(Date.now(),0)}
  function validDay(value){return /^\d{4}-\d{2}-\d{2}$/.test(String(value||''))?String(value):''}
  function validTime(value){var match=String(value||'').match(/^(\d{2}):(\d{2})$/);return match&&+match[1]<24&&+match[2]<60?match[1]+':'+match[2]:''}
  function shortDay(value){var parts=validDay(value).split('-');return parts.length===3?(+parts[1])+'/'+(+parts[2]):''}
  function deadlineInfo(task){
    var day=validDay(task&&task.dueDay),time=validTime(task&&task.dueTime)||'23:59';if(!day)return null;
    var d=day.split('-'),t=time.split(':'),dueAt=new Date(+d[0],+d[1]-1,+d[2],+t[0],+t[1]).getTime(),remaining=dueAt-Date.now();
    if(remaining<=0)return {status:'overdue',text:''};
    var hours=Math.floor(remaining/3600000);if(hours<1)return {status:'soon',text:'あと1時間未満'};
    if(hours<24)return {status:'soon',text:'あと'+hours+'時間'};
    var days=Math.floor(hours/24),rest=hours%24;return {status:'',text:'あと'+days+'日'+(rest?rest+'時間':'')};
  }
  function cleanTask(x){
    x=x&&typeof x==='object'?x:{};
    return {id:x.id||uid(),title:String(x.title||'').trim()||'名称未設定',repeatDaily:!!x.repeatDaily,dueDay:validDay(x.dueDay),dueTime:validTime(x.dueTime),createdDay:String(x.createdDay||''),carriedFrom:String(x.carriedFrom||''),completedAt:Math.max(0,+x.completedAt||0),completedDay:String(x.completedDay||'')};
  }
  function cleanHistory(x){
    x=x&&typeof x==='object'?x:{};
    return {id:x.id||uid(),taskId:String(x.taskId||''),title:String(x.title||'').trim()||'名称未設定',completedAt:Math.max(0,+x.completedAt||0),day:String(x.day||''),repeatDaily:!!x.repeatDaily};
  }
  function taskDataFrom(source){
    source=source&&typeof source==='object'?source:{};
    var settings=source.taskSettings&&typeof source.taskSettings==='object'?source.taskSettings:{};
    var hour=clampHour(settings.cutoffHour),today=dayKey(Date.now(),hour);
    return {
      tasks:Array.isArray(source.tasks)?source.tasks.map(cleanTask):[],
      history:Array.isArray(source.taskHistory)?source.taskHistory.map(cleanHistory).filter(function(x){return x.completedAt&&x.day}):[],
      settings:{cutoffHour:hour,lastDay:String(settings.lastDay||today)}
    };
  }
  function installTaskData(target,source){
    var data=taskDataFrom(source);
    target.tasks=data.tasks;target.taskHistory=data.history;target.taskSettings=data.settings;
    return target;
  }
  function ensureTaskData(){
    var has=Array.isArray(state.tasks)&&Array.isArray(state.taskHistory)&&state.taskSettings;
    installTaskData(state,state);
    if(!has&&typeof save==='function')save(false);
  }
  function archiveCompleted(task,fallbackDay){
    var completedAt=Math.max(0,+task.completedAt||0),day=task.completedDay||dayKey(completedAt||Date.now(),state.taskSettings.cutoffHour)||fallbackDay;
    var duplicate=state.taskHistory.some(function(x){return x.taskId===task.id&&x.completedAt===completedAt});
    if(!duplicate)state.taskHistory.push({id:uid(),taskId:task.id,title:task.title,completedAt:completedAt||Date.now(),day:day,repeatDaily:!!task.repeatDaily});
  }
  function rolloverIfNeeded(){
    ensureTaskData();
    var today=currentDay(),previous=state.taskSettings.lastDay||today;
    if(previous===today)return false;
    var next=[];
    state.tasks.forEach(function(task){
      if(task.completedAt){
        archiveCompleted(task,previous);
        if(task.repeatDaily){task.completedAt=0;task.completedDay='';task.createdDay=today;task.carriedFrom='';if(task.dueDay)task.dueDay=calendarDay();next.push(task)}
      }else{
        if(!task.carriedFrom)task.carriedFrom=task.createdDay||previous;
        next.push(task);
      }
    });
    state.tasks=next;state.taskSettings.lastDay=today;
    if(typeof save==='function')save();
    return true;
  }
  function ensureScreens(){
    var app=document.querySelector('.app');if(!app)return;
    if(!document.getElementById('tasks')){
      var tasks=document.createElement('main');tasks.id='tasks';tasks.className='screen';
      tasks.innerHTML='<div class="task-page"><form id="taskQuickAdd" class="card task-add-card"><div class="task-add-row"><input id="taskTitleNew" class="task-add-input" maxlength="200" autocomplete="off" placeholder="やることを入力"><button class="btn task-add-btn" type="submit">追加</button></div><div class="task-add-options"><button id="taskDailyNew" class="task-daily-chip" type="button" aria-pressed="false">↻ 毎日</button><div class="task-due-wrap"><button id="taskDueButton" class="task-due-chip" type="button">期限なし</button><input id="taskDueNew" class="task-due-input" type="date"><button id="taskTimeButton" class="task-time-chip" type="button" hidden>時間なし</button><button id="taskDueClear" class="task-due-clear" type="button" aria-label="期限を外す" hidden>×</button></div></div></form><section class="task-section"><div class="task-section-head"><span>全タスク</span><span id="taskOpenCount"></span></div><div id="taskOpenList" class="task-list"></div></section><section id="taskCompletedWrap" class="task-section task-completed-wrap"><div class="task-section-head"><span>完了</span><span id="taskDoneCount"></span></div><div id="taskDoneList" class="task-list"></div></section></div>';
      app.insertBefore(tasks,document.getElementById('timer'));
    }
    if(!document.getElementById('taskHistory')){
      var historyScreen=document.createElement('main');historyScreen.id='taskHistory';historyScreen.className='screen';historyScreen.innerHTML='<div id="taskHistoryList" class="task-history-page"></div>';app.insertBefore(historyScreen,document.getElementById('timer'));
    }
    if(!document.getElementById('dailyTasks')){
      var daily=document.createElement('main');daily.id='dailyTasks';daily.className='screen';daily.innerHTML='<div id="dailyTaskList" class="daily-task-page"></div>';app.insertBefore(daily,document.getElementById('timer'));
    }
    if(!document.getElementById('taskDetail')){
      var detail=document.createElement('main');detail.id='taskDetail';detail.className='screen';detail.innerHTML='<div class="task-detail-wrap"><div class="card task-detail-edit"><textarea id="taskDetailName" class="task-detail-name" maxlength="200" rows="1" aria-label="タスク名"></textarea><div class="task-detail-options"><button id="taskDetailDaily" class="task-daily-chip" type="button">↻ 毎日</button><div class="task-due-wrap"><button id="taskDetailDue" class="task-due-chip" type="button">期限なし</button><input id="taskDetailDueInput" class="task-due-input" type="date"><button id="taskDetailTime" class="task-time-chip" type="button" hidden>時間なし</button><button id="taskDetailClear" class="task-due-clear" type="button" aria-label="期限を外す" hidden>×</button></div></div><button id="taskDetailSave" class="btn task-detail-save" type="button">保存</button></div><div class="task-calendar-card"><div class="task-cal-head"><button id="taskCalPrev" class="task-cal-nav" type="button">‹</button><div id="taskCalTitle" class="task-cal-title"></div><button id="taskCalNext" class="task-cal-nav" type="button">›</button></div><div class="task-cal-week"><div>日</div><div>月</div><div>火</div><div>水</div><div>木</div><div>金</div><div>土</div></div><div id="taskCalDays" class="task-cal-days"></div></div><div class="task-cal-legend"><span class="task-cal-key">今日</span><span class="task-cal-key deadline">締切日</span></div></div>';app.insertBefore(detail,document.getElementById('timer'));
      bindTaskDetail();
    }
    if(!document.getElementById('modeNav')){
      var nav=document.createElement('nav');nav.id='modeNav';nav.setAttribute('aria-label','機能の切り替え');
      nav.innerHTML='<button type="button" class="mode-nav-btn" data-mode="routine"><span class="mode-nav-icon">◷</span><span>ストレッチ</span></button><button type="button" class="mode-nav-btn" data-mode="tasks"><span class="mode-nav-icon">✓</span><span>タスク</span></button>';
      app.appendChild(nav);
      nav.querySelector('[data-mode="routine"]').onclick=function(){settingsReturn='home';renderHome()};
      nav.querySelector('[data-mode="tasks"]').onclick=renderTasks;
    }
    bindTaskForm();
  }
  function bindTaskForm(){
    var form=document.getElementById('taskQuickAdd');if(!form||form.dataset.bound)return;form.dataset.bound='1';
    form.onsubmit=function(e){e.preventDefault();var input=document.getElementById('taskTitleNew'),title=(input.value||'').trim();if(!title){input.focus();return}rolloverIfNeeded();state.tasks.unshift({id:uid(),title:title,repeatDaily:addDaily,dueDay:addDueDay,dueTime:addDueTime,createdDay:currentDay(),carriedFrom:'',completedAt:0,completedDay:''});input.value='';addDaily=false;addDueDay='';addDueTime='';updateAddOptions();save();renderTaskLists();input.focus()};
    document.getElementById('taskDailyNew').onclick=function(){addDaily=!addDaily;updateDailyChip()};
    var dueInput=document.getElementById('taskDueNew');
    document.getElementById('taskDueButton').onclick=function(){dueInput.min=calendarDay();try{if(dueInput.showPicker)dueInput.showPicker();else dueInput.click()}catch(e){dueInput.click()}};
    dueInput.onchange=function(){addDueDay=validDay(dueInput.value);if(!addDueDay)addDueTime='';updateDueChip()};
    document.getElementById('taskTimeButton').onclick=openTimePicker;
    document.getElementById('taskDueClear').onclick=function(){addDueDay='';addDueTime='';dueInput.value='';updateDueChip()};
  }
  function updateDailyChip(){var chip=document.getElementById('taskDailyNew');if(!chip)return;chip.classList.toggle('on',addDaily);chip.setAttribute('aria-pressed',String(addDaily))}
  function updateDueChip(){var chip=document.getElementById('taskDueButton'),time=document.getElementById('taskTimeButton'),input=document.getElementById('taskDueNew'),clear=document.getElementById('taskDueClear');if(!chip||!time||!input||!clear)return;input.value=addDueDay;chip.textContent=addDueDay?shortDay(addDueDay)+'まで':'期限なし';chip.classList.toggle('on',!!addDueDay);time.hidden=!addDueDay;time.textContent=addDueTime||'時間なし';time.classList.toggle('on',!!addDueTime);clear.hidden=!addDueDay}
  function updateAddOptions(){updateDailyChip();updateDueChip()}
  function buildTaskTimeInput(value,max,unit){
    var wrap=document.createElement('div');wrap.className='item-time-input-wrap';var input=document.createElement('input');input.className='item-time-input';input.type='number';input.inputMode='numeric';input.min='0';input.max=String(max);input.step='1';input.value=String(value).padStart(2,'0');input.setAttribute('aria-label',unit==='時'?'締め切りの時':'締め切りの分');var label=document.createElement('span');label.className='item-time-input-unit';label.textContent=unit;wrap.append(input,label);
    input.onfocus=function(){try{input.select()}catch(e){}};return {element:wrap,input:input,value:function(){return Math.max(0,Math.min(max,Math.floor(+input.value||0)))}};
  }
  function openTimePicker(){
    if(!addDueDay)return;openTimeEditor(addDueTime,function(value){addDueTime=value;updateDueChip()});
  }
  function openTimeEditor(initial,onSave){
    var existing=document.querySelector('.task-time-overlay');if(existing)existing.remove();var parts=validTime(initial).split(':'),hour=parts.length===2?+parts[0]:0,minute=parts.length===2?+parts[1]:0;
    var overlay=document.createElement('div');overlay.className='task-time-overlay';var panel=document.createElement('div');panel.className='task-time-panel';panel.innerHTML='<div class="task-time-title">締め切り時刻</div><div class="task-time-fields"></div><div class="task-time-actions"><button type="button" class="btn sub task-time-none">時間指定なし</button><button type="button" class="btn task-time-save">決定</button></div>';overlay.appendChild(panel);document.body.appendChild(overlay);
    var h=buildTaskTimeInput(hour,23,'時'),m=buildTaskTimeInput(minute,59,'分'),fields=panel.querySelector('.task-time-fields');fields.append(h.element,m.element);setTimeout(function(){try{h.input.focus();h.input.select()}catch(e){}},0);
    function close(){overlay.remove()};overlay.onclick=function(e){if(e.target===overlay)close()};panel.querySelector('.task-time-none').onclick=function(){onSave('');close()};panel.querySelector('.task-time-save').onclick=function(){onSave(String(h.value()).padStart(2,'0')+':'+String(m.value()).padStart(2,'0'));close()};
  }
  function updateNav(screen){
    if(window.StretchUI&&StretchUI.syncNav)return StretchUI.syncNav(screen);
    var nav=document.getElementById('modeNav');if(!nav)return;
    var visible=screen==='home'||screen==='tasks';nav.hidden=!visible;document.body.classList.toggle('mode-nav-visible',visible);
    if(screen==='tasks'){var back=document.getElementById('backBtn');if(back)back.style.display='none'}
    nav.querySelectorAll('.mode-nav-btn').forEach(function(btn){btn.classList.toggle('active',(screen==='home'&&btn.dataset.mode==='routine')||(screen==='tasks'&&btn.dataset.mode==='tasks'))});
  }
  function taskById(id){return state.tasks.find(function(x){return x.id===id})||null}
  function updateTaskDetailOptions(){
    var daily=document.getElementById('taskDetailDaily'),due=document.getElementById('taskDetailDue'),input=document.getElementById('taskDetailDueInput'),time=document.getElementById('taskDetailTime'),clear=document.getElementById('taskDetailClear');if(!daily||!due||!input||!time||!clear)return;
    daily.classList.toggle('on',detailDaily);daily.setAttribute('aria-pressed',String(detailDaily));input.value=detailDueDay;due.textContent=detailDueDay?shortDay(detailDueDay)+'まで':'期限なし';due.classList.toggle('on',!!detailDueDay);time.hidden=!detailDueDay;time.textContent=detailDueTime||'時間なし';time.classList.toggle('on',!!detailDueTime);clear.hidden=!detailDueDay;
  }
  function renderTaskCalendar(){
    var title=document.getElementById('taskCalTitle'),box=document.getElementById('taskCalDays');if(!title||!box)return;var y=detailViewDate.getFullYear(),mo=detailViewDate.getMonth(),today=calendarDay();title.textContent=y+'年 '+(mo+1)+'月';box.innerHTML='';var first=new Date(y,mo,1).getDay(),days=new Date(y,mo+1,0).getDate();
    for(var i=0;i<first;i++){var blank=document.createElement('div');blank.className='task-cal-day blank';box.appendChild(blank)}
    for(var day=1;day<=days;day++){var key=y+'-'+String(mo+1).padStart(2,'0')+'-'+String(day).padStart(2,'0'),cell=document.createElement('div');cell.className='task-cal-day'+(key===today?' today':'')+(key===detailDueDay?' deadline':'');cell.textContent=day;box.appendChild(cell)}
  }
  function changeTaskMonth(delta){detailViewDate=new Date(detailViewDate.getFullYear(),detailViewDate.getMonth()+delta,1);renderTaskCalendar()}
  function resizeTaskTextarea(el,maxHeight,minHeight){if(!el)return;el.style.height='auto';var height=el.scrollHeight;if(maxHeight){height=Math.min(height,maxHeight);el.style.overflowY=el.scrollHeight>maxHeight?'auto':'hidden'}el.style.height=Math.max(minHeight||48,height)+'px'}
  function bindTaskDetail(){
    var dueInput=document.getElementById('taskDetailDueInput'),nameInput=document.getElementById('taskDetailName');nameInput.oninput=function(){resizeTaskTextarea(nameInput)};document.getElementById('taskDetailDaily').onclick=function(){detailDaily=!detailDaily;updateTaskDetailOptions()};document.getElementById('taskDetailDue').onclick=function(){try{if(dueInput.showPicker)dueInput.showPicker();else dueInput.click()}catch(e){dueInput.click()}};
    dueInput.onchange=function(){detailDueDay=validDay(dueInput.value);if(!detailDueDay)detailDueTime='';if(detailDueDay){var p=detailDueDay.split('-');detailViewDate=new Date(+p[0],+p[1]-1,1)}updateTaskDetailOptions();renderTaskCalendar()};
    document.getElementById('taskDetailTime').onclick=function(){if(detailDueDay)openTimeEditor(detailDueTime,function(value){detailDueTime=value;updateTaskDetailOptions()})};document.getElementById('taskDetailClear').onclick=function(){detailDueDay='';detailDueTime='';updateTaskDetailOptions();renderTaskCalendar()};
    document.getElementById('taskDetailSave').onclick=function(){var task=taskById(detailTaskId);if(!task)return;task.title=(document.getElementById('taskDetailName').value||'').trim()||task.title;task.repeatDaily=detailDaily;task.dueDay=detailDueDay;task.dueTime=detailDueTime;save();renderTaskDetail()};document.getElementById('taskCalPrev').onclick=function(){changeTaskMonth(-1)};document.getElementById('taskCalNext').onclick=function(){changeTaskMonth(1)};
    var card=document.querySelector('#taskDetail .task-calendar-card'),x0=0,y0=0;card.addEventListener('touchstart',function(e){if(e.touches.length===1){x0=e.touches[0].clientX;y0=e.touches[0].clientY}},{passive:true});card.addEventListener('touchend',function(e){if(!e.changedTouches.length)return;var dx=e.changedTouches[0].clientX-x0,dy=e.changedTouches[0].clientY-y0;if(Math.abs(dx)>=42&&Math.abs(dx)>Math.abs(dy)*1.25)changeTaskMonth(dx<0?1:-1)},{passive:true});
  }
  function renderTaskDetail(){var task=taskById(detailTaskId);if(!task){renderTasks();return}var name=document.getElementById('taskDetailName');name.value=task.title;resizeTaskTextarea(name);updateTaskDetailOptions();renderTaskCalendar()}
  function openTaskDetail(id){var task=taskById(id);if(!task)return;detailTaskId=id;detailDueDay=task.dueDay;detailDueTime=task.dueTime;detailDaily=task.repeatDaily;if(detailDueDay){var p=detailDueDay.split('-');detailViewDate=new Date(+p[0],+p[1]-1,1)}else detailViewDate=new Date();show('taskDetail','タスク詳細');renderTaskDetail();window.scrollTo(0,0)}
  function saveTaskTitle(task,input,old){var title=(input.value||'').trim();task.title=title||old;if(task.title!==old)save();renderTaskLists()}
  function removeTask(id){state.tasks=state.tasks.filter(function(x){return x.id!==id});save();renderTaskLists()}
  function duplicateTask(id){var task=taskById(id);if(!task)return;var copy=JSON.parse(JSON.stringify(task));copy.id=uid();copy.title=(task.title||'タスク')+' コピー';copy.completedAt=0;copy.completedDay='';copy.createdDay=currentDay();copy.carriedFrom='';var index=state.tasks.findIndex(function(x){return x.id===id});state.tasks.splice(index+1,0,copy);save();renderTaskLists()}
  function closeTaskAction(){var pop=document.getElementById('taskActionPop');if(pop)pop.remove()}
  function beginInlineTaskEdit(id){var task=taskById(id),row=document.querySelector('.task-row[data-id="'+id+'"]'),text=row&&row.querySelector('.task-title-text');if(!task||!text)return;var input=document.createElement('textarea'),old=task.title;input.className='task-title-editor';input.rows=1;input.maxLength=200;input.value=old;input.setAttribute('aria-label','タスク名を編集');input.onclick=function(e){e.stopPropagation()};input.oninput=function(){resizeTaskTextarea(input,68,30)};input.onkeydown=function(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();input.blur()}else if(e.key==='Escape'){input.value=old;input.blur()}};input.onblur=function(){saveTaskTitle(task,input,old)};text.replaceWith(input);row.draggable=false;resizeTaskTextarea(input,68,30);input.focus();input.setSelectionRange(input.value.length,input.value.length)}
  function openTaskAction(button,id){
    closeTaskAction();var pop=document.createElement('div');pop.id='taskActionPop';pop.className='task-action-pop';pop.innerHTML='<button type="button" data-act="edit">編集</button><button type="button" data-act="detail">詳細</button><button type="button" data-act="delete" class="danger">削除</button>';document.body.appendChild(pop);var r=button.getBoundingClientRect(),w=132;pop.style.left=Math.max(8,Math.min(innerWidth-w-8,r.right-w))+'px';pop.style.top=Math.min(innerHeight-pop.offsetHeight-8,r.bottom+5)+'px';
    pop.onclick=function(e){var b=e.target.closest('button');if(!b)return;e.stopPropagation();var act=b.dataset.act;closeTaskAction();if(act==='edit')beginInlineTaskEdit(id);else if(act==='detail')openTaskDetail(id);else if(act==='delete')removeTask(id)};setTimeout(function(){document.addEventListener('pointerdown',function close(e){if(!e.target.closest('#taskActionPop')){closeTaskAction();document.removeEventListener('pointerdown',close,true)}},true)},0);
  }
  function taskMeta(task){
    var meta=document.createElement('div');meta.className='task-meta';
    if(task.repeatDaily){var daily=document.createElement('span');daily.className='task-tag daily';daily.textContent='毎日';meta.appendChild(daily)}
    if(task.dueDay){var due=document.createElement('span'),today=calendarDay(),info=deadlineInfo(task),status=info?info.status:(task.dueDay<today?'overdue':task.dueDay===today?'today':'');due.className='task-tag due'+(status?' '+status:'');due.textContent=shortDay(task.dueDay)+(task.dueTime?' '+task.dueTime:'')+'まで'+(info&&info.text?'（'+info.text+'）':'');meta.appendChild(due)}
    if(!task.completedAt&&task.carriedFrom&&task.carriedFrom!==currentDay()){var carry=document.createElement('span');carry.className='task-tag';carry.textContent='繰越';meta.appendChild(carry)}
    return meta;
  }
  function makeTaskRow(task,completed){
    var row=document.createElement('div');row.className='task-row'+(completed?' completed':'');row.dataset.id=task.id;row.draggable=false;
    var check=document.createElement('button');check.type='button';check.className='task-check'+(completed?' checked':'');check.setAttribute('aria-label',completed?'未完了に戻す':'完了にする');check.textContent=completed?'✓':'';
    check.onclick=function(){if(task.completedAt){task.completedAt=0;task.completedDay=''}else{task.completedAt=Date.now();task.completedDay=currentDay()}save();renderTaskLists()};
    var main=document.createElement('div');main.className='task-main';main.setAttribute('role','button');main.tabIndex=0;var title=document.createElement('div');title.className='task-title-text';title.textContent=task.title;
    main.onclick=function(){openTaskDetail(task.id)};main.onkeydown=function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();openTaskDetail(task.id)}};
    main.append(title,taskMeta(task));
    var more=document.createElement('button');more.type='button';more.className='task-more';more.setAttribute('aria-label','タスク操作');more.textContent='…';more.onclick=function(e){e.stopPropagation();openTaskAction(more,task.id)};
    var del=document.createElement('button');del.type='button';del.className='task-swipe-delete';del.textContent='削除';del.onclick=function(e){e.preventDefault();e.stopPropagation();removeTask(task.id)};var dup=document.createElement('button');dup.type='button';dup.className='task-swipe-duplicate';dup.textContent='複製';dup.onclick=function(e){e.preventDefault();e.stopPropagation();duplicateTask(task.id)};
    row.append(check,main,more,del,dup);if(window.StretchUI&&StretchUI.bindSwipe)StretchUI.bindSwipe(row,{left:'.task-swipe-delete',right:'.task-swipe-duplicate'});else wireTaskSwipe(row);return row;
  }
  function wireTaskSwipe(row){var x0=0,y0=0,moved=false,ignore=false;row.addEventListener('touchstart',function(e){ignore=!!(e.target&&e.target.closest('button,input,textarea,select,a'));if(ignore||e.touches.length!==1)return;x0=e.touches[0].clientX;y0=e.touches[0].clientY;moved=false},{passive:true});row.addEventListener('touchmove',function(e){if(ignore||e.touches.length!==1)return;var dx=e.touches[0].clientX-x0,dy=e.touches[0].clientY-y0;if(Math.abs(dx)>22&&Math.abs(dx)>Math.abs(dy)*1.25)moved=true},{passive:true});row.addEventListener('touchend',function(e){if(ignore){ignore=false;return}if(!moved||!e.changedTouches.length)return;var dx=e.changedTouches[0].clientX-x0,dy=e.changedTouches[0].clientY-y0;if(Math.abs(dx)<=45||Math.abs(dx)<=Math.abs(dy)*1.25)return;taskSwipeClickUntil=Date.now()+550;document.querySelectorAll('.task-row.swipe-open,.task-row.swipe-copy-open').forEach(function(x){if(x!==row)x.classList.remove('swipe-open','swipe-copy-open')});var deleteOpen=row.classList.contains('swipe-open'),copyOpen=row.classList.contains('swipe-copy-open');if(deleteOpen){if(dx>0)row.classList.remove('swipe-open');return}if(copyOpen){if(dx<0)row.classList.remove('swipe-copy-open');return}row.classList.add(dx<0?'swipe-open':'swipe-copy-open')},{passive:true});row.addEventListener('click',function(e){var action=e.target.closest('.task-swipe-delete,.task-swipe-duplicate');if(Date.now()<taskSwipeClickUntil&&!action){e.preventDefault();e.stopPropagation();return}if((row.classList.contains('swipe-open')||row.classList.contains('swipe-copy-open'))&&!action){row.classList.remove('swipe-open','swipe-copy-open');e.preventDefault();e.stopPropagation()}},true)}
  function moveTask(fromId,toId){
    if(fromId===toId)return;var from=state.tasks.findIndex(function(x){return x.id===fromId}),to=state.tasks.findIndex(function(x){return x.id===toId});if(from<0||to<0)return;var task=state.tasks.splice(from,1)[0];to=state.tasks.findIndex(function(x){return x.id===toId});state.tasks.splice(Math.max(0,to),0,task);save();renderTaskLists();
  }
  function wireTaskReorder(row,id){
    row.addEventListener('dragstart',function(e){if(e.target&&e.target.closest('button,input,textarea')){e.preventDefault();return}e.dataTransfer.setData('text/plain',id);row.classList.add('task-dragging')});
    row.addEventListener('dragend',function(){row.classList.remove('task-dragging');document.querySelectorAll('.task-drop-target').forEach(function(x){x.classList.remove('task-drop-target')})});
    row.addEventListener('dragover',function(e){e.preventDefault();row.classList.add('task-drop-target')});
    row.addEventListener('dragleave',function(){row.classList.remove('task-drop-target')});
    row.addEventListener('drop',function(e){e.preventDefault();row.classList.remove('task-drop-target');moveTask(e.dataTransfer.getData('text/plain'),id)});
  }
  function renderTaskLists(){
    rolloverIfNeeded();var open=state.tasks.filter(function(x){return !x.completedAt}),done=state.tasks.filter(function(x){return !!x.completedAt});
    var openList=document.getElementById('taskOpenList'),doneList=document.getElementById('taskDoneList');if(!openList||!doneList)return;openList.innerHTML='';doneList.innerHTML='';
    if(!open.length){var empty=document.createElement('div');empty.className='task-empty';empty.textContent='未完了のタスクはありません';openList.appendChild(empty)}else open.forEach(function(task){openList.appendChild(makeTaskRow(task,false))});
    done.forEach(function(task){doneList.appendChild(makeTaskRow(task,true))});
    document.getElementById('taskCompletedWrap').style.display=done.length?'grid':'none';document.getElementById('taskOpenCount').textContent=open.length+'件';document.getElementById('taskDoneCount').textContent=done.length+'件';updateAddOptions();
  }
  function openTaskSettings(){settingsReturn='tasks';renderSettings()}
  function renderTasks(){
    ensureScreens();rolloverIfNeeded();show('tasks','タスク');renderTaskLists();
  }
  function historyEntries(){
    var all=state.taskHistory.slice();state.tasks.filter(function(x){return x.completedAt}).forEach(function(task){all.push({id:'current-'+task.id,taskId:task.id,title:task.title,completedAt:task.completedAt,day:task.completedDay||dayKey(task.completedAt,state.taskSettings.cutoffHour),repeatDaily:task.repeatDaily})});return all.sort(function(a,b){return b.completedAt-a.completedAt});
  }
  function formatDay(key){var parts=String(key).split('-'),d=new Date(+parts[0],(+parts[1]||1)-1,+parts[2]||1),week=['日','月','火','水','木','金','土'];return (+parts[1])+'月'+(+parts[2])+'日（'+week[d.getDay()]+'）'}
  function renderTaskHistory(){
    ensureScreens();rolloverIfNeeded();show('taskHistory','完了履歴');var box=document.getElementById('taskHistoryList'),entries=historyEntries();box.innerHTML='';if(!entries.length){box.innerHTML='<div class="task-empty">完了したタスクはまだありません</div>';return}
    var groups={};entries.forEach(function(x){(groups[x.day]||(groups[x.day]=[])).push(x)});Object.keys(groups).sort().reverse().forEach(function(key){var group=document.createElement('section');group.className='task-history-group';var date=document.createElement('div');date.className='task-history-date';date.textContent=formatDay(key);var card=document.createElement('div');card.className='card task-history-card';groups[key].forEach(function(x){var item=document.createElement('div');item.className='task-history-item';var check=document.createElement('span');check.className='task-history-check';check.textContent='✓';var title=document.createElement('span');title.textContent=x.title;item.append(check,title);card.appendChild(item)});group.append(date,card);box.appendChild(group)});
  }
  function renderDailyTasks(){
    ensureScreens();rolloverIfNeeded();show('dailyTasks','毎日タスク');var box=document.getElementById('dailyTaskList'),daily=state.tasks.filter(function(x){return x.repeatDaily});box.innerHTML='';if(!daily.length){box.innerHTML='<div class="task-empty">毎日繰り返すタスクはありません</div>';return}daily.forEach(function(task){var row=document.createElement('div');row.className='daily-manage-row';var title=document.createElement('div');title.className='daily-manage-title';title.textContent=task.title;var off=document.createElement('button');off.type='button';off.className='daily-disable';off.textContent='繰り返しを解除';off.onclick=function(){task.repeatDaily=false;save();renderDailyTasks()};row.append(title,off);box.appendChild(row)});
  }
  function hourLabel(hour){hour=clampHour(hour);return hour<12?'午前'+hour+'時':'午後'+(hour-12)+'時'}
  function settingsCard(){
    var card=document.getElementById('taskSettingsCard');if(card)return card;var stack=document.querySelector('#settings>.stack');if(!stack)return null;
    card=document.createElement('div');card.id='taskSettingsCard';card.className='card task-settings-card';card.innerHTML='<div class="section-title" style="margin:0">タスク</div><button id="taskHistoryLink" type="button" class="task-settings-link"><span>完了履歴</span><span id="taskHistoryCount"></span></button><div class="task-cutoff-row"><label for="taskCutoffHour">日付の切り替え</label><select id="taskCutoffHour" class="task-cutoff-select"></select></div><button id="dailyTaskLink" type="button" class="task-settings-link"><span>毎日タスク</span><span id="dailyTaskCount"></span></button>';
    var firstCard=stack.querySelector('.card');stack.insertBefore(card,firstCard||stack.firstChild);
    var select=card.querySelector('#taskCutoffHour');for(var h=0;h<24;h++){var option=document.createElement('option');option.value=String(h);option.textContent=hourLabel(h);select.appendChild(option)}
    card.querySelector('#taskHistoryLink').onclick=renderTaskHistory;card.querySelector('#dailyTaskLink').onclick=renderDailyTasks;
    select.onchange=function(){state.taskSettings.cutoffHour=clampHour(select.value);state.taskSettings.lastDay=currentDay();save();renderTaskSettings()};return card;
  }
  function renderTaskSettings(){
    ensureTaskData();rolloverIfNeeded();var card=settingsCard();if(!card)return;card.querySelector('#taskCutoffHour').value=String(state.taskSettings.cutoffHour);card.querySelector('#taskHistoryCount').textContent=historyEntries().length+'件 ›';card.querySelector('#dailyTaskCount').textContent=state.tasks.filter(function(x){return x.repeatDaily}).length+'件 ›';
  }

  ensureTaskData();ensureScreens();rolloverIfNeeded();

  if(window.StretchUI&&StretchUI.registerDataProvider)StretchUI.registerDataProvider({key:'tasks',write:function(payload){payload.tasks=state.tasks.map(cleanTask);payload.taskHistory=state.taskHistory.map(cleanHistory);payload.taskSettings={cutoffHour:state.taskSettings.cutoffHour,lastDay:state.taskSettings.lastDay}},read:function(remote){installTaskData(state,remote);rolloverIfNeeded();if(typeof save==='function')save(false)}});

  if(window.StretchUI&&StretchUI.registerScreenHook)StretchUI.registerScreenHook({key:'tasks-nav',after:updateNav});
  if(window.StretchUI&&StretchUI.registerSettingsSection)StretchUI.registerSettingsSection({key:'tasks',before:function(){if(typeof currentScreen!=='undefined'&&currentScreen!=='settings')settingsReturn=currentScreen==='tasks'||currentScreen==='taskHistory'||currentScreen==='dailyTasks'?'tasks':'home'},render:renderTaskSettings});

  if(window.StretchUI&&StretchUI.registerBackHandler)StretchUI.registerBackHandler({key:'tasks',priority:300,handle:function(){
    var custom=currentScreen==='tasks'||currentScreen==='taskDetail'||currentScreen==='taskHistory'||currentScreen==='dailyTasks'||(currentScreen==='settings'&&settingsReturn==='tasks');
    if(custom){
      var target=history.state&&history.state.stretchTimerScreen;
      if(target&&target!==currentScreen){if(target==='tasks'){renderTasks();return true}if(target==='settings'){renderSettings();return true}if(target==='home'){renderHome();return true}}
      var depth=history.state&&history.state.stretchTimerApp?Math.max(0,+history.state.stretchTimerDepth||0):0;
      if(depth>0&&typeof history.back==='function'){history.back();return true}
      if(currentScreen==='taskDetail'){renderTasks();return true}
      if(currentScreen==='taskHistory'||currentScreen==='dailyTasks'){renderSettings();return true}
      if(currentScreen==='settings'){renderTasks();return true}
      renderHome();return true;
    }
    return false
  }});

  document.addEventListener('visibilitychange',function(){if(!document.hidden&&rolloverIfNeeded()&&currentScreen==='tasks')renderTaskLists()});
  rolloverTimer=setInterval(function(){rolloverIfNeeded();if(currentScreen==='tasks')renderTaskLists()},60000);
  updateNav(currentScreen);

  window.__stretchTimerTasksV106={render:renderTasks,rollover:rolloverIfNeeded,dayKey:dayKey,history:renderTaskHistory};
})();
