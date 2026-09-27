(function(){
var D=window.QAWSED_DADOS||{};
var el=document.getElementById('entrevista');
var vhs=document.getElementById('transicao-vhs');
if(!el)return;

function pegarSB(){return window.QAWSED_SB||null}
function esperarSB(cb,tentativas){
  tentativas=tentativas||0;
  var sb=pegarSB();
  if(sb){cb(sb);return}
  if(!sb&&tentativas>25)return; /* uns 5s tentando, depois desiste (supabase mesmo desligado) */
  setTimeout(function(){esperarSB(cb,tentativas+1)},200);
}
function pegarVisitorId(){
  try{var v=parseInt(localStorage.qaw_id);if(v)return v}catch(e){}
  return Math.floor(Math.random()*1e9);
}

/* transicao (reaproveita a mesma transicao VHS do resto do site) */
function wipe(cb){
  if(vhs){vhs.classList.remove('jogar');void vhs.offsetWidth;vhs.classList.add('jogar')}
  setTimeout(cb,420);
  setTimeout(function(){if(vhs)vhs.classList.remove('jogar')},950);
}

/* ---- MODO DONO: segredo pra revelar o botao de aceitar/negar ---- */
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
    if(tentarCodigo(r)){
      montarPainelDono();
      if(typeof atualizarVeredito==='function')atualizarVeredito();
    }
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

/* ---- STAGE 4: chat com o qawsed ---- */
function iniciarChat(){
  el.innerHTML='';
  var wrap=document.createElement('div');wrap.className='chat-qawsed';
  var cab=document.createElement('p');cab.className='chat-cabecalho vhs';cab.textContent='QAWSED';wrap.appendChild(cab);
  var corpo=document.createElement('div');corpo.className='chat-corpo';wrap.appendChild(corpo);
  el.appendChild(wrap);
  var linhas=(D.chat||[]).slice();
  function prox(){
    if(!linhas.length){setTimeout(function(){wipe(renderVeredito)},500);return}
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

/* ---- STAGE 5: veredito ----
   se o supabase estiver configurado, a candidatura vai pro banco e a decisao
   pode vir de outro aparelho (o do dono), em tempo real.
   se nao estiver configurado, cai no modo antigo: so decide quem estiver
   no mesmo aparelho e souber o codigo. */
var vereditoWrap=null,decidido=null,modoRemoto=false,candidaturaId=null;
function renderVeredito(){
  el.innerHTML='';
  vereditoWrap=document.createElement('div');vereditoWrap.className='veredito';
  el.appendChild(vereditoWrap);
  var sb=pegarSB();
  if(sb){
    modoRemoto=true;
    vereditoWrap.innerHTML='<p class="veredito-espera">enviando pro qawsed...</p>';
    sb.from('candidaturas').insert({visitor_id:pegarVisitorId(),status:'pendente'}).select().single().then(function(r){
      if(r.error||!r.data){modoRemoto=false;atualizarVeredito();return}
      candidaturaId=r.data.id;
      escutarCandidatura();
      atualizarVeredito();
    }).catch(function(){modoRemoto=false;atualizarVeredito()});
  }else{
    atualizarVeredito();
  }
}
function escutarCandidatura(){
  var sb=pegarSB();if(!sb||!candidaturaId)return;
  sb.channel('candidatura-'+candidaturaId).on('postgres_changes',
    {event:'UPDATE',schema:'public',table:'candidaturas',filter:'id=eq.'+candidaturaId},
    function(p){if(p.new&&p.new.status&&p.new.status!=='pendente'){decidido=p.new.status;wipe(atualizarVeredito)}}
  ).subscribe();
  var tentativas=0,poll=setInterval(function(){
    tentativas++;
    if(decidido||tentativas>150){clearInterval(poll);return} /* poll de reserva, ~10min, caso o realtime falhe */
    sb.from('candidaturas').select('status').eq('id',candidaturaId).single().then(function(r){
      if(r.data&&r.data.status&&r.data.status!=='pendente'){decidido=r.data.status;clearInterval(poll);wipe(atualizarVeredito)}
    });
  },4000);
}
function atualizarVeredito(){
  if(!vereditoWrap)return;
  vereditoWrap.innerHTML='';
  if(decidido){
    var v=(D.veredito||{})[decidido]||{};
    var h=document.createElement('h2');h.className='sigil';h.textContent=v.titulo||'';vereditoWrap.appendChild(h);
    var p=document.createElement('p');p.textContent=v.texto||'';vereditoWrap.appendChild(p);
    return;
  }
  if(modoRemoto){
    var esp=document.createElement('p');esp.className='veredito-espera';esp.textContent='o qawsed esta decidindo...';vereditoWrap.appendChild(esp);
    return;
  }
  if(ehDono()){
    var pergunta=document.createElement('p');pergunta.className='veredito-espera';pergunta.textContent='so voce ve isso. e agora?';vereditoWrap.appendChild(pergunta);
    var botoes=document.createElement('div');botoes.className='veredito-botoes';
    var ac=document.createElement('button');ac.className='tag';ac.textContent='ACEITAR';
    ac.onclick=function(){decidido='aceito';wipe(atualizarVeredito)};
    var ng=document.createElement('button');ng.className='tag';ng.textContent='NEGAR';
    ng.onclick=function(){decidido='negado';wipe(atualizarVeredito)};
    botoes.appendChild(ac);botoes.appendChild(ng);
    vereditoWrap.appendChild(botoes);
  }else{
    var esp2=document.createElement('p');esp2.className='veredito-espera';esp2.textContent='o qawsed esta decidindo...';vereditoWrap.appendChild(esp2);
  }
}

/* ---- PAINEL DO DONO: lista quem esta esperando decisao, em qualquer aparelho ---- */
var painelEl=null;
function montarPainelDono(){
  if(painelEl)return;
  esperarSB(function(sb){
    painelEl=document.createElement('div');painelEl.className='painel-dono';
    painelEl.innerHTML='<h3 class="vhs">candidaturas pendentes</h3><div class="lista-candidaturas"></div>';
    document.body.appendChild(painelEl);
    var lista=painelEl.querySelector('.lista-candidaturas');
    function decidirRemoto(id,status){sb.from('candidaturas').update({status:status}).eq('id',id).then(function(){})}
    function renderLista(items){
      lista.innerHTML='';
      if(!items.length){var v=document.createElement('p');v.className='vazio';v.textContent='ninguem esperando.';lista.appendChild(v);return}
      items.forEach(function(row){
        var d=document.createElement('div');d.className='candidatura';
        var t=document.createElement('p');t.textContent='visitante #'+row.visitor_id;d.appendChild(t);
        var b=document.createElement('div');b.className='botoes';
        var ac=document.createElement('button');ac.className='tag';ac.textContent='ACEITAR';
        ac.onclick=function(){ac.disabled=true;ng.disabled=true;decidirRemoto(row.id,'aceito')};
        var ng=document.createElement('button');ng.className='tag';ng.textContent='NEGAR';
        ng.onclick=function(){ac.disabled=true;ng.disabled=true;decidirRemoto(row.id,'negado')};
        b.appendChild(ac);b.appendChild(ng);d.appendChild(b);
        lista.appendChild(d);
      });
    }
    function carregar(){
      sb.from('candidaturas').select('id,visitor_id,criado_em').eq('status','pendente').order('criado_em',{ascending:true}).then(function(r){renderLista(r.data||[])});
    }
    carregar();
    sb.channel('painel-dono').on('postgres_changes',{event:'*',schema:'public',table:'candidaturas'},function(){carregar()}).subscribe();
  });
}

mostrarIntro();
if(ehDono())esperarSB(function(){montarPainelDono()});
})();
