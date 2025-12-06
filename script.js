// script.js — Llama a la Netlify Function /.netlify/functions/lexemes vía POST
const funcUrl = "/.netlify/functions/lexemes"; // Netlify servirá esta ruta automáticamente
const resultsList = document.getElementById("results");
const statusDiv = document.getElementById("status");
const runBtn = document.getElementById("run");

const sparqlQuery = `
PREFIX wd: <http://www.wikidata.org/entity/>
PREFIX wikibase: <http://wikiba.se/ontology#>
PREFIX dct: <http://purl.org/dc/terms/>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

SELECT ?lexeme ?lemma WHERE {
  ?lexeme rdf:type wikibase:Lexeme .
  ?lexeme dct:language wd:Q5218 .   # Q5218 = Quechua
  ?lexeme wikibase:lemma ?lemma .
}
LIMIT 15
`;

async function fetchLexemes() {
  resultsList.innerHTML = "";
  statusDiv.textContent = "Consultando Wikidata (vía Netlify Function)...";
  try {
    const resp = await fetch(funcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: sparqlQuery })
    });
    if (!resp.ok) {
      const errText = await resp.text().catch(()=>"");
      throw new Error(`HTTP ${resp.status} — ${errText}`);
    }
    const data = await resp.json();
    const bindings = data?.results?.bindings || [];
    if (bindings.length === 0) {
      statusDiv.textContent = "No se encontraron lexemas (prueba otro query).";
      return;
    }
    statusDiv.textContent = `Se obtuvieron ${bindings.length} resultados.`;
    bindings.forEach(b => {
      const lemma = b.lemma?.value || "(sin lema)";
      const lexeme = b.lexeme?.value || "(sin id)";
      const li = document.createElement("li");
      li.innerHTML = `<strong>${escapeHtml(lemma)}</strong> — <small>${escapeHtml(lexeme)}</small>`;
      resultsList.appendChild(li);
    });
  } catch (err) {
    console.error(err);
    statusDiv.textContent = "Error consultando Wikidata: " + err.message;
  }
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"]/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[s]));
}

runBtn.addEventListener("click", fetchLexemes);
