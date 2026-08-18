(function(){
  if(window.__videoReferenceV86)return;
  window.__videoReferenceV86=true;

  var style=document.createElement('style');
  style.setAttribute('data-video-reference-v86','');
  style.textContent='\
body.timer-active .timer-video-row{display:flex;justify-content:center;margin:2px 0 0}\
body.timer-active .timer-video-link{display:inline-flex;align-items:center;justify-content:center;gap:6px;min-height:36px;padding:7px 13px;border:1px solid #dfe5e9;border-radius:12px;background:#f7f8fa;color:#53606c;font-size:13px;font-weight:700;text-decoration:none;cursor:pointer;-webkit-tap-highlight-color:transparent}\
body.timer-active .timer-video-link:active{background:#edf1f3}\
body.timer-active .timer-video-link svg{width:16px;height:16px;display:block;fill:#e74c3c}\
';
  document.head.appendChild(style);

  function validYouTubeUrl(value){
    if(!value)return '';
    try{
      var u=new URL(String(value).trim()),host=u.hostname.toLowerCase().replace(/^www\./,'');
      if(u.protocol!=='https:')return '';
      if(host==='youtu.be'||host==='youtube.com'||host.endsWith('.youtube.com')||host==='youtube-nocookie.com'||host.endsWith('.youtube-nocookie.com'))return u.href;
    }catch(e){}
    return '';
  }

  function currentVideoUrl(){
    try{
      if(!timerState||timerState.phase!=='item')return '';
      var m=typeof menu==='function'?menu():null,x=m&&Array.isArray(m.items)?m.items[timerState.index]:null;
      return validYouTubeUrl(x&&x.videoUrl);
    }catch(e){return ''}
  }

  function openVideo(url){
    if(!timerState)return;
    timerState.paused=true;
    if(typeof renderTimer==='function')renderTimer();
    if(/StretchTimerApp\//.test(navigator.userAgent)){
      window.location.href=url;
      return;
    }
    var opened=window.open(url,'_blank','noopener');
    if(!opened)window.location.href=url;
  }

  function decorate(){
    var url=currentVideoUrl(),box=document.getElementById('timerContent');
    if(!url||!box||box.querySelector('.timer-video-link'))return;
    var row=document.createElement('div');row.className='timer-video-row';
    var link=document.createElement('button');link.type='button';link.className='timer-video-link';
    link.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21.6 7.2a3 3 0 0 0-2.1-2.1C17.6 4.6 12 4.6 12 4.6s-5.6 0-7.5.5a3 3 0 0 0-2.1 2.1A31 31 0 0 0 2 12a31 31 0 0 0 .4 4.8 3 3 0 0 0 2.1 2.1c1.9.5 7.5.5 7.5.5s5.6 0 7.5-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 22 12a31 31 0 0 0-.4-4.8ZM10 15.5v-7l6 3.5-6 3.5Z"/></svg><span>参考動画</span>';
    link.setAttribute('aria-label','参考動画を開いて一時停止');
    link.onclick=function(){openVideo(url)};
    row.appendChild(link);
    var meta=box.querySelector('.compact-meta');
    if(meta)meta.insertBefore(row,meta.querySelector('.timer-count'));
    else box.appendChild(row);
  }

  var previousRender=typeof renderTimer==='function'?renderTimer:null;
  if(previousRender)renderTimer=function(){var result=previousRender.apply(this,arguments);decorate();return result};
  window.__stretchTimerValidYouTubeUrlV86=validYouTubeUrl;
  window.__stretchTimerOpenVideoV86=openVideo;
  decorate();
})();
