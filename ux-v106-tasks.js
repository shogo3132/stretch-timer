(function(){
  if(window.__tasksV106)return;
  window.__tasksV106=true;

  var addDaily=false;
  var addDueDay='';
  var addDueTime='';
  var settingsReturn='home';
  var rolloverTimer=null;

  var style=document.createElement('style');
  style.setAttribute('data-tasks-v106','');
  style.textContent='\
body.mode-nav-visible .screen.active{padding-bottom:108px!important}\
body.mode-nav-visible #appToast{bottom:88px!important}\
#modeNav{position:fixed;left:50%;bottom:0;z-index:9000;width:min(760px,100%);transform:translateX(-50%);display:grid;grid-template-columns:1fr 1fr;padding:7px 14px max(8px,env(safe-area-inset-bottom));background:rgba(255,255,255,.96);border-top:1px solid #e5e9ec;box-shadow:0 -6px 20px rgba(29,38,46,.06);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px)}\
#modeNav[hidden]{display:none!important}\
.mode-nav-btn{min-height:48px;border:0;border-radius:14px;background:transparent;color:#7a838d;font-size:13px;font-weight:700;display:flex;align-items:center;justify-content:center;gap:7px;cursor:pointer}\
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
.task-row{position:relative;display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:10px;min-height:54px;padding:8px 9px 8px 12px;border-radius:16px;background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.04);touch-action:pan-y}\
.task-row.task-dragging{opacity:.55}\
.task-row.task-drop-target{outline:2px solid #27ae8b}\
.task-check{width:25px;height:25px;border:2px solid #aeb7bf;border-radius:8px;background:#fff;color:#fff;padding:0;display:grid;place-items:center;font-size:16px;font-weight:900;cursor:pointer}\
.task-check.checked{border-color:#27ae8b;background:#27ae8b}\
.task-main{min-width:0;display:grid;gap:3px}\
.task-title-input{width:100%;min-width:0;border:0;background:transparent;color:#20262c;font-size:16px;line-height:1.35;padding:3px 0;outline:none;text-overflow:ellipsis}\
.task-title-input:not([readonly]){background:#f3f6f5;border-radius:8px;padding:5px 7px;margin:-2px -7px}\
.task-row.completed .task-title-input{text-decoration:line-through;color:#929aa2}\
.task-meta{display:flex;align-items:center;gap:6px;min-height:0}\
.task-tag{font-size:10px;line-height:1;border-radius:999px;padding:4px 6px;background:#edf1f3;color:#717b84}\
.task-tag.daily{background:#e7f6f1;color:#168465}\
.task-tag.due{background:#e8f0f8;color:#39729f}\
.task-tag.due.today{background:#fff0d8;color:#a15d00}\
.task-tag.due.overdue{background:#fde8e7;color:#b4453d}\
.task-delete{width:34px;height:34px;border:0;border-radius:10px;background:transparent;color:#a0a8af;font-size:21px;line-height:1;cursor:pointer}\
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
@media(min-width:780px){#modeNav{bottom:14px;border:1px solid #e4e8eb;border-radius:20px;box-shadow:0 9px 30px rgba(28,36,44,.12);padding-bottom:7px}body.paused-routine-away #modeNav{bottom:178px}body.mode-nav-visible.paused-routine-away .screen.active{padding-bottom:275px!important}}\
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
      tasks.innerHTML='<div class="task-page"><form id="taskQuickAdd" class="card task-add-card"><div class="task-add-row"><input id="taskTitleNew" class="task-add-input" maxlength="200" autocomplete="off" placeholder="やることを入力"><button class="btn task-add-btn" type="submit">追加</button></div><div class="task-add-options"><button id="taskDailyNew" class="task-daily-chip" type="button" aria-pressed="false">↻ 毎日</button><div class="task-due-wrap"><button id="taskDueButton" class="task-due-chip" type="button">期限なし</button><input id="taskDueNew" class="task-due-input" type="date"><button id="taskTimeButton" class="task-time-chip" type="button" hidden>時間なし</button><button id="taskDueClear" class="task-due-clear" type="button" aria-label="期限を外す" hidden>×</button></div></div></form><section class="task-section"><div class="task-section-head"><span>今日のタスク</span><span id="taskOpenCount"></span></div><div id="taskOpenList" class="task-list"></div></section><section id="taskCompletedWrap" class="task-section task-completed-wrap"><div class="task-section-head"><span>完了</span><span id="taskDoneCount"></span></div><div id="taskDoneList" class="task-list"></div></section></div>';
      app.insertBefore(tasks,document.getElementById('timer'));
    }
    if(!document.getElementById('taskHistory')){
      var historyScreen=document.createElement('main');historyScreen.id='taskHistory';historyScreen.className='screen';historyScreen.innerHTML='<div id="taskHistoryList" class="task-history-page"></div>';app.insertBefore(historyScreen,document.getElementById('timer'));
    }
    if(!document.getElementById('dailyTasks')){
      var daily=document.createElement('main');daily.id='dailyTasks';daily.className='screen';daily.innerHTML='<div id="dailyTaskList" class="daily-task-page"></div>';app.insertBefore(daily,document.getElementById('timer'));
    }
    if(!document.getElementById('modeNav')){
      var nav=document.createElement('nav');nav.id='modeNav';nav.setAttribute('aria-label','機能の切り替え');
      nav.innerHTML='<button type="button" class="mode-nav-btn" data-mode="routine"><span class="mode-nav-icon">◷</span><span>ルーティン</span></button><button type="button" class="mode-nav-btn" data-mode="tasks"><span class="mode-nav-icon">✓</span><span>タスク</span></button>';
      app.appendChild(nav);
      nav.querySelector('[data-mode="routine"]').onclick=function(){settingsReturn='home';renderHome()};
      nav.querySelector('[data-mode="tasks"]').onclick=renderTasks;
    }
    bindTaskForm();
  }
  function bindTaskForm(){
    var form=document.getElementById('taskQuickAdd');if(!form||form.dataset.bound)return;form.dataset.bound='1';
    form.onsubmit=function(e){e.preventDefault();var input=document.getElementById('taskTitleNew'),title=(input.value||'').trim();if(!title){input.focus();return}rolloverIfNeeded();state.tasks.push({id:uid(),title:title,repeatDaily:addDaily,dueDay:addDueDay,dueTime:addDueTime,createdDay:currentDay(),carriedFrom:'',completedAt:0,completedDay:''});input.value='';addDaily=false;addDueDay='';addDueTime='';updateAddOptions();save();renderTaskLists();input.focus()};
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
    if(!addDueDay)return;var existing=document.querySelector('.task-time-overlay');if(existing)existing.remove();var parts=validTime(addDueTime).split(':'),hour=parts.length===2?+parts[0]:0,minute=parts.length===2?+parts[1]:0;
    var overlay=document.createElement('div');overlay.className='task-time-overlay';var panel=document.createElement('div');panel.className='task-time-panel';panel.innerHTML='<div class="task-time-title">締め切り時刻</div><div class="task-time-fields"></div><div class="task-time-actions"><button type="button" class="btn sub task-time-none">時間指定なし</button><button type="button" class="btn task-time-save">決定</button></div>';overlay.appendChild(panel);document.body.appendChild(overlay);
    var h=buildTaskTimeInput(hour,23,'時'),m=buildTaskTimeInput(minute,59,'分'),fields=panel.querySelector('.task-time-fields');fields.append(h.element,m.element);setTimeout(function(){try{h.input.focus();h.input.select()}catch(e){}},0);
    function close(){overlay.remove()};overlay.onclick=function(e){if(e.target===overlay)close()};panel.querySelector('.task-time-none').onclick=function(){addDueTime='';updateDueChip();close()};panel.querySelector('.task-time-save').onclick=function(){addDueTime=String(h.value()).padStart(2,'0')+':'+String(m.value()).padStart(2,'0');updateDueChip();close()};
  }
  function updateNav(screen){
    var nav=document.getElementById('modeNav');if(!nav)return;
    var visible=screen==='home'||screen==='tasks';nav.hidden=!visible;document.body.classList.toggle('mode-nav-visible',visible);
    if(screen==='tasks'){var back=document.getElementById('backBtn');if(back)back.style.display='none'}
    nav.querySelectorAll('.mode-nav-btn').forEach(function(btn){btn.classList.toggle('active',(screen==='home'&&btn.dataset.mode==='routine')||(screen==='tasks'&&btn.dataset.mode==='tasks'))});
  }
  function saveTaskTitle(task,input,old){
    var title=(input.value||'').trim();task.title=title||old;input.value=task.title;input.readOnly=true;if(task.title!==old)save();
  }
  function taskMeta(task){
    var meta=document.createElement('div');meta.className='task-meta';
    if(task.repeatDaily){var daily=document.createElement('span');daily.className='task-tag daily';daily.textContent='毎日';meta.appendChild(daily)}
    if(task.dueDay){var due=document.createElement('span'),today=calendarDay(),status=task.dueDay<today?'overdue':task.dueDay===today?'today':'';if(status==='today'&&task.dueTime){var p=task.dueTime.split(':'),now=new Date();if(now.getHours()*60+now.getMinutes()>=+p[0]*60+(+p[1]))status='overdue'}due.className='task-tag due'+(status?' '+status:'');due.textContent=shortDay(task.dueDay)+(task.dueTime?' '+task.dueTime:'')+'まで';meta.appendChild(due)}
    if(!task.completedAt&&task.carriedFrom&&task.carriedFrom!==currentDay()){var carry=document.createElement('span');carry.className='task-tag';carry.textContent='繰越';meta.appendChild(carry)}
    return meta;
  }
  function makeTaskRow(task,completed){
    var row=document.createElement('div');row.className='task-row'+(completed?' completed':'');row.dataset.id=task.id;row.draggable=!completed;
    var check=document.createElement('button');check.type='button';check.className='task-check'+(completed?' checked':'');check.setAttribute('aria-label',completed?'未完了に戻す':'完了にする');check.textContent=completed?'✓':'';
    check.onclick=function(){if(task.completedAt){task.completedAt=0;task.completedDay=''}else{task.completedAt=Date.now();task.completedDay=currentDay()}save();renderTaskLists()};
    var main=document.createElement('div');main.className='task-main';var input=document.createElement('input');input.className='task-title-input';input.value=task.title;input.readOnly=true;input.setAttribute('aria-label','タスク名');
    input.onclick=function(){var old=task.title;input.readOnly=false;input.focus();input.setSelectionRange(input.value.length,input.value.length);input.dataset.old=old};
    input.onkeydown=function(e){if(e.key==='Enter'){e.preventDefault();input.blur()}else if(e.key==='Escape'){input.value=input.dataset.old||task.title;input.readOnly=true;input.blur()}};
    input.onblur=function(){if(!input.readOnly)saveTaskTitle(task,input,input.dataset.old||task.title)};
    main.append(input,taskMeta(task));
    var remove=document.createElement('button');remove.type='button';remove.className='task-delete';remove.setAttribute('aria-label','削除');remove.textContent='×';remove.onclick=function(){state.tasks=state.tasks.filter(function(x){return x.id!==task.id});save();renderTaskLists()};
    row.append(check,main,remove);if(!completed)wireTaskReorder(row,task.id);return row;
  }
  function moveTask(fromId,toId){
    if(fromId===toId)return;var from=state.tasks.findIndex(function(x){return x.id===fromId}),to=state.tasks.findIndex(function(x){return x.id===toId});if(from<0||to<0)return;var task=state.tasks.splice(from,1)[0];to=state.tasks.findIndex(function(x){return x.id===toId});state.tasks.splice(Math.max(0,to),0,task);save();renderTaskLists();
  }
  function wireTaskReorder(row,id){
    row.addEventListener('dragstart',function(e){if(e.target&&e.target.closest('button,input')){e.preventDefault();return}e.dataTransfer.setData('text/plain',id);row.classList.add('task-dragging')});
    row.addEventListener('dragend',function(){row.classList.remove('task-dragging');document.querySelectorAll('.task-drop-target').forEach(function(x){x.classList.remove('task-drop-target')})});
    row.addEventListener('dragover',function(e){e.preventDefault();row.classList.add('task-drop-target')});
    row.addEventListener('dragleave',function(){row.classList.remove('task-drop-target')});
    row.addEventListener('drop',function(e){e.preventDefault();row.classList.remove('task-drop-target');moveTask(e.dataTransfer.getData('text/plain'),id)});
    var hold=null,active=false;
    row.addEventListener('touchstart',function(e){if(e.target&&e.target.closest('button,input'))return;hold=setTimeout(function(){active=true;row.classList.add('task-dragging');if(navigator.vibrate)navigator.vibrate(25)},420)},{passive:true});
    row.addEventListener('touchmove',function(e){if(!active)return;e.preventDefault();var p=e.touches[0],target=document.elementFromPoint(p.clientX,p.clientY);target=target&&target.closest('.task-row:not(.completed)');document.querySelectorAll('.task-drop-target').forEach(function(x){x.classList.remove('task-drop-target')});if(target&&target!==row)target.classList.add('task-drop-target')},{passive:false});
    row.addEventListener('touchend',function(){clearTimeout(hold);if(active){var target=document.querySelector('.task-row.task-drop-target');if(target)moveTask(id,target.dataset.id);document.querySelectorAll('.task-drop-target').forEach(function(x){x.classList.remove('task-drop-target')});row.classList.remove('task-dragging')}active=false});
    row.addEventListener('touchcancel',function(){clearTimeout(hold);active=false;row.classList.remove('task-dragging')});
  }
  function renderTaskLists(){
    rolloverIfNeeded();var open=state.tasks.filter(function(x){return !x.completedAt}),done=state.tasks.filter(function(x){return !!x.completedAt});
    var openList=document.getElementById('taskOpenList'),doneList=document.getElementById('taskDoneList');if(!openList||!doneList)return;openList.innerHTML='';doneList.innerHTML='';
    if(!open.length){var empty=document.createElement('div');empty.className='task-empty';empty.textContent='今日のタスクはありません';openList.appendChild(empty)}else open.forEach(function(task){openList.appendChild(makeTaskRow(task,false))});
    done.forEach(function(task){doneList.appendChild(makeTaskRow(task,true))});
    document.getElementById('taskCompletedWrap').style.display=done.length?'grid':'none';document.getElementById('taskOpenCount').textContent=open.length+'件';document.getElementById('taskDoneCount').textContent=done.length+'件';updateAddOptions();
  }
  function openTaskSettings(){settingsReturn='tasks';renderSettings()}
  function renderTasks(){
    ensureScreens();rolloverIfNeeded();show('tasks','タスク',{label:'⚙',fn:openTaskSettings});renderTaskLists();
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

  var previousSyncPayload=typeof syncPayload==='function'?syncPayload:null;
  if(previousSyncPayload)syncPayload=function(){var payload=JSON.parse(previousSyncPayload());payload.tasks=state.tasks.map(cleanTask);payload.taskHistory=state.taskHistory.map(cleanHistory);payload.taskSettings={cutoffHour:state.taskSettings.cutoffHour,lastDay:state.taskSettings.lastDay};return JSON.stringify(payload)};

  var previousApplyRemote=typeof applyRemote==='function'?applyRemote:null;
  if(previousApplyRemote)applyRemote=function(raw,remoteTime){var remote={};try{remote=JSON.parse(raw)||{}}catch(e){}var result=previousApplyRemote.apply(this,arguments);installTaskData(state,remote);rolloverIfNeeded();if(typeof save==='function')save(false);return result};

  var previousShow=typeof show==='function'?show:null;
  if(previousShow)show=function(id){var result=previousShow.apply(this,arguments);updateNav(id);return result};

  var previousRenderSettings=typeof renderSettings==='function'?renderSettings:null;
  if(previousRenderSettings)renderSettings=function(){if(typeof currentScreen!=='undefined'&&currentScreen!=='settings')settingsReturn=currentScreen==='tasks'||currentScreen==='taskHistory'||currentScreen==='dailyTasks'?'tasks':'home';var result=previousRenderSettings.apply(this,arguments);renderTaskSettings();return result};

  var previousGoBack=typeof goBack==='function'?goBack:null;
  if(previousGoBack)goBack=function(){
    var custom=currentScreen==='tasks'||currentScreen==='taskHistory'||currentScreen==='dailyTasks'||(currentScreen==='settings'&&settingsReturn==='tasks');
    if(custom){
      var target=history.state&&history.state.stretchTimerScreen;
      if(target&&target!==currentScreen){if(target==='tasks')return renderTasks();if(target==='settings')return renderSettings();if(target==='home')return renderHome()}
      var depth=history.state&&history.state.stretchTimerApp?Math.max(0,+history.state.stretchTimerDepth||0):0;
      if(depth>0&&typeof history.back==='function'){history.back();return}
      if(currentScreen==='taskHistory'||currentScreen==='dailyTasks')return renderSettings();
      if(currentScreen==='settings')return renderTasks();
      return renderHome();
    }
    return previousGoBack.apply(this,arguments)
  };
  var back=document.getElementById('backBtn');if(back)back.onclick=function(){goBack()};

  document.addEventListener('visibilitychange',function(){if(!document.hidden&&rolloverIfNeeded()&&currentScreen==='tasks')renderTaskLists()});
  rolloverTimer=setInterval(function(){rolloverIfNeeded();if(currentScreen==='tasks')renderTaskLists()},60000);
  updateNav(currentScreen);

  window.__stretchTimerTasksV106={render:renderTasks,rollover:rolloverIfNeeded,dayKey:dayKey,history:renderTaskHistory};
})();
