# Guia: do zero ao 90+ no iPhone

Este guia usa GitHub Pages e API-Football no plano gratuito. Para manter GitHub Actions e Pages sem custo, crie um repositório **público**.

## 1. Preparar as contas e programas

1. Crie uma conta em [github.com](https://github.com) e confirme seu e-mail.
2. Crie um repositório público chamado `90-plus`.
3. Instale o [Git](https://git-scm.com/downloads) e o [Node.js LTS](https://nodejs.org/). Feche e abra o terminal após instalar.
4. No GitHub, copie a URL HTTPS do repositório. No terminal, execute:

```bash
git clone https://github.com/SEU-USUARIO/90-plus.git
cd 90-plus
npm install
```

5. Abra essa pasta no VS Code. Para testar localmente, execute:

```bash
npm run dev
```

Abra o endereço mostrado pelo terminal (normalmente `http://localhost:5173`).

## 2. Configurar a API-Football com segurança

1. Crie uma conta no plano gratuito em [API-Football](https://www.api-football.com/).
2. Copie sua chave no painel da API.
3. No repositório GitHub, abra **Settings → Secrets and variables → Actions → New repository secret**.
4. Use exatamente o nome `API_FOOTBALL_KEY` e cole a chave em **Secret**.

Nunca coloque a chave em arquivo `.env` enviado ao GitHub, no código React, no README ou em commits. O workflow usa a chave somente durante a coleta.

## 3. Fazer a primeira coleta

No GitHub, abra **Actions → Update football data → Run workflow → Run workflow**. Ao terminar, o workflow cria um commit com arquivos em `public/data`. Verifique em `public/data/fixtures/today.json` se há `updatedAt` e partidas. Se não houver partidas prioritárias no dia, a lista ficará vazia corretamente.

O coletor usa `/leagues` para validar competições e coverage, três buscas de fixtures por data (ontem, hoje e amanhã) e tabelas das competições disponíveis. A programação inclui as ligas, divisões nacionais e copas adultas masculinas de Brasil, Inglaterra, Itália e Alemanha; uma copa vista nas partidas também é aceita quando não aparece em `/leagues?current`. O plano Free da API-Football não libera a consulta em lote necessária para eventos, escalações e estatísticas detalhadas de partidas; esses blocos só aparecem quando houver uma fonte compatível. O coletor preserva o último JSON válido se uma chamada falhar ou a quota ficar baixa. O workflow **Update club and player profiles** roda uma vez por dia, atualiza até seis equipes, três perfis aprofundados de jogadores e listas de artilharia de até quatro competições. O plano completo foi calculado para ficar dentro de 100 requisições diárias.

## 4. Publicar no GitHub Pages

1. Envie o projeto para o GitHub:

```bash
git add .
git commit -m "feat: iniciar 90+"
git push -u origin main
```

2. No GitHub, abra **Settings → Pages**.
3. Em **Build and deployment**, selecione **GitHub Actions**.
4. O workflow **Deploy PWA** roda após cada push na `main`. Quando terminar, Pages mostra o endereço `https://SEU-USUARIO.github.io/90-plus/`.

Os assets e rotas já consideram o caminho `/90-plus/`. Se o repositório tiver outro nome, altere `base` em `vite.config.ts` antes de publicar.

Para criar uma versão marcada, abra **Actions → Version app → Run workflow**, escolha `patch`, `minor` ou `major` e execute. O workflow atualiza `package.json`, cria a tag Git correspondente e envia ambos ao repositório.

## 5. Instalar no iPhone

1. Abra o endereço do Pages no **Safari**.
2. Toque em **Compartilhar**.
3. Escolha **Adicionar à Tela de Início**.
4. Confirme o nome e toque em **Adicionar**.
5. Abra o 90+ pelo ícone. Ele deve abrir sem a barra do Safari.

Na primeira abertura, o app salva o shell e os JSONs recentes. Para testar offline, abra uma vez conectado, ative o Modo Avião e abra de novo. Dados atualizados dependem de conexão; o app não deve apresentar dados ao vivo como atuais quando estiver usando um snapshot antigo.

Em **Configurações**, escolha um único time de coração. Essa preferência fica somente no navegador do seu aparelho e não é enviada para nenhum serviço. A mesma tela informa quando os dados foram atualizados, o consumo da última coleta, o estado do cache e se o app está offline ou instalado.

## Problemas comuns

- **A coleta falhou:** confirme que o secret se chama exatamente `API_FOOTBALL_KEY` e que o plano/API estão ativos.
- **A página ficou em branco:** abra a aba Actions e confira se `npm run build` passou; depois confira o `base` do Vite.
- **Ícone antigo no iPhone:** remova o ícone da Tela de Início, feche o Safari e adicione novamente.
- **Sem jogos:** isto pode ser normal. O 90+ não cria partidas nem completa dados não fornecidos pela API.
