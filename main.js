export async function faiScegliere(g) {
  const mosseDisponibili = g.mosseDisponibili();
  const criteria = Object.fromEntries(
    mosseDisponibili.map((nodo) => [
      String(nodo),
      `Move to node ${nodo} to reach ${g.nodoFinale()} in the fewest moves possible.`,
    ]),
  );

  const response = await fetch("/api/typesafe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      state: `you are in this graph: ${g.toString()} you can move one node at the time.
              you're current node is ${g.nodoAttuale()},
              and you can move to this nodes: ${g.mosseDisponibili()}, you're objective is to get to the node: ${g.nodoFinale()} in the least moves possible`,
      questions: {
        test: {
          type: "choice",
          instructions: "which node is the best node to move to?",
          criteria: criteria,
        },
      },
    }),
  });
  const text = await response.text();
  let result;
  try {
    result = JSON.parse(text);
  } catch {
    throw new Error(
      `Risposta non JSON (HTTP ${response.status}): ${text.slice(0, 200)}`,
    );
  }
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${JSON.stringify(result)}`);
  }
  return result;
}
