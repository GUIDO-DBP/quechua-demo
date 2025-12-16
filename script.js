const funcUrl = "/.netlify/functions/lexemes";
const resultsList = document.getElementById("results");
const statusDiv = document.getElementById("status");
const runBtn = document.getElementById("run");

const sparqlQuery = `
PREFIX wd: <http://www.wikidata.org/entity/>
PREFIX wikibase: <http://wikiba.se/ontology#>
PREFIX dct: <http://purl.org/dc/terms/>

SELECT ?lexeme ?lemma WHERE {
  ?lexeme dct:language wd:Q5218 .
  ?lexeme wikibase:lemma ?lemma .
}
LIMIT 15
`;

async function fetchLexemes() {
  resultsList.innerHTML = "";
  statusDiv.textContent = "Consultando Wikidata…";

  try {
    const resp = await fetch(funcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: sparqlQuery })
    });

    if (!resp.ok) {
      throw new Error(`HTTP ${resp.status}`);
    }

    const data = await resp.json();
    const bindings = data?.results?.bindings || [];

    if (bindings.length === 0) {
      statusDiv.textContent = "No se encontraron lexemas.";
      return;
    }

    statusDiv.textContent = `Se obtuvieron ${bindings.length} resultados.`;

    bindings.forEach(b => {
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${b.lemma.value}</strong>
        <small>${b.lexeme.value}</small>
      `;
      resultsList.appendChild(li);
    });

  } catch (err) {
    console.error(err);
    statusDiv.textContent = "Error consultando la función.";
  }
}

runBtn.addEventListener("click", fetchLexemes);
