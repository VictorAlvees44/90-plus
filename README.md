# 90+

Painel pessoal de futebol, feito como PWA estática para GitHub Pages. © Victor Alves.

## Rodar localmente

```bash
npm install
npm run dev
```

## Dados

O app consome snapshots JSON de `public/data`; ele nunca chama uma API no navegador. A coleta usa `API_FOOTBALL_KEY` como fonte principal e, se ela falhar, tenta `FOOTBALL_DATA_KEY` como contingência para as competições cobertas pelo plano gratuito. As duas chaves ficam apenas como GitHub Secrets. Jogos confirmados que não existam nas duas fontes podem ser incluídos de forma auditável em [public/data/editorial/fixtures.json](public/data/editorial/fixtures.json); veja [o guia editorial](docs/EDITORIAL-JOGOS.md). Consulte [o guia de celular](docs/GUIA-CELULAR.md) para configurar e publicar.

## Validar

```bash
npm run lint
npm test
npm run build
```

## Limitações

Os planos gratuitos das fontes definem a cobertura e o limite diário. A contingência cobre Brasileirão Série A, Premier League, Championship, Bundesliga e Serie A italiana; copas nacionais dependem da fonte principal ou de um registro editorial verificado. Odds, apostas e futebol feminino não fazem parte do projeto.
