(function(){
var B=document.currentScript.dataset.base||'/',S=window.localStorage;
var wrap=document.getElementById('cubo-wrap'),cubo=document.getElementById('cubo'),cont=document.getElementById('cliques'),reb=document.getElementById('rebanho');
if(!wrap||!cubo||!reb)return;

/* ---- CLIQUES ---- */
var n=parseInt(S.qaw_cliques)||0;
if(cont)cont.textContent=n;

/* ---- CUBO: giro com inercia, cada clique da um chute ---- */
var rx=-24,ry=35,vx=0,vy=20,ultC=performance.now();
function girar(t){
  var dt=Math.min((t-ultC)/1000,.05);ultC=t;
  rx+=vx*dt;ry+=vy*dt;
  vx*=Math.pow(.06,dt);vy*=Math.pow(.4,dt);
  if(Math.abs(vy)<20)vy=vy<0?-20:20;                    /* nunca para de todo: sempre gira um pouco */
  cubo.style.transform='rotateX('+rx+'deg) rotateY('+ry+'deg)';
  requestAnimationFrame(girar);
}
requestAnimationFrame(girar);

/* ---- REBANHO: bixin por marco de cliques, cada um com colar de cor aleatoria ---- */
var W=48,H=96,bichos=[],LIMITE=50,POR_BIXO=12;
function spawn(){
  var d=document.createElement('div'),q=document.createElement('div');d.className='bixo';q.className='q';
  var rostoN=1+Math.floor(Math.random()*9);
  ['corpo','rosto'+rostoN,'cabeca','colar'].forEach(function(nome){
    var im=document.createElement('img');im.src=B+'assets/bixinhos/'+nome+'.png';im.className='cor';
    if(nome==='colar')im.style.filter='hue-rotate('+Math.floor(Math.random()*360)+'deg) saturate(2.4)';
    q.appendChild(im);
  });
  d.appendChild(q);reb.appendChild(d);
  var w=Math.max(reb.clientWidth-W,10),h=Math.max(reb.clientHeight-H,10);
  var x=Math.random()*w,y=Math.random()*h;
  bichos.push({d:d,q:q,x:x,y:y,tx:x,ty:y,esp:14+Math.random()*18,par:Math.random()*3,f:-1});
}
var ultA=performance.now();
function andar(agora){
  var dt=Math.min((agora-ultA)/1000,.1);ultA=agora;
  var w=Math.max(reb.clientWidth-W,10),h=Math.max(reb.clientHeight-H,10);
  bichos.forEach(function(b){
    if(b.par>0){b.par-=dt;if(b.par<=0){b.tx=Math.random()*w;b.ty=Math.random()*h}}
    else{var dx=b.tx-b.x,dy=b.ty-b.y,dist=Math.hypot(dx,dy);
      if(dist<3)b.par=1+Math.random()*4;
      else{b.x+=dx/dist*b.esp*dt;b.y+=dy/dist*b.esp*dt;if(Math.abs(dx)>2)b.f=dx<0?1:-1}}
    var s=b.par<=0?Math.sin(agora/90+b.x):0;
    b.d.style.transform='translate('+Math.min(b.x,w)+'px,'+(b.y-Math.abs(s)*4)+'px)';
    b.q.style.transform='scaleX('+b.f+') rotate('+s*4+'deg)';
    b.d.style.zIndex=Math.round(b.y);
  });
  requestAnimationFrame(andar);
}
requestAnimationFrame(andar);

function ajustaRebanho(){
  var alvo=Math.min(Math.floor(n/POR_BIXO),LIMITE);
  while(bichos.length<alvo)spawn();
}
ajustaRebanho();

wrap.addEventListener('click',function(){
  n++;S.qaw_cliques=n;if(cont)cont.textContent=n;
  vx+=Math.random()*180-90;vy+=(Math.random()<.5?-1:1)*(140+Math.random()*180);
  cubo.classList.remove('pulso');void cubo.offsetWidth;cubo.classList.add('pulso');
  ajustaRebanho();
});
})();
