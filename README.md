# Template do blog

Tudo aqui é texto simples. Para editar no GitHub, abra o arquivo e toque no lápis (Edit).
No PC, edite os arquivos e envie com `git add .` → `git commit -m "mudança"` → `git push`.

## Escrever um post
Crie um arquivo em `_posts/` chamado `AAAA-MM-DD-titulo.md`, por exemplo `2026-10-01-meu-sonho.md`:

    ---
    layout: post
    title: "Meu sonho"
    ---
    Escreva aqui.

Ele aparece sozinho na lista da página inicial.

## Criar uma página nova (ex.: Músicas)
1. Crie `musicas.md` na raiz:

        ---
        layout: pagina
        title: Músicas
        permalink: /musicas/
        ---
        Texto da página.

2. Adicione o link no menu, em `_includes/menu.html`.

## Adicionar imagens
Coloque o arquivo em `assets/img/`. No post ou página: `![descrição](/assets/img/foto.png)`
Antes de enviar, tire os dados (metadados) da imagem se quiser manter o anonimato.

## Adicionar fontes
Coloque os arquivos em `assets/fonts/` com os nomes `titulo.ttf` e `texto.ttf` (ou .otf, .woff, .woff2).
Para outras fontes, copie um bloco `@font-face` no começo de `assets/css/style.css`.

## Mudar cores e tamanhos
Em `assets/css/style.css`, a seção 2 tem as cores, as fontes e a largura.

## Onde fica cada coisa
- `_config.yml`: nome e descrição do blog
- `index.html`: página inicial
- `_includes/menu.html`: menu do topo
- `_includes/rodape.html`: rodapé
- `_layouts/`: moldes de post e de página
