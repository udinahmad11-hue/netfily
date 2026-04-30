addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  const targetUrl = url.pathname.slice(1) + url.search
  
  const response = await fetch(targetUrl, {
    headers: {
      'Origin': new URL(targetUrl).origin,
      'Referer': new URL(targetUrl).origin
    }
  })
  
  const modifiedHeaders = new Headers(response.headers)
  modifiedHeaders.set('Access-Control-Allow-Origin', '*')
  
  return new Response(response.body, {
    status: response.status,
    headers: modifiedHeaders
  })
}
