export default async (request, context) => {
  const incomingUrl = request.url; // Contoh: https://spontaneous-raindrop-7c59ab.netlify.app/at-live-7.tentcdn.eu/bpk-tv/...

  // 1. Ambil path setelah nama domain Netlify kamu
  const urlObj = new URL(incomingUrl);
  // Ambil path, lalu hapus tanda garis miring di paling depan jika ada
  let cleanPath = urlObj.pathname.startsWith('/') ? urlObj.pathname.substring(1) : urlObj.pathname;

  // Jika kosong, kembalikan error bad request
  if (!cleanPath || cleanPath === "") {
    return new Response("Error: Masukkan URL target setelah tanda garing tanpa menggunakan http/https. Contoh: domain-netlify.app/at-live-7.tentcdn.eu/stream.mpd", { status: 400 });
  }

  // 2. Jika user tidak sengaja mengetik http/https, kita bersihkan dulu agar tidak memicu 404
  cleanPath = cleanPath.replace(/^https?:\/+/i, '');

  // 3. Rekonstruksi URL target asli dengan menyisipkan kembali https:// secara otomatis
  // Sertakan juga seluruh query string bawaan (seperti token biner) jika ada
  const targetUrl = `https://${cleanPath}${urlObj.search}`;

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
