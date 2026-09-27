-- Rode isto inteiro no SQL Editor do seu projeto Supabase (supabase.com > seu projeto > SQL Editor > New query)

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
create policy "leitura publica comentarios" on comentarios for select using (true);
create policy "insercao publica comentarios" on comentarios for insert with check (true);

create policy "leitura publica comida" on comida_eventos for select using (true);
create policy "insercao publica comida" on comida_eventos for insert with check (true);

-- ativa o Realtime nas duas tabelas (pra todo mundo ver os comentarios/comida na hora)
alter publication supabase_realtime add table comentarios, comida_eventos;

-- ============================================================
-- BLOCO NOVO (entrevista do qawsedista, decisao a distancia).
-- Se voce ja rodou o bloco acima antes, so precisa rodar DAQUI PRA BAIXO.
-- ============================================================

create table if not exists candidaturas (
  id bigint generated always as identity primary key,
  criado_em timestamptz not null default now(),
  visitor_id bigint not null,
  status text not null default 'pendente' check (status in ('pendente','aceito','negado'))
);

alter table candidaturas enable row level security;

-- qualquer visitante pode criar sua candidatura e ler status (pra saber se foi aceito)
create policy "leitura publica candidaturas" on candidaturas for select using (true);
create policy "insercao publica candidaturas" on candidaturas for insert with check (true);
-- so permite mudar de "pendente" pra "aceito"/"negado" (o codigo secreto no site e quem controla quem mexe nisso,
-- mas tecnicamente, como o site e estatico, qualquer um com a anon key poderia chamar isso direto -- e um blog
-- pessoal, nao um sistema com autenticacao de verdade, entao aceitamos esse risco baixo)
create policy "atualizacao publica candidaturas" on candidaturas for update using (true) with check (status in ('aceito','negado'));

alter publication supabase_realtime add table candidaturas;
