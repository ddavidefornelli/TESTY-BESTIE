# Test Jev

Uno smoke test, senza framework o dipendenze: Bun serve `index.html` e inoltra le richieste a TypeSafe da `server/index.js`.

## Avvio

```sh
cp .env.example .env
# Inserisci la tua chiave in TYPESAFE_API_KEY nel file .env
bun run dev
```

Apri http://localhost:3001, inserisci un testo e una domanda sì/no, poi premi **Prova Jev**. La pagina mostra lo stato HTTP e la risposta JSON.

La chiave resta sul server. Il modello predefinito è `jev-latest`, modificabile con `TYPESAFE_MODEL` in `.env`. Timeout: 30 secondi.

`POST /api/typesafe` accetta `{ state, questions }`; la validazione delle domande è lasciata a TypeSafe. Documentazione: https://docs.typesafe.ai/api

Per avviare senza watch: `bun run start`. Nessuna build necessaria. Il server ascolta solo su localhost.
