(function(){
var B=document.currentScript.dataset.base||'/',S=window.localStorage;
var SBU=document.currentScript.dataset.sbUrl,SBK=document.currentScript.dataset.sbKey;
var sb=(SBU&&SBK&&window.supabase)?window.supabase.createClient(SBU,SBK):null;
window.QAWSED_SB=sb;
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
/* ---- POVO: um bixinho por pessoa que viu, andando solto ----
   cada bixinho tem: corpo + rosto (1 de 24) + talvez cabeca (1 de 3) + talvez colar (1 de 3)
   + talvez acessorio de rosto (1 de 4) + talvez maquiagem, sorteado sempre igual pro mesmo #id.
   quem ja foi aceito como qawsedista ganha o manto por cima de tudo, pra sempre. */
function rnd(s){s=Math.sin(s*9301+49297)*233280;return s-Math.floor(s)}
var aceitos={};                                                    /* visitor_id -> true, preenchido do banco quando da */
function souAceito(){try{return localStorage.getItem('qaw_aceito')==='1'}catch(e){return false}}
function camadasBixo(i,eu){
  var L=['corpo','rosto'+(1+Math.floor(rnd(i*7+1)*24))];
  if(rnd(i*3+5)>.5)L.push('cabeca'+(rnd(i*3+6)>.66?(rnd(i*3+7)>.5?'3':'2'):''));
  if(rnd(i*5+9)>.5)L.push('colar'+(rnd(i*5+10)>.66?(rnd(i*5+11)>.5?'3':'2'):''));
  if(rnd(i*13+2)>.72)L.push('acessorio'+(1+Math.floor(rnd(i*13+3)*4)));
  if(rnd(i*17+4)>.83)L.push('maquiagem1');
  if(aceitos[i]||(eu&&souAceito()))L.push('manto');
  return L;
}
var el=document.getElementById('povo');if(!el)return;
var W=48,H=96,bichos=[];
function bixo(i,eu){
  var d=document.createElement('div'),q=document.createElement('div');d.className='bixo';q.className='q';d.title='#'+i;
  camadasBixo(i,eu).forEach(function(n){var m=document.createElement('img');m.src=B+'assets/bixinhos/'+n+'.png';m.className='cor';q.appendChild(m)});
  d.appendChild(q);
  if(eu){var t=document.createElement('span');t.className='tag voce';t.textContent='VOCE';d.appendChild(t)}
  d.addEventListener('click',function(){abrirFicha(i)});
  el.appendChild(d);
  var x=rnd(i*11+3)*(el.clientWidth-W),y=rnd(i*13+7)*(el.clientHeight-H);
  bichos.push({d:d,q:q,x:x,y:y,tx:x,ty:y,esp:18+rnd(i*17+1)*22,par:rnd(i*19)*3,f:-1,i:i});
}
function refazBixo(b){var q=b.q;q.innerHTML='';camadasBixo(b.i,b.i===id).forEach(function(n){var m=document.createElement('img');m.src=B+'assets/bixinhos/'+n+'.png';m.className='cor';q.appendChild(m)})}

/* ---- FICHA: toca num bixinho (o seu ou de qualquer um) e ve o nome dele e tudo que ele ja falou ---- */
function esc2(s){var d=document.createElement('div');d.textContent=s;return d.innerHTML}
function fmtQuando(iso){
  try{var dt=new Date(iso),ago=(Date.now()-dt.getTime())/1000;
    if(ago<60)return 'agora mesmo';
    if(ago<3600)return 'ha '+Math.floor(ago/60)+'min';
    if(ago<86400)return 'ha '+Math.floor(ago/3600)+'h';
    return dt.toLocaleDateString('pt-BR');
  }catch(e){return ''}
}
function abrirFicha(vid){
  var ov=document.createElement('div');ov.className='ficha-ov';
  var card=document.createElement('div');card.className='ficha-card';
  ov.appendChild(card);document.body.appendChild(ov);
  requestAnimationFrame(function(){ov.classList.add('in')});
  function fechar(){ov.classList.remove('in');setTimeout(function(){ov.remove()},250)}
  ov.addEventListener('click',function(e){if(e.target===ov)fechar()});
  document.addEventListener('keydown',function esc(e){if(e.key==='Escape'){fechar();document.removeEventListener('keydown',esc)}});
  card.innerHTML='<p class="ficha-carregando vhs">abrindo ficha #'+vid+'...</p>';

  if(!sb){
    var localCand=null;
    try{var fila=JSON.parse(localStorage.qawsed_fila_local||'[]');fila.forEach(function(c){if(c.visitor_id===vid)localCand=c})}catch(e){}
    var falasLocais=localCand?localCand.mensagens.filter(function(m){return m.autor==='candidato'}).map(function(m){return {texto:m.texto,quando:null}}):[];
    montarFicha(card,vid,localCand,falasLocais,fechar,vid===id);
    return;
  }
  sb.from('candidaturas').select('id,nome,status,criado_em').eq('visitor_id',vid).order('criado_em',{ascending:false}).limit(1).then(function(r){
    var cand=(r.data&&r.data[0])||null;
    var p1=cand?sb.from('mensagens_candidatura').select('texto,criado_em').eq('candidatura_id',cand.id).eq('autor','candidato').order('id',{ascending:true}):Promise.resolve({data:[]});
    var p2=sb.from('comentarios').select('texto,criado_em').eq('visitor_id',vid).order('id',{ascending:true});
    Promise.all([p1,p2]).then(function(res){
      var falas=(res[0].data||[]).map(function(m){return {texto:m.texto,quando:m.criado_em,onde:'no julgamento'}})
        .concat((res[1].data||[]).map(function(c){return {texto:c.texto,quando:c.criado_em,onde:'num comentario'}}));
      falas.sort(function(a,b){return new Date(a.quando)-new Date(b.quando)});
      montarFicha(card,vid,cand,falas,fechar,vid===id);
    });
  });
}
function montarFicha(card,vid,cand,falas,fechar,eu){
  card.innerHTML='';
  var bfechar=document.createElement('button');bfechar.type='button';bfechar.className='ficha-fechar';bfechar.setAttribute('aria-label','fechar');bfechar.textContent='×';
  bfechar.onclick=fechar;card.appendChild(bfechar);
  var cab=document.createElement('div');cab.className='ficha-cabecalho';
  var av=document.createElement('div');av.className='avatar-bixo';var q=document.createElement('div');q.className='q';
  camadasBixo(vid,(cand&&cand.status==='aceito')||(eu&&souAceito())).forEach(function(n){var m=document.createElement('img');m.src=B+'assets/bixinhos/'+n+'.png';m.className='cor';q.appendChild(m)});
  av.appendChild(q);cab.appendChild(av);
  var textos=document.createElement('div');
  var nome=document.createElement('span');nome.className='nome-bixo vhs';nome.textContent=(cand&&cand.nome)?cand.nome:'SEM NOME (#'+vid+')';textos.appendChild(nome);
  var status=document.createElement('span');status.className='status-bixo';
  status.textContent=cand?({pendente:'esperando o veredito.',aceito:'e um qawsedista.',negado:'foi negado.'}[cand.status]||''):(eu?'voce ainda nao se candidatou.':'nunca se candidatou.');
  textos.appendChild(status);cab.appendChild(textos);
  card.appendChild(cab);
  var lista=document.createElement('div');lista.className='ficha-falas';
  if(!falas.length){var v=document.createElement('p');v.className='ficha-vazia';v.textContent='ele nunca falou nada aqui.';lista.appendChild(v)}
  falas.forEach(function(f){
    var linha=document.createElement('p');linha.className='ficha-fala';
    linha.innerHTML='<span class="ficha-fala-texto"></span>'+(f.onde?' <span class="ficha-fala-onde">('+esc2(f.onde)+(f.quando?', '+esc2(fmtQuando(f.quando)):'')+')</span>':'');
    linha.querySelector('.ficha-fala-texto').textContent=f.texto;
    lista.appendChild(linha);
  });
  card.appendChild(lista);
  if(!sb){var av2=document.createElement('p');av2.className='ficha-aviso';av2.textContent='(esse deploy ta sem supabase ligado -- so da pra ver ficha de bixinho nesse mesmo aparelho.)';card.appendChild(av2)}
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
  for(var i=Math.max(1,n-59);i<=n;i++)bixo(i,i===id);
  bichos.forEach(refazBixo); /* se a lista de aceitos ja chegou do banco antes disso, aplica o manto de cara */
}
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
  /* quem ja foi aceito como qawsedista ganha o manto, pra todo mundo ver, em qualquer aparelho */
  sb.from('candidaturas').select('visitor_id').eq('status','aceito').then(function(r){
    (r.data||[]).forEach(function(row){aceitos[row.visitor_id]=true});
    bichos.forEach(refazBixo);
  });
  sb.channel('aceitos-manto').on('postgres_changes',{event:'UPDATE',schema:'public',table:'candidaturas'},function(p){
    if(p.new&&p.new.status==='aceito'){aceitos[p.new.visitor_id]=true;bichos.forEach(function(b){if(b.i==p.new.visitor_id)refazBixo(b)})}
  }).subscribe();
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
