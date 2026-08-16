(function(){
  var detailMenuId=null;
  var viewDate=new Date();

  var style=document.createElement('style');
  style.setAttribute('data-routine-detail-v28','');
  style.textContent='\
.menu-card .edit{background:#fff!important;color:#5f6873!important;box-shadow:none!important;min-width:42px!important;padding:4px 8px!important;font-size:25px!important;line-height:1!important}\
#routineDetail{padding-top:18px}\
.routine-detail-wrap{display:grid;gap:16px}\
.detail-summary{display:flex;align-items:center;gap:14px;background:#fff;border-radius:20px;padding:15px 16px;box-shadow:0 1px 2px rgba(0,0,0,.04)}\
.detail-ring{--p:0deg;width:54px;height:54px;border-radius:50%;background:conic-gradient(#27ae8b var(--p),#e6e9ed 0);position:relative;flex:0 0 auto}\
.detail-ring::after{content:"";position:absolute;inset:6px;border-radius:50%;background:#fff}\
.detail-routine-name{font-size:19px;font-weight:800;line-height:1.25;min-width:0;word-break:break-word}\
.detail-calendar-card{background:#fff;border-radius:20px;padding:15px;box-shadow:0 1px 2px rgba(0,0,0,.04)}\
.detail-cal-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}\
.detail-cal-title{font-size:17px;font-weight:800}\
.detail-cal-nav{border:0;background:#f2f4f6;border-radius:11px;width:36px;height:34px;font-size:18px;color:#4e5863}\
.detail-week,.detail-days{display:grid;grid-template-columns:repeat(7,1fr);gap:5px}\
.detail-week{margin-bottom:5px;color:#8a929c;font-size:11px;text-align:center}\
.detail-day{aspect-ratio:1;border:0;border-radius:7px;background:#eef0f2;color:#7b838d;font-size:13px;padding:0;display:grid;place-items:center;position:relative}\
.detail-day.blank{visibility:hidden}\
.detail-day.done1{background:#87d8c3;color:#114d3f;font-weight:700}\
.detail-day.done2{background:#27ae8b;color:#fff;font-weight:800}\
.detail-day.has-log{cursor:pointer}\
.detail-complete{font-size:17px;font-weight:800;padding:2px 4px 0}\
.detail-pop{position:fixed;z-index:9999;background:#20252b;color:#fff;border-radius:12px;padding:9px 12px;min-width:105px;max-width:190px;font-size:13px;box-shadow:0 5px 18px rgba(0,0,0,.22);transform:translate(-50%,-100%);pointer-events:none}\
.detail-pop-date{font-weight:700;margin-bottom:4px}.detail-pop-time{white-space:nowrap}\
';
  document.head.appendChild(style);

  function ensureScreen(){
    var s=document.getElementById('routineDetail');
    if(s)return s;
    s=document.createElement('main');s.id='routineDetail';s.className='screen';
    s.innerHTML='<div class="routine-detail-wrap"><div class="detail-summary"><div id="detailRing" class="detail-ring"></div><div id="detailRoutineName" class="detail-routine-name"></div></div><div class="detail-calendar-card"><div class="detail-cal-head"><button id="detailPrevMonth" class="detail-cal-nav" type="button">‹</button><div id="detailMonthTitle" class="detail-cal-title"></div><button id="detailNextMonth" class="detail-cal-nav" type="button">›</button></div><div class="detail-week"><div>日</div><div>月</div><div>火</div><div>水</div><div>木</div><div>金</div><div>土</div></div><div id="detailDays" class="detail-days"></div></div><div id="detailCompleteCount" class="detail-complete"></div></div>';
    var timer=document.getElementById('timer');
    if(timer&&timer.parentNode)timer.parentNode.insertBefore(s,timer);else document.querySelector('.app').appendChild(s);
    document.getElementById('detailPrevMonth').onclick=function(){viewDate=new Date(viewDate.getFullYear(),viewDate.getMonth()-1,1);renderDetail()};
    document.getElementById('detailNextMonth').onclick=function(){viewDate=new Date(viewDate.getFullYear(),viewDate.getMonth()+1,1);renderDetail()};
    return s;
  }

  function getMenu(){
    if(typeof state==='undefined'||!state||!Array.isArray(state.menus))return null;
    return state.menus.find(function(m){return m.id===detailMenuId})||null;
  }
  function logs(m){return Array.isArray(m&&m.completions)?m.completions.filter(function(x){return Number.isFinite(+x)}).map(Number):[]}
  function dayKey(ts){var d=new Date(ts);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
  function monthMap(m,y,mo){var map={};logs(m).forEach(function(ts){var d=new Date(ts);if(d.getFullYear()!==y||d.getMonth()!==mo)return;var k=dayKey(ts);(map[k]||(map[k]=[])).push(ts)});return map}
  function closePop(){var p=document.getElementById('detailPop');if(p)p.remove()}
  function showPop(btn,times){
    closePop();if(!times||!times.length)return;
    var p=document.createElement('div');p.id='detailPop';p.className='detail-pop';
    var d=new Date(times[0]);var html='<div class="detail-pop-date">'+(d.getMonth()+1)+'月'+d.getDate()+'日</div>';
    times.sort(function(a,b){return a-b}).forEach(function(ts){var x=new Date(ts);html+='<div class="detail-pop-time">'+String(x.getHours()).padStart(2,'0')+':'+String(x.getMinutes()).padStart(2,'0')+'</div>'});
    p.innerHTML=html;document.body.appendChild(p);
    var r=btn.getBoundingClientRect(),w=Math.min(190,Math.max(105,p.getBoundingClientRect().width));var x=Math.max(w/2+8,Math.min(innerWidth-w/2-8,r.left+r.width/2));
    p.style.left=x+'px';p.style.top=(r.top-8)+'px';
    setTimeout(function(){document.addEventListener('pointerdown',closePop,{once:true,capture:true})},0);
  }

  function renderDetail(){
    ensureScreen();var m=getMenu();if(!m)return;
    closePop();document.getElementById('detailRoutineName').textContent=m.name||'ルーティン';
    var y=viewDate.getFullYear(),mo=viewDate.getMonth(),daysInMonth=new Date(y,mo+1,0).getDate(),map=monthMap(m,y,mo);
    var activeDays=Object.keys(map).length,pct=daysInMonth?activeDays/daysInMonth:0;
    document.getElementById('detailRing').style.setProperty('--p',(pct*360)+'deg');
    document.getElementById('detailRing').title=Math.round(pct*100)+'%';
    document.getElementById('detailMonthTitle').textContent=y+'年 '+(mo+1)+'月';
    var box=document.getElementById('detailDays');box.innerHTML='';
    var first=new Date(y,mo,1).getDay();for(var i=0;i<first;i++){var blank=document.createElement('div');blank.className='detail-day blank';box.appendChild(blank)}
    for(var day=1;day<=daysInMonth;day++){
      var k=y+'-'+String(mo+1).padStart(2,'0')+'-'+String(day).padStart(2,'0'),arr=map[k]||[];
      var b=document.createElement('button');b.type='button';b.className='detail-day'+(arr.length>=2?' done2':arr.length===1?' done1':'')+(arr.length?' has-log':'');b.textContent=day;
      if(arr.length)(function(btn,t){btn.onclick=function(e){e.stopPropagation();showPop(btn,t.slice())}})(b,arr);
      box.appendChild(b);
    }
    document.getElementById('detailCompleteCount').textContent='完走 '+logs(m).length+'回';
  }

  function openDetail(id){
    detailMenuId=id;viewDate=new Date();ensureScreen();
    if(typeof currentMenuId!=='undefined')currentMenuId=id;
    if(typeof show==='function')show('routineDetail','カレンダー');
    renderDetail();window.scrollTo(0,0);
  }
  window.openRoutineDetail=openDetail;

  function decorateDots(){
    document.querySelectorAll('.menu-card').forEach(function(card){
      var b=card.querySelector('.edit');if(!b)return;
      if(b.textContent!=='⋯')b.textContent='⋯';
      if(b.getAttribute('aria-label')!=='ルーティン設定')b.setAttribute('aria-label','ルーティン設定');
      b.title='ルーティン設定';
    });
  }
  var prevHome=typeof renderHome==='function'?renderHome:null;
  if(prevHome){renderHome=function(){var r=prevHome.apply(this,arguments);setTimeout(decorateDots,0);return r}}
  setTimeout(decorateDots,0);

  document.addEventListener('click',function(e){
    var card=e.target&&e.target.closest?e.target.closest('.menu-card'):null;if(!card||!card.dataset.id)return;
    var id=card.dataset.id;
    var button=e.target.closest('button');
    if(button&&button.classList.contains('edit')){
      e.preventDefault();e.stopImmediatePropagation();
      if(typeof openMenu==='function')openMenu(id);
      return;
    }
    if(button)return;
    e.preventDefault();e.stopImmediatePropagation();openDetail(id);
  },true);

  if(typeof finishTimer==='function'){
    var originalFinish=finishTimer;
    finishTimer=function(){
      try{
        if(typeof state!=='undefined'&&state&&Array.isArray(state.menus)&&typeof currentMenuId!=='undefined'){
          var m=state.menus.find(function(x){return x.id===currentMenuId});
          if(m){if(!Array.isArray(m.completions))m.completions=[];m.completions.push(Date.now());if(typeof save==='function')save()}
        }
      }catch(err){console.error(err)}
      return originalFinish.apply(this,arguments);
    };
  }
})();
