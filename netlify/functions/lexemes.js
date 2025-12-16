exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");
    const query = body.query;

    if (!query) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Falta query SPARQL" })
      };
    }

    const url =
      "https://query.wikidata.org/sparql?format=json&query=" +
      encodeURIComponent(query);

    const response = await fetch(url, {
      headers: {
        "Accept": "application/sparql-results+json",
        // MUY IMPORTANTE
        "User-Agent": "QuechuaDemo/1.0 (https://quechuademo.netlify.app)"
      }
    });

    const data = await response.json();

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
