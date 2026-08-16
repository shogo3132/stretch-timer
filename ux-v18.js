(function(){
  function uid2(){return typeof uid==='function'?uid():(Date.now()+Math.random().toString(16).slice(2))}
  function currentMenu(){try{return typeof menu==='function'?menu():null}catch(e){return null}}

  function reveal(selector,id){
    setTimeout(function(){
      var card=document.querySelector(selector+'[data-id="'+id+'"]');
      if(!card)return;
      card.classList.remove('card-added');void card.offsetWidth;card.classList.add('card-added');
      if(card.scrollIntoView)card.scrollIntoView({behavior:'smooth',block:'nearest'});
      setTimeout(function(){card.classList.remove('card-added')},280);
    },50);
  }

  function addRoutine(){
    if(typeof state==='undefined'||!state||!Array.isArray(state.menus))return;
    var id=uid2();
    state.menus.push({id:id,name:'ルーティン'+(state.menus.length+1),desc:'',rest:15,items:[]});
    if(typeof save==='function')save();
    if(typeof renderHome==='function')renderHome();
    reveal('.menu-card',id);
  }

  function addItem(){
    var m=currentMenu();if(!m||!Array.isArray(m.items))return;
    var id=uid2();
    m.items.push({id:id,name:'新しい種目',seconds:30,desc:'',photo:''});
    if(typeof save==='function')save();
    if(typeof renderItems==='function')renderItems();
    if(typeof updateDuration==='function')updateDuration();
    reveal('.item',id);
  }

  function deleteRoutineById(id){
    if(typeof state==='undefined'||!state||!Array.isArray(state.menus))return;
    var i=state.menus.findIndex(function(x){return x.id===id});if(i<0)return;
    state.menus.splice(i,1);
    if(typeof save==='function')save();
    if(typeof renderHome==='function')renderHome();
  }

  function deleteItemById(id){
    var m=currentMenu();if(!m||!Array.isArray(m.items))return;
    var i=m.items.findIndex(function(x){return x.id===id});if(i<0)return;
    m.items.splice(i,1);
    if(typeof save==='function')save();
    if(typeof renderItems==='function')renderItems();
    if(typeof updateDuration==='function')updateDuration();
  }

  function deleteCurrentRoutine(){
    if(typeof currentMenuId==='undefined')return;
    deleteRoutineById(currentMenuId);
  }

  function deleteCurrentItem(){
    if(typeof currentItemId==='undefined')return;
    var id=currentItemId;
    deleteItemById(id);
    if(typeof openMenu==='function'&&typeof currentMenuId!=='undefined')openMenu(currentMenuId);
  }

  document.addEventListener('click',function(e){
    var t=e.target&&e.target.closest?e.target.closest('button'):null;
    if(!t)return;

    if(t.id==='addMenuHome'){
      e.preventDefault();e.stopImmediatePropagation();addRoutine();return;
    }
    if(t.id==='addItemBtn'){
      e.preventDefault();e.stopImmediatePropagation();addItem();return;
    }
    if(t.classList.contains('swipe-delete')){
      var card=t.closest('.menu-card,.item');if(!card)return;
      e.preventDefault();e.stopImmediatePropagation();
      if(card.classList.contains('menu-card'))deleteRoutineById(card.dataset.id);
      else deleteItemById(card.dataset.id);
      return;
    }
    if(t.id==='deleteMenuBtn'){
      e.preventDefault();e.stopImmediatePropagation();deleteCurrentRoutine();return;
    }
    if(t.id==='deleteItemBtn'){
      e.preventDefault();e.stopImmediatePropagation();deleteCurrentItem();return;
    }
  },true);
})();
