addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})
/**
 * Respond with hello worker text
 * @param {Request} request
 */
async function handleRequest(request) {
  if (request.method !== 'GET') return MethodNotAllowed(request);
  let url = new URL(request.url, `http://${request.headers.get("host")}`);
  let numQuestions = url.searchParams.get("qn");

  let data = await BUCKET.get("data-file", {type: "json"});
  let result = [];
  let qn = [];
  while (qn.length < numQuestions) {
      let newidx = Math.floor(Math.random() * data.length);
      if (qn.indexOf(newidx) == -1) {
          qn.push(newidx);
      }
  }

  for (let i of qn) {
      result.push(data[i]);
  }
  return new Response(JSON.stringify(result), {
    headers: { 'content-type': 'application/json', "Access-Control-Allow-Origin": "https://trails-game.com" },
  })
}
