// netlify/functions/lexemes.js
// Netlify Function que actúa como proxy al Wikidata Query Service (WDQS)
// No requiere dependencias externas si Netlify usa Node >= 18 (fetch global).
exports.handler = async (event) => {
  try {
    // Obtener query: preferimos POST JSON { query: "..." }, si no, fallback a q param
    let query = "";
    if (event.httpMethod === "POST" && event.body) {
      try { query = JSON.parse(event.body).query || ""; } catch (e) { query = ""; }
    }
    if (!query) query = (event.queryStringParameters && event.queryStringParameters.q) || "";

    if (!query) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ error: "Falta el parámetro 'query' (SPARQL)." })
      };
    }

    const wdqsUrl = "https://query.wikidata.org/sparql?query=" + encodeURIComponent(query) + "&format=json";

    // Llamada al WDQS desde el servidor (aquí podemos establecer User-Agent)
    const resp = await fetch(wdqsUrl, {
      headers: {
        "Accept": "application/sparql-results+json",
        // Cambia el email a uno tuyo para seguimiento si quieres
        "User-Agent": "QuechuaDemo/1.0 (mailto:tu_correo@example.com)"
      },
      // timeout no nativo aquí; Netlify limita ejecución a su timeout
    });

    if (!resp.ok) {
      const text = await resp.text().catch(()=>"");
      return {
        statusCode: resp.status,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ error: `WDQS responded ${resp.status}`, detail: text })
      };
    }

    const json = await resp.json();

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"  // permite que tu frontend llame desde cualquier dominio
      },
      body: JSON.stringify(json)
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: err.message })
    };
  }
};
