(function(){
  if(window.__overnightCompletionV131)return;
  window.__overnightCompletionV131=true;

  var previousFinish=typeof finishTimer==='function'?finishTimer:null;
  if(!previousFinish)return;

  function menuById(id){
    try{return state&&Array.isArray(state.menus)?state.menus.find(function(m){return m.id===id}):null}catch(e){return null}
  }
  function previousDayEnd(now){
    var d=new Date(now);
    d.setDate(d.getDate()-1);
    d.setHours(23,59,0,0);
    return d.getTime();
  }
  function label(ts){
    var d=new Date(ts);
    return (d.getMonth()+1)+'/'+d.getDate()+' 23:59';
  }

  finishTimer=function(){
    var completedAt=Date.now(),menuId=currentMenuId;
    var result=previousFinish.apply(this,arguments);
    var now=new Date(completedAt);
    if(now.getHours()>=4)return result;

    var m=menuById(menuId),logs=m&&Array.isArray(m.completions)?m.completions:null;
    if(!logs||!logs.length)return result;
    var logIndex=logs.length-1,originalTs=logs[logIndex],previousTs=previousDayEnd(completedAt);
    var box=document.getElementById('timerContent'),actions=box&&box.querySelector('.finish-actions');
    if(!actions)return result;

    var button=document.createElement('button');
    button.type='button';
    button.className='btn sub';
    var moved=false;
    function draw(){
      button.textContent=moved?'前日分として記録済み（取り消す）':'前日分として記録する（'+label(previousTs)+'）';
    }
    button.onclick=function(){
      var latest=menuById(menuId),list=latest&&Array.isArray(latest.completions)?latest.completions:null;
      if(!list||logIndex<0||logIndex>=list.length)return;
      moved=!moved;
      list[logIndex]=moved?previousTs:originalTs;
      if(typeof save==='function')save();
      draw();
    };
    draw();
    actions.insertBefore(button,actions.firstChild);
    return result;
  };
})();
