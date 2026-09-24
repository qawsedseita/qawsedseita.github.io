(function(){
var B=document.currentScript.dataset.base||'/',S=window.localStorage;
/* ---- MUSICA EM LOOP: de 0 ate 20,45 s (30 batidas a 88 BPM), sem falha ---- */
var AC=window.AudioContext||window.webkitAudioContext,ctx,buf,src,t0=0,on=false,pos=parseFloat(S.mt)||0;
var b=document.createElement('button');b.className='tag musica';document.body.appendChild(b);
function lab(){b.textContent=on?'MUSICA: ON':'MUSICA: OFF'}lab();
function carregar(){
  if(buf)return Promise.resolve();ctx=ctx||new AC();
  return fetch(B+'assets/audio/fundo.wav').then(function(r){return r.arrayBuffer()}).then(function(d){return ctx.decodeAudioData(d)}).then(function(x){buf=x});
}
function tocar(){
  carregar().then(function(){return ctx.resume()}).then(function(){
    if(on||ctx.state!=='running')return;
    var g=ctx.createGain();g.gain.value=.5;g.connect(ctx.destination);
    src=ctx.createBufferSource();src.buffer=buf;src.loop=true;src.connect(g);
    var o=pos%buf.duration;src.start(0,o);t0=ctx.currentTime-o;on=true;S.mus='1';lab();
  }).catch(function(){});
}
function parar(){if(!on)return;pos=(ctx.currentTime-t0)%buf.duration;src.stop();on=false;S.mus='0';S.mt=pos;lab()}
b.onclick=function(){on?parar():tocar()};
function salva(){if(on)S.mt=(ctx.currentTime-t0)%buf.duration}
setInterval(salva,1000);addEventListener('pagehide',salva);
if(S.mus!=='0'){tocar();document.addEventListener('click',function(){if(!on&&S.mus!=='0')tocar()},{once:true})}
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
