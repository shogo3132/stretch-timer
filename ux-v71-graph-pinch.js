(function(){
  if(window.__graphPinchV72)return;
  window.__graphPinchV72=true;

  var zoom=1;
  var pointers={};
  var pinch=null;
  var pan=null;

  var style=document.createElement('style');
  style.setAttribute('data-graph-pinch-v72','');
  style.textContent='\
#detailTimeGraph{overflow-x:auto;overflow-y:visible;-webkit-overflow-scrolling:touch;overscroll-behavior-x:contain;touch-action:pan-y}\
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
  function activePoints(){return Object.keys(pointers).map(function(k){return pointers[k]})}
  function distance(a,b){var dx=a.x-b.x,dy=a.y-b.y;return Math.sqrt(dx*dx+dy*dy)}
  function midpointX(a,b){return (a.x+b.x)/2}
  function currentSvg(box){return box&&box.querySelector('.detail-time-chart')}

  function applyZoom(box,newZoom,anchorClientX,anchorRatio){
    var svg=currentSvg(box);if(!svg)return;
    zoom=clamp(newZoom);
    svg.style.width=(zoom*100)+'%';
    if(anchorClientX==null||anchorRatio==null)return;
    var r=box.getBoundingClientRect();
    var contentX=anchorRatio*box.scrollWidth;
    var wanted=contentX-(anchorClientX-r.left);
    var maxScroll=Math.max(0,box.scrollWidth-box.clientWidth);
    box.scrollLeft=Math.max(0,Math.min(maxScroll,wanted));
  }

  function wire(){
    var box=document.getElementById('detailTimeGraph');
    var svg=currentSvg(box);
    if(!box||!svg)return;
    svg.style.width=(clamp(zoom)*100)+'%';
    if(box.dataset.pinchZoomReady==='1')return;
    box.dataset.pinchZoomReady='1';

    box.addEventListener('pointerdown',function(e){
      if(e.pointerType!=='touch')return;
      pointers[e.pointerId]={x:e.clientX,y:e.clientY};
      try{box.setPointerCapture(e.pointerId)}catch(_){}
      var pts=activePoints();
      if(pts.length===1&&zoom>1){
        pan={id:e.pointerId,startX:e.clientX,startScroll:box.scrollLeft};
      }else if(pts.length===2){
        pan=null;
        var d=distance(pts[0],pts[1]);
        if(!d)return;
        var mid=midpointX(pts[0],pts[1]);
        var r=box.getBoundingClientRect();
        pinch={startDist:d,startZoom:zoom,anchorClientX:mid,anchorRatio:(box.scrollLeft+(mid-r.left))/Math.max(1,box.scrollWidth)};
      }
    });

    box.addEventListener('pointermove',function(e){
      if(e.pointerType!=='touch'||!pointers[e.pointerId])return;
      pointers[e.pointerId]={x:e.clientX,y:e.clientY};
      var pts=activePoints();
      if(pts.length>=2&&pinch){
        if(e.cancelable)e.preventDefault();
        var d=distance(pts[0],pts[1]);
        if(!d)return;
        var mid=midpointX(pts[0],pts[1]);
        applyZoom(box,pinch.startZoom*(d/pinch.startDist),mid,pinch.anchorRatio);
      }else if(pts.length===1&&pan&&pan.id===e.pointerId&&zoom>1){
        if(e.cancelable)e.preventDefault();
        box.scrollLeft=pan.startScroll-(e.clientX-pan.startX);
      }
    },{passive:false});

    function release(e){
      delete pointers[e.pointerId];
      var pts=activePoints();
      if(pts.length<2)pinch=null;
      if(pts.length===1&&zoom>1){
        var ids=Object.keys(pointers),p=pointers[ids[0]];
        pan={id:+ids[0],startX:p.x,startScroll:box.scrollLeft};
      }else if(!pts.length){pan=null}
    }
    box.addEventListener('pointerup',release);
    box.addEventListener('pointercancel',release);
  }

  function resetForMonth(){
    zoom=1;pointers={};pinch=null;pan=null;
    var box=document.getElementById('detailTimeGraph');
    if(box)box.scrollLeft=0;
    setTimeout(wire,30);
  }

  function watch(){
    var monthTitle=document.getElementById('detailMonthTitle');
    if(monthTitle&&monthTitle.dataset.pinchMonthWatch!=='1'){
      monthTitle.dataset.pinchMonthWatch='1';
      new MutationObserver(resetForMonth).observe(monthTitle,{childList:true,characterData:true,subtree:true});
    }
    var detail=document.getElementById('routineDetail');
    if(detail&&detail.dataset.pinchGraphWatch!=='1'){
      detail.dataset.pinchGraphWatch='1';
      new MutationObserver(function(){setTimeout(wire,0)}).observe(detail,{childList:true,subtree:true});
    }
    wire();
  }

  document.addEventListener('click',function(e){
    if(e.target&&e.target.closest&&e.target.closest('.record-btn'))setTimeout(watch,80);
  },true);
  setTimeout(watch,120);
})();
