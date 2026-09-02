# 90+

Painel pessoal de futebol, feito como PWA estática para GitHub Pages. © Victor Alves.

## Rodar localmente

```bash
npm install
npm run dev
```

## Dados

O app consome snapshots JSON de `public/data`; ele nunca chama a API-Football no navegador. A coleta usa a variável `API_FOOTBALL_KEY`, configurada apenas como GitHub Secret. Consulte [o guia de celular](docs/GUIA-CELULAR.md) para configurar e publicar.

## Validar

```bash
npm run lint
npm test
npm run build
```

## Limitações

O plano gratuito da API-Football define a cobertura e o limite diário. Se um dado não vier da API, o 90+ não o exibe. Odds, apostas e futebol feminino não fazem parte do projeto.
