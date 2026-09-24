(function(){
var B=document.currentScript.dataset.base||'/',S=window.localStorage;
/* ---- MUSICA EM LOOP ---- */
var a=new Audio(B+'assets/audio/fundo.mp3');a.loop=true;a.volume=.5;
var b=document.createElement('button');b.className='tag musica';document.body.appendChild(b);
function lab(){b.textContent=a.paused?'MUSICA: OFF':'MUSICA: ON'}
function play(){a.play().then(function(){S.mus='1'}).catch(function(){})}
b.onclick=function(){if(a.paused){play()}else{a.pause();S.mus='0'}};
a.onplay=a.onpause=lab;lab();
a.addEventListener('loadedmetadata',function(){a.currentTime=(parseFloat(S.mt)||0)%a.duration});
setInterval(function(){if(!a.paused)S.mt=a.currentTime},1000);
addEventListener('pagehide',function(){S.mt=a.currentTime});
if(S.mus!=='0'){play();document.addEventListener('click',function(){if(a.paused&&S.mus!=='0')play()},{once:true})}
/* ---- POVO: um bixinho por pessoa que viu ---- */
function rnd(s){s=Math.sin(s*9301+49297)*233280;return s-Math.floor(s)}
function bixo(i,eu){
  var d=document.createElement('div');d.className='bixo'+(eu?' eu':'');d.title='#'+i;
  d.style.backgroundImage='url('+B+'assets/img/formas/'+(eu?'selection':'persona')+'.png)';
  var L=['corpo','rosto'+(1+Math.floor(rnd(i*7+1)*9))];
  if(rnd(i*3+5)>.5)L.push('cabeca');if(rnd(i*5+9)>.5)L.push('colar');
  L.forEach(function(n){var m=document.createElement('img');m.src=B+'assets/bixinhos/'+n+'.png';m.className='cor';d.appendChild(m)});
  return d}
var el=document.getElementById('povo');if(!el)return;
var id=parseInt(S.qaw_id)||0,API='https://api.counterapi.dev/v1/qawsedhub/visitantes/';
function draw(n){
  var c=document.getElementById('povo-n');if(c)c.textContent=n+' PESSOAS VIRAM';
  if(id&&id<n-59)el.appendChild(bixo(id,true));
  for(var i=Math.max(1,n-59);i<=n;i++)el.appendChild(bixo(i,i===id))}
fetch(API+(id?'':'up')).then(function(r){return r.json()}).then(function(j){
  var n=parseInt(j.count!=null?j.count:j.value);if(!n)throw 0;
  if(!id){id=n;S.qaw_id=id}draw(n)
}).catch(function(){if(id)draw(id)});
})();
