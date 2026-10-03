export class Grafo {
  #adiacenze = new Map();
  #orientato;
  #posizione = null;
  #finale = null;

  constructor({ orientato = false } = {}) {
    this.#orientato = orientato;
  }

  aggiungiNodo(nodo) {
    if (!this.#adiacenze.has(nodo)) {
      this.#adiacenze.set(nodo, new Set());
    }
    return this;
  }

  // Crea automaticamente i nodi mancanti. Gli archi duplicati sono ignorati.
  aggiungiArco(da, a) {
    this.aggiungiNodo(da).aggiungiNodo(a);
    this.#adiacenze.get(da).add(a);
    if (!this.#orientato) this.#adiacenze.get(a).add(da);
    return this;
  }

  haNodo(nodo) {
    return this.#adiacenze.has(nodo);
  }

  haArco(da, a) {
    return this.#adiacenze.get(da)?.has(a) ?? false;
  }

  nodi() {
    return [...this.#adiacenze.keys()];
  }

  // Mostra le adiacenze, * per la posizione attuale e [finale] per l'obiettivo.
  toString() {
    const titolo = `Grafo ${this.#orientato ? "orientato" : "non orientato"}`;
    if (this.#adiacenze.size === 0) return `${titolo} (vuoto)`;

    const collegamento = this.#orientato ? "->" : "<->";
    const righe = [titolo];
    for (const [nodo, vicini] of this.#adiacenze) {
      const attuale = this.#posizione &&
        (Object.is(this.#posizione.nodo, nodo) || this.#posizione.nodo === nodo);
      const destinazioni = [...vicini].map(String).join(", ") || "(nessuno)";
      const finale = this.#finale &&
        (Object.is(this.#finale.nodo, nodo) || this.#finale.nodo === nodo);
      righe.push(`${attuale ? "* " : "  "}${String(nodo)}${finale ? " [finale]" : ""} ${collegamento} ${destinazioni}`);
    }
    return righe.join("\n");
  }

  vicini(nodo) {
    return [...(this.#adiacenze.get(nodo) ?? [])];
  }

  // Imposta liberamente la posizione iniziale (o riposiziona il grafo).
  posizionati(nodo) {
    if (!this.haNodo(nodo)) {
      throw new Error("Il nodo non esiste nel grafo.");
    }
    this.#posizione = { nodo };
    return this;
  }

  // Restituisce null se non è stata impostata una posizione.
  nodoAttuale() {
    return this.#posizione ? this.#posizione.nodo : null;
  }

  impostaNodoFinale(nodo) {
    if (!this.haNodo(nodo)) {
      throw new Error("Il nodo finale non esiste nel grafo.");
    }
    this.#finale = { nodo };
    return this;
  }

  // Restituisce null se non è stato impostato un obiettivo.
  nodoFinale() {
    return this.#finale ? this.#finale.nodo : null;
  }

  raggiuntoNodoFinale() {
    return Boolean(this.#posizione && this.#finale &&
      (Object.is(this.#posizione.nodo, this.#finale.nodo) ||
        this.#posizione.nodo === this.#finale.nodo));
  }

  // Solo destinazioni direttamente collegate, rispettando l'orientamento.
  mosseDisponibili() {
    return this.#posizione ? this.vicini(this.#posizione.nodo) : [];
  }

  muoviti(nodo) {
    if (!this.#posizione) {
      throw new Error("Imposta prima una posizione con posizionati(nodo).");
    }
    if (!this.haArco(this.#posizione.nodo, nodo)) {
      throw new Error("Non puoi muoverti verso un nodo non collegato.");
    }
    this.#posizione = { nodo };
    return this;
  }
}
