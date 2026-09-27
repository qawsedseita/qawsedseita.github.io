-- Rode isto INTEIRO no SQL Editor do seu projeto Supabase (supabase.com > seu projeto > SQL Editor > New query).
-- Pode selecionar o arquivo inteiro e rodar de uma vez, mesmo que voce ja tenha rodado ele (ou partes dele)
-- antes -- toda parte aqui embaixo checa se a coisa ja existe antes de criar, entao nao da erro de duplicado.

create table if not exists comentarios (
  id bigint generated always as identity primary key,
  criado_em timestamptz not null default now(),
  visitor_id bigint not null,
  nome text not null check (char_length(nome) between 1 and 30),
  texto text not null check (char_length(texto) between 1 and 140)
);

create table if not exists comida_eventos (
  id bigint generated always as identity primary key,
  criado_em timestamptz not null default now(),
  visitor_id bigint not null
);

alter table comentarios enable row level security;
alter table comida_eventos enable row level security;

-- qualquer visitante (chave anon) pode ler e inserir; ninguem pode editar/apagar pelo site
drop policy if exists "leitura publica comentarios" on comentarios;
create policy "leitura publica comentarios" on comentarios for select using (true);
drop policy if exists "insercao publica comentarios" on comentarios;
create policy "insercao publica comentarios" on comentarios for insert with check (true);

drop policy if exists "leitura publica comida" on comida_eventos;
create policy "leitura publica comida" on comida_eventos for select using (true);
drop policy if exists "insercao publica comida" on comida_eventos;
create policy "insercao publica comida" on comida_eventos for insert with check (true);

-- ativa o Realtime nas tabelas (pra todo mundo ver na hora), so se ainda nao estiver ativado
do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and tablename='comentarios') then
    alter publication supabase_realtime add table comentarios;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and tablename='comida_eventos') then
    alter publication supabase_realtime add table comida_eventos;
  end if;
end $$;

-- ============================================================
-- BLOCO (entrevista do qawsedista, decisao a distancia).
-- ============================================================

create table if not exists candidaturas (
  id bigint generated always as identity primary key,
  criado_em timestamptz not null default now(),
  visitor_id bigint not null,
  nome text,
  status text not null default 'pendente' check (status in ('pendente','aceito','negado'))
);

-- se a tabela ja existia de uma versao anterior (sem a coluna "nome"), isso adiciona ela sem quebrar nada
alter table candidaturas add column if not exists nome text;

alter table candidaturas enable row level security;

-- qualquer visitante pode criar sua candidatura e ler status (pra saber se foi aceito)
drop policy if exists "leitura publica candidaturas" on candidaturas;
create policy "leitura publica candidaturas" on candidaturas for select using (true);
drop policy if exists "insercao publica candidaturas" on candidaturas;
create policy "insercao publica candidaturas" on candidaturas for insert with check (true);
-- so permite mudar de "pendente" pra "aceito"/"negado" (o codigo secreto no site e quem controla quem mexe nisso,
-- mas tecnicamente, como o site e estatico, qualquer um com a anon key poderia chamar isso direto -- e um blog
-- pessoal, nao um sistema com autenticacao de verdade, entao aceitamos esse risco baixo)
drop policy if exists "atualizacao publica candidaturas" on candidaturas;
create policy "atualizacao publica candidaturas" on candidaturas for update using (true) with check (status in ('aceito','negado'));

do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and tablename='candidaturas') then
    alter publication supabase_realtime add table candidaturas;
  end if;
end $$;

-- ============================================================
-- BLOCO (chat ao vivo entre voce e quem esta se candidatando).
-- ============================================================

create table if not exists mensagens_candidatura (
  id bigint generated always as identity primary key,
  criado_em timestamptz not null default now(),
  candidatura_id bigint not null references candidaturas(id) on delete cascade,
  autor text not null check (autor in ('candidato','dono')),
  texto text not null check (char_length(texto) between 1 and 300)
);

alter table mensagens_candidatura enable row level security;
drop policy if exists "leitura publica mensagens_candidatura" on mensagens_candidatura;
create policy "leitura publica mensagens_candidatura" on mensagens_candidatura for select using (true);
drop policy if exists "insercao publica mensagens_candidatura" on mensagens_candidatura;
create policy "insercao publica mensagens_candidatura" on mensagens_candidatura for insert with check (true);

do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and tablename='mensagens_candidatura') then
    alter publication supabase_realtime add table mensagens_candidatura;
  end if;
end $$;
