(function(){
  if(window.__graphPinchV71)return;
  window.__graphPinchV71=true;

  var zoom=1;
  var pinch=null;

  var style=document.createElement('style');
  style.setAttribute('data-graph-pinch-v71','');
  style.textContent='\
#detailTimeGraph{overflow-x:auto;overflow-y:visible;-webkit-overflow-scrolling:touch;overscroll-behavior-x:contain;touch-action:pan-x pan-y}\
#detailTimeGraph .detail-time-chart{max-width:none!important;min-width:100%;height:auto}\
';
  document.head.appendChild(style);

  function daysInCurrentMonth(){
    var title=document.getElementById('detailMonthTitle');
    if(!title)return 31;
    var m=title.textContent.match(/(\d{4})年\s*(\d{1,2})月/);
    if(!m)return 31;
    return new Date(+m[1],+m[2],0).getDate();
  }

  function maxZoom(){return Math.max(1,daysInCurrentMonth()/15)}
  function clamp(v){return Math.max(1,Math.min(maxZoom(),v))}
  function distance(a,b){var dx=a.clientX-b.clientX,dy=a.clientY-b.clientY;return Math.sqrt(dx*dx+dy*dy)}
  function midpointX(a,b){return (a.clientX+b.clientX)/2}

  function applyZoom(box,svg,newZoom,anchorClientX,anchorContentX){
    newZoom=clamp(newZoom);
    zoom=newZoom;
    svg.style.width=(zoom*100)+'%';

    if(anchorClientX!=null&&anchorContentX!=null){
      var r=box.getBoundingClientRect();
      var scale=zoom/(pinch&&pinch.startZoom||zoom);
      var wanted=anchorContentX*scale-(anchorClientX-r.left);
      var maxScroll=Math.max(0,box.scrollWidth-box.clientWidth);
      box.scrollLeft=Math.max(0,Math.min(maxScroll,wanted));
    }
  }

  function wire(){
    var box=document.getElementById('detailTimeGraph');
    var svg=box&&box.querySelector('.detail-time-chart');
    if(!box||!svg)return;

    if(box.dataset.pinchZoomReady==='1'){
      svg.style.width=(clamp(zoom)*100)+'%';
      return;
    }
    box.dataset.pinchZoomReady='1';
    svg.style.width=(clamp(zoom)*100)+'%';

    box.addEventListener('touchstart',function(e){
      if(e.touches.length!==2)return;
      var d=distance(e.touches[0],e.touches[1]);
      if(!d)return;
      var mid=midpointX(e.touches[0],e.touches[1]);
      var r=box.getBoundingClientRect();
      pinch={
        startDist:d,
        startZoom:zoom,
        midClientX:mid,
        anchorContentX:box.scrollLeft+(mid-r.left)
      };
    },{passive:true});

    box.addEventListener('touchmove',function(e){
      if(!pinch||e.touches.length!==2)return;
      if(e.cancelable)e.preventDefault();
      var d=distance(e.touches[0],e.touches[1]);
      if(!d)return;
      var next=clamp(pinch.startZoom*(d/pinch.startDist));
      var mid=midpointX(e.touches[0],e.touches[1]);
      applyZoom(box,svg,next,mid,pinch.anchorContentX);
    },{passive:false});

    function endPinch(e){
      if(!pinch)return;
      if(!e.touches||e.touches.length<2)pinch=null;
    }
    box.addEventListener('touchend',endPinch,{passive:true});
    box.addEventListener('touchcancel',function(){pinch=null},{passive:true});
  }

  function resetForMonth(){
    zoom=1;pinch=null;
    var box=document.getElementById('detailTimeGraph');
    if(box)box.scrollLeft=0;
    setTimeout(wire,30);
  }

  var monthTitle=document.getElementById('detailMonthTitle');
  if(monthTitle){
    new MutationObserver(resetForMonth).observe(monthTitle,{childList:true,characterData:true,subtree:true});
  }

  var detail=document.getElementById('routineDetail');
  if(detail){
    new MutationObserver(function(){setTimeout(wire,0)}).observe(detail,{childList:true,subtree:true});
  }

  document.addEventListener('click',function(e){
    if(e.target&&e.target.closest&&e.target.closest('.record-btn'))setTimeout(wire,80);
  },true);

  setTimeout(wire,120);
})();
