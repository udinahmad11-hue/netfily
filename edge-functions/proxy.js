export default async (request, context) => {
  const incomingUrl = request.url; // Contoh: https://cors0-starhub.netlify.app/https://target.com/file.mpd?token=123

  // 1. Cari posisi awal URL asli (https:// atau http://) setelah domain Netlify
  const httpIndex = incomingUrl.indexOf("http://");
  const httpsIndex = incomingUrl.indexOf("https://");
  
  // Tentukan di mana URL asli dimulai
  let targetUrlStart = -1;
  if (httpsIndex > 0) {
    targetUrlStart = httpsIndex;
  } else if (httpIndex > 0) {
    targetUrlStart = httpIndex;
  }

  // Jika tidak ditemukan URL target yang valid, bypass atau return error
  if (targetUrlStart === -1) {
    // Biarkan request aset internal Netlify lolos jika ada, atau kembalikan bad request
    return new Response("Error: Invalid proxy format. Usage: https://your-netlify.app/https://target-url.com/stream.mpd", { status: 400 });
  }

  // 2. Potong string untuk mendapatkan URL target yang murni beserta seluruh query string-nya
  let targetUrl = incomingUrl.substring(targetUrlStart);

  try {
    // 3. Siapkan request headers untuk menembak CDN asli (Starhub, dll)
    const forwardHeaders = new Headers();
    forwardHeaders.set("User-Agent", request.headers.get("user-agent") || "Mozilla/5.0");
    forwardHeaders.set("Accept", "*/*");
    
    if (request.headers.get("x-forwarded-for")) {
      forwardHeaders.set("X-Forwarded-For", request.headers.get("x-forwarded-for"));
    }
    
    if (targetUrl.includes("starhub")) {
      forwardHeaders.set("Referer", "https://www.starhub.com/");
      forwardHeaders.set("Origin", "https://www.starhub.com");
    }

    // 4. Ambil data dari server target (bisa berupa teks manifest atau biner segmen)
    const targetResponse = await fetch(targetUrl, {
      method: request.method,
      headers: forwardHeaders,
      body: request.body,
      redirect: "follow"
    });

    const responseBody = await targetResponse.arrayBuffer();

    // 5. Inject CORS Header agar bisa diputar langsung di OTT Navigator / Player
    const responseHeaders = new Headers(targetResponse.headers);
    responseHeaders.set("Access-Control-Allow-Origin", "*");
    responseHeaders.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    responseHeaders.set("Access-Control-Allow-Headers", "*");
    
    responseHeaders.delete("Content-Security-Policy");
    responseHeaders.delete("X-Frame-Options");

    return new Response(responseBody, {
      status: targetResponse.status,
      statusText: targetResponse.statusText,
      headers: responseHeaders
    });

  } catch (error) {
    return new Response("Proxy Error: " + error.message, { status: 500 });
  }
};
