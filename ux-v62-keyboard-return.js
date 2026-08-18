(function(){
  if(window.__keyboardReturnV62)return;
  window.__keyboardReturnV62=true;

  var returning=false;

  function returnToWheel(input){
    if(returning||!input||!input.isConnected)return;
    var field=input.closest('.item-time-field');
    var mode=field&&field.querySelector('.item-time-mode');
    if(!mode)return;
    returning=true;
    setTimeout(function(){
      try{
        if(input.isConnected&&mode.isConnected)mode.click();
      }finally{
        setTimeout(function(){returning=false},0);
      }
    },40);
  }

  document.addEventListener('change',function(e){
    if(e.target&&e.target.classList&&e.target.classList.contains('item-time-input'))returnToWheel(e.target);
  },true);

  document.addEventListener('focusout',function(e){
    if(e.target&&e.target.classList&&e.target.classList.contains('item-time-input'))returnToWheel(e.target);
  },true);
})();
