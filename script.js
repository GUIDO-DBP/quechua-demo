// script-debug.js — versión de depuración: muestra la respuesta cruda de la función
const funcUrl = "/.netlify/functions/lexemes";
const resultsList = document.getElementById("results");
const statusDiv = document.getElementById("status");
const runBtn = document.getElementById("run");

const sparqlQuery = `
PREFIX wd: <http://www.wikidata.org/entity/>
PREFIX wikibase: <http://wikiba.se/ontology#>
PREFIX dct: <http://purl.org/dc/terms/>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

SELECT ?lexeme ?lemma WHERE {
  ?lexeme dct:language wd:Q5218 .   # Q5218 = Quechua
  ?lexeme wikibase:lemma ?lemma .
}
LIMIT 15
`;


async function fetchLexemesDebug() {
  resultsList.innerHTML = "";
  statusDiv.textContent = "Consultando función (depuración) ...";
  try {
    const resp = await fetch(funcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: sparqlQuery })
    });

    // mostrar estado básico
    statusDiv.textContent = `HTTP ${resp.status} ${resp.statusText}`;

    // intentar parsear JSON y mostrar crudo
    let dataText = await resp.text();
    // intentar parsear JSON si aplica
    let data;
    try { data = JSON.parse(dataText); } catch(e) { data = dataText; }

    // mostrar crudo en consola y en la página
    console.log("Respuesta bruta de la función:", data);
    const pre = document.createElement("pre");
    pre.style.maxHeight = "300px";
    pre.style.overflow = "auto";
    pre.textContent = typeof data === "string" ? data : JSON.stringify(data, null, 2);
    // limpiar y mostrar
    resultsList.innerHTML = "";
    resultsList.appendChild(pre);

    // Si hay resultados, listarlos también (para conveniencia)
    if (data && data.results && Array.isArray(data.results.bindings) && data.results.bindings.length) {
      statusDiv.textContent = `Se obtuvieron ${data.results.bindings.length} resultados.`;
      data.results.bindings.forEach(b => {
        const lemma = b.lemma?.value || "(sin lema)";
        const lexeme = b.lexeme?.value || "(sin id)";
        const li = document.createElement("li");
        li.innerHTML = `<strong>${escapeHtml(lemma)}</strong> — <small>${escapeHtml(lexeme)}</small>`;
        resultsList.appendChild(li);
      });
    }
  } catch (err) {
    console.error("Error fetch:", err);
    statusDiv.textContent = "Error consultando la función: " + err.message;
  }
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"]/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[s]));
}

runBtn.addEventListener("click", fetchLexemesDebug);
