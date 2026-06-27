export default async (request, context) => {
  const urlObj = new URL(request.url);
  
  // 1. Ambil URL target dari query parameter '?url='
  let targetUrl = urlObj.searchParams.get("url");

  if (!targetUrl) {
    return new Response("Error: Mana URL-nya? Contoh: /proxy?url=https://alamat-stream.com/manifest.mpd", { status: 400 });
  }

  // 2. Bersihkan parameter internal 'url' agar sisa token stream aslinya bisa digabung kembali
  urlObj.searchParams.delete("url"); 
  const remainingParams = urlObj.searchParams.toString();
  if (remainingParams) {
    targetUrl += (targetUrl.includes("?") ? "&" : "?") + remainingParams;
  }

  try {
    const forwardHeaders = new Headers();
    forwardHeaders.set("User-Agent", request.headers.get("user-agent") || "Mozilla/5.0");
    forwardHeaders.set("Accept", "*/*");
    
    if (targetUrl.includes("starhub")) {
      forwardHeaders.set("Referer", "https://www.starhub.com/");
      forwardHeaders.set("Origin", "https://www.starhub.com");
    }

    const targetResponse = await fetch(targetUrl, {
      method: request.method,
      headers: forwardHeaders,
      redirect: "follow"
    });

    const responseBody = await targetResponse.arrayBuffer();

    // Inject CORS Header agar lolos di player
    const responseHeaders = new Headers(targetResponse.headers);
    responseHeaders.set("Access-Control-Allow-Origin", "*");
    responseHeaders.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    responseHeaders.set("Access-Control-Allow-Headers", "*");

    return new Response(responseBody, {
      status: targetResponse.status,
      headers: responseHeaders
    });

  } catch (error) {
    return new Response("Proxy Error: " + error.message, { status: 500 });
  }
};
