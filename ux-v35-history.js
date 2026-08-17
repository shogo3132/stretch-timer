(function(){
  if(window.__executionTimeGraphV37)return;
  window.__executionTimeGraphV37=true;

  var NS='http://www.w3.org/2000/svg';
  var style=document.createElement('style');
  style.setAttribute('data-execution-time-graph-v37','');
  style.textContent='\
.detail-time-card{background:#fff;border-radius:20px;padding:15px 14px 12px;box-shadow:0 1px 2px rgba(0,0,0,.04);overflow:visible}\
.detail-time-head{display:flex;align-items:baseline;justify-content:space-between;gap:10px;margin-bottom:8px}\
.detail-time-title{font-size:17px;font-weight:800;color:#1b1f24}\
.detail-time-empty{height:207px;display:grid;place-items:center;color:#9aa1aa;font-size:13px}\
.detail-time-chart{display:block;width:100%;height:auto;overflow:visible}\
.detail-time-grid{stroke:#e8ecef;stroke-width:1}\
.detail-time-axis{fill:#8a929c;font-size:13px;font-weight:400;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}\
.detail-time-line{fill:none;stroke:#27ae8b;stroke-width:2.6;stroke-linecap:round;stroke-linejoin:round}\
.detail-time-dot{fill:#fff;stroke:#27ae8b;stroke-width:2.2;cursor:pointer;touch-action:manipulation}\
';
  document.head.appendChild(style);

  function svgEl(name,attrs,text){
    var el=document.createElementNS(NS,name);
    Object.keys(attrs||{}).forEach(function(k){el.setAttribute(k,attrs[k])});
    if(text!=null)el.textContent=text;
    return el;
  }

  function currentMonth(){
    var title=document.getElementById('detailMonthTitle');
    if(!title)return null;
    var m=title.textContent.match(/(\d{4})年\s*(\d{1,2})月/);
    return m?{year:+m[1],month:+m[2]-1}:null;
  }

  function menuNow(){
    if(typeof state==='undefined'||!state||!Array.isArray(state.menus)||typeof currentMenuId==='undefined')return null;
    return state.menus.find(function(m){return m.id===currentMenuId})||null;
  }

  function ensureCard(){
    var count=document.getElementById('detailCompleteCount');
    if(!count||!count.parentNode)return null;
    var card=document.getElementById('detailTimeCard');
    if(card)return card;
    card=document.createElement('div');
    card.id='detailTimeCard';card.className='detail-time-card';
    card.innerHTML='<div class="detail-time-head"><div class="detail-time-title">実行時間</div></div><div id="detailTimeGraph"></div>';
    count.insertAdjacentElement('afterend',card);
    return card;
  }

  function dayNumber(ts){var d=new Date(ts);return Math.floor(new Date(d.getFullYear(),d.getMonth(),d.getDate()).getTime()/86400000)}
  function hourValue(ts){var d=new Date(ts);return d.getHours()+d.getMinutes()/60+d.getSeconds()/3600}
  function fmtTime(ts){var d=new Date(ts);return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')}

  function bounds(points){
    var vals=points.map(function(p){return p.hour}),min=Math.min.apply(null,vals),max=Math.max.apply(null,vals);
    var lo=Math.max(0,Math.floor((min-1)/2)*2),hi=Math.min(24,Math.ceil((max+1)/2)*2);
    if(hi-lo<6){var mid=(hi+lo)/2;lo=Math.max(0,Math.floor(mid-3));hi=Math.min(24,lo+6);lo=Math.max(0,hi-6)}
    if(hi===lo)hi=Math.min(24,lo+1);
    return {lo:lo,hi:hi};
  }

  function closePointPop(){var p=document.getElementById('detailTimePop');if(p)p.remove()}
  function showPointPop(dot,p){
    closePointPop();
    var pop=document.createElement('div');pop.id='detailTimePop';pop.className='detail-pop';
    pop.innerHTML='<div class="detail-pop-date">'+(p.month+1)+'月'+p.day+'日</div><div class="detail-pop-time">'+fmtTime(p.ts)+'</div>';
    document.body.appendChild(pop);
    var r=dot.getBoundingClientRect(),w=Math.min(190,Math.max(105,pop.getBoundingClientRect().width));
    var x=Math.max(w/2+8,Math.min(innerWidth-w/2-8,r.left+r.width/2));
    pop.style.left=x+'px';pop.style.top=(r.top-8)+'px';
    setTimeout(function(){document.addEventListener('pointerdown',closePointPop,{once:true,capture:true})},0);
  }

  function render(){
    var card=ensureCard(),box=document.getElementById('detailTimeGraph'),m=menuNow(),vm=currentMonth();
    if(!card||!box||!m||!vm)return;
    closePointPop();
    var daysInMonth=new Date(vm.year,vm.month+1,0).getDate();
    var logs=Array.isArray(m.completions)?m.completions.filter(function(x){var d=new Date(+x);return Number.isFinite(+x)&&d.getFullYear()===vm.year&&d.getMonth()===vm.month}).map(Number).sort(function(a,b){return a-b}):[];
    box.innerHTML='';
    if(!logs.length){box.innerHTML='<div class="detail-time-empty">この月の実行記録はありません</div>';return}

    var pts=logs.map(function(ts){var d=new Date(ts);return {ts:ts,day:d.getDate(),month:d.getMonth(),serial:dayNumber(ts),hour:hourValue(ts)}}),b=bounds(pts);
    var W=640,H=330,L=58,R=14,T=16,B=42,pw=W-L-R,ph=H-T-B;
    function x(day){return L+(day-1)/(Math.max(1,daysInMonth-1))*pw}
    function y(hour){return T+(hour-b.lo)/(b.hi-b.lo)*ph}

    var svg=svgEl('svg',{viewBox:'0 0 '+W+' '+H,class:'detail-time-chart','aria-label':'日ごとの実行時間グラフ',role:'img'});
    var tickCount=3;
    for(var i=0;i<=tickCount;i++){
      var hv=b.lo+(b.hi-b.lo)*i/tickCount,yy=y(hv);
      svg.appendChild(svgEl('line',{x1:L,y1:yy,x2:W-R,y2:yy,class:'detail-time-grid'}));
      svg.appendChild(svgEl('text',{x:L-10,y:yy+4,'text-anchor':'end',class:'detail-time-axis'},String(Math.round(hv))+':00'));
    }

    var xticks=[1,5,10,15,20,25,daysInMonth].filter(function(v,idx,a){return v<=daysInMonth&&a.indexOf(v)===idx});
    xticks.forEach(function(day){svg.appendChild(svgEl('text',{x:x(day),y:H-10,'text-anchor':'middle',class:'detail-time-axis'},String(day)))});

    var dstr='';
    pts.forEach(function(p,idx){
      var px=x(p.day),py=y(p.hour),prev=idx?pts[idx-1]:null;
      if(!prev||p.serial-prev.serial>1)dstr+='M'+px.toFixed(1)+' '+py.toFixed(1);
      else dstr+=' L'+px.toFixed(1)+' '+py.toFixed(1);
    });
    svg.appendChild(svgEl('path',{d:dstr,class:'detail-time-line'}));
    pts.forEach(function(p){
      var c=svgEl('circle',{cx:x(p.day),cy:y(p.hour),r:5.2,class:'detail-time-dot',tabindex:'0','aria-label':p.day+'日 '+fmtTime(p.ts)});
      c.addEventListener('click',function(e){e.stopPropagation();showPointPop(c,p)});
      c.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();showPointPop(c,p)}});
      svg.appendChild(c);
    });
    box.appendChild(svg);
  }

  function wireMonthObserver(){
    var title=document.getElementById('detailMonthTitle');
    if(!title||title.dataset.timeGraphWatch==='1')return;
    title.dataset.timeGraphWatch='1';
    new MutationObserver(function(){setTimeout(render,0)}).observe(title,{childList:true,characterData:true,subtree:true});
  }

  var oldShow=typeof show==='function'?show:null;
  if(oldShow){
    show=function(){
      var r=oldShow.apply(this,arguments);
      if(arguments[0]==='routineDetail')setTimeout(function(){wireMonthObserver();render()},0);
      return r;
    };
  }

  document.addEventListener('click',function(e){
    if(e.target&&e.target.closest&&e.target.closest('.record-btn'))setTimeout(function(){wireMonthObserver();render()},40);
  },true);
})();
