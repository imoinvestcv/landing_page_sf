# IMO INVEST — Site institucional

Site estático (HTML/CSS/JS puro, sem build). Uma página, trilingue PT / EN / FR.

## Estrutura

```
index.html      página única (estilos e scripts inline)
i18n.js         dicionário de traduções PT / EN / FR
images/         todas as imagens (auto-hospedadas)
api/send.js     função serverless (Vercel) — envio do formulário via Resend
vercel.json     headers de cache e segurança
robots.txt
.env.example    modelo da variável de ambiente (a chave real nunca vai para o git)
```

## Deploy — GitHub → Vercel

1. Criar um repositório no GitHub e enviar **o conteúdo desta pasta** para a raiz:
   ```bash
   cd imo-invest-site
   git init
   git add .
   git commit -m "IMO INVEST — site institucional"
   git branch -M main
   git remote add origin https://github.com/<utilizador>/<repo>.git
   git push -u origin main
   ```
2. Em [vercel.com](https://vercel.com) → **Add New → Project** → importar o repositório.
3. Configuração:
   - **Framework Preset:** Other
   - **Build Command:** (vazio)
   - **Output Directory:** (vazio — raiz)
4. **Variável de ambiente (obrigatória para o formulário):**
   Project → **Settings → Environment Variables** → adicionar
   - Name: `RESEND_API_KEY`
   - Value: a chave da API Resend (criada em [resend.com/api-keys](https://resend.com/api-keys))
   - Environments: Production, Preview e Development
5. Deploy. Cada `git push` para `main` publica automaticamente.

### Deploy em VPS (alternativa)

É um site estático — basta servir a pasta com nginx/Apache/Caddy. **Atenção:** a
função `api/send.js` só corre na Vercel; num VPS puro o formulário precisa de um
pequeno serviço Node equivalente (ou manter o envio na Vercel).

Exemplo nginx:

```nginx
server {
  listen 80;
  server_name imo-invest.cv www.imo-invest.cv;
  root /var/www/imo-invest-site;
  index index.html;
  location /images/ { add_header Cache-Control "public, max-age=31536000, immutable"; }
}
```

## Depois de ligar o domínio final

- Em `index.html`, substituir `og:image` / `twitter:image` pelo URL absoluto
  (ex.: `https://www.imo-invest.cv/images/hero.jpeg`) e, opcionalmente,
  acrescentar `<link rel="canonical" href="https://www.imo-invest.cv/">`.
- Em `robots.txt`, ativar a linha do sitemap se criar um.

## Formulário de contacto (Resend)

O formulário faz POST para `/api/send`, que envia o email via
[Resend](https://resend.com) para `imoinvestcaboverde@gmail.com`, com
`reply_to` preenchido com o email do visitante — responder é só carregar em
"Responder". Inclui honeypot anti-spam e validação no servidor.

- **A chave da API vive só na variável de ambiente** `RESEND_API_KEY` (Vercel) —
  nunca no código nem no repositório. O `.env` local serve apenas para testar
  com `vercel dev` e está no `.gitignore`.
- **Remetente:** enquanto usar `onboarding@resend.dev`, o Resend só entrega ao
  email da própria conta. Para enviar de um endereço da marca (ex.:
  `info@imoinvest.cv`) e para qualquer destinatário, verificar o domínio em
  [resend.com/domains](https://resend.com/domains) e trocar o `from` em
  `api/send.js`.
- **Testar localmente:** `npm i -g vercel` → `vercel dev` na pasta do projeto.
- Se a chave alguma vez for exposta, revogá-la e criar outra em
  [resend.com/api-keys](https://resend.com/api-keys).

## Contactos no site

- Email: info@imoinvest.cv
- Telefone / WhatsApp: +238 921 78 38 (FAB liga a `wa.link/uml5bo`)
