# Jogos editoriais

Este arquivo cobre apenas partidas confirmadas que não sejam entregues por nenhuma das duas APIs. Ele é lido pelo coletor e aparece junto da programação normal:

`public/data/editorial/fixtures.json`

Mantenha `fixtures` vazio até ter uma fonte verificável. Cada registro deve usar o mesmo formato da aplicação, ter um `id` negativo e exclusivo, e data ISO em UTC. Exemplo:

```json
{
  "id": -900001,
  "startsAt": "2026-09-03T21:30:00Z",
  "status": "scheduled",
  "league": { "id": -100, "name": "Copa do Brasil", "country": "Brasil" },
  "home": { "id": -101, "name": "Palmeiras" },
  "away": { "id": -102, "name": "Santos" },
  "sourceUrl": "https://fonte-verificavel.example/jogos"
}
```

Use uma fonte oficial ou uma emissora confiável e não inclua placares estimados. Os campos `sourceUrl` e `broadcast` (lista de canais/plataformas) são opcionais e preservados no JSON para auditoria.
