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
/* ---- POVO: um bixinho por pessoa que viu, andando solto ---- */
function rnd(s){s=Math.sin(s*9301+49297)*233280;return s-Math.floor(s)}
var el=document.getElementById('povo');if(!el)return;
var W=48,H=96,bichos=[];
function bixo(i,eu){
  var d=document.createElement('div'),q=document.createElement('div');d.className='bixo';q.className='q';d.title='#'+i;
  var L=['corpo','rosto'+(1+Math.floor(rnd(i*7+1)*9))];
  if(rnd(i*3+5)>.5)L.push('cabeca');if(rnd(i*5+9)>.5)L.push('colar');
  L.forEach(function(n){var m=document.createElement('img');m.src=B+'assets/bixinhos/'+n+'.png';m.className='cor';q.appendChild(m)});
  d.appendChild(q);
  if(eu){var t=document.createElement('span');t.className='tag voce';t.textContent='VOCE';d.appendChild(t)}
  el.appendChild(d);
  var x=rnd(i*11+3)*(el.clientWidth-W),y=rnd(i*13+7)*(el.clientHeight-H);
  bichos.push({d:d,q:q,x:x,y:y,tx:x,ty:y,esp:18+rnd(i*17+1)*22,par:rnd(i*19)*3,f:-1,i:i});
}
var ult=performance.now();
function anda(agora){
  var dt=Math.min((agora-ult)/1000,.1);ult=agora;
  var w=el.clientWidth-W,h=el.clientHeight-H;
  bichos.forEach(function(b){
    if(b.par>0){b.par-=dt;if(b.par<=0){b.tx=Math.random()*w;b.ty=Math.random()*h}}   /* parado, olhando em volta */
    else{var dx=b.tx-b.x,dy=b.ty-b.y,dist=Math.hypot(dx,dy);
      if(dist<3){b.par=1+Math.random()*4}
      else{b.x+=dx/dist*b.esp*dt;b.y+=dy/dist*b.esp*dt;if(Math.abs(dx)>2)b.f=dx<0?1:-1}}
    var an=b.par<=0,s=an?Math.sin(agora/90+b.i):0;                                    /* balancinho de quem anda */
    b.d.style.transform='translate('+Math.min(b.x,w)+'px,'+(b.y-Math.abs(s)*4)+'px)';
    b.q.style.transform='scaleX('+b.f+') rotate('+s*4+'deg)';
    b.d.style.zIndex=Math.round(b.y);
  });
  requestAnimationFrame(anda)}
requestAnimationFrame(anda);
var id=parseInt(S.qaw_id)||0,N=parseInt(S.qaw_n)||0,K='qawsedseita.github.io/visitantes';
function draw(n,aviso){
  var c=document.getElementById('povo-n');if(c)c.textContent=aviso||(n+' PESSOAS VIRAM');
  if(id&&id<n-59)bixo(id,true);
  for(var i=Math.max(1,n-59);i<=n;i++)bixo(i,i===id)}
/* pessoa nova: /hit soma 1 e devolve o numero dela; quem ja veio: /get so le o total */
fetch('https://abacus.jasoncameron.dev/'+(id?'get/':'hit/')+K).then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(j){
  var n=parseInt(j.value);if(!n)throw 0;
  if(!id){id=n;S.qaw_id=id}S.qaw_n=n;draw(n)
}).catch(function(){draw(Math.max(N,id,1),'CONTADOR FORA DO AR')});
})();
