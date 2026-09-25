(function(){
var B=document.currentScript.dataset.base||'/',S=window.localStorage;
var SBU=document.currentScript.dataset.sbUrl,SBK=document.currentScript.dataset.sbKey;
var sb=(SBU&&SBK&&window.supabase)?window.supabase.createClient(SBU,SBK):null;
if(!sb)console.info('QAWSED: comentarios/comida desligados (falta data-sb-url/data-sb-key ou lib do supabase)');
/* ---- MUSICA: toca a faixa inteira em loop normal, sem corte. paginas podem trocar a faixa com window.QAWSED_FAIXA={src,chave,titulo} ---- */
var faixa=window.QAWSED_FAIXA,chaveTempo='mt'+(faixa&&faixa.chave?'_'+faixa.chave:'');
var au=new Audio(faixa&&faixa.src?faixa.src:B+'assets/audio/vhs.mp3');au.loop=true;au.volume=.5;
try{au.currentTime=parseFloat(S[chaveTempo])||0}catch(e){}
var b=document.createElement('button');b.className='tag musica';document.body.appendChild(b);
function lab(){b.textContent=(au.paused?'MUSICA: OFF':'MUSICA: ON')+(faixa&&faixa.titulo?' · '+faixa.titulo.toUpperCase():'')}lab();
au.addEventListener('play',lab);au.addEventListener('pause',lab);
function tocar(){au.play().then(function(){S.mus='1'}).catch(function(){})}
function parar(){au.pause();S.mus='0'}
b.onclick=function(){au.paused?tocar():parar()};
function salva(){try{S[chaveTempo]=au.currentTime}catch(e){}}
setInterval(salva,1000);addEventListener('pagehide',salva);
if(S.mus!=='0'){tocar();document.addEventListener('click',function(){if(au.paused&&S.mus!=='0')tocar()},{once:true})}
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
var ult=performance.now(),comida=null;
function anda(agora){
  var dt=Math.min((agora-ult)/1000,.1);ult=agora;
  var w=el.clientWidth-W,h=el.clientHeight-H;
  bichos.forEach(function(b){
    if(comida){                                                                       /* correria: todo mundo vira porco */
      var cx=comida.x-b.x,cy=comida.y-b.y,cd=Math.hypot(cx,cy);
      if(cd>8){b.x+=cx/cd*b.esp*2.6*dt;b.y+=cy/cd*b.esp*2.6*dt;if(Math.abs(cx)>2)b.f=cx<0?1:-1}
      var sc=cd<=8?Math.abs(Math.sin(agora/55+b.i))*1.8:Math.sin(agora/70+b.i);
      b.d.style.transform='translate('+Math.min(b.x,w)+'px,'+(b.y-Math.abs(sc)*4)+'px) scale('+(cd<=8?1.12:1)+')';
      b.q.style.transform='scaleX('+b.f+') rotate('+sc*4+'deg)';
      b.d.style.zIndex=Math.round(b.y);
      return;
    }
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

/* ---- COMENTARIOS + COMIDA + QAWSED (precisa de data-sb-url/data-sb-key no <script>) ---- */
function esc(s){var d=document.createElement('div');d.textContent=s;return d.innerHTML}
function balaoEm(vid,nome,texto){
  var alvo=null;bichos.forEach(function(x){if(x.i==vid)alvo=x});if(!alvo)return;
  var velho=alvo.d.querySelector('.balao');if(velho)velho.remove();
  var bal=document.createElement('div');bal.className='balao';bal.innerHTML='<b>'+esc(nome)+'</b> '+esc(texto);
  alvo.d.appendChild(bal);setTimeout(function(){bal.remove()},6000);
}
function addFeed(nome,texto){
  var f=document.getElementById('povo-comentarios');if(!f)return;
  var p=document.createElement('p');p.innerHTML='<b>'+esc(nome)+':</b> '+esc(texto);
  f.insertBefore(p,f.firstChild);while(f.children.length>8)f.removeChild(f.lastChild);
}
function darComida(){
  if(!el||comida)return;
  var w=el.clientWidth-W,h=el.clientHeight-H;if(w<1||h<1)return;
  var cx=Math.random()*w+W/2,cy=Math.random()*h+H/2;
  var ic=document.createElement('div');ic.className='comida';ic.textContent='🍖';
  ic.style.transform='translate('+cx+'px,'+cy+'px)';
  el.appendChild(ic);
  comida={x:cx,y:cy,el:ic};
  setTimeout(function(){if(comida&&comida.el)comida.el.remove();comida=null;setTimeout(mostrarQawsed,250)},3400);
}
function mostrarQawsed(){
  var ov=document.createElement('div');ov.className='qawsed-ov';
  var im=document.createElement('img');im.className='qawsed-img';im.alt='O Qawsed';im.src=B+'assets/qawsed/QawMove.gif';
  var t=document.createElement('span');t.className='tag vhs qawsed-tag';t.textContent='O QAWSED SURGIU';
  ov.appendChild(im);ov.appendChild(t);document.body.appendChild(ov);
  requestAnimationFrame(function(){ov.classList.add('in')});
  setTimeout(function(){im.src=B+'assets/qawsed/QawIdle.gif'},1700);
  setTimeout(function(){ov.classList.add('out')},5200);
  setTimeout(function(){ov.remove()},6100);
}
if(sb&&el){
  var TXT_MAX=140,NOME_MAX=30;
  var bc=document.createElement('button');bc.className='tag';bc.textContent='COMENTAR';
  bc.onclick=function(){
    var nome=S.qaw_nome;
    if(!nome){nome=prompt('Como seu bixinho vai assinar os comentarios? (nome ou apelido)','');if(nome===null)return;
      nome=nome.trim().slice(0,NOME_MAX);if(!nome)return;S.qaw_nome=nome}
    var texto=prompt('O que ele vai falar? (max '+TXT_MAX+' caracteres)','');if(texto===null)return;
    texto=texto.trim().slice(0,TXT_MAX);if(!texto)return;
    bc.disabled=true;
    sb.from('comentarios').insert({visitor_id:id,nome:nome,texto:texto}).then(function(r){
      bc.disabled=false;if(r.error)alert('Nao rolou comentar agora, tenta de novo')});
  };
  var bf=document.createElement('button');bf.className='tag';bf.textContent='DAR COMIDA';
  bf.onclick=function(){
    bf.disabled=true;
    sb.from('comida_eventos').insert({visitor_id:id}).then(function(){setTimeout(function(){bf.disabled=false},4000)});
  };
  var pn=document.getElementById('povo-n');
  if(pn&&pn.parentNode){pn.parentNode.insertBefore(bf,pn.nextSibling);pn.parentNode.insertBefore(bc,pn.nextSibling)}
  var feedEl=document.createElement('div');feedEl.id='povo-comentarios';feedEl.className='povo-comentarios';
  el.parentNode.insertBefore(feedEl,el.nextSibling);

  sb.channel('social').on('postgres_changes',{event:'INSERT',schema:'public',table:'comentarios'},function(p){
    addFeed(p.new.nome,p.new.texto);balaoEm(p.new.visitor_id,p.new.nome,p.new.texto);
  }).on('postgres_changes',{event:'INSERT',schema:'public',table:'comida_eventos'},function(){darComida()}).subscribe();

  sb.from('comentarios').select('nome,texto').order('id',{ascending:false}).limit(8).then(function(r){
    if(r.data)r.data.slice().reverse().forEach(function(row){addFeed(row.nome,row.texto)});
  });
}
})();
