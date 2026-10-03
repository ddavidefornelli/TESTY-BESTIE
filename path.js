import { Grafo } from "./grafo.js";
import { faiScegliere } from "./main.js";

// 66 nodi e 92 archi, senza casualità.
export function creaGrafoTest() {
  const g = new Grafo();
  const settori = ["A", "B", "C", "D", "E", "F"];

  for (const settore of settori) {
    for (let i = 1; i <= 8; i++) {
      g.aggiungiArco(`${settore}${i}`, `${settore}${(i % 8) + 1}`);
    }
    g.aggiungiArco(`${settore}2`, `${settore}6`);
    g.aggiungiArco(`${settore}4`, `${settore}8`);
    // Vicolo cieco.
    g.aggiungiArco(`${settore}3`, `${settore}9`);
    g.aggiungiArco(`${settore}9`, `${settore}10`);
    g.aggiungiArco(`${settore}10`, `${settore}11`);
  }

  for (let i = 0; i < settori.length - 1; i++) {
    g.aggiungiArco(`${settori[i]}5`, `${settori[i + 1]}1`);
    g.aggiungiArco(`${settori[i]}7`, `${settori[i + 1]}3`);
  }

  for (const [da, a] of [
    ["A6", "C4"],
    ["B8", "D2"],
    ["C7", "E5"],
    ["D6", "F2"],
  ]) {
    g.aggiungiArco(da, a);
  }

  return g.posizionati("A1").impostaNodoFinale("F11");
}

// Sola visualizzazione: nodo attuale giallo, arrivo verde, ultimo arco rosso.
export function stampaGrafoGUI(g, precedente = null) {
  const svg = document.querySelector("#grafo");
  svg.replaceChildren();
  const punti = new Map();

  function disegna(tag, attributi) {
    const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
    for (const [nome, valore] of Object.entries(attributi))
      el.setAttribute(nome, valore);
    svg.append(el);
    return el;
  }

  for (const nodo of g.nodi()) {
    const settore = nodo.charCodeAt(0) - 65;
    const numero = Number(nodo.slice(1));
    const cx = 200 + (settore % 3) * 400;
    const cy = 150 + Math.floor(settore / 3) * 400;
    const angolo = ((numero - 1) / 8) * Math.PI * 2;
    punti.set(
      nodo,
      numero <= 8
        ? { x: cx + Math.cos(angolo) * 115, y: cy + Math.sin(angolo) * 115 }
        : { x: cx, y: cy + 115 + (numero - 8) * 40 },
    );
  }

  const visti = new Set();
  for (const da of g.nodi()) {
    for (const a of g.vicini(da)) {
      const chiave = [da, a].sort().join(":");
      if (visti.has(chiave)) continue;
      visti.add(chiave);
      const p = punti.get(da),
        q = punti.get(a);
      const ultimo =
        (da === precedente && a === g.nodoAttuale()) ||
        (a === precedente && da === g.nodoAttuale());
      disegna("line", {
        x1: p.x,
        y1: p.y,
        x2: q.x,
        y2: q.y,
        stroke: ultimo ? "#dc2626" : "#bbb",
        "stroke-width": ultimo ? 4 : 1,
      });
    }
  }

  for (const [nodo, { x, y }] of punti) {
    disegna("circle", {
      cx: x,
      cy: y,
      r: 17,
      stroke: "#555",
      fill:
        nodo === g.nodoAttuale()
          ? "#fde047"
          : nodo === g.nodoFinale()
            ? "#86efac"
            : "white",
    });
    disegna("text", {
      x,
      y,
      "text-anchor": "middle",
      dy: ".35em",
      "font-size": 11,
    }).textContent = nodo;
  }

  document.querySelector("#stato").textContent =
    `${precedente === null ? `Partenza: ${g.nodoAttuale()}` : `${precedente} → ${g.nodoAttuale()}`} · Arrivo: ${g.nodoFinale()}` +
    (g.raggiuntoNodoFinale() ? " · Raggiunto!" : "");
}

export async function avvia() {
  const g = creaGrafoTest();
  stampaGrafoGUI(g);

  while (!g.raggiuntoNodoFinale()) {
    const r = await faiScegliere(g);
    const precedente = g.nodoAttuale();
    g.muoviti(r.answers.test.choice);
    stampaGrafoGUI(g, precedente);
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
}

avvia().catch((errore) => {
  document.querySelector("#stato").textContent = `Errore: ${errore.message}`;
  console.error(errore);
});
