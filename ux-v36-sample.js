(function(){
  var FLAG='stretchTimer.sampleRoutine5.v67';
  if(localStorage.getItem(FLAG)==='done')return;

  function isTarget(m){
    var name=String(m&&m.name||'').trim();
    return name==='ルーティン5'||name==='メニュー5';
  }

  function addDay(m,y,mo,day,count,morning){
    var first=morning[(day-1)%morning.length];
    var slots=[first,[18,12+(day*7)%38],[12,18+(day*11)%32],[21,4+(day*13)%41]];
    for(var i=0;i<count;i++){
      var hm=slots[i]||[22,10+i];
      m.completions.push(new Date(y,mo,day,hm[0],hm[1],0,0).getTime());
    }
  }

  function seedMonth(m,y,mo,lastDay,skip,special,morning){
    for(var day=1;day<=lastDay;day++){
      if(skip[day])continue;
      var count=Object.prototype.hasOwnProperty.call(special,day)?special[day]:2;
      addDay(m,y,mo,day,count,morning);
    }
  }

  function seed(){
    try{
      if(typeof state==='undefined'||!state||!Array.isArray(state.menus))return false;
      var m=state.menus.find(isTarget);
      if(!m)return false;

      if(!Array.isArray(m.completions))m.completions=[];

      // テスト用の2026年7月・8月だけを作り直す。
      m.completions=m.completions.filter(function(ts){
        var d=new Date(+ts);
        return !(d.getFullYear()===2026&&(d.getMonth()===6||d.getMonth()===7));
      });

      var morning=[[7,12],[7,28],[6,58],[7,41],[8,6],[7,19],[7,53],[8,22],[7,34],[6,49],[7,16],[8,3],[7,45],[7,8],[8,31],[7,24],[7,57],[8,11],[7,38],[6,55],[7,29],[8,18],[7,6],[7,51],[8,27],[7,33],[6,52],[7,21],[8,8],[7,47],[7,14]];

      seedMonth(
        m,2026,6,31,
        {5:true,13:true,22:true,30:true},
        {3:1,7:3,11:1,16:1,19:4,24:1,27:3},
        morning
      );

      var now=new Date(),lastAug=(now.getFullYear()===2026&&now.getMonth()===7)?now.getDate():18;
      lastAug=Math.max(1,Math.min(31,lastAug));
      seedMonth(
        m,2026,7,lastAug,
        {4:true,10:true,15:true},
        {2:1,6:3,8:1,12:1,14:4,18:3},
        morning
      );

      m.completions.sort(function(a,b){return a-b});
      localStorage.setItem(FLAG,'done');
      if(typeof save==='function')save();
      return true;
    }catch(e){console.error('sample routine seed failed',e);return false}
  }

  if(!seed())setTimeout(seed,800);
})();
