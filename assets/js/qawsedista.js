(function(){
var D=window.QAWSED_DADOS||{};
var el=document.getElementById('entrevista');
var vhs=document.getElementById('transicao-vhs');
if(!el)return;

var BASE=(function(){try{var s=document.currentScript.src;var i=s.indexOf('assets/js/');return i>-1?s.slice(0,i):'/'}catch(e){return '/'}})();

function pegarSB(){return window.QAWSED_SB||null}
/* espera o hub.js (carregado depois, por causa do "defer") ligar o supabase. so desiste de
   verdade depois de uns 5s tentando -- ate la, nunca decide "local" so por pressa. */
function esperarSB(cb,desiste,tentativas){
  tentativas=tentativas||0;
  var sb=pegarSB();
  if(sb){cb(sb);return}
  if(tentativas>25){if(desiste)desiste();return}
  setTimeout(function(){esperarSB(cb,desiste,tentativas+1)},200);
}
function pegarVisitorId(){
  try{var v=parseInt(localStorage.qaw_id);if(v)return v}catch(e){}
  return Math.floor(Math.random()*1e9);
}

/* ---- BIXINHO: mesma logica de camadas do hub.js, so que parado e sozinho num avatar ---- */
function rnd(s){s=Math.sin(s*9301+49297)*233280;return s-Math.floor(s)}
function camadasBixo(i,manto){
  var L=['corpo','rosto'+(1+Math.floor(rnd(i*7+1)*24))];
  if(rnd(i*3+5)>.5)L.push('cabeca'+(rnd(i*3+6)>.66?(rnd(i*3+7)>.5?'3':'2'):''));
  if(rnd(i*5+9)>.5)L.push('colar'+(rnd(i*5+10)>.66?(rnd(i*5+11)>.5?'3':'2'):''));
  if(rnd(i*13+2)>.72)L.push('acessorio'+(1+Math.floor(rnd(i*13+3)*4)));
  if(rnd(i*17+4)>.83)L.push('maquiagem1');
  if(manto)L.push('manto');
  return L;
}
function montarAvatar(i,manto,peq){
  var d=document.createElement('div');d.className='avatar-bixo'+(peq?' peq':'');
  var q=document.createElement('div');q.className='q';
  camadasBixo(i,manto).forEach(function(n){var m=document.createElement('img');m.src=BASE+'assets/bixinhos/'+n+'.png';m.className='cor';q.appendChild(m)});
  d.appendChild(q);
  return d;
}

/* ---- NOME DO BIXIN: se ele nao tem nome ainda, ganha um agora, e fica pra sempre ---- */
function pegarNomeBixin(){
  try{var n=localStorage.qaw_nome_bixin;if(n)return n}catch(e){}
  var pool=D.nomes_bixin&&D.nomes_bixin.length?D.nomes_bixin:['SEM-NOME'];
  var n=pool[Math.floor(Math.random()*pool.length)]+'-'+(100+Math.floor(Math.random()*900));
  try{localStorage.qaw_nome_bixin=n}catch(e){}
  return n;
}

/* transicao (reaproveita a mesma transicao VHS do resto do site) */
function wipe(cb){
  if(vhs){vhs.classList.remove('jogar');void vhs.offsetWidth;vhs.classList.add('jogar')}
  setTimeout(cb,420);
  setTimeout(function(){if(vhs)vhs.classList.remove('jogar')},950);
}

/* ---- MODO DONO: segredo pra revelar o painel de quem esta esperando ---- */
var DONO_KEY='qawsed_dono';
function ehDono(){try{return localStorage.getItem(DONO_KEY)==='1'}catch(e){return false}}
function tentarCodigo(v){
  if(!v)return false;
  if(String(v).trim().toLowerCase()===String(D.codigo_dono||'').trim().toLowerCase()){
    try{localStorage.setItem(DONO_KEY,'1')}catch(e){}
    return true;
  }
  return false;
}
(function(){try{var p=new URLSearchParams(location.search).get('dono');if(p)tentarCodigo(p)}catch(e){}})();
(function(){
  var alvo=document.querySelector('.nome-do-blog');if(!alvo)return;
  var t=null;
  function comeca(){t=setTimeout(function(){
    var r=prompt('codigo:');
    if(tentarCodigo(r))montarPainelDono();
  },900)}
  function cancela(){clearTimeout(t)}
  alvo.addEventListener('pointerdown',comeca);
  alvo.addEventListener('pointerup',cancela);
  alvo.addEventListener('pointerleave',cancela);
})();

/* ---- STAGE 1: intro ---- */
function mostrarIntro(){
  el.innerHTML='';
  var wrap=document.createElement('div');wrap.className='entrevista-intro';
  (D.intro||[]).forEach(function(linha){var p=document.createElement('p');p.textContent=linha;wrap.appendChild(p)});
  var b=document.createElement('button');b.className='tag';b.textContent='ENTRAR';
  b.onclick=function(){wipe(iniciarPerguntas)};
  wrap.appendChild(b);
  el.appendChild(wrap);
}

/* ---- STAGE 2: perguntas, uma vez so, sem voltar ---- */
var qi=0;
function iniciarPerguntas(){qi=0;mostrarPergunta()}
function mostrarPergunta(){
  var perguntas=D.perguntas||[];
  if(qi>=perguntas.length){wipe(iniciarDesafios);return}
  el.innerHTML='';
  var p=perguntas[qi];
  var wrap=document.createElement('div');
  var n=document.createElement('p');n.className='pergunta-n vhs';n.textContent=(qi+1)+' / '+perguntas.length;wrap.appendChild(n);
  var t=document.createElement('p');t.className='pergunta-texto';t.textContent=p.texto;wrap.appendChild(t);
  var op=document.createElement('div');op.className='opcoes';
  (p.opcoes||[]).forEach(function(o){
    var btn=document.createElement('button');btn.className='tag';btn.textContent=o;
    btn.onclick=function(){op.querySelectorAll('button').forEach(function(x){x.disabled=true});qi++;wipe(mostrarPergunta)};
    op.appendChild(btn);
  });
  wrap.appendChild(op);
  el.appendChild(wrap);
}

/* ---- STAGE 3: desafios ---- */
var di=0;
function iniciarDesafios(){di=0;mostrarDesafio()}
function mostrarDesafio(){
  var desafios=D.desafios||[];
  if(di>=desafios.length){wipe(iniciarChat);return}
  var d=desafios[di];
  el.innerHTML='';
  var wrap=document.createElement('div');wrap.className='desafio';
  var nome=document.createElement('p');nome.className='desafio-nome vhs';nome.textContent=d.label||'DESAFIO';wrap.appendChild(nome);
  var instr=document.createElement('p');instr.className='instrucao';instr.textContent=d.instrucao||'';wrap.appendChild(instr);
  el.appendChild(wrap);
  function prox(){di++;wipe(mostrarDesafio)}
  if(d.tipo==='memoria')rodarMemoria(wrap,prox);
  else if(d.tipo==='segurar')rodarSegurar(wrap,d.duracao||5,prox);
  else rodarReacao(wrap,prox);
}

function resultado(wrap,msg,fim){
  var r=document.createElement('p');r.className='desafio-resultado';r.textContent=msg;wrap.appendChild(r);
  setTimeout(fim,1100);
}

function rodarReacao(wrap,fim){
  var sinal=document.createElement('div');sinal.className='sinal';wrap.appendChild(sinal);
  var pronto=false,acabou=false,t0;
  setTimeout(function(){
    if(acabou)return;
    pronto=true;t0=performance.now();sinal.classList.add('ativo');
    setTimeout(function(){if(!acabou){acabou=true;sinal.style.pointerEvents='none';resultado(wrap,'tarde demais.',fim)}},900);
  },1000+Math.random()*2200);
  sinal.onclick=function(){
    if(acabou)return;
    if(!pronto){acabou=true;sinal.style.pointerEvents='none';resultado(wrap,'cedo demais.',fim);return}
    acabou=true;var ms=Math.round(performance.now()-t0);sinal.style.pointerEvents='none';sinal.classList.remove('ativo');
    resultado(wrap,'registrado: '+ms+'ms.',fim);
  };
}

function rodarMemoria(wrap,fim){
  var simbolos=['◆','▲','●','■'];
  var seq=[];for(var i=0;i<4;i++)seq.push(simbolos[Math.floor(Math.random()*simbolos.length)]);
  var box=document.createElement('div');box.className='memoria-simbolos';wrap.appendChild(box);
  var botoes=simbolos.map(function(s){var b=document.createElement('button');b.textContent=s;b.disabled=true;box.appendChild(b);return b});
  var idx=0;
  function mostrar(){
    if(idx>=seq.length){setTimeout(iniciarResposta,400);return}
    var b=botoes[simbolos.indexOf(seq[idx])];
    b.classList.add('mostrando');
    setTimeout(function(){b.classList.remove('mostrando');idx++;setTimeout(mostrar,220)},520);
  }
  var resp=[];
  function iniciarResposta(){
    botoes.forEach(function(b){b.disabled=false;b.onclick=function(){
      resp.push(b.textContent);
      if(resp.length>=seq.length){
        botoes.forEach(function(x){x.disabled=true});
        var ok=resp.every(function(v,i2){return v===seq[i2]});
        resultado(wrap,ok?'sequencia correta.':'sequencia errada.',fim);
      }
    }});
  }
  setTimeout(mostrar,500);
}

function rodarSegurar(wrap,duracao,fim){
  var btn=document.createElement('div');btn.className='segurar-botao';btn.textContent='segure';wrap.appendChild(btn);
  var barra=document.createElement('div');barra.className='combo-barra';var pre=document.createElement('div');pre.className='combo-preenche';barra.appendChild(pre);wrap.appendChild(barra);
  var ativo=false,t0,raf,acabou=false;
  function passo(agora){
    if(!ativo||acabou)return;
    var pct=Math.min(1,(agora-t0)/1000/duracao);
    pre.style.width=(pct*100)+'%';
    if(pct>=1){acabou=true;btn.classList.remove('pressionando');resultado(wrap,'aguentou o peso todo.',fim);return}
    raf=requestAnimationFrame(passo);
  }
  function iniciar(e){e.preventDefault();if(acabou)return;ativo=true;t0=performance.now();btn.classList.add('pressionando');raf=requestAnimationFrame(passo)}
  function soltar(){
    if(acabou||!ativo)return;
    ativo=false;acabou=true;btn.classList.remove('pressionando');cancelAnimationFrame(raf);
    resultado(wrap,'soltou antes do fim.',fim);
  }
  btn.addEventListener('pointerdown',iniciar);
  btn.addEventListener('pointerup',soltar);
  btn.addEventListener('pointerleave',soltar);
}

/* ---- STAGE 4: monologo de abertura do qawsed (so narrativo, decora o clima antes da sala de verdade) ---- */
function iniciarChat(){
  el.innerHTML='';
  var wrap=document.createElement('div');wrap.className='chat-qawsed';
  var cab=document.createElement('p');cab.className='chat-cabecalho vhs';cab.textContent='QAWSED';wrap.appendChild(cab);
  var corpo=document.createElement('div');corpo.className='chat-corpo';wrap.appendChild(corpo);
  el.appendChild(wrap);
  var linhas=(D.chat||[]).slice();
  function prox(){
    if(!linhas.length){setTimeout(function(){wipe(iniciarJulgamento)},500);return}
    var msg=linhas.shift();
    var dig=document.createElement('div');dig.className='balao-chat digitando';dig.innerHTML='<span></span><span></span><span></span>';
    corpo.appendChild(dig);
    setTimeout(function(){
      dig.remove();
      var b=document.createElement('div');b.className='balao-chat';b.textContent=msg;corpo.appendChild(b);
      setTimeout(prox,850);
    },900+Math.random()*500);
  }
  setTimeout(prox,400);
}

/* ============================================================
   FILA LOCAL: usada so quando o supabase nao esta configurado
   nesse deploy. fica inteira no localStorage do proprio aparelho,
   e tanto a tela do candidato quanto o painel do dono leem dessa
   MESMA fonte -- entao nunca da de um lado dizer "ninguem esperando"
   enquanto do outro lado tem alguem esperando de verdade.
   ============================================================ */
var FILA_KEY='qawsed_fila_local';
function filaLer(){try{var v=JSON.parse(localStorage[FILA_KEY]||'[]');return v instanceof Array?v:[]}catch(e){return []}}
function filaGravar(lista){try{localStorage[FILA_KEY]=JSON.stringify(lista)}catch(e){}}
function filaAchar(id){var l=filaLer();for(var i=0;i<l.length;i++)if(l[i].id===id)return l[i];return null}
function filaCriarOuAchar(visitorId,nome){
  var id='local-'+visitorId,existente=filaAchar(id);
  if(existente)return existente;
  var lista=filaLer();
  var nova={id:id,visitor_id:visitorId,nome:nome,status:'pendente',criado_em:Date.now(),mensagens:[]};
  lista.push(nova);filaGravar(lista);disparaFila();
  return nova;
}
function filaAtualizar(id,campos){
  var lista=filaLer();
  for(var i=0;i<lista.length;i++)if(lista[i].id===id){
    for(var k in campos)lista[i][k]=campos[k];
    filaGravar(lista);disparaFila();return lista[i];
  }
  return null;
}
function filaMensagem(id,autor,texto){
  var lista=filaLer();
  for(var i=0;i<lista.length;i++)if(lista[i].id===id){
    lista[i].mensagens.push({autor:autor,texto:texto,criado_em:Date.now()});
    filaGravar(lista);disparaFila();return;
  }
}
var filaOuvintes=[];
function disparaFila(){filaOuvintes.slice().forEach(function(f){f()})}
window.addEventListener('storage',function(e){if(e.key===FILA_KEY)disparaFila()});

/* ============================================================
   REFERENCIA SALVA: pra nao precisar ficar com a aba aberta.
   guarda so o id + o modo (remoto ou local). fechar e voltar
   depois cai direto na sala de julgamento, sem repetir a entrevista.
   ============================================================ */
var REF_KEY='qaw_candidatura_ref';
function lerRef(){try{return JSON.parse(localStorage[REF_KEY]||'null')}catch(e){return null}}
function gravarRef(o){try{localStorage[REF_KEY]=JSON.stringify(o)}catch(e){}}
function limparRef(){try{localStorage.removeItem(REF_KEY)}catch(e){}}

/* ---- notificacao do navegador: avisa mesmo se a aba estiver so em segundo plano ---- */
function pedirNotificacao(){
  try{if('Notification' in window&&Notification.permission==='default')Notification.requestPermission()}catch(e){}
}
function notificar(titulo,corpo){
  try{if('Notification' in window&&Notification.permission==='granted')new Notification(titulo,{body:corpo})}catch(e){}
}

/* ============================================================
   STAGE 5: A SALA -- chat ao vivo entre voce e o dono.
   ele pode decidir (sim ou nao) a qualquer momento, de qualquer
   aparelho onde ele destrave o painel dele.
   ============================================================ */
var salaWrap=null,candidatura=null,modo=null,mensagens=[],vistas={},sb2=null;

function iniciarJulgamento(){
  var ref=lerRef();
  if(ref){retomarJulgamento(ref);return}
  var vid=pegarVisitorId(),nome=pegarNomeBixin();
  desenharCasca();
  function irLocal(){
    modo='local';
    candidatura=filaCriarOuAchar(vid,nome);
    gravarRef({modo:'local',id:candidatura.id});
    prepararLocal();
  }
  esperarSB(function(sb){
    modo='remoto';sb2=sb;
    criarCandidaturaRemota(sb,vid,nome,function(row,erro){
      if(!row){irLocal();return}
      candidatura=row;
      gravarRef({modo:'remoto',id:row.id});
      mensagens=[];vistas={};
      prepararRemoto();
    });
  },irLocal);
}

function retomarJulgamento(ref){
  modo=ref.modo;
  desenharCasca();
  if(modo==='remoto'){
    esperarSB(function(sb){
      sb2=sb;
      sb.from('candidaturas').select('*').eq('id',ref.id).single().then(function(r){
        if(!r.data){limparRef();mostrarIntro();return}
        candidatura=r.data;mensagens=[];vistas={};
        prepararRemoto();
      });
    },function(){
      /* supabase sumiu de vez desse deploy: melhor recomecar do zero do que travar numa sala fantasma */
      limparRef();mostrarIntro();
    });
  }else{
    var achada=filaAchar(ref.id);
    if(!achada){limparRef();mostrarIntro();return}
    candidatura=achada;
    prepararLocal();
  }
}

function criarCandidaturaRemota(sb,visitorId,nome,cb){
  var tentativas=0;
  function tentar(){
    tentativas++;
    sb.from('candidaturas').insert({visitor_id:visitorId,nome:nome,status:'pendente'}).select().single().then(function(r){
      if(r.error||!r.data){if(tentativas<5){setTimeout(tentar,1200*tentativas);return}cb(null,r.error);return}
      cb(r.data);
    }).catch(function(err){if(tentativas<5){setTimeout(tentar,1200*tentativas);return}cb(null,err)});
  }
  tentar();
}

function prepararRemoto(){
  pedirNotificacao();
  desenharSala();
  sb2.from('mensagens_candidatura').select('*').eq('candidatura_id',candidatura.id).order('id',{ascending:true}).then(function(r){
    (r.data||[]).forEach(function(m){if(!vistas[m.id]){vistas[m.id]=1;mensagens.push(m)}});
    if(!mensagens.length)enviarMensagem('dono','...');
    desenharSala();
  });
  sb2.channel('julgamento-'+candidatura.id)
    .on('postgres_changes',{event:'UPDATE',schema:'public',table:'candidaturas',filter:'id=eq.'+candidatura.id},function(p){
      if(p.new&&p.new.status&&p.new.status!=='pendente')receberDecisao(p.new.status);
    })
    .on('postgres_changes',{event:'INSERT',schema:'public',table:'mensagens_candidatura',filter:'candidatura_id=eq.'+candidatura.id},function(p){
      receberMensagem(p.new);
    })
    .subscribe();
  var tentativas=0,poll=setInterval(function(){
    tentativas++;
    if(candidatura.status!=='pendente'||tentativas>300){clearInterval(poll);return}
    sb2.from('candidaturas').select('status').eq('id',candidatura.id).single().then(function(r){
      if(r.data&&r.data.status&&r.data.status!=='pendente')receberDecisao(r.data.status);
    });
    var ultimoId=0;mensagens.forEach(function(m){if(m.id>ultimoId)ultimoId=m.id});
    sb2.from('mensagens_candidatura').select('*').eq('candidatura_id',candidatura.id).gt('id',ultimoId).then(function(r){
      (r.data||[]).forEach(receberMensagem);
    });
  },4000);
}

function prepararLocal(){
  pedirNotificacao();
  if(!candidatura.mensagens.length)filaMensagem(candidatura.id,'dono','...');
  filaOuvintes.push(function(){
    var atual=filaAchar(candidatura.id);
    if(!atual)return;
    var statusVelho=candidatura.status;
    candidatura=atual;
    if(statusVelho==='pendente'&&atual.status!=='pendente')notificar('QAWSED','o veredito saiu.');
    desenharSala();
  });
  desenharSala();
}

function receberDecisao(status){
  if(candidatura.status==='pendente')notificar('QAWSED','o veredito saiu.');
  candidatura.status=status;
  desenharSala();
}
function receberMensagem(m){
  if(vistas[m.id])return;
  vistas[m.id]=1;mensagens.push(m);
  if(m.autor==='dono'&&document.hidden)notificar(pegarNomeBixin(),m.texto);
  desenharSala();
}

function enviarMensagem(autor,texto){
  texto=(texto||'').trim().slice(0,300);
  if(!texto)return;
  if(modo==='remoto'){
    sb2.from('mensagens_candidatura').insert({candidatura_id:candidatura.id,autor:autor,texto:texto}).then(function(){});
  }else{
    filaMensagem(candidatura.id,autor,texto);
  }
}

function desenharCasca(){
  el.innerHTML='';
  salaWrap=document.createElement('div');salaWrap.className='sala-julgamento';
  var esp=document.createElement('p');esp.className='veredito-espera';esp.textContent='entrando na sala...';
  salaWrap.appendChild(esp);
  el.appendChild(salaWrap);
}

function copiarNumero(txt,btn){
  var ok=function(){btn.textContent='COPIADO';setTimeout(function(){btn.textContent='COPIAR NUMERO'},1600)};
  if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(txt).then(ok).catch(function(){prompt('seu numero:',txt)});
  else prompt('seu numero:',txt);
}

function desenharSala(){
  if(!salaWrap)return;
  salaWrap.innerHTML='';
  var vid=candidatura.visitor_id;

  var cab=document.createElement('div');cab.className='sala-cabecalho';
  cab.appendChild(montarAvatar(vid,candidatura.status==='aceito',false));
  var textos=document.createElement('div');
  var nomeEl=document.createElement('span');nomeEl.className='nome-bixo vhs';nomeEl.textContent=candidatura.nome||'SEM-NOME';textos.appendChild(nomeEl);
  var statusEl=document.createElement('span');statusEl.className='status-bixo';
  statusEl.textContent=candidatura.status==='pendente'?'diante do qawsed, esperando.':(candidatura.status==='aceito'?'aceito.':'negado.');
  textos.appendChild(statusEl);
  cab.appendChild(textos);
  salaWrap.appendChild(cab);

  if(candidatura.status==='pendente'){
    var aviso=document.createElement('div');aviso.className='sala-aviso';
    aviso.textContent='voce pode fechar essa aba a qualquer momento. sua conversa fica guardada, e quando o qawsed decidir, e so voltar em /qawsedista/ que essa mesma sala abre de novo, do jeito que voce deixou. seu numero: #'+vid+'.';
    var bcopiar=document.createElement('button');bcopiar.type='button';bcopiar.className='tag';bcopiar.textContent='COPIAR NUMERO';
    bcopiar.onclick=function(){copiarNumero('#'+vid,bcopiar)};
    aviso.appendChild(bcopiar);
    salaWrap.appendChild(aviso);
  }

  if(candidatura.status!=='pendente'){
    var v=(D.veredito||{})[candidatura.status]||{};
    var vd=document.createElement('div');vd.className='veredito veredito-resultado';
    var h=document.createElement('h2');h.className='sigil';h.textContent=v.titulo||'';vd.appendChild(h);
    var p=document.createElement('p');p.textContent=v.texto||'';vd.appendChild(p);
    salaWrap.appendChild(vd);
  }

  var wrapChat=document.createElement('div');wrapChat.className='chat-qawsed';
  var corpo=document.createElement('div');corpo.className='chat-corpo';
  var lista=modo==='remoto'?mensagens:candidatura.mensagens;
  lista.forEach(function(m){
    var b=document.createElement('div');b.className='balao-chat'+(m.autor==='candidato'?' eu':'');
    b.textContent=m.texto;corpo.appendChild(b);
  });
  wrapChat.appendChild(corpo);
  salaWrap.appendChild(wrapChat);
  corpo.scrollTop=corpo.scrollHeight;

  if(candidatura.status==='pendente'){
    var entrada=document.createElement('div');entrada.className='chat-entrada';
    var input=document.createElement('input');input.type='text';input.maxLength=300;input.placeholder='fala com ele...';
    var benviar=document.createElement('button');benviar.type='button';benviar.className='tag';benviar.textContent='ENVIAR';
    function mandar(){var t=input.value;if(!t.trim())return;enviarMensagem('candidato',t);input.value=''}
    benviar.onclick=mandar;
    input.addEventListener('keydown',function(e){if(e.key==='Enter')mandar()});
    entrada.appendChild(input);entrada.appendChild(benviar);
    salaWrap.appendChild(entrada);
  }else{
    var reiniciar=document.createElement('button');reiniciar.type='button';reiniciar.className='sala-reiniciar';
    reiniciar.textContent='apagar essa candidatura e recomecar do zero';
    reiniciar.onclick=function(){
      limparRef();
      try{localStorage.removeItem('qaw_nome_bixin')}catch(e){}
      if(candidatura.status==='aceito')try{localStorage.setItem('qaw_aceito','1')}catch(e){}
      location.reload();
    };
    salaWrap.appendChild(reiniciar);
    if(candidatura.status==='aceito')try{localStorage.setItem('qaw_aceito','1')}catch(e){}
  }
}

/* ---- PAINEL DO DONO: lista quem esta esperando decisao de verdade, remoto (qualquer aparelho)
   ou local (so nesse aparelho, quando o supabase nao ta configurado nesse deploy) -- nunca os dois
   misturados, pra nunca dar de aparecer "ninguem esperando" enquanto tem gente esperando de fato. ---- */
var painelEl=null;
function montarPainelDono(){
  if(painelEl)return;
  painelEl=document.createElement('div');painelEl.className='painel-dono';
  painelEl.innerHTML='<h3 class="vhs">candidaturas pendentes</h3><div class="lista-candidaturas"></div>';
  document.body.appendChild(painelEl);
  var lista=painelEl.querySelector('.lista-candidaturas');

  function renderLista(items,remoto){
    lista.innerHTML='';
    if(!items.length){var v=document.createElement('p');v.className='vazio';v.textContent='ninguem esperando.';lista.appendChild(v);return}
    items.forEach(function(row){
      var d=document.createElement('div');d.className='candidatura';
      var topo=document.createElement('div');topo.className='cab-candidatura';
      topo.appendChild(montarAvatar(row.visitor_id,false,true));
      var info=document.createElement('div');
      var t=document.createElement('p');t.className='nome';t.textContent=(row.nome||'SEM-NOME')+' (#'+row.visitor_id+')';info.appendChild(t);
      var b=document.createElement('div');b.className='botoes';
      var ac=document.createElement('button');ac.className='tag';ac.textContent='ACEITAR';
      var ng=document.createElement('button');ng.className='tag';ng.textContent='NEGAR';
      var cv=document.createElement('button');cv.className='tag';cv.textContent='CONVERSA';
      function decidir(status){
        ac.disabled=true;ng.disabled=true;
        if(remoto)sb.from('candidaturas').update({status:status}).eq('id',row.id).then(function(){});
        else filaAtualizar(row.id,{status:status});
      }
      ac.onclick=function(){decidir('aceito')};
      ng.onclick=function(){decidir('negado')};
      b.appendChild(ac);b.appendChild(ng);b.appendChild(cv);
      info.appendChild(b);
      var conversaBox=document.createElement('div');conversaBox.className='conversa';conversaBox.style.display='none';
      cv.onclick=function(){
        var aberta=conversaBox.style.display!=='none';
        conversaBox.style.display=aberta?'none':'block';
        cv.textContent=aberta?'CONVERSA':'FECHAR';
        if(!aberta)montarConversa(conversaBox,row,remoto,sb);
      };
      info.appendChild(conversaBox);
      d.appendChild(topo);topo.appendChild(info);
      lista.appendChild(d);
    });
  }

  var sb=null;
  function carregarRemoto(){
    sb.from('candidaturas').select('id,visitor_id,nome,criado_em').eq('status','pendente').order('criado_em',{ascending:true}).then(function(r){renderLista(r.data||[],true)});
  }
  function carregarLocal(){
    renderLista(filaLer().filter(function(c){return c.status==='pendente'}),false);
  }

  esperarSB(function(sbEncontrado){
    sb=sbEncontrado;
    carregarRemoto();
    sb.channel('painel-dono').on('postgres_changes',{event:'*',schema:'public',table:'candidaturas'},function(){carregarRemoto()}).subscribe();
  },function(){
    carregarLocal();
    filaOuvintes.push(carregarLocal);
  });
}

function montarConversa(box,row,remoto,sb){
  box.innerHTML='';
  var corpo=document.createElement('div');corpo.className='chat-corpo';box.appendChild(corpo);
  var entrada=document.createElement('div');entrada.className='chat-entrada';
  var input=document.createElement('input');input.type='text';input.maxLength=300;input.placeholder='responde ele...';
  var benviar=document.createElement('button');benviar.type='button';benviar.className='tag';benviar.textContent='ENVIAR';
  entrada.appendChild(input);entrada.appendChild(benviar);box.appendChild(entrada);

  function pintar(msgs){
    corpo.innerHTML='';
    if(!msgs.length){var v=document.createElement('p');v.className='vazia-conversa';v.textContent='sem mensagens ainda.';corpo.appendChild(v)}
    msgs.forEach(function(m){var b=document.createElement('div');b.className='balao-chat'+(m.autor==='dono'?' eu':'');b.textContent=m.texto;corpo.appendChild(b)});
    corpo.scrollTop=corpo.scrollHeight;
  }
  function mandar(){
    var t=input.value;if(!t.trim())return;
    if(remoto)sb.from('mensagens_candidatura').insert({candidatura_id:row.id,autor:'dono',texto:t.trim().slice(0,300)}).then(function(){});
    else filaMensagem(row.id,'dono',t.trim().slice(0,300));
    input.value='';
  }
  benviar.onclick=mandar;
  input.addEventListener('keydown',function(e){if(e.key==='Enter')mandar()});

  if(remoto){
    sb.from('mensagens_candidatura').select('*').eq('candidatura_id',row.id).order('id',{ascending:true}).then(function(r){pintar(r.data||[])});
    sb.channel('painel-conversa-'+row.id).on('postgres_changes',{event:'INSERT',schema:'public',table:'mensagens_candidatura',filter:'candidatura_id=eq.'+row.id},function(){
      sb.from('mensagens_candidatura').select('*').eq('candidatura_id',row.id).order('id',{ascending:true}).then(function(r){pintar(r.data||[])});
    }).subscribe();
  }else{
    pintar((filaAchar(row.id)||{mensagens:[]}).mensagens);
    filaOuvintes.push(function(){var achada=filaAchar(row.id);if(achada)pintar(achada.mensagens)});
  }
}

var refExistente=lerRef();
if(refExistente){iniciarJulgamento()}else{mostrarIntro()}
if(ehDono())montarPainelDono();
})();
