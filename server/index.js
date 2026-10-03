const page = Bun.file(new URL("../index.html", import.meta.url));
const scripts = new Map(
  ["main.js", "example.js", "grafo.js", "path.js"].map((nome) => [
    `/${nome}`,
    Bun.file(new URL(`../${nome}`, import.meta.url)),
  ]),
);

const server = Bun.serve({
  hostname: "127.0.0.1",
  port: process.env.PORT || 3001,
  async fetch(request) {
    const path = new URL(request.url).pathname;
    if (path === "/" && request.method === "GET") return new Response(page);
    if (scripts.has(path) && request.method === "GET") {
      return new Response(scripts.get(path), {
        headers: { "Content-Type": "text/javascript; charset=utf-8" },
      });
    }
    if (path !== "/api/typesafe" || request.method !== "POST") {
      return new Response("Not found", { status: 404 });
    }

    const apiKey = process.env.TYPESAFE_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: "Configura TYPESAFE_API_KEY nel file .env" },
        { status: 503 },
      );
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: "JSON non valido" }, { status: 400 });
    }

    try {
      const response = await fetch("https://api.typesafe.ai/v1/systemone", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          state: body?.state,
          questions: body?.questions,
          model: process.env.TYPESAFE_MODEL || "jev-latest",
        }),
        signal: AbortSignal.timeout(30_000),
      });
      return Response.json(await response.json(), { status: response.status });
    } catch (error) {
      return Response.json(
        { error: error.message },
        { status: error.name === "TimeoutError" ? 504 : 502 },
      );
    }
  },
});

console.log(`Test Jev: http://localhost:${server.port}`);
