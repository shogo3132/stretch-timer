(function(){
  var FLAG='stretchTimer.sampleRoutine5.v36';
  if(localStorage.getItem(FLAG)==='done')return;

  function keyOf(ts){
    var d=new Date(ts);
    return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  }

  function seed(){
    try{
      if(typeof state==='undefined'||!state||!Array.isArray(state.menus))return false;
      var m=state.menus.find(function(x){return String(x&&x.name||'').trim()==='ルーティン5'});
      if(!m)return false;

      var now=new Date();
      var y=now.getFullYear(),mo=now.getMonth(),today=now.getDate();
      var skip={4:true,10:true,15:true};
      var morning=[[7,12],[7,28],[6,58],[7,41],[8,6],[7,19],[7,53],[8,22],[7,34],[6,49],[7,16],[8,3],[7,45],[7,8],[8,31],[7,24],[7,57],[8,11],[7,38],[6,55],[7,29],[8,18],[7,6],[7,51],[8,27],[7,33],[6,52],[7,21],[8,8],[7,47],[7,14]];
      if(!Array.isArray(m.completions))m.completions=[];
      var existing={};m.completions.forEach(function(ts){existing[keyOf(+ts)]=true});
      var added=0;
      for(var day=1;day<=today;day++){
        if(skip[day])continue;
        var k=y+'-'+String(mo+1).padStart(2,'0')+'-'+String(day).padStart(2,'0');
        if(existing[k])continue;
        var hm=morning[(day-1)%morning.length];
        m.completions.push(new Date(y,mo,day,hm[0],hm[1],0,0).getTime());
        added++;
      }
      m.completions.sort(function(a,b){return a-b});
      localStorage.setItem(FLAG,'done');
      if(added&&typeof save==='function')save();
      return true;
    }catch(e){console.error('sample routine seed failed',e);return false}
  }

  if(!seed())setTimeout(seed,600);
})();
