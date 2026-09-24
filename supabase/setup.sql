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
