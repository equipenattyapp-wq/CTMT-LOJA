# CTMT Boxe Store

Site estático em HTML, CSS e JavaScript. Abra `index.html` ou publique a pasta inteira em qualquer hospedagem estática.

## Mídia da hero

O fundo animado atual usa `assets/hero-ctmt.mp4`, com
`assets/hero-ctmt-poster.jpg` como capa e fallback. O MP4 substitui o GIF para
reduzir o consumo de memória e processamento, especialmente em Android.

## Docker

Crie a imagem:

```bash
docker build -t ctmt-loja .
```

Execute o container:

```bash
docker run --rm -p 8080:80 ctmt-loja
```

O site ficará disponível em `http://localhost:8080`.

## WhatsApp oficial

Em `script.js`, localize:

```js
const whatsappNumber = "";
```

Informe o número com código do país e DDD, somente números. Exemplo:

```js
const whatsappNumber = "5511999999999";
```

Enquanto o campo estiver vazio, o checkout abre o WhatsApp e permite escolher o contato.

## Produtos

Os nomes, preços e categorias ficam em `index.html`. O carrinho é salvo no `localStorage` do navegador.
