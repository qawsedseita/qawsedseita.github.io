(function(){
var B=document.currentScript.dataset.base||'/';

/* ---- ARMAZENAMENTO SEGURO: se localStorage falhar (privado, cheio, bloqueado), usa memoria e o cliquer continua funcionando ---- */
var mem={};
function ler(chave){try{var v=window.localStorage.getItem(chave);return v===null?undefined:v}catch(e){return mem[chave]}}
function salvar(chave,valor){try{window.localStorage.setItem(chave,valor)}catch(e){mem[chave]=String(valor)}}

var wrap=document.getElementById('cubo-wrap'),cubo=document.getElementById('cubo'),cont=document.getElementById('cliques'),reb=document.getElementById('rebanho');
if(!wrap||!cubo||!reb)return;
var elCps=document.getElementById('cps'),elComboBarra=document.getElementById('combo-barra'),elComboPreenche=document.getElementById('combo-preenche'),
    elFlut=document.getElementById('flutuantes'),elAutoNota=document.getElementById('auto-nota'),elTransicao=document.getElementById('transicao-vhs');
var reduzMovimento=!!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches);

/* ---- CLIQUES ---- */
var n=parseInt(ler('qaw_cliques'))||0;
if(cont)cont.textContent=n;

/* ---- TRANSICAO (varredura VHS): toca na entrada da pagina e em cada marco de 50 cliques ---- */
var transicaoRodando=false;
function transicao(textoMarco){
  if(textoMarco)mostraMarco(textoMarco);
  if(!elTransicao||reduzMovimento||transicaoRodando)return;
  transicaoRodando=true;
  elTransicao.classList.remove('jogar');void elTransicao.offsetWidth;elTransicao.classList.add('jogar');
  var fim=function(){transicaoRodando=false;elTransicao.classList.remove('jogar');elTransicao.removeEventListener('animationend',fim)};
  elTransicao.addEventListener('animationend',fim);
  setTimeout(fim,1000);
}
function mostraMarco(texto){
  var p=document.createElement('p');p.className='marco-flash vhs';p.textContent=texto;
  document.body.appendChild(p);
  p.addEventListener('animationend',function(){if(p.parentNode)p.remove()});
  setTimeout(function(){if(p.parentNode)p.remove()},2200);
}
requestAnimationFrame(function(){transicao()});

/* ---- CUBO: giro com inercia, cada clique da um chute ---- */
var rx=-24,ry=35,vx=0,vy=20,ultC=performance.now();
var ultCliqueEm=0,comboN=0;
function girar(t){
  var dt=Math.min((t-ultC)/1000,.05);ultC=t;
  rx+=vx*dt;ry+=vy*dt;
  vx*=Math.pow(.06,dt);vy*=Math.pow(.4,dt);
  if(Math.abs(vy)<20)vy=vy<0?-20:20;                    /* nunca para de todo: sempre gira um pouco */
  cubo.style.transform='rotateX('+rx+'deg) rotateY('+ry+'deg)';
  if(comboN>0&&t-ultCliqueEm>900){comboN=0;atualizaComboBarra()}   /* combo esfria sozinho quando voce para de clicar */
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

/* ---- CLIQUES POR SEGUNDO ---- */
var historico=[];
function atualizaCps(){
  var agora=performance.now();
  historico=historico.filter(function(t){return agora-t<4000});
  if(elCps)elCps.textContent=historico.length?(' ('+(historico.length/4).toFixed(1)+'/s)'):'';
}
setInterval(atualizaCps,500);

/* ---- COMBO: cliques rapidos e seguidos aumentam o ganho por clique, ate 5x ---- */
function atualizaComboBarra(){
  if(!elComboBarra||!elComboPreenche)return;
  if(comboN<=1){elComboBarra.hidden=true;return}
  elComboBarra.hidden=false;
  elComboPreenche.style.width=((comboN%10)/10*100)+'%';
}
function multiplicador(){return 1+Math.min(4,Math.floor(comboN/10))}

/* ---- MARCOS: a cada 50 cliques dispara a transicao com o numero ---- */
var ultimoMarco=Math.floor(n/50);
function checaMarco(){
  var atual=Math.floor(n/50);
  if(atual>ultimoMarco){ultimoMarco=atual;transicao(n+' CLIQUES!')}
}

/* ---- BIXIN AUTOMATICO: inspirado no Cookie Clicker, depois de 30 cliques o rebanho passa a clicar sozinho de vez em quando ---- */
var autoLigado=false;
function ligaAuto(){
  if(autoLigado)return;autoLigado=true;
  if(elAutoNota){elAutoNota.hidden=false;elAutoNota.textContent='UM BIXIN VELHO SE OFERECEU PRA CLICAR PRA VOCE (+1 A CADA 5S)'}
  setInterval(function(){registraCliques(1,true)},5000);
}

/* ---- NUMERO FLUTUANTE: feedback visual de cada clique ---- */
function flutuante(txt){
  if(!elFlut)return;
  while(elFlut.children.length>10)elFlut.removeChild(elFlut.firstChild);
  var s=document.createElement('span');s.className='flutuante vhs';s.textContent=txt;
  elFlut.appendChild(s);
  s.addEventListener('animationend',function(){if(s.parentNode)s.remove()});
  setTimeout(function(){if(s.parentNode)s.remove()},1300);
}

/* ---- REGISTRA CLIQUES: usado pelo clique manual e pelo bixin automatico ---- */
function registraCliques(qtd,automatico){
  n+=qtd;salvar('qaw_cliques',n);if(cont)cont.textContent=n;
  historico.push(performance.now());
  if(!automatico)flutuante('+'+qtd);
  ajustaRebanho();checaMarco();
  if(n>=30)ligaAuto();
}

function clicou(){
  var agora=performance.now();
  comboN=(agora-ultCliqueEm<700)?comboN+1:1;ultCliqueEm=agora;
  atualizaComboBarra();
  registraCliques(multiplicador(),false);
  vx+=Math.random()*180-90;vy+=(Math.random()<.5?-1:1)*(140+Math.random()*180);
  cubo.classList.remove('pulso');void cubo.offsetWidth;cubo.classList.add('pulso');
}
wrap.addEventListener('click',clicou);
wrap.addEventListener('keydown',function(e){                       /* acessibilidade: cubo tambem clica com Enter/Espaco */
  if(e.key===' '||e.key==='Spacebar'||e.key==='Enter'){e.preventDefault();clicou()}
});
})();
