# CSS Purger Worker

Este é um Cloudflare Worker construído com [Hono](https://hono.dev/) que expõe um serviço para remover CSS não utilizado de um determinado conteúdo HTML. Ele utiliza a biblioteca [PurgeCSS](https://purgecss.com/) para realizar a otimização.

## Funcionalidades

-   Endpoint protegido por API Key (`/purge`) para processar o CSS.
-   Aceita tanto CSS em string quanto uma URL para um arquivo CSS.
-   Documentação da API interativa com Swagger UI.
-   Estrutura de projeto modular (rotas, serviços, middlewares).

## Começando

### Pré-requisitos

-   [Node.js](https://nodejs.org/) (versão 18 ou superior)
-   Conta na [Cloudflare](https://dash.cloudflare.com/sign-up)
-   Wrangler CLI instalado globalmente ou via `npx`.

### Instalação

1.  Clone o repositório:
    ```bash
    git clone <url-do-repositorio>
    cd css-purger
    ```
2.  Instale as dependências:
    ```bash
    npm install
    ```

### Configuração

O serviço usa uma API Key para proteger o endpoint `/purge`.

1.  Crie um arquivo `.dev.vars` na raiz do projeto para desenvolvimento local.
2.  Adicione sua chave secreta a este arquivo:

    ```ini
    # .dev.vars
    API_KEY="sua-chave-secreta-super-segura"
    ```

    > **Importante**: O arquivo `.dev.vars` já está no `.gitignore` para evitar que segredos sejam enviados para o repositório.

Para produção, você precisará configurar o segredo diretamente no dashboard da Cloudflare:
`wrangler secret put API_KEY`

## Uso

### Desenvolvimento

Para iniciar o servidor de desenvolvimento local:

```bash
npm run dev
```

O worker estará disponível em `http://127.0.0.1:8787`.

### Documentação da API

Após iniciar o servidor, a documentação interativa da API estará disponível em:

**[http://127.0.0.1:8787/docs](http://127.0.0.1:8787/docs)**

Você pode usar a interface do Swagger para explorar os endpoints, ver os schemas e até mesmo fazer requisições de teste diretamente do navegador.

### API

#### `POST /purge`

Este endpoint processa o HTML e o CSS para remover os seletores não utilizados.

-   **Headers**
    -   `Authorization: Bearer <API_KEY>` (Obrigatório)
    -   `Content-Type: application/json`
-   **Body (JSON)**
    -   `html` (string, obrigatório): O conteúdo HTML.
    -   `css` (string, obrigatório): O conteúdo CSS ou uma URL para um arquivo `.css`.

**Exemplo de Request:**

```json
{
  "html": "<html><body><div class=\"usada\">Olá</div></body></html>",
  "css": ".usada { color: blue; } .nao-usada { color: red; }"
}
```

**Exemplo de Resposta (Status `200 OK`)**

```json
{
  "css": ".usada { color: blue; }"
}
```

### Deploy

Para publicar seu worker na Cloudflare:

```bash
npm run deploy```

### Sincronização de Tipos

Para gerar/sincronizar tipos baseados na sua configuração `wrangler.jsonc` (bindings, etc.), execute:

```bash
npm run cf-typegen
```